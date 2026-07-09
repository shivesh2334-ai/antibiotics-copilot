export type Provider = "groq" | "google";

export interface ModelOption {
  id: string;
  name: string;
  provider: Provider;
  description: string;
}

export const MODELS: ModelOption[] = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    description: "Groq · Fast & capable (free tier)",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "groq",
    description: "Groq · Fastest responses (free tier)",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    provider: "groq",
    description: "Groq · Large context window (free tier)",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Google · Latest model (free tier)",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    description: "Google · Stable & reliable (free tier)",
  },
];

export const DEFAULT_MODEL = MODELS[0];
