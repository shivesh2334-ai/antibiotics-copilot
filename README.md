# 💊 Antibiotics Copilot

> AI-powered clinical decision support for antibiotic therapy, dosing, resistance patterns, and antimicrobial stewardship.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshivesh2334-ai%2Fantibiotics-copilot&env=GROQ_API_KEY,GOOGLE_GENERATIVE_AI_API_KEY&envDescription=API%20keys%20for%20LLM%20providers%20(at%20least%20one%20required)&envLink=https%3A%2F%2Fgithub.com%2Fshivesh2334-ai%2Fantibiotics-copilot%23environment-variables)

---

## Features

- 🤖 **AI Chatbot** — Streaming chat interface powered by multiple free-tier LLMs
- 🔄 **LLM Selector** — Switch between providers in the UI without page reload:
  - **Groq** (free): Llama 3.3 70B · Llama 3.1 8B · Mixtral 8x7B
  - **Google Gemini** (free): Gemini 2.0 Flash · Gemini 1.5 Flash
- 💊 **Clinical Decision Support**
  - Empiric antibiotic therapy recommendations
  - Dosing guidance (renal/hepatic adjustment)
  - Drug–drug and drug–allergy interactions
  - IV-to-oral switch criteria
  - Antibiotic stewardship & resistance patterns (MRSA, ESBL, CPE)
  - Surgical & post-exposure prophylaxis
- ⚡ **Vercel-ready** — One-click deployment with `vercel.json` included

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI SDK | [Vercel AI SDK](https://sdk.vercel.ai) |
| LLMs | Groq API · Google Gemini API |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/shivesh2334-ai/antibiotics-copilot.git
cd antibiotics-copilot
npm install
```

### 2. Configure environment variables

Copy the example file and fill in at least one API key:

```bash
cp .env.example .env.local
```

| Variable | Provider | Get key |
|---|---|---|
| `GROQ_API_KEY` | Groq (free) | https://console.groq.com/keys |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini (free) | https://aistudio.google.com/app/apikey |

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

### One-click deploy

Click the **Deploy with Vercel** button at the top of this README. You will be prompted to set your API key environment variables during setup.

### Manual deploy

```bash
npm i -g vercel
vercel
```

Set the environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | If using Groq models | Free API key from console.groq.com |
| `GOOGLE_GENERATIVE_AI_API_KEY` | If using Gemini models | Free API key from Google AI Studio |

At least one variable must be set. The app will return a helpful error message if a model is selected without its corresponding key.

---

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts   # Streaming chat API (Groq / Gemini)
│   ├── layout.tsx           # Root layout & metadata
│   └── page.tsx             # Main page
├── components/
│   ├── Chat.tsx             # Main chat shell + starter prompts
│   ├── ChatInput.tsx        # Auto-growing textarea input
│   ├── MessageList.tsx      # Message bubbles + typing indicator
│   └── ModelSelector.tsx    # LLM provider/model dropdown
└── lib/
    ├── models.ts            # Model registry (Groq + Gemini)
    └── systemPrompt.ts      # Clinical decision support system prompt
```

---

## Disclaimer

> ⚠️ **For clinical support only.** This tool provides AI-generated suggestions to assist healthcare professionals. It does **not** replace clinical judgement, a formal patient assessment, or consultation with an infectious diseases specialist. Always verify recommendations against your local antibiogram and institutional guidelines.
