export interface TranscriptSegment {
  text: string;
  avg_logprob: number;
  no_speech_prob: number;
}

const HALLUCINATION_PATTERNS: RegExp[] = [
  /subt[ií]tulos/i,
  /amara\.org/i,
  /gracias por ver/i,
  /thanks for watching/i,
  /suscr[ií]bete/i,
  /subscribe to/i,
  /m[uú]sica/i,
  /^\[m[uú]sica\]/i,
  /^\[aplausos\]/i,
  /^\[risas\]/i,
];

const VALID_SHORT_RESPONSE = /^(?:[1-9]|10|no|s[ií])$/i;

function hasRealContent(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (VALID_SHORT_RESPONSE.test(trimmed)) return true;
  if (/^[\s.,!?…\-–—]+$/u.test(trimmed)) return false;
  return true;
}

function isKnownHallucination(text: string): boolean {
  return HALLUCINATION_PATTERNS.some((pattern) => pattern.test(text));
}

function segmentsIndicateSilence(segments: TranscriptSegment[]): boolean {
  if (segments.length === 0) return true;

  const avgNoSpeech =
    segments.reduce((sum, seg) => sum + seg.no_speech_prob, 0) / segments.length;
  if (avgNoSpeech > 0.6) return true;
  if (segments.every((seg) => seg.no_speech_prob > 0.5)) return true;

  const textSegments = segments.filter((seg) => seg.text.trim());
  if (
    textSegments.length > 0 &&
    textSegments.every(
      (seg) => seg.no_speech_prob > 0.6 && seg.avg_logprob < -1.0,
    )
  ) {
    return true;
  }

  return false;
}

export function isUsableTranscript(
  text: string,
  segments: TranscriptSegment[],
): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (!hasRealContent(trimmed)) return false;
  if (isKnownHallucination(trimmed)) return false;

  if (VALID_SHORT_RESPONSE.test(trimmed)) return true;

  if (segmentsIndicateSilence(segments)) return false;

  return true;
}
