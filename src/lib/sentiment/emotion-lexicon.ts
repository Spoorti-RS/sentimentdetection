// Dictionary-based emotion lexicon. Keywords map to one or more emotions
// with intensity weights (0-1). This powers the rule-based pass that runs
// alongside the LLM analysis.

export type Emotion =
  | "joy"
  | "sadness"
  | "anger"
  | "fear"
  | "surprise"
  | "disgust"
  | "love"
  | "trust"
  | "anticipation"
  | "shame"
  | "pride"
  | "calm"
  | "confusion";

export const EMOTION_META: Record<Emotion, { color: string; emoji: string; label: string }> = {
  joy: { color: "var(--emotion-joy)", emoji: "😊", label: "Joy" },
  sadness: { color: "var(--emotion-sadness)", emoji: "😢", label: "Sadness" },
  anger: { color: "var(--emotion-anger)", emoji: "😠", label: "Anger" },
  fear: { color: "var(--emotion-fear)", emoji: "😨", label: "Fear" },
  surprise: { color: "var(--emotion-surprise)", emoji: "😲", label: "Surprise" },
  disgust: { color: "var(--emotion-disgust)", emoji: "🤢", label: "Disgust" },
  love: { color: "var(--emotion-love)", emoji: "❤️", label: "Love" },
  trust: { color: "var(--emotion-trust)", emoji: "🤝", label: "Trust" },
  anticipation: { color: "var(--emotion-anticipation)", emoji: "🤩", label: "Anticipation" },
  shame: { color: "var(--emotion-shame)", emoji: "😳", label: "Shame" },
  pride: { color: "var(--emotion-pride)", emoji: "🏆", label: "Pride" },
  calm: { color: "var(--emotion-calm)", emoji: "😌", label: "Calm" },
  confusion: { color: "var(--emotion-confusion)", emoji: "🤔", label: "Confusion" },
};

type LexEntry = Partial<Record<Emotion, number>>;

export const WORD_LEXICON: Record<string, LexEntry> = {
  // joy
  happy: { joy: 0.9 }, glad: { joy: 0.7 }, delighted: { joy: 0.9 },
  excited: { joy: 0.7, anticipation: 0.6 }, cheerful: { joy: 0.8 },
  thrilled: { joy: 0.9, surprise: 0.4 }, amazing: { joy: 0.7, surprise: 0.5 },
  wonderful: { joy: 0.8 }, great: { joy: 0.6 }, awesome: { joy: 0.8 },
  enjoy: { joy: 0.6 }, fun: { joy: 0.6 }, smile: { joy: 0.6 },
  // sadness
  sad: { sadness: 0.9 }, down: { sadness: 0.6 }, depressed: { sadness: 1 },
  unhappy: { sadness: 0.8 }, miserable: { sadness: 0.9 }, lonely: { sadness: 0.8 },
  cry: { sadness: 0.7 }, crying: { sadness: 0.8 }, hurt: { sadness: 0.6, anger: 0.3 },
  heartbroken: { sadness: 1, love: 0.4 }, gloomy: { sadness: 0.7 },
  // anger
  angry: { anger: 0.9 }, furious: { anger: 1 }, mad: { anger: 0.7 },
  hate: { anger: 0.8, disgust: 0.6 }, annoyed: { anger: 0.6 },
  frustrated: { anger: 0.7 }, irritated: { anger: 0.6 }, rage: { anger: 1 },
  pissed: { anger: 0.9 },
  // fear
  scared: { fear: 0.9 }, afraid: { fear: 0.9 }, terrified: { fear: 1 },
  anxious: { fear: 0.7 }, nervous: { fear: 0.6, anticipation: 0.3 },
  worried: { fear: 0.7 }, panic: { fear: 1 }, dread: { fear: 0.8 },
  // surprise
  surprised: { surprise: 0.9 }, shocked: { surprise: 0.9, fear: 0.3 },
  astonished: { surprise: 1 }, unexpected: { surprise: 0.6 }, wow: { surprise: 0.7 },
  // disgust
  disgusting: { disgust: 1 }, gross: { disgust: 0.8 }, nasty: { disgust: 0.7 },
  awful: { disgust: 0.6, sadness: 0.4 }, terrible: { disgust: 0.5, sadness: 0.5 },
  // love
  love: { love: 0.9, joy: 0.4 }, adore: { love: 0.9 }, cherish: { love: 0.8 },
  romantic: { love: 0.7 }, sweetheart: { love: 0.8 },
  // trust
  trust: { trust: 0.9 }, reliable: { trust: 0.7 }, honest: { trust: 0.7 },
  safe: { trust: 0.6, calm: 0.4 },
  // anticipation
  hope: { anticipation: 0.7, joy: 0.3 }, excited2: { anticipation: 0.8 },
  cant_wait: { anticipation: 0.9, joy: 0.5 }, eager: { anticipation: 0.8 },
  // shame / pride
  embarrassed: { shame: 0.8 }, ashamed: { shame: 0.9 },
  proud: { pride: 0.9, joy: 0.4 }, accomplished: { pride: 0.8 },
  // calm
  calm: { calm: 0.8 }, peaceful: { calm: 0.9 }, relaxed: { calm: 0.8 },
  serene: { calm: 0.9 },
  // confusion
  confused: { confusion: 0.9 }, lost: { confusion: 0.6, sadness: 0.3 },
  puzzled: { confusion: 0.8 }, unsure: { confusion: 0.6 },
};

