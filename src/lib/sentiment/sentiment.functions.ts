import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  text: z.string().min(1).max(2000),
});

export type LLMEmotion = {
  emotion: string;
  intensity: number; // 0-1
  evidence: string;
};

export type LLMResult = {
  primary: LLMEmotion;
  secondary?: LLMEmotion | null;
  dualEmotion: boolean;
  overallTone: "positive" | "negative" | "neutral" | "mixed";
  emojiSentiment: string;
  summary: string;
};

export const analyzeSentimentLLM = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<LLMResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const body = {
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert sentiment & emotion analyst. Analyze the user's sentence considering BOTH the words AND any emojis (multi-modal). Detect dual/conflicting emotions when present (e.g. bittersweet, anxious-excitement). Return STRICT JSON via the provided tool.",
        },
        { role: "user", content: data.text },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_emotions",
            description: "Return detected emotions for the sentence.",
            parameters: {
              type: "object",
              properties: {
                primary: {
                  type: "object",
                  properties: {
                    emotion: { type: "string" },
                    intensity: { type: "number" },
                    evidence: { type: "string" },
                  },
                  required: ["emotion", "intensity", "evidence"],
                  additionalProperties: false,
                },
                secondary: {
                  type: "object",
                  properties: {
                    emotion: { type: "string" },
                    intensity: { type: "number" },
                    evidence: { type: "string" },
                  },
                  required: ["emotion", "intensity", "evidence"],
                  additionalProperties: false,
                },
                dualEmotion: { type: "boolean" },
                overallTone: {
                  type: "string",
                  enum: ["positive", "negative", "neutral", "mixed"],
                },
                emojiSentiment: {
                  type: "string",
                  description:
                    "What the emojis (if any) contribute. If no emojis say 'no emojis present'.",
                },
                summary: { type: "string" },
              },
              required: [
                "primary",
                "dualEmotion",
                "overallTone",
                "emojiSentiment",
                "summary",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_emotions" } },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      if (resp.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      if (resp.status === 402)
        throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      throw new Error("AI gateway error");
    }

    const json = await resp.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI did not return a tool call");
    const args = JSON.parse(call.function.arguments);
    return args as LLMResult;
  });
