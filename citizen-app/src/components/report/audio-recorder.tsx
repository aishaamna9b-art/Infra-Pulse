"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transcribeAudio } from "@/lib/api";
import { useLanguage } from "@/features/i18n/language-provider";
import type { Language } from "@/features/i18n/translations";

export function AudioRecorder({
  onTranscriptionComplete,
}: {
  onTranscriptionComplete: (text: string) => void;
}) {
  const { t, lang } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<Language>(lang);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(blob, voiceLang);
          onTranscriptionComplete(text);
        } catch (err) {
          setError(err instanceof Error ? err.message : t.micError);
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setError(t.micError);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-center">
      <p className="font-semibold">{t.voiceTitle}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t.voiceHelp}</p>
      <div className="mt-3 flex justify-center gap-2" role="group" aria-label={t.language}>
        <Button
          type="button"
          size="sm"
          variant={voiceLang === "en" ? "default" : "outline"}
          onClick={() => setVoiceLang("en")}
          disabled={isRecording || isTranscribing}
        >
          {t.english}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={voiceLang === "ta" ? "default" : "outline"}
          onClick={() => setVoiceLang("ta")}
          disabled={isRecording || isTranscribing}
        >
          {t.tamil}
        </Button>
      </div>
      <div className="mt-4">
        {isRecording ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="size-16 rounded-full"
            onClick={stopRecording}
            aria-label={t.stopRecording}
          >
            <Square className="size-6 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="size-16 rounded-full"
            onClick={startRecording}
            disabled={isTranscribing}
            aria-label={t.startRecording}
          >
            {isTranscribing ? <Loader2 className="size-7 animate-spin" /> : <Mic className="size-7" />}
          </Button>
        )}
      </div>
      <p className="mt-3 min-h-5 text-sm" aria-live="polite">
        {isRecording ? t.recording : null}
        {isTranscribing ? t.transcribing : null}
        {error ? <span className="text-destructive">{error}</span> : null}
      </p>
    </div>
  );
}
