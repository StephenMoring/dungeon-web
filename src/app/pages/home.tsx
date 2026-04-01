import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Sparkles, Scroll, BookOpen, History, Settings, Plus, Loader2 } from "lucide-react";
import { getCharacters, type CharacterWithCampaign } from "../api/characters";
import { createCampaign } from "../api/campaigns";

export function Home() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterWithCampaign[]>([]);
  const [campaignTarget, setCampaignTarget] = useState<CharacterWithCampaign | null>(null);
  const [campaignDescription, setCampaignDescription] = useState("");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  useEffect(() => {
    getCharacters().then(setCharacters).catch(console.error);
  }, []);

  function openCampaignDialog(item: CharacterWithCampaign) {
    setCampaignTarget(item);
    setCampaignDescription("");
    setCampaignError(null);
  }

  async function handleStartCampaign() {
    if (!campaignTarget || !campaignDescription.trim()) return;
    setIsCreatingCampaign(true);
    setCampaignError(null);
    try {
      const { campaign, opening_message } = await createCampaign(campaignTarget.character.id!, campaignDescription.trim());
      navigate(`/adventure/${campaign.id}`, { state: { openingMessage: opening_message, characterId: campaignTarget.character.id } });
    } catch (err) {
      setCampaignError(err instanceof Error ? err.message : "Failed to create campaign. Try again.");
      setIsCreatingCampaign(false);
    }
  }

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

        {/* Characters */}
        {characters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-400" />
              Your Characters
            </h2>
            <div className="space-y-3">
              {characters.map((item, idx) => {
                return (
                  <motion.div
                    key={item.character.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    {item.character.campaign_id ? (
                      <Link to={`/adventure/${item.character.campaign_id}`}>
                        <Card className="border border-border/50 hover:border-purple-500/50 transition-all cursor-pointer group">
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <h3 className="font-semibold group-hover:text-purple-400 transition-colors">
                                {item.character.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.character.hero_class}{item.campaign ? ` · ${item.campaign.name}` : ""}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">Continue →</Button>
                          </CardContent>
                        </Card>
                      </Link>
                    ) : (
                      <Card
                        className="border border-border/50 hover:border-emerald-500/50 transition-all cursor-pointer group"
                        onClick={() => openCampaignDialog(item)}
                      >
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">
                              {item.character.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.character.hero_class} · No campaign yet
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">Start Campaign →</Button>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                );
              })}
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

      <Dialog open={campaignTarget !== null} onOpenChange={(open) => { if (!open) setCampaignTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a Campaign for {campaignTarget?.character.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="campaign-description">Describe the campaign you want to play</Label>
            <Textarea
              id="campaign-description"
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              placeholder="A dark dungeon crawl through an ancient dwarven fortress overrun by undead..."
              rows={4}
              className="resize-none"
            />
            {campaignError && (
              <p className="text-sm text-destructive">{campaignError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignTarget(null)} disabled={isCreatingCampaign}>
              Cancel
            </Button>
            <Button
              onClick={handleStartCampaign}
              disabled={!campaignDescription.trim() || isCreatingCampaign}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isCreatingCampaign ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Begin Adventure"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
