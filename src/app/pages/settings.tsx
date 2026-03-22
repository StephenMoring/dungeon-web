import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { ArrowLeft, Volume2, Bell, Sparkles, Palette } from "lucide-react";

export function Settings() {
  const navigate = useNavigate();
  const [autoSave, setAutoSave] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [aiCreativity, setAiCreativity] = useState([70]);
  const [volume, setVolume] = useState([80]);

  return (
    <div className="h-full p-8 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-6">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize your adventure experience
            </p>
          </div>
        </motion.div>

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-400" />
                <CardTitle>General</CardTitle>
              </div>
              <CardDescription>
                Basic application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save campaign progress
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders about active campaigns
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audio Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-blue-400" />
                <CardTitle>Audio</CardTitle>
              </div>
              <CardDescription>
                Sound and music preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-effects">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound effects for dice rolls and actions
                  </p>
                </div>
                <Switch
                  id="sound-effects"
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Master Volume</Label>
                  <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-emerald-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <CardTitle>AI Dungeon Master</CardTitle>
              </div>
              <CardDescription>
                Configure how the AI responds to your actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Creativity Level</Label>
                    <p className="text-sm text-muted-foreground">
                      Higher values = more unexpected events
                    </p>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">
                    {aiCreativity[0] < 40 ? "Conservative" : aiCreativity[0] < 70 ? "Balanced" : "Creative"}
                  </span>
                </div>
                <Slider
                  value={aiCreativity}
                  onValueChange={setAiCreativity}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-emerald-500/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Lower creativity keeps the story more predictable and traditional, while higher creativity introduces more surprises and unusual scenarios.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-600/5">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Clear All Campaign Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Delete all saved campaigns and progress
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end gap-4"
        >
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Save Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
