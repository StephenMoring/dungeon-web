import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { streamCombatRound, streamTurn } from "@/app/api/turn-stream";
import type { CombatAction, CombatRound, EncounterState, Roll, TurnStreamEvent } from "@/app/api/turn-stream";
import { startRest, type RestState } from "@/app/api/combat";
import type { Character } from "@/app/api/characters";
import { RollCard } from "./roll-card";
import { RoundCard } from "./round-card";
import { CombatActions } from "./combat-actions";
import { RestOverlay } from "./rest-overlay";
import { apiFetch } from "@/app/api/http";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";
const SECONDARY = `h-11 shrink-0 rounded-[4px] border border-input bg-raised px-[18px] text-base font-semibold text-foreground transition-[filter] hover:brightness-125 disabled:opacity-60 disabled:hover:brightness-100 ${FOCUS}`;

type StoryItem =
  | { kind: "message"; id: string; role: "user" | "dm"; content: string; timestamp: Date }
  | { kind: "roll"; id: string; roll: Roll }
  | { kind: "round"; id: string; round: CombatRound }
  | { kind: "note"; id: string; content: string }
  | { kind: "error"; id: string; content: string };

interface ChatInterfaceProps {
  openingMessage?: string | null;
  characterId?: number | null;
  /** The character as loaded: hit points, death and resting come from here. */
  character?: Character | null;
  /** The active fight, or null. */
  encounter?: EncounterState | null;
  /** A fight started, a round changed hit points, or a fight ended. */
  onEncounter?: (encounter: EncounterState) => void;
  /** The server sent back the character, e.g. healed after resting. */
  onCharacter?: (character: Character) => void;
  onUserMessage?: (message: string) => void;
}

/** The player's line for a combat button, as the server saves it. */
function actionText(action: CombatAction, encounter: EncounterState, targetId: number | null): string {
  if (action === "defend") return "I raise my guard and defend.";
  if (action === "flee") return "I try to escape.";
  const target = encounter.enemies.find((enemy) => enemy.id === targetId);
  return target ? `I attack ${target.name}.` : "I attack.";
}

