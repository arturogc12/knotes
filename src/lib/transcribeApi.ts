interface TranscribeResponse {
  text: string;
}

interface TranscribeError {
  error: string;
}

interface TranscribeOptions {
  apiUnavailable?: string;
  noSpeechDetected?: string;
}

const NO_SPEECH_SERVER_ERROR = "No se detectó voz en la grabación";

export async function transcribeAudio(
  blob: Blob,
  options?: TranscribeOptions,
): Promise<string> {
  const apiUnavailableMessage =
    options?.apiUnavailable ??
    "No se pudo conectar con el servicio de transcripción. Comprueba tu conexión e inténtalo de nuevo.";

  const base64 = await blobToBase64(blob);

  let res: Response;
  try {
    res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: base64, mimeType: blob.type || "audio/webm" }),
    });
  } catch {
    throw new Error(apiUnavailableMessage);
  }

  let data: TranscribeResponse | TranscribeError;
  try {
    data = (await res.json()) as TranscribeResponse | TranscribeError;
  } catch {
    throw new Error(apiUnavailableMessage);
  }

  if (!res.ok) {
    const err = data as TranscribeError;
    if (res.status === 400 && err.error === NO_SPEECH_SERVER_ERROR) {
      throw new Error(
        options?.noSpeechDetected ??
          "No se detectó voz en la grabación. Inténtalo de nuevo.",
      );
    }
    throw new Error(err.error || "Error al transcribir el audio");
  }

  return (data as TranscribeResponse).text;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("No se pudo leer el audio"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Error al leer el audio"));
    reader.readAsDataURL(blob);
  });
}
