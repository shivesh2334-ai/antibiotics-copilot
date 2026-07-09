"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import ModelSelector from "@/components/ModelSelector";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { DEFAULT_MODEL, ModelOption } from "@/lib/models";

const STARTERS = [
  "What is the first-line antibiotic for uncomplicated UTI in an adult?",
  "Patient has CAP, penicillin allergy — what are my options?",
  "How should I dose vancomycin in a patient with CrCl 20 mL/min?",
  "Explain MRSA decolonisation protocol",
  "When should I switch from IV to oral antibiotics for pneumonia?",
];

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(DEFAULT_MODEL);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  function clearChat() {
    setMessages([]);
  }

  function handleSend(text: string) {
    if (text.trim()) {
      sendMessage({ text }, { body: { modelId: selectedModel.id } });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💊</span>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight">
              Antibiotics Copilot
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clinical decision support · antibiotic stewardship
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ModelSelector selected={selectedModel} onChange={setSelectedModel} />
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Messages or welcome */}
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-10 gap-6">
          <div className="text-center max-w-md">
            <p className="text-4xl mb-3">💊</p>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Welcome to Antibiotics Copilot
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-powered clinical decision support for empiric therapy, dosing,
              resistance patterns, and antibiotic stewardship. Choose an LLM
              provider above and ask your first question.
            </p>
          </div>

          <div className="grid gap-2 w-full max-w-lg">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-left text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-slate-700 dark:text-slate-300"
              >
                {s}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center max-w-xs">
            ⚠️ For clinical support only. Always verify with local antibiogram
            data and consult an infectious diseases specialist for complex cases.
          </p>
        </div>
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
          {error.message ||
            "An error occurred. Check your API key configuration."}
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}



