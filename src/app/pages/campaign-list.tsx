import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Plus, Trash2, Calendar, Sword } from "lucide-react";

export function CampaignList() {
  const navigate = useNavigate();

  const campaigns = [
    {
      id: "1",
      name: "The Lost Temple",
      character: "Aldrin the Brave",
      class: "Paladin",
      level: 5,
      lastPlayed: "2024-03-22",
      sessions: 12,
      location: "Temple of the Forgotten Gods"
    },
    {
      id: "2",
      name: "Dragon's Lair",
      character: "Mystara",
      class: "Wizard",
      level: 12,
      lastPlayed: "2024-03-21",
      sessions: 28,
      location: "Crimson Peak Mountains"
    },
    {
      id: "3",
      name: "Cursed Forest",
      character: "Shadow",
      class: "Rogue",
      level: 3,
      lastPlayed: "2024-03-19",
      sessions: 5,
      location: "Whispering Woods"
    },
    {
      id: "4",
      name: "Sea of Storms",
      character: "Captain Finn",
      class: "Fighter",
      level: 8,
      lastPlayed: "2024-03-15",
      sessions: 18,
      location: "The Maelstrom"
    },
  ];

  return (
    <div className="h-full p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Your Campaigns
              </h1>
              <p className="text-muted-foreground mt-1">
                {campaigns.length} active campaigns
              </p>
            </div>
          </div>
          <Link to="/character/new">
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </motion.div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-2 gap-6">
          {campaigns.map((campaign, idx) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-2 border-border/50 hover:border-purple-500/50 transition-all group h-full">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2 group-hover:text-purple-400 transition-colors">
                        {campaign.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sword className="h-4 w-4 text-emerald-400" />
                        <span>
                          {campaign.character} • Lv. {campaign.level} {campaign.class}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className="text-muted-foreground">
                        Last played: {campaign.lastPlayed}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Sessions: </span>
                      <span className="font-medium">{campaign.sessions}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current Location: </span>
                      <span className="font-medium text-amber-400">{campaign.location}</span>
                    </div>
                  </div>

                  <Link to={`/campaign/${campaign.id}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Continue Adventure
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
