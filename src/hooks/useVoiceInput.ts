import { useCallback, useRef, useState } from "react";
import { transcribeAudio } from "../lib/transcribeApi";

export function useVoiceInput(
  onTranscript: (text: string) => void,
  onError?: (message: string) => void,
) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
          setIsTranscribing(false);
          return;
        }

        try {
          const text = await transcribeAudio(blob);
          onTranscript(text);
        } catch (e) {
          onError?.(e instanceof Error ? e.message : "Error al transcribir el audio");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      throw new Error("No se pudo acceder al micrófono");
    }
  }, [isRecording, isTranscribing, onTranscript]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    setIsRecording(false);
    setIsTranscribing(true);
    recorder.stop();
    mediaRecorderRef.current = null;
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    toggleRecording,
    stopRecording,
  };
}
