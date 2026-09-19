"use client";

import { useState } from 'react';
import AudioRecorder from '@/components/AudioRecorder';

export default function Home() {
  const [transcription, setTranscription] = useState<string>('');

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Infra-Pulse</h1>
          <p className="opacity-90 text-sm mt-1">Report civic issues seamlessly</p>
        </div>
        
        <div className="p-6 space-y-6">
          <AudioRecorder 
            onTranscriptionComplete={(text) => setTranscription(text)} 
          />

          {transcription && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h4 className="text-sm font-semibold text-green-800 mb-1">Transcribed Text:</h4>
              <p className="text-green-900">{transcription}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
