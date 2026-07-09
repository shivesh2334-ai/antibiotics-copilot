"use client";

import { MODELS, ModelOption } from "@/lib/models";

interface Props {
  selected: ModelOption;
  onChange: (model: ModelOption) => void;
}

export default function ModelSelector({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="model-select"
        className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap"
      >
        LLM:
      </label>
      <select
        id="model-select"
        value={selected.id}
        onChange={(e) => {
          const model = MODELS.find((m) => m.id === e.target.value);
          if (model) onChange(model);
        }}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} — {m.description}
          </option>
        ))}
      </select>
    </div>
  );
}
