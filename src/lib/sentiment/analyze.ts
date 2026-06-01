import {
  WORD_LEXICON,
  EMOJI_LEXICON,
  NEGATIONS,
  INTENSIFIERS,
  type Emotion,
} from "./emotion-lexicon";

export type EmotionScore = { emotion: Emotion; score: number };

export interface DictionaryResult {
  scores: EmotionScore[];
  matchedWords: { token: string; emotions: Emotion[] }[];
  matchedEmojis: { emoji: string; emotions: Emotion[] }[];
  dualEmotion: boolean;
  topTwo: Emotion[];
}

// Splits a sentence into text tokens and emoji tokens.
function tokenize(text: string): { words: string[]; emojis: string[] } {
  // Capture emojis as separate tokens
  const emojiRegex = /\p{Extended_Pictographic}(\uFE0F)?/gu;
  const emojis = Array.from(text.matchAll(emojiRegex)).map((m) => m[0]);
  const cleaned = text
    .replace(emojiRegex, " ")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z\s-]/g, " ");
  const words = cleaned.split(/\s+/).filter(Boolean);
  return { words, emojis };
}

export function analyzeDictionary(text: string): DictionaryResult {
  const { words, emojis } = tokenize(text);
  const totals: Partial<Record<Emotion, number>> = {};
  const matchedWords: DictionaryResult["matchedWords"] = [];
  const matchedEmojis: DictionaryResult["matchedEmojis"] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const entry = WORD_LEXICON[w];
    if (!entry) continue;

    // Look back for negation / intensifier within 2 words.
    let multiplier = 1;
    let negate = false;
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (NEGATIONS.has(words[j])) negate = true;
      if (INTENSIFIERS[words[j]]) multiplier *= INTENSIFIERS[words[j]];
    }

    const emotionsHit: Emotion[] = [];
    for (const [emo, val] of Object.entries(entry) as [Emotion, number][]) {
      const signed = negate ? -val * 0.6 : val * multiplier;
      totals[emo] = (totals[emo] ?? 0) + signed;
      emotionsHit.push(emo);
    }
    matchedWords.push({ token: w, emotions: emotionsHit });
  }

  for (const e of emojis) {
    const entry = EMOJI_LEXICON[e];
    if (!entry) continue;
    const emotionsHit: Emotion[] = [];
    for (const [emo, val] of Object.entries(entry) as [Emotion, number][]) {
      // Emojis weight a bit higher — they are explicit signals.
      totals[emo] = (totals[emo] ?? 0) + val * 1.2;
      emotionsHit.push(emo);
    }
    matchedEmojis.push({ emoji: e, emotions: emotionsHit });
  }

  // Normalize positives only for display.
  const entries = Object.entries(totals)
    .map(([e, s]) => ({ emotion: e as Emotion, score: Math.max(0, s as number) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const max = entries[0]?.score ?? 1;
  const normalized = entries.map((x) => ({ emotion: x.emotion, score: x.score / max }));

  const topTwo = normalized.slice(0, 2).map((x) => x.emotion);
  // Dual emotion = two top emotions with comparable strength (>= 0.6 of leader)
  // and from different valence families.
  const dualEmotion =
    normalized.length >= 2 && normalized[1].score >= 0.6 && areContrasting(topTwo[0], topTwo[1]);

  return { scores: normalized, matchedWords, matchedEmojis, dualEmotion, topTwo };
}

const POSITIVE = new Set<Emotion>(["joy", "love", "trust", "pride", "calm", "anticipation"]);
const NEGATIVE = new Set<Emotion>(["sadness", "anger", "fear", "disgust", "shame"]);

function areContrasting(a: Emotion, b: Emotion): boolean {
  return (
    (POSITIVE.has(a) && NEGATIVE.has(b)) ||
    (NEGATIVE.has(a) && POSITIVE.has(b)) ||
    // bittersweet specifics
    (a === "love" && b === "sadness") ||
    (a === "sadness" && b === "love")
  );
}
