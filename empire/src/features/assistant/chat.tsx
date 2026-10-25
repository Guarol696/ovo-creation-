"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const starters = [
  "Je veux créer mon premier business en ligne. Par où commencer ?",
  "Aide-moi à définir les pages du site d'un coach sportif.",
  "Propose-moi un plan de 4 semaines pour trouver mes premiers clients freelance.",
];

/** Conversation avec l'assistant réel (route serveur /api/assistant), réponse diffusée en continu. */
export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setError(null);
    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    abort.current = new AbortController();

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-24) }),
        signal: abort.current.signal,
      });
      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "L'assistant ne répond pas.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) => {
          const copy = [...current];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        });
        end.current?.scrollIntoView({ block: "end" });
      }
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") {
        setError((caught as Error).message);
        // Retire la réponse vide et rend le message à l'utilisateur.
        setMessages(history.slice(0, -1));
        setInput(content);
      }
    } finally {
      setStreaming(false);
      abort.current = null;
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  return (
    <div className="grid border hairline bg-abyss">
      <div className="flex items-center justify-between border-b hairline px-4 py-3">
        <p className="meta text-mist">Session</p>
        <p className="meta flex items-center gap-2 text-silver">
          <span aria-hidden className="size-1.5 rounded-full bg-volt" /> IA connectée
        </p>
      </div>
      <div className="grid max-h-[60dvh] min-h-[22rem] content-start gap-5 overflow-y-auto p-4 md:p-6" aria-live="polite">
        {messages.length === 0 && (
          <div className="grid gap-3">
            <p className="text-silver">Décris ton idée, ton projet ou ta question. Quelques points de départ :</p>
            {starters.map((starter) => (
              <button key={starter} type="button" onClick={() => void send(starter)} className="min-h-12 border hairline px-4 py-3 text-left text-sm text-silver hover:border-paper hover:text-paper">
                {starter}
              </button>
            ))}
          </div>
        )}
        {messages.map((message, index) =>
          message.role === "user" ? (
            <p key={index} className="max-w-[85%] justify-self-end bg-paper px-4 py-3 whitespace-pre-wrap text-void">
              {message.content}
            </p>
          ) : (
            <div key={index} className="max-w-[92%] border-l-2 border-volt pl-4">
              <p className="meta mb-2 text-mist">Assistant</p>
              <p className="leading-relaxed whitespace-pre-wrap text-paper">
                {message.content}
                {streaming && index === messages.length - 1 && <span aria-hidden className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-[caret_1s_steps(1)_infinite] bg-paper" />}
              </p>
            </div>
          ),
        )}
        {error && (
          <p role="alert" className="border border-danger/40 bg-danger/[0.06] p-3 text-sm">
            {error}
          </p>
        )}
        <div ref={end} />
      </div>
      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t hairline p-3">
        <label htmlFor="assistant-input" className="sr-only">
          Ton message
        </label>
        <textarea
          id="assistant-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          maxLength={4000}
          placeholder="Écris ton message (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"
          className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-paper placeholder:text-mist/70 focus:outline-none"
        />
        {streaming ? (
          <button type="button" onClick={() => abort.current?.abort()} className="flex size-12 items-center justify-center border hairline hover:border-paper" aria-label="Arrêter la réponse">
            <Square aria-hidden className="size-4" />
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} className={cn("flex size-12 items-center justify-center bg-paper text-void hover:bg-volt disabled:opacity-40")} aria-label="Envoyer">
            <ArrowUp aria-hidden className="size-4" />
          </button>
        )}
      </form>
    </div>
  );
}
