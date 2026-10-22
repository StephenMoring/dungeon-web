import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Credits } from "../components/shared/credits";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";
const PANEL = "rounded-[4px] border border-border bg-card";
const SWITCH =
  `${FOCUS} data-[state=checked]:bg-foreground data-[state=unchecked]:bg-input [&[data-state=checked]>span]:!bg-background [&[data-state=unchecked]>span]:!bg-foreground`;
const SLIDER =
  `[&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-input [&_[data-slot=slider-range]]:bg-foreground [&_[data-slot=slider-thumb]]:border-foreground [&_[data-slot=slider-thumb]]:bg-foreground [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-thumb]]:ring-0 [&_[data-slot=slider-thumb]]:focus-visible:outline-solid [&_[data-slot=slider-thumb]]:focus-visible:outline-2 [&_[data-slot=slider-thumb]]:focus-visible:outline-offset-[3px] [&_[data-slot=slider-thumb]]:focus-visible:outline-gold`;

interface SectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="grid grid-cols-[minmax(0,260px)_minmax(0,1fr)] gap-x-10 gap-y-3 border-t border-border py-8 first:border-t-0 first:pt-0 max-[759px]:grid-cols-1">
      <div>
        <h2 className="m-0 text-base font-semibold text-foreground">{title}</h2>
        <p className="m-0 mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

interface SwitchRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SwitchRow({ id, label, description, checked, onChange }: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-[18px] py-4 last:border-b-0">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
        <p className="m-0 mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className={SWITCH} />
    </div>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const [autoSave, setAutoSave] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [aiCreativity, setAiCreativity] = useState([70]);
  const [volume, setVolume] = useState([80]);
  const creativityLabel = aiCreativity[0] < 40 ? "Conservative" : aiCreativity[0] < 70 ? "Balanced" : "Creative";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[960px] px-6 py-6 max-[759px]:px-4">
        <header className="mb-8 flex items-start gap-x-4">
          <Link
            to="/dashboard"
            aria-label="Back to the dashboard"
            className={`-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-foreground ${FOCUS}`}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1 pt-[3px]">
            <h1 className="m-0 font-display text-[28px] font-normal leading-tight text-foreground max-[759px]:text-[24px]">
              Settings
            </h1>
            <p className="m-0 mt-1 text-base text-muted-foreground">Customize your adventure experience</p>
          </div>
        </header>

        <Section title="General" description="Basic application preferences">
          <div className={PANEL}>
            <SwitchRow
              id="auto-save"
              label="Auto-save"
              description="Automatically save campaign progress"
              checked={autoSave}
              onChange={setAutoSave}
            />
            <SwitchRow
              id="notifications"
              label="Notifications"
              description="Receive reminders about active campaigns"
              checked={notifications}
              onChange={setNotifications}
            />
          </div>
        </Section>

        <Section title="Audio" description="Sound and music preferences">
          <div className={PANEL}>
            <SwitchRow
              id="sound-effects"
              label="Sound Effects"
              description="Play sound effects for dice rolls and actions"
              checked={soundEffects}
              onChange={setSoundEffects}
            />
            <div className="px-[18px] py-4">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Master Volume</Label>
                <span className="text-sm text-muted-foreground tabular-nums">{volume[0]}%</span>
              </div>
              <Slider
                aria-label="Master Volume"
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className={`w-full ${SLIDER}`}
              />
            </div>
          </div>
        </Section>

        <Section title="AI Dungeon Master" description="Configure how the AI responds to your actions">
          <div className={PANEL}>
            <div className="px-[18px] py-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Creativity Level</Label>
                  <p className="m-0 mt-0.5 text-sm text-muted-foreground">Higher values = more unexpected events</p>
                </div>
                <span className="text-sm font-medium text-foreground">{creativityLabel}</span>
              </div>
              <Slider
                aria-label="Creativity Level"
                value={aiCreativity}
                onValueChange={setAiCreativity}
                max={100}
                step={1}
                className={`w-full ${SLIDER}`}
              />
            </div>
            <p className="m-0 border-t border-border px-[18px] py-4 text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">Tip:</strong> Lower creativity keeps the story more
              predictable and traditional, while higher creativity introduces more surprises and unusual scenarios.
            </p>
          </div>
        </Section>

        <Section title="Pictures" description="The paintings behind the dungeon">
          <div className={`${PANEL} px-[18px] py-4`}>
            <Credits ids={["pandemonium", "wrath"]} className="leading-relaxed" />
          </div>
        </Section>

        <Section title="Danger Zone" description="Irreversible actions">
          <div className={`${PANEL} flex items-center justify-between gap-4 px-[18px] py-4`}>
            <div className="min-w-0">
              <p className="m-0 text-sm font-medium text-foreground">Clear All Campaign Data</p>
              <p className="m-0 mt-0.5 text-sm text-muted-foreground">Delete all saved campaigns and progress</p>
            </div>
            <button
              type="button"
              className={`inline-flex min-h-11 shrink-0 items-center rounded-[4px] border border-ember px-4 text-sm font-semibold text-ember transition-colors hover:bg-raised ${FOCUS}`}
            >
              Clear Data
            </button>
          </div>
        </Section>

        <div className="flex justify-end gap-3 border-t border-border pt-6 pb-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`inline-flex h-11 items-center rounded-[4px] border border-input px-[22px] text-base font-medium text-foreground transition-colors hover:bg-raised ${FOCUS}`}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`inline-flex h-11 items-center rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground transition-[filter] hover:brightness-110 ${FOCUS}`}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
