export const TYPING_MS_PER_CHAR = 22;

export function wordChunks(fullText: string): string[] {
  if (!fullText) return [];
  const chunks = fullText.match(/\S+\s*/g);
  if (chunks) return chunks;
  return [fullText];
}

export function delayForChunk(chunk: string): number {
  return Math.max(TYPING_MS_PER_CHAR * chunk.length, TYPING_MS_PER_CHAR);
}
