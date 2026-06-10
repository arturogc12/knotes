import { useCallback, useRef, useState } from "react";
import { transcribeAudio } from "../lib/transcribeApi";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
];

const MIN_RECORDING_MS = 700;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useVoiceInput(
  onTranscript: (text: string) => void | Promise<void>,
  onError?: (message: string) => void,
  messages?: {
    notSupported?: string;
    audioTooShort?: string;
    apiUnavailable?: string;
    noSpeechDetected?: string;
  },
) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const recordingStartedAtRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      throw new Error(
        messages?.notSupported ??
          "Tu navegador no soporta grabación de voz. Prueba con otro navegador o escribe tu mensaje.",
      );
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      mimeTypeRef.current = mimeType ?? "audio/webm";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const durationMs = Date.now() - recordingStartedAtRef.current;
        if (durationMs < MIN_RECORDING_MS) {
          setIsTranscribing(false);
          onError?.(
            messages?.audioTooShort ??
              "La grabación es demasiado corta. Habla un poco más e inténtalo de nuevo.",
          );
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        if (blob.size < 1000) {
          setIsTranscribing(false);
          onError?.(
            messages?.audioTooShort ??
              "La grabación es demasiado corta. Habla un poco más e inténtalo de nuevo.",
          );
          return;
        }

        try {
          const text = await transcribeAudio(blob, {
            apiUnavailable: messages?.apiUnavailable,
            noSpeechDetected: messages?.noSpeechDetected,
          });
          await onTranscript(text);
        } catch (e) {
          onError?.(e instanceof Error ? e.message : "Error al transcribir el audio");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      recorder.start(250);
      setIsRecording(true);
    } catch (e) {
      if (e instanceof Error && e.message.includes("navegador")) {
        throw e;
      }
      throw new Error("No se pudo acceder al micrófono");
    }
  }, [isRecording, isTranscribing, messages, onError, onTranscript]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      setIsRecording(false);
      setIsTranscribing(false);
      return;
    }

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
