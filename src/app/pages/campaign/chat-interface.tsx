import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiceRoller } from "./dice-roller";
import ReactMarkdown from "react-markdown";

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
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    <Card className="h-full grid grid-rows-[auto_1fr_auto] overflow-hidden border-2 border-purple-500/20 bg-gradient-to-b from-card to-card/50">
      <CardHeader className="border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dungeon Master
            </CardTitle>
          </div>
          <DiceRoller />
        </div>
      </CardHeader>
      <CardContent className="min-h-0 p-0">
        <div className="h-full overflow-y-auto px-6">
          <div className="space-y-4 py-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 shadow-lg transition-all hover:shadow-xl ${message.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white border border-blue-400/20"
                      : "bg-gradient-to-br from-muted to-muted/50 border border-purple-500/10"
                      }`}
                  >
                    <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                      {message.role === "dm" && (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {message.role === "dm" ? "Dungeon Master" : "You"}
                    </div>
                    <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{message.content.replace(/\\n/g, "\n")}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] rounded-lg p-4 bg-gradient-to-br from-muted to-muted/50 border border-purple-500/10 shadow-lg">
                  <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Dungeon Master
                  </div>
                  <div className="text-sm">
                    <span className="inline-flex gap-1">
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      >
                        ●
                      </motion.span>
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "loop",
                          delay: 0.2,
                        }}
                      >
                        ●
                      </motion.span>
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "loop",
                          delay: 0.4,
                        }}
                      >
                        ●
                      </motion.span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
        <div className="p-4 border-t border-purple-500/20 bg-gradient-to-t from-card/80 to-transparent">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your action..."
              className="flex-1 border-purple-500/20 focus:border-purple-500/50 transition-colors"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
