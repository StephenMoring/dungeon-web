import { useState, useEffect, useRef } from "react";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown, { type Components } from "react-markdown";
import { DiceRoller } from "./dice-roller";
import { DIE_HREF, markDice } from "./mark-dice";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";

// Dice results marked by markDice render as an ember chip; other links stay plain links.
const MARKDOWN: Components = {
  a: ({ href, children }) =>
    href === DIE_HREF ? (
      <span className="inline-block rounded-[2px] bg-ember px-2 font-semibold tabular-nums text-[#1a0800]">{children}</span>
    ) : (
      <a href={href} className="text-foreground underline underline-offset-2">
        {children}
      </a>
    ),
};

interface Message {
  id: string;
  role: "user" | "dm";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  openingMessage?: string | null;
  characterId?: number | null;
  onUserMessage?: (message: string) => void;
}

export function ChatInterface({ openingMessage, characterId, onUserMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(
    openingMessage
      ? [{ id: "1", role: "dm", content: openingMessage, timestamp: new Date() }]
      : []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

  const generateDMResponse = (userMessage: string): string => {
    // Mock AI responses based on keywords
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("enter") ||
      lowerMessage.includes("go in") ||
      lowerMessage.includes("proceed")
    ) {
      return "You step through the archway into a dimly lit corridor. Torches flicker on the walls, casting dancing shadows. You see two paths ahead: one leads north, where you hear the sound of running water, and another leads east, where a faint red glow emanates. Which path do you choose?";
    } else if (
      lowerMessage.includes("north") ||
      lowerMessage.includes("water")
    ) {
      return "You head north toward the sound of water. The corridor opens into a cavern with an underground stream. A rickety wooden bridge spans the water. On the far side, you notice what appears to be a treasure chest. However, the bridge looks unstable. Roll for Perception (1d20 + modifier) to examine the bridge more closely.";
    } else if (lowerMessage.includes("east") || lowerMessage.includes("glow")) {
      return "You venture east toward the red glow. The air grows warmer as you approach. You enter a chamber with glowing red crystals embedded in the walls. In the center of the room stands a stone pedestal with an ornate dagger. However, you notice scorch marks on the floor around the pedestal. What's your next move?";
    } else if (lowerMessage.includes("roll") || lowerMessage.includes("d20")) {
      const roll = Math.floor(Math.random() * 20) + 1;
      return `You rolled a ${roll}! ${roll >= 15
        ? "Success! You notice that the bridge is trapped with a pressure plate mechanism. You carefully disarm it and cross safely."
        : roll >= 10
          ? "Partial success. You sense something is off about the bridge but can't quite pinpoint what. Proceed with caution."
          : "The bridge appears safe to you, but your instincts tell you to be careful anyway."
        }`;
    } else if (
      lowerMessage.includes("attack") ||
      lowerMessage.includes("fight")
    ) {
      return "Roll for initiative! (1d20 + Dexterity modifier). You ready your weapon as the shadows begin to move...";
    } else if (
      lowerMessage.includes("inspect") ||
      lowerMessage.includes("examine") ||
      lowerMessage.includes("look")
    ) {
      return "You take a closer look at your surroundings. The stonework is ancient, dating back centuries. You notice faint inscriptions on the walls in a language you don't recognize. Make an Intelligence (Arcana) check if you wish to decipher them.";
    } else if (
      lowerMessage.includes("take") ||
      lowerMessage.includes("grab") ||
      lowerMessage.includes("pick up")
    ) {
      return "You reach out to take the item. As your fingers close around it, you hear a soft click... Roll a Dexterity saving throw!";
    } else {
      const responses = [
        "Interesting choice! The dungeon seems to respond to your action. What happens next depends on your next move.",
        "You proceed cautiously. The atmosphere in the dungeon shifts slightly. You sense that something is watching you from the shadows.",
        "As you take action, you hear a distant rumbling. The dungeon is alive with ancient magic. How do you respond?",
        "Your action echoes through the chamber. A faint breeze carries whispers of forgotten adventurers. What's your next step?",
        "The dungeon holds many secrets. Your decision leads you deeper into its mysteries. What do you do next?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !characterId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    onUserMessage?.(input);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`/api/characters/${characterId}/turns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}` },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json() as { message: string };
      const content = data.message;

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "dm", content, timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
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
        <div className="flex flex-col gap-4">
          {messages.length === 0 && !isTyping && (
            <p className="max-w-[62ch] text-base text-faint">The story begins with your first action.</p>
          )}
          <AnimatePresence initial={false}>
            {messages.map((message) => (
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
                  <ReactMarkdown components={MARKDOWN}>{markDice(message.content.replace(/\\n/g, "\n"))}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
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
      <div className="shrink-0 space-y-3 border-t border-border p-5 max-[759px]:p-4">
        <DiceRoller />
        <div className="flex gap-2.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="Your action"
            placeholder="What do you do?"
            className={`h-11 flex-1 rounded-[4px] border-input bg-raised px-3.5 text-[15px] placeholder:text-faint dark:bg-raised md:text-[15px] ${FOCUS}`}
          />
          <motion.button
            type="button"
            onClick={handleSend}
            whileTap={{ y: 1 }}
            className={`h-11 shrink-0 rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground transition-[filter] hover:brightness-110 ${FOCUS}`}
          >
            Act
          </motion.button>
        </div>
      </div>
    </>
  );
}