// Emoji to emotion mapping for multi-modal analysis.
export const EMOJI_LEXICON: Record<string, LexEntry> = {
  "😊": { joy: 0.9 }, "😀": { joy: 0.9 }, "😁": { joy: 0.9 }, "😄": { joy: 0.9 },
  "😍": { love: 0.9, joy: 0.6 }, "🥰": { love: 1 }, "❤️": { love: 1 },
  "💕": { love: 0.9 }, "💖": { love: 0.9 },
  "😂": { joy: 1, surprise: 0.3 }, "🤣": { joy: 1 },
  "😢": { sadness: 0.9 }, "😭": { sadness: 1 }, "😔": { sadness: 0.7 },
  "😞": { sadness: 0.7 }, "💔": { sadness: 1, love: 0.5 },
  "😠": { anger: 0.9 }, "😡": { anger: 1 }, "🤬": { anger: 1, disgust: 0.6 },
  "😨": { fear: 0.9 }, "😱": { fear: 1, surprise: 0.7 }, "😰": { fear: 0.8 },
  "😲": { surprise: 0.9 }, "😮": { surprise: 0.8 }, "🤯": { surprise: 1 },
  "🤢": { disgust: 0.9 }, "🤮": { disgust: 1 },
  "🤔": { confusion: 0.9 }, "😕": { confusion: 0.7, sadness: 0.3 },
  "😌": { calm: 0.9 }, "🧘": { calm: 1 },
  "🏆": { pride: 1, joy: 0.5 }, "💪": { pride: 0.7, anticipation: 0.4 },
  "😳": { shame: 0.8, surprise: 0.4 },
  "🤩": { anticipation: 0.8, joy: 0.7 }, "✨": { anticipation: 0.5, joy: 0.5 },
};

// Modifiers: negation flips, intensifiers scale.
export const NEGATIONS = new Set([
  "not", "no", "never", "nothing", "nobody", "neither", "without", "cant", "cannot", "dont",
  "doesnt", "didnt", "wont", "wouldnt", "isnt", "arent", "wasnt", "werent",
]);

export const INTENSIFIERS: Record<string, number> = {
  very: 1.4, really: 1.3, extremely: 1.7, super: 1.4, so: 1.2, totally: 1.3,
  absolutely: 1.5, incredibly: 1.6, somewhat: 0.6, slightly: 0.5, kinda: 0.7, "a-bit": 0.6,
};
