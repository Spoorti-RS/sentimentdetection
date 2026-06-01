import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Wand2, BookOpenText, Brain, Smile, AlertCircle } from "lucide-react";

import { analyzeDictionary } from "@/lib/sentiment/analyze";
import { analyzeSentimentLLM, type LLMResult } from "@/lib/sentiment/sentiment.functions";
import { EMOTION_META, type Emotion } from "@/lib/sentiment/emotion-lexicon";
import { EmotionBar } from "@/components/EmotionBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SentimentDetector — Detect emotion in any sentence" },
      {
        name: "description",
        content:
          "Multi-modal sentiment analysis combining a dictionary lexicon with LLM reasoning. Detects dual emotions, words, and emojis.",
      },
      { property: "og:title", content: "SentimentDetector" },
      {
        property: "og:description",
        content:
          "Multi-modal sentiment analysis combining a dictionary lexicon with LLM reasoning.",
      },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  "I got the promotion today 🎉 but I'll miss my old team so much 😢",
  "I can't believe she said that to me 😡 absolutely furious right now",
  "feeling weirdly calm before the exam 🧘 even though I should be panicking",
  "this soup is disgusting 🤢 but somehow I can't stop eating it",
];

function Index() {
  const [text, setText] = useState("");
  const llm = useServerFn(analyzeSentimentLLM);

  const mutation = useMutation({
    mutationFn: async (input: string) => {
      const [dict, ai] = await Promise.all([
        Promise.resolve(analyzeDictionary(input)),
        llm({ data: { text: input } }) as Promise<LLMResult>,
      ]);
      return { dict, ai, input };
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    mutation.mutate(text.trim());
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:py-20">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <header className="text-center mb-10 sm:mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Dictionary + LLM · Words + Emojis
          </div>
          <h1 className="text-5xl sm:text-7xl font-normal leading-[0.95]">
            <span className="text-gradient">Sentiment</span>
            <br />
            <span className="italic text-foreground/90">Detector</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
            Write a sentence. We blend a hand-crafted emotion lexicon with an LLM to
            surface the feelings inside — including the rare dual emotions and the
            quiet meaning behind your emojis.
          </p>
        </header>

        {/* Input */}
        <form onSubmit={onSubmit} className="glass rounded-3xl p-2 glow animate-fade-up">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling? Try emojis too… ✨"
            rows={4}
            className="w-full resize-none bg-transparent px-5 py-4 text-lg outline-none placeholder:text-muted-foreground/60"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-xs text-muted-foreground">{text.length}/2000</span>
            <button
              type="submit"
              disabled={mutation.isPending || !text.trim()}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Wand2 className="h-4 w-4" />
              {mutation.isPending ? "Analyzing…" : "Detect sentiment"}
            </button>
          </div>
        </form>

        {/* Examples */}
        {!mutation.data && !mutation.isPending && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center animate-fade-up">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setText(ex)}
                className="text-xs rounded-full border border-border bg-card/40 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {ex.length > 50 ? ex.slice(0, 50) + "…" : ex}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {mutation.isPending && (
          <div className="mt-10 text-center text-muted-foreground animate-pulse-soft">
            Reading between the lines…
          </div>
        )}

        {/* Error */}
        {mutation.error && (
          <div className="mt-8 glass rounded-2xl p-5 border border-destructive/40 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <div className="font-medium">Couldn't analyze</div>
              <div className="text-sm text-muted-foreground">
                {(mutation.error as Error).message}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {mutation.data && <Results result={mutation.data} />}
      </div>

      <footer className="text-center text-xs text-muted-foreground mt-20">
        Built with a hybrid lexicon + AI gateway · multi-modal text & emoji
      </footer>
    </main>
  );
}

function Results({
  result,
}: {
  result: { dict: ReturnType<typeof analyzeDictionary>; ai: LLMResult; input: string };
}) {
  const { dict, ai } = result;

  return (
    <section className="mt-10 space-y-6">
      {/* Headline summary */}
      <div className="glass rounded-3xl p-6 sm:p-8 animate-fade-up">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
          <Brain className="h-3.5 w-3.5" /> AI verdict
        </div>
        <div className="flex flex-wrap items-baseline gap-3 mb-4">
          <h2 className="text-4xl sm:text-5xl">
            <span className="text-gradient capitalize">{ai.primary.emotion}</span>
          </h2>
          {ai.dualEmotion && ai.secondary && (
            <>
              <span className="text-muted-foreground text-2xl">×</span>
              <h2 className="text-4xl sm:text-5xl capitalize italic text-foreground/80">
                {ai.secondary.emotion}
              </h2>
            </>
          )}
          <span
            className="ml-auto rounded-full px-3 py-1 text-xs uppercase tracking-wider"
            style={{
              background:
                ai.overallTone === "positive"
                  ? "var(--emotion-joy)"
                  : ai.overallTone === "negative"
                  ? "var(--emotion-sadness)"
                  : ai.overallTone === "mixed"
                  ? "var(--emotion-confusion)"
                  : "var(--muted)",
              color: "var(--primary-foreground)",
            }}
          >
            {ai.overallTone}
          </span>
        </div>
        <p className="text-foreground/85 leading-relaxed">{ai.summary}</p>

        {ai.dualEmotion && (
          <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="text-xs uppercase tracking-wider text-primary mb-1">
              Dual emotion detected
            </div>
            <div className="text-sm text-foreground/80">
              <span className="capitalize font-medium">{ai.primary.emotion}</span> sits
              alongside{" "}
              <span className="capitalize font-medium">{ai.secondary?.emotion}</span> —
              feelings rarely live alone.
            </div>
          </div>
        )}
      </div>

      {/* Two-column: dictionary + emoji */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Dictionary scores */}
        <div className="glass rounded-3xl p-6 animate-fade-up">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-5">
            <BookOpenText className="h-3.5 w-3.5" /> Dictionary analysis
          </div>
          {dict.scores.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No lexicon matches — the LLM still has you covered above.
            </div>
          ) : (
            <div className="space-y-3.5">
              {dict.scores.slice(0, 6).map((s, i) => (
                <EmotionBar key={s.emotion} item={s} index={i} />
              ))}
            </div>
          )}
          {dict.matchedWords.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Trigger words</div>
              <div className="flex flex-wrap gap-1.5">
                {dict.matchedWords.map((w, i) => (
                  <span
                    key={i}
                    className="text-xs rounded-md bg-secondary px-2 py-1"
                    style={{
                      color: EMOTION_META[w.emotions[0] as Emotion]?.color,
                    }}
                  >
                    {w.token}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Multi-modal: emoji panel */}
        <div className="glass rounded-3xl p-6 animate-fade-up">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-5">
            <Smile className="h-3.5 w-3.5" /> Multi-modal · Emoji
          </div>
          {dict.matchedEmojis.length === 0 ? (
            <div className="text-sm text-muted-foreground">No emojis in your text.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {dict.matchedEmojis.map((e, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card/60 px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-2xl">{e.emoji}</span>
                  <div className="text-xs">
                    {e.emotions.map((em) => (
                      <div key={em} className="capitalize" style={{ color: EMOTION_META[em].color }}>
                        {em}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 pt-5 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1">AI on the emojis</div>
            <div className="text-sm text-foreground/80">{ai.emojiSentiment}</div>
          </div>
        </div>
      </div>

      {/* Evidence */}
      <div className="glass rounded-3xl p-6 animate-fade-up">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Why the AI thinks so
        </div>
        <div className="space-y-3">
          <Evidence label={ai.primary.emotion} text={ai.primary.evidence} intensity={ai.primary.intensity} />
          {ai.secondary && (
            <Evidence
              label={ai.secondary.emotion}
              text={ai.secondary.evidence}
              intensity={ai.secondary.intensity}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Evidence({ label, text, intensity }: { label: string; text: string; intensity: number }) {
  return (
    <div className="rounded-2xl bg-card/50 border border-border p-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="capitalize font-medium">{label}</div>
        <div className="text-xs text-muted-foreground tabular-nums">
          intensity {Math.round(intensity * 100)}%
        </div>
      </div>
      <div className="text-sm text-foreground/75 italic">"{text}"</div>
    </div>
  );
}
