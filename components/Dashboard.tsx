import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, TranscriptItem, CoachingData, SentimentPoint } from '../types.ts';
import { CheckCircleIcon, AlertCircleIcon, TrendingUpIcon, MicIcon, PlayIcon, PauseIcon } from './Icons.tsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  data: AnalysisResult;
  audioFile: File | null;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, audioFile, onReset }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
              AD
            </div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Archival Designs <span className="text-slate-400 font-normal">| Call QA</span></h1>
          </div>
          <button 
            onClick={onReset}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            New Analysis
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Top Summary & Audio Player */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Executive Summary</h2>
            <p className="text-slate-600 leading-relaxed text-sm">{data.coaching.summary}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Call Recording</h2>
            {audioFile && <AudioPlayer file={audioFile} />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Transcript */}
          <div className="lg:col-span-5 flex flex-col h-[600px] lg:h-[800px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <MicIcon className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-700">Transcript</h2>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {data.transcript.map((item, index) => (
                <TranscriptRow key={index} item={item} />
              ))}
            </div>
          </div>

          {/* Right Column: Analytics & Coaching */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Sentiment Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-orange-600" />
                  <h2 className="font-semibold text-slate-800">Engagement Sentiment</h2>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High Engagement</span>
                </div>
              </div>
              <div className="h-64 w-full">
                <SentimentChart data={data.sentiment} />
              </div>
            </div>

            {/* Coaching Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CoachingCard 
                type="strength" 
                title="SOP Adherence" 
                points={data.coaching.strengths} 
              />
              <CoachingCard 
                type="weakness" 
                title="SOP Deviations" 
                points={data.coaching.missedOpportunities} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const TranscriptRow: React.FC<{ item: TranscriptItem }> = ({ item }) => {
  const isRep = item.speaker.toLowerCase().includes('paulo');
  return (
    <div className={`flex flex-col ${isRep ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 mb-1 ${isRep ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.speaker}</span>
        <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
      </div>
      <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isRep 
          ? 'bg-orange-600 text-white rounded-tr-sm' 
          : 'bg-slate-100 text-slate-800 rounded-tl-sm'
      }`}>
        {item.text}
      </div>
    </div>
  );
};

const SentimentChart: React.FC<{ data: SentimentPoint[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="time" 
          tick={{fontSize: 10, fill: '#64748b'}} 
          tickLine={false}
          axisLine={false}
          minTickGap={20}
        />
        <YAxis 
          domain={[0, 100]} 
          tick={{fontSize: 10, fill: '#64748b'}} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ color: '#ea580c', fontWeight: 600 }}
          labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '10px' }}
        />
        <Area 
          type="monotone" 
          dataKey="score" 
          stroke="#ea580c" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorScore)" 
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const CoachingCard: React.FC<{ type: 'strength' | 'weakness', title: string, points: string[] }> = ({ type, title, points }) => {
  const isStrength = type === 'strength';
  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 hover:shadow-md ${
      isStrength ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        {isStrength ? (
          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
        ) : (
          <AlertCircleIcon className="w-5 h-5 text-red-600" />
        )}
        <h3 className={`font-semibold ${isStrength ? 'text-emerald-900' : 'text-red-900'}`}>{title}</h3>
      </div>
      <ul className="space-y-3">
        {points.map((point, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-snug">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              isStrength ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
            <span>{point}</span>
          </li>
        ))}
        {points.length === 0 && (
          <li className="text-slate-400 italic text-xs">No data points identified.</li>
        )}
      </ul>
    </div>
  );
};

const AudioPlayer: React.FC<{ file: File }> = ({ file }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full flex items-center gap-4">
      <audio 
        ref={audioRef} 
        src={url || ''} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-colors flex-shrink-0 shadow-lg"
      >
        {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="0.1"
          value={progress || 0} 
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>{formatTime((progress / 100) * duration)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;