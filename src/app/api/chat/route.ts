import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { MODELS, Provider } from "@/lib/models";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, modelId }: { messages: UIMessage[]; modelId: string } =
    await req.json();

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const provider: Provider = model.provider;

  let llm;

  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "GROQ_API_KEY is not configured. Add it to your .env.local file.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const groq = createGroq({ apiKey });
    llm = groq(model.id);
  } else if (provider === "google") {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Add it to your .env.local file.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const google = createGoogleGenerativeAI({ apiKey });
    llm = google(model.id);
  } else {
    return new Response(JSON.stringify({ error: "Unknown provider." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = streamText({
    model: llm,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

