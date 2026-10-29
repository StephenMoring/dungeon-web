import { useState, useEffect, useRef } from "react";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { streamTurn } from "@/app/api/turn-stream";
import type { Roll } from "@/app/api/turn-stream";
import { RollCard } from "./roll-card";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";


type StoryItem =
  | { kind: "message"; id: string; role: "user" | "dm"; content: string; timestamp: Date }
  | { kind: "roll"; id: string; roll: Roll }
  | { kind: "error"; id: string; content: string };

interface ChatInterfaceProps {
  openingMessage?: string | null;
  characterId?: number | null;
  onUserMessage?: (message: string) => void;
}

export function ChatInterface({ openingMessage, characterId, onUserMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<StoryItem[]>(
    openingMessage
      ? [{ kind: "message", id: "1", role: "dm", content: openingMessage, timestamp: new Date() }]
      : []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // While a live roll animates, narration is held here so the outcome isn't spoiled.
  const dmIdRef = useRef<string | null>(null);
  const heldRef = useRef(false);
  const pendingRef = useRef("");
  const [historyLoaded, setHistoryLoaded] = useState(!!openingMessage);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!characterId || historyLoaded) return;
    fetch(`/api/characters/${characterId}/turns`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}` },
    })
      .then((res) => res.json() as Promise<{ id: number; role: string; content: string; created_at: string }[]>)
      .then((data) => {
        setMessages(data.map((m) => ({
          kind: "message" as const,
          id: String(m.id),
          role: m.role as "user" | "dm",
          content: m.content,
          timestamp: new Date(m.created_at),
        })));
        setHistoryLoaded(true);
      })
      .catch(console.error);
  }, [characterId, historyLoaded]);

  useEffect(() => {
    // Scroll the story pane itself, so the page around it never jumps.
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, isTyping]);

  const appendDm = (text: string) => {
    const dmId = dmIdRef.current;
    if (!dmId || !text) return;
    setMessages((prev) =>
      prev.some((m) => m.id === dmId)
        ? prev.map((m) => (m.id === dmId && m.kind === "message" ? { ...m, content: m.content + text } : m))
        : [...prev, { kind: "message", id: dmId, role: "dm", content: text, timestamp: new Date() }]
    );
  };

  const insertRoll = (roll: Roll) => {
    const dmId = dmIdRef.current;
    const item: StoryItem = { kind: "roll", id: `roll-${dmId}`, roll };
    setMessages((prev) => {
      // The card sits above this turn's narration, even if some text already arrived.
      const index = prev.findIndex((m) => m.id === dmId);
      return index === -1 ? [...prev, item] : [...prev.slice(0, index), item, ...prev.slice(index)];
    });
  };

  const handleRollSettled = () => {
    heldRef.current = false;
    const pending = pendingRef.current;
    pendingRef.current = "";
    appendDm(pending);
  };

  const handleSend = async () => {
    const text = input;
    if (!text.trim() || !characterId || isStreaming) return;

    const now = Date.now();
    dmIdRef.current = `dm-${now}`;
    heldRef.current = false;
    pendingRef.current = "";

    setMessages((prev) => [
      ...prev,
      { kind: "message", id: `user-${now}`, role: "user", content: text, timestamp: new Date() },
    ]);
    onUserMessage?.(text);
    setInput("");
    setIsTyping(true);
    setIsStreaming(true);

    try {
      for await (const event of streamTurn(characterId, text)) {
        if (event.type === "roll") {
          setIsTyping(false);
          heldRef.current = true;
          insertRoll(event.roll);
        } else if (event.type === "text") {
          setIsTyping(false);
          if (heldRef.current) pendingRef.current += event.text;
          else appendDm(event.text);
        } else if (event.type === "error") {
          setMessages((prev) => [...prev, { kind: "error", id: `error-${now}`, content: event.detail }]);
          setInput(text);
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { kind: "error", id: `error-${now}`, content: error instanceof Error ? error.message : "Something went wrong" },
      ]);
      setInput(text);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-5">
        <div role="log" aria-live="polite" aria-label="Story" className="flex flex-col gap-4">
          {messages.length === 0 && !isTyping && (
            <p className="max-w-[62ch] text-base text-faint">The story begins with your first action.</p>
          )}
          <AnimatePresence initial={false}>
            {messages.map((message) =>
              message.kind === "roll" ? (
                <motion.div key={message.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <RollCard roll={message.roll} animate onSettled={handleRollSettled} />
                </motion.div>
              ) : message.kind === "error" ? (
                <p key={message.id} role="alert" className="max-w-[62ch] text-[15px] text-destructive">
                  {message.content}
                </p>
              ) : (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  message.role === "user"
                    ? "max-w-[68%] self-end break-words rounded-[4px] bg-raised px-3.5 py-2.5 text-[15px] leading-relaxed max-[759px]:max-w-[85%]"
                    : "max-w-[62ch] break-words text-base leading-relaxed"
                }
              >
                <span className="sr-only">{message.role === "dm" ? "Dungeon Master: " : "You: "}</span>
                <div className="[&_p]:m-0 [&_p+p]:mt-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold">
                  <ReactMarkdown>{message.content.replace(/\\n/g, "\n")}</ReactMarkdown>
                </div>
              </motion.div>
              )
            )}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="status"
              className="inline-flex items-center gap-1.5 text-muted-foreground"
            >
              <span className="sr-only">The Dungeon Master is writing</span>
              {[0, 0.2, 0.4].map((delay) => (
                <motion.span
                  key={delay}
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-muted-foreground"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <div className="shrink-0 border-t border-border p-5 max-[759px]:p-4">
        <div className="flex gap-2.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isStreaming}
            aria-label="Your action"
            placeholder="What do you do?"
            className={`h-11 flex-1 rounded-[4px] border-input bg-raised px-3.5 text-[15px] placeholder:text-faint dark:bg-raised md:text-[15px] ${FOCUS}`}
          />
          <motion.button
            type="button"
            onClick={handleSend}
            disabled={isStreaming}
            whileTap={{ y: 1 }}
            className={`h-11 shrink-0 rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground transition-[filter] hover:brightness-110 disabled:opacity-60 disabled:hover:brightness-100 ${FOCUS}`}
          >
            Act
          </motion.button>
        </div>
      </div>
    </>
  );
}
