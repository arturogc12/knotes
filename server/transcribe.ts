import type { Request, Response } from "express";
import { toFile } from "openai";
import { getOpenAIClient } from "./openai.js";
import { isUsableTranscript, type TranscriptSegment } from "./transcribeValidation.js";

interface TranscribeBody {
  audio?: string;
  mimeType?: string;
}

const NO_SPEECH_ERROR = "No se detectó voz en la grabación";

export async function handleTranscribe(req: Request, res: Response) {
  try {
    const { audio, mimeType = "audio/webm" } = req.body as TranscribeBody;

    if (!audio) {
      return res.status(400).json({ error: "Falta el audio" });
    }

    const buffer = Buffer.from(audio, "base64");
    if (buffer.length < 1000) {
      return res.status(400).json({ error: "El audio es demasiado corto" });
    }

    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const file = await toFile(buffer, `grabacion.${ext}`, { type: mimeType });
    const openai = getOpenAIClient();

    const result = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "es",
      temperature: 0,
      response_format: "verbose_json",
    });

    const text = result.text.trim();
    const segments: TranscriptSegment[] = (result.segments ?? []).map((seg) => ({
      text: seg.text,
      avg_logprob: seg.avg_logprob,
      no_speech_prob: seg.no_speech_prob,
    }));

    if (!isUsableTranscript(text, segments)) {
      return res.status(400).json({ error: NO_SPEECH_ERROR });
    }

    return res.json({ text });
  } catch (error) {
    console.error("[transcribe]", error);
    const message =
      error instanceof Error ? error.message : "Error al transcribir el audio";
    return res.status(500).json({ error: message });
  }
}
