interface TranscribeResponse {
  text: string;
}

interface TranscribeError {
  error: string;
}

export async function transcribeAudio(
  blob: Blob,
  apiUnavailableMessage = "No se pudo conectar con el servicio de transcripción. Comprueba tu conexión e inténtalo de nuevo.",
): Promise<string> {
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
