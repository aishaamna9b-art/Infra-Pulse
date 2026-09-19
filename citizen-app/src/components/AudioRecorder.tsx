"use client";

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export default function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ta'>('ta'); // Default to Tamil
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please ensure you have granted permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language); // Pass the selected language explicitly

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      onTranscriptionComplete(data.text);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'An error occurred during transcription.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border rounded-xl bg-slate-50/50">
      <div className="text-center">
        <h3 className="font-medium text-lg mb-1">Voice Complaint</h3>
        <p className="text-sm text-slate-500 mb-4">
          Select your language and tap the microphone.
        </p>

        {/* Language Selection Buttons */}
        <div className="flex justify-center gap-3 mb-2">
          <Button 
            variant={language === 'en' ? 'default' : 'outline'}
            onClick={() => setLanguage('en')}
            disabled={isRecording || isTranscribing}
            className={language === 'en' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            English
          </Button>
          <Button 
            variant={language === 'ta' ? 'default' : 'outline'}
            onClick={() => setLanguage('ta')}
            disabled={isRecording || isTranscribing}
            className={language === 'ta' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Tamil
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center h-24">
        {!isRecording ? (
          <Button 
            onClick={startRecording} 
            disabled={isTranscribing}
            className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-transform active:scale-95 flex flex-col gap-1"
          >
            {isTranscribing ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </Button>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <Button 
              onClick={stopRecording} 
              variant="destructive"
              className="relative w-20 h-20 rounded-full shadow-lg transition-transform active:scale-95"
            >
              <Square className="w-8 h-8 text-white fill-white" />
            </Button>
          </div>
        )}
      </div>

      <div className="h-6">
        {isRecording && <p className="text-red-500 font-medium animate-pulse text-sm">Recording...</p>}
        {isTranscribing && <p className="text-blue-500 font-medium animate-pulse text-sm">Transcribing audio with AI...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
