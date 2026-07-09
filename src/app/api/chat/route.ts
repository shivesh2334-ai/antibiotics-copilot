import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { MODELS, Provider } from "@/lib/models";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { formatRetrievedContext, retrieveRelevantChunks } from "@/lib/rag";

const MAX_CONTEXT_CHUNKS = 6;

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

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const lastMessageParts = messages[messages.length - 1].parts || [];
  const lastMessageText = lastMessageParts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ");
  let augmentedPrompt = SYSTEM_PROMPT;

  if (lastMessageText) {
    const searchResults = await retrieveRelevantChunks(
      lastMessageText,
      MAX_CONTEXT_CHUNKS
    );

    if (searchResults.length > 0) {
      const contextText = formatRetrievedContext(searchResults);
      augmentedPrompt += `\n\nThe following excerpts were retrieved from JIPMER Antibiotic Policy 2026. Use only these excerpts to answer the user:\n\n${contextText}`;
    } else {
      augmentedPrompt +=
        "\n\nNo relevant excerpts were retrieved from JIPMER Antibiotic Policy 2026 for this question. State that the policy evidence is insufficient and ask for clarification or a narrower query.";
    }
  }

  const result = streamText({
    model: llm,
    system: augmentedPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

