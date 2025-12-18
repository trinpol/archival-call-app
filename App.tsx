import React, { useState } from 'react';
import { analyzeAudio } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import Dashboard from './components/Dashboard';
import { UploadIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setErrorMsg('Please upload a valid audio file (MP3, WAV, etc.)');
      setAppState('error');
      return;
    }

    setAudioFile(file);
    setAppState('analyzing');
    setErrorMsg('');

    try {
      const result = await analyzeAudio(file);
      setAnalysisData(result);
      setAppState('complete');
    } catch (error) {
      console.error(error);
      setAppState('error');
      setErrorMsg('Failed to analyze audio. Please check your network connection and try again.');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setAnalysisData(null);
    setAudioFile(null);
    setErrorMsg('');
  };

  if (appState === 'complete' && analysisData) {
    return <Dashboard data={analysisData} audioFile={audioFile} onReset={handleReset} />;
  }

  if (appState === 'analyzing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-2xl">🏗️</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Paulo's Call</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Parsing audio for SOP compliance: checking NATO alphabet usage, Modification Request routing, and brand consistency.
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-orange-600 animate-pulse rounded-full w-2/3 transition-all duration-1000"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
       <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
               <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-600/20">
                AD
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight">
              Archival Designs <span className="text-orange-600">QA Platform</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Automated sales coaching intelligence. Upload calls for instant SOP verification and performance insights.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
             <div className={`relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
               appState === 'error' ? 'animate-shake' : ''
             }`}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-100 flex flex-col items-center justify-center gap-6">
                  
                  <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UploadIcon className="w-10 h-10" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Call Recording</h3>
                    <p className="text-sm text-slate-500">Supported formats: MP3, WAV, M4A, AAC</p>
                  </div>

                  <label className="relative">
                    <input 
                      type="file" 
                      accept="audio/*" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="px-8 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 cursor-pointer">
                      Select File
                    </div>
                  </label>
                </div>
             </div>
             {appState === 'error' && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center justify-center gap-2">
                  <span className="font-semibold">Error:</span> {errorMsg}
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-slate-200/60">
            <div className="text-center space-y-2">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold text-slate-800">SOP Adherence</h4>
              <p className="text-sm text-slate-500">AI audits for NATO alphabet and correct routing.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-semibold text-slate-800">Smart Transcript</h4>
              <p className="text-sm text-slate-500">Auto-diarization of agent and customer speech.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-slate-800">Sentiment Analysis</h4>
              <p className="text-sm text-slate-500">Visualize customer engagement across the call.</p>
            </div>
          </div>
        </div>
       </div>
    </div>
  );
};

export default App;