export function ChatInterface({
  openingMessage,
  characterId,
  character,
  encounter,
  onEncounter,
  onCharacter,
  onUserMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<StoryItem[]>(
    openingMessage
      ? [{ kind: "message", id: "1", role: "dm", content: openingMessage, timestamp: new Date() }]
      : []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [rest, setRest] = useState<RestState | null>(null);
  // While live dice animate, narration (and a round's hit points) are held here so
  // the outcome isn't spoiled.
  const dmIdRef = useRef<string | null>(null);
  const heldRef = useRef(false);
  const pendingRef = useRef("");
  const pendingCombatRef = useRef<EncounterState | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(!!openingMessage);
  const listRef = useRef<HTMLDivElement>(null);

  const dead = character?.died_at != null;
  const inFight = !!encounter && encounter.status === "active" && !dead;
  const wounded = !!character && character.current_hp < character.max_hp;

  useEffect(() => {
    if (!characterId || historyLoaded) return;
    apiFetch(`/characters/${characterId}/turns`)
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

  // A rest left running (e.g. the page was reloaded by the fire) picks up where it was.
  const restStartedAt = character?.rest_started_at;
  useEffect(() => {
    if (!characterId || !restStartedAt || rest) return;
    startRest(characterId).then(setRest).catch(console.error);
  }, [characterId, restStartedAt, rest]);

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

  const insertCard = (item: StoryItem) => {
    const dmId = dmIdRef.current;
    setMessages((prev) => {
      // The card sits above this turn's narration, even if some text already arrived.
      const index = prev.findIndex((m) => m.id === dmId);
      return index === -1 ? [...prev, item] : [...prev.slice(0, index), item, ...prev.slice(index)];
    });
  };

  const flushCombat = () => {
    const pending = pendingCombatRef.current;
    pendingCombatRef.current = null;
    if (pending) onEncounter?.(pending);
  };

  const handleCardSettled = () => {
    heldRef.current = false;
    const pending = pendingRef.current;
    pendingRef.current = "";
    appendDm(pending);
    flushCombat();
  };

  const addError = (id: string, content: string) =>
    setMessages((prev) => [...prev, { kind: "error", id: `error-${id}`, content }]);

  /** Shows a turn or round as it streams. Returns false if it failed. */
  const play = async (userText: string, events: AsyncGenerator<TurnStreamEvent>): Promise<boolean> => {
    const now = Date.now();
    dmIdRef.current = `dm-${now}`;
    heldRef.current = false;
    pendingRef.current = "";
    pendingCombatRef.current = null;

    setMessages((prev) => [
      ...prev,
      { kind: "message", id: `user-${now}`, role: "user", content: userText, timestamp: new Date() },
    ]);
    setIsTyping(true);
    setIsStreaming(true);

    let ok = true;
    try {
      for await (const event of events) {
        if (event.type === "roll") {
          setIsTyping(false);
          heldRef.current = true;
          insertCard({ kind: "roll", id: `roll-${dmIdRef.current}`, roll: event.roll });
        } else if (event.type === "round") {
          heldRef.current = true;
          insertCard({ kind: "round", id: `round-${dmIdRef.current}`, round: event.round });
        } else if (event.type === "combat") {
          if (heldRef.current) pendingCombatRef.current = event.encounter;
          else onEncounter?.(event.encounter);
        } else if (event.type === "text") {
          setIsTyping(false);
          if (heldRef.current) pendingRef.current += event.text;
          else appendDm(event.text);
        } else if (event.type === "error") {
          // Nothing was saved, so held narration must not appear when the dice settle.
          // A combat round's hit points were saved, though: show them now.
          ok = false;
          heldRef.current = false;
          pendingRef.current = "";
          dmIdRef.current = null;
          flushCombat();
          addError(String(now), event.detail);
        }
      }
    } catch (error) {
      ok = false;
      heldRef.current = false;
      pendingRef.current = "";
      dmIdRef.current = null;
      flushCombat();
      addError(String(now), error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
    return ok;
  };

  const handleSend = async () => {
    const text = input;
    if (!text.trim() || !characterId || isStreaming) return;
    onUserMessage?.(text);
    setInput("");
    const ok = await play(text, streamTurn(characterId, text));
    if (!ok) setInput(text);
  };

  const handleCombat = async (action: CombatAction, targetId: number | null) => {
    if (!characterId || !encounter || isStreaming) return;
    await play(actionText(action, encounter, targetId), streamCombatRound(characterId, action, targetId));
  };

  const handleRest = () => {
    if (!characterId || isStreaming) return;
    startRest(characterId)
      .then(setRest)
      .catch((error: unknown) => addError(String(Date.now()), error instanceof Error ? error.message : "Couldn't make camp"));
  };

  const handleRested = (healed: Character) => {
    setRest(null);
    onCharacter?.(healed);
    setMessages((prev) => [
      ...prev,
      { kind: "note", id: `rest-${Date.now()}`, content: `You rest by the fire. Health restored to ${healed.current_hp} / ${healed.max_hp}.` },
    ]);
  };

  const handleRestFailed = (message: string) => {
    setRest(null);
    addError(String(Date.now()), message);
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
                  <RollCard roll={message.roll} animate onSettled={handleCardSettled} />
                </motion.div>
              ) : message.kind === "round" ? (
                <motion.div key={message.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <RoundCard round={message.round} animate onSettled={handleCardSettled} />
                </motion.div>
              ) : message.kind === "error" ? (
                <p key={message.id} role="alert" className="max-w-[62ch] text-[15px] text-destructive">
                  {message.content}
                </p>
              ) : message.kind === "note" ? (
                <p key={message.id} className="max-w-[62ch] text-[15px] italic text-muted-foreground">
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
        {dead ? (
          <div role="status" className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-base text-foreground">
              <span className="font-display text-xl">{character?.name}</span> has died. Their story is over.
            </p>
            <Link to="/dashboard" className={`inline-flex items-center ${SECONDARY}`}>
              Back to your heroes
            </Link>
          </div>
        ) : inFight && encounter ? (
          <CombatActions encounter={encounter} disabled={isStreaming} onAction={handleCombat} />
        ) : (
          <div className="flex gap-2.5">
            <Input
              maxLength={2000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              // readOnly, not disabled: disabling would blur the box and lose focus every turn.
              readOnly={isStreaming}
              aria-disabled={isStreaming}
              aria-label="Your action"
              placeholder="What do you do?"
              className={`h-11 flex-1 rounded-[4px] border-input bg-raised px-3.5 text-[15px] placeholder:text-faint dark:bg-raised md:text-[15px] ${FOCUS}`}
            />
            {wounded && (
              <motion.button type="button" onClick={handleRest} disabled={isStreaming} whileTap={{ y: 1 }} className={SECONDARY}>
                Rest
              </motion.button>
            )}
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
        )}
      </div>
      {rest && characterId && !dead && (
        <RestOverlay characterId={characterId} rest={rest} onRested={handleRested} onFailed={handleRestFailed} />
      )}
    </>
  );
}
