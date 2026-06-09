import type { Request, Response } from "express";
import { toFile } from "openai";
import { getOpenAIClient } from "./openai.js";

interface TranscribeBody {
  audio?: string;
  mimeType?: string;
}

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
    });

    const text = result.text.trim();
    if (!text) {
      return res.status(400).json({ error: "No se detectó voz en la grabación" });
    }

    return res.json({ text });
  } catch (error) {
    console.error("[transcribe]", error);
    const message =
      error instanceof Error ? error.message : "Error al transcribir el audio";
    return res.status(500).json({ error: message });
  }
}
