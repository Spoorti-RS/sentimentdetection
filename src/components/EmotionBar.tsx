import { EMOTION_META, type Emotion } from "@/lib/sentiment/emotion-lexicon";
import type { EmotionScore } from "@/lib/sentiment/analyze";

export function EmotionBar({ item, index }: { item: EmotionScore; index: number }) {
  const meta = EMOTION_META[item.emotion as Emotion];
  if (!meta) return null;
  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.emoji}</span>
          <span className="font-medium">{meta.label}</span>
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {Math.round(item.score * 100)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(4, item.score * 100)}%`,
            background: meta.color,
            boxShadow: `0 0 20px ${meta.color}`,
          }}
        />
      </div>
    </div>
  );
}
