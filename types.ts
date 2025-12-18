export interface TranscriptItem {
  speaker: 'Salesperson' | 'Prospect';
  text: string;
  timestamp: string;
}

export interface SentimentPoint {
  time: string; // MM:SS label
  seconds: number; // For sorting/axis if needed
  score: number; // 0-100
}

export interface CoachingData {
  strengths: string[];
  missedOpportunities: string[];
  summary: string;
}

export interface AnalysisResult {
  transcript: TranscriptItem[];
  sentiment: SentimentPoint[];
  coaching: CoachingData;
}

export type AppState = 'idle' | 'analyzing' | 'complete' | 'error';
