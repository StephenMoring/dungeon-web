import { useState, useEffect } from "react";
import { MotionConfig } from "motion/react";
import { useParams, useLocation } from "react-router";
import { getCampaignCharacterId, getCampaigns, type Campaign as CampaignRecord } from "@/app/api/campaigns";
import { getCharacter, type Character } from "@/app/api/characters";
import { getEncounter } from "@/app/api/combat";
import type { EncounterState } from "@/app/api/turn-stream";
import { LoadError } from "@/app/components/shared/load-error";
import { CharacterSheet } from "./character-sheet";
import { ChatInterface } from "./chat-interface";
import { NotesSection } from "./notes-section";
import { ArtBand } from "./art-band";
import { PlayHeader } from "./play-header";
import { campaignName } from "./campaign-name";

const PANE = "min-h-0 rounded-[4px] border border-border bg-card";

export function Campaign() {
  const { id = "" } = useParams();
  const { state } = useLocation();
  const locationState = state as { openingMessage?: string; characterId?: number } | null;
  const openingMessage = locationState?.openingMessage ?? null;
  const [characterId, setCharacterId] = useState<number | null>(locationState?.characterId ?? null);
  const [campaigns, setCampaigns] = useState<CampaignRecord[] | null>(null);

  useEffect(() => {
    if (!characterId && id) {
      getCampaignCharacterId(id).then(setCharacterId).catch(console.error);
    }
  }, [id, characterId]);

  useEffect(() => {
    getCampaigns().then(setCampaigns).catch(console.error);
  }, []);

  const [character, setCharacter] = useState<Character | null>(null);
  const [characterFailed, setCharacterFailed] = useState(false);
  const [characterAttempt, setCharacterAttempt] = useState(0);

  useEffect(() => {
    if (characterId == null) return;
    let cancelled = false;
    setCharacterFailed(false);
    getCharacter(characterId)
      .then((loaded) => {
        if (!cancelled) setCharacter(loaded);
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!cancelled) setCharacterFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [characterId, characterAttempt]);

  const [encounter, setEncounter] = useState<EncounterState | null>(null);

  useEffect(() => {
    if (characterId == null) return;
    let cancelled = false;
    getEncounter(characterId)
      .then((loaded) => {
        if (!cancelled) setEncounter(loaded);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [characterId]);

  // Hit points live on the server; every fight update carries the player's too.
  const handleEncounter = (next: EncounterState) => {
    setEncounter(next.status === "active" ? next : null);
    setCharacter((current) =>
      current
        ? {
            ...current,
            current_hp: next.player.hp,
            max_hp: next.player.max_hp,
            died_at: next.player.dead ? (current.died_at ?? new Date().toISOString()) : current.died_at,
          }
        : current
    );
  };

  const [notes, setNotes] = useState(
    "- Entered ancient dungeon\n- Two paths: north (water sounds) and east (red glow)\n"
  );

  return (
    <MotionConfig reducedMotion="user">
      {/* Desktop and tablet fit the height under the navbar; phones scroll as one column. */}
      <div className="flex h-full flex-col overflow-hidden bg-background max-[759px]:overflow-y-auto">
        <ArtBand />
        <PlayHeader title={campaignName(campaigns, id)} meta={character ? `${character.name} · ${character.hero_class}` : ""} />

        <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_240px] grid-rows-[minmax(0,1fr)] gap-4 px-6 pb-6 min-[760px]:max-[1099px]:grid-cols-[240px_minmax(0,1fr)] min-[760px]:max-[1099px]:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] max-[759px]:flex-none max-[759px]:grid-cols-1 max-[759px]:grid-rows-none max-[759px]:px-4 max-[759px]:pb-4">
          <aside
            aria-label="Character"
            className={`${PANE} overflow-y-auto min-[760px]:max-[1099px]:col-start-1 min-[760px]:max-[1099px]:row-start-1 max-[759px]:overflow-visible`}
          >
            {character ? (
              <CharacterSheet character={character} />
            ) : characterFailed ? (
              <LoadError className="p-5" onRetry={() => setCharacterAttempt((n) => n + 1)} />
            ) : null}
          </aside>

          <section
            aria-label="Story"
            className={`${PANE} relative flex flex-col overflow-hidden min-[760px]:max-[1099px]:col-start-2 min-[760px]:max-[1099px]:row-span-2 min-[760px]:max-[1099px]:row-start-1 max-[759px]:order-first max-[759px]:max-h-[max(440px,80svh)] max-[759px]:min-h-[420px]`}
          >
            <ChatInterface
              openingMessage={openingMessage}
              characterId={characterId}
              character={character}
              encounter={encounter}
              onEncounter={handleEncounter}
              onCharacter={setCharacter}
            />
          </section>

          <aside
            aria-label="Notes"
            className={`${PANE} flex flex-col min-[760px]:max-[1099px]:col-start-1 min-[760px]:max-[1099px]:row-start-2`}
          >
            <NotesSection notes={notes} onUpdate={setNotes} />
          </aside>
        </div>
      </div>
    </MotionConfig>
  );
}
