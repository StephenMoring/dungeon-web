import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { ArrowLeft, Clock, Scroll, Sparkles } from "lucide-react";

export function History() {
  const navigate = useNavigate();

  const sessions = [
    {
      id: "1",
      campaign: "The Lost Temple",
      date: "2024-03-22",
      duration: "2h 15m",
      summary: "The party discovered the hidden entrance to the Temple of the Forgotten Gods. After defeating the stone guardians, they found the first key fragment.",
      highlights: ["Found secret passage", "Defeated 3 Stone Guardians", "Discovered Key Fragment"],
    },
    {
      id: "2",
      campaign: "Dragon's Lair",
      date: "2024-03-21",
      duration: "3h 45m",
      summary: "Epic battle with the Ancient Red Dragon Crimsonwing. The party emerged victorious but wounded, claiming the dragon's hoard.",
      highlights: ["Defeated Crimsonwing", "Found legendary sword", "Leveled up to 13"],
    },
    {
      id: "3",
      campaign: "The Lost Temple",
      date: "2024-03-20",
      duration: "1h 30m",
      summary: "Explored the ancient ruins. Met the mysterious hermit who provided cryptic clues about the temple's location.",
      highlights: ["Met Hermit Gandros", "Obtained Map Fragment", "Learned temple history"],
    },
    {
      id: "4",
      campaign: "Cursed Forest",
      date: "2024-03-19",
      duration: "2h 00m",
      summary: "Ventured deeper into the Whispering Woods. Encountered corrupted dryads and discovered the source of the curse.",
      highlights: ["Found Curse Source", "Saved corrupted dryad", "Obtained quest item"],
    },
  ];

  return (
    <div className="h-full p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Campaign History
            </h1>
            <p className="text-muted-foreground mt-1">
              Review your past adventures and sessions
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-6">
          {sessions.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-2 border-border/50 hover:border-blue-500/30 transition-all">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Scroll className="h-5 w-5 text-amber-400" />
                        <CardTitle className="text-xl">{session.campaign}</CardTitle>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.date}
                        </div>
                        <span>•</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed mb-4">{session.summary}</p>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium">Key Highlights</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.highlights.map((highlight, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5">
            <CardHeader>
              <CardTitle>All-Time Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-emerald-400">63</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">142h</div>
                  <div className="text-sm text-muted-foreground">Time Played</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">4</div>
                  <div className="text-sm text-muted-foreground">Active Campaigns</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-400">28</div>
                  <div className="text-sm text-muted-foreground">Quests Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
