import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { getCharacters, type CharacterWithCampaign } from "@/app/api/characters";
import { createCampaign } from "@/app/api/campaigns";
import { continueTarget } from "./continue-target";
import { DashboardHero } from "./dashboard-hero";
import { HeroRoster } from "./hero-roster";
import { LoadError } from "@/app/components/shared/load-error";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";

export function Home() {
  const navigate = useNavigate();
  // null while loading; the error flag stops the forge action from showing for a failed request.
  const [characters, setCharacters] = useState<CharacterWithCampaign[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [campaignTarget, setCampaignTarget] = useState<CharacterWithCampaign | null>(null);
  const [campaignDescription, setCampaignDescription] = useState("");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  const loadCharacters = useCallback(() => {
    setLoadFailed(false);
    setCharacters(null);
    getCharacters()
      .then(setCharacters)
      .catch((err: unknown) => {
        console.error(err);
        setLoadFailed(true);
      });
  }, []);

  useEffect(loadCharacters, [loadCharacters]);

  const target = characters && continueTarget(characters);
  const heroName = characters?.find((i) => i.character.campaign_id != null)?.character.name;

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
    <MotionConfig reducedMotion="user">
      <div className="h-full overflow-y-auto bg-background">
        <DashboardHero
          target={target}
          heroName={heroName}
          status={loadFailed ? <LoadError onRetry={loadCharacters} className="max-w-[40ch]" /> : undefined}
        />
        {characters && <HeroRoster items={characters} onBegin={openCampaignDialog} />}
      </div>

      <Dialog open={campaignTarget !== null} onOpenChange={(open) => { if (!open) setCampaignTarget(null); }}>
        <DialogContent className="rounded-[4px] border-border bg-card">
          <DialogHeader className="text-left">
            <DialogTitle className="font-body text-lg font-semibold leading-snug">
              Begin a campaign for <span className="font-display text-[22px] font-normal">{campaignTarget?.character.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2.5 py-2">
            <Label htmlFor="campaign-description" className="text-sm font-medium">
              Describe the campaign you want to play
            </Label>
            <Textarea
              id="campaign-description"
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              placeholder="A dark dungeon crawl through an ancient dwarven fortress overrun by undead..."
              rows={4}
              className={`resize-none rounded-[4px] border-input bg-raised text-base placeholder:text-faint ${FOCUS}`}
            />
            {campaignError && <p className="text-sm text-ember">{campaignError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCampaignTarget(null)}
              disabled={isCreatingCampaign}
              className={`h-11 rounded-[4px] border-input bg-transparent px-5 text-base dark:bg-transparent ${FOCUS}`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartCampaign}
              disabled={!campaignDescription.trim() || isCreatingCampaign}
              className={`h-11 rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground hover:bg-gold hover:brightness-110 ${FOCUS}`}
            >
              {isCreatingCampaign ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Beginning…
                </>
              ) : (
                "Begin the campaign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MotionConfig>
  );
}
