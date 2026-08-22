"use client";

import { useState } from "react";

const prompts = [
  "What should I build next?",
  "What resources am I missing?",
  "Which project has the highest potential?",
  "Show me opportunities related to healthcare.",
];

type Message = { role: "user" | "assistant"; text: string };

export function IntelligencePanel({ initialInsight }: { initialInsight: string }) {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: initialInsight },
  ]);

  async function ask(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    try {
      const response = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await response.json();
      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.answer || data.error || "I could not read the universe." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="panel mt-10 max-w-3xl rounded-3xl p-6">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`whitespace-pre-wrap leading-7 ${
              message.role === "user" ? "text-gold" : "text-cream/90"
            }`}
          >
            {message.text}
          </div>
        ))}
        {pending ? <p className="text-sm text-muted">Reading the universe…</p> : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-gold/40 hover:text-cream"
            onClick={() => ask(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="mt-6 flex gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <input
          className="field"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask the universe a strategic question"
        />
        <button className="btn btn-primary shrink-0" disabled={pending} type="submit">
          Ask
        </button>
      </form>
    </div>
  );
}
