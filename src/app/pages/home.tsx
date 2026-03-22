import { motion } from "motion/react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Sparkles, Scroll, BookOpen, History, Settings, Plus } from "lucide-react";

export function Home() {
  const recentCampaigns = [
    { id: "1", name: "The Lost Temple", lastPlayed: "2 hours ago", level: 5 },
    { id: "2", name: "Dragon's Lair", lastPlayed: "1 day ago", level: 12 },
    { id: "3", name: "Cursed Forest", lastPlayed: "3 days ago", level: 3 },
  ];

  return (
    <div className="h-full flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8"
      >
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-16 w-16 mx-auto text-purple-400 mb-4" />
          </motion.div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
            Dungeon Master AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Embark on epic adventures guided by your AI Dungeon Master
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/character/new">
            <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:border-purple-500/40 transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <CardTitle>New Campaign</CardTitle>
                </div>
                <CardDescription>Create a character and start a new adventure</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/campaigns">
            <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:border-emerald-500/40 transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scroll className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <CardTitle>All Campaigns</CardTitle>
                </div>
                <CardDescription>View and manage your saved campaigns</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Campaigns */}
        {recentCampaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-400" />
              Continue Your Adventure
            </h2>
            <div className="space-y-3">
              {recentCampaigns.map((campaign, idx) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <Link to={`/campaign/${campaign.id}`}>
                    <Card className="border border-border/50 hover:border-purple-500/50 transition-all cursor-pointer group">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-semibold group-hover:text-purple-400 transition-colors">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Level {campaign.level} • Last played {campaign.lastPlayed}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Continue →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Navigation */}
        <div className="flex justify-center gap-4">
          <Link to="/history">
            <Button variant="outline" className="gap-2 border-border/50">
              <History className="h-4 w-4" />
              Campaign History
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="gap-2 border-border/50">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
