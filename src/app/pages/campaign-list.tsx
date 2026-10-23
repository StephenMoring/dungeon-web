import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getCampaigns, type Campaign } from "../api/campaigns";
import { LoadError } from "@/app/components/shared/load-error";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";
const MotionLink = motion.create(Link);

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function CampaignList() {
  // null while loading, so neither the count nor the empty state claims anything yet.
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadCampaigns = useCallback(() => {
    setLoadFailed(false);
    setCampaigns(null);
    getCampaigns()
      .then(setCampaigns)
      .catch((err: unknown) => {
        console.error(err);
        setLoadFailed(true);
      });
  }, []);

  useEffect(loadCampaigns, [loadCampaigns]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[960px] px-6 py-6 max-[759px]:px-4">
        <header className="mb-6 flex items-start gap-x-4">
          <Link
            to="/dashboard"
            aria-label="Back to the dashboard"
            className={`-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-foreground ${FOCUS}`}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1 pt-[3px]">
            <h1 className="m-0 break-words font-display text-[28px] font-normal leading-tight text-foreground max-[759px]:text-[24px]">
              Campaigns
            </h1>
            <p className="m-0 mt-1 min-h-6 text-base text-muted-foreground tabular-nums">
              {campaigns && plural(campaigns.length, "campaign")}
            </p>
          </div>
          <MotionLink
            to="/character/new"
            whileTap={{ y: 1 }}
            className={`inline-flex h-11 shrink-0 items-center rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground transition-[filter] hover:brightness-110 ${FOCUS}`}
          >
            New campaign
          </MotionLink>
        </header>

        {loadFailed ? (
          <LoadError onRetry={loadCampaigns} />
        ) : campaigns === null ? null : campaigns.length === 0 ? (
          <p className="m-0 rounded-[4px] border border-dashed border-border px-[18px] py-6 text-base text-muted-foreground">
            No campaigns yet. Forge a hero to begin one.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {campaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="flex items-start gap-3 rounded-[4px] border border-border bg-card px-[18px] py-4 max-[759px]:flex-col max-[759px]:gap-1"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 break-words font-display text-[22px] font-normal leading-tight text-foreground">
                    {campaign.name}
                  </h2>
                  <p className="m-0 mt-1 text-sm text-muted-foreground tabular-nums">
                    {campaign.theme} · {plural(campaign.characters.length, "character")} ·{" "}
                    {plural(campaign.campaign_checkpoints.length, "checkpoint")}
                  </p>
                  <p className="m-0 mt-2 break-words text-base text-muted-foreground">{campaign.description}</p>
                </div>
                <div className="-mr-3 flex shrink-0 items-center gap-1 max-[759px]:-ml-3 max-[759px]:w-full max-[759px]:justify-between">
                  <Link
                    to={`/adventure/${campaign.id}`}
                    className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-[4px] px-3 text-sm font-semibold text-gold hover:brightness-110 ${FOCUS}`}
                  >
                    Continue
                    <span className="sr-only">: {campaign.name}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label={`Delete ${campaign.name}`}
                    className={`inline-flex size-11 items-center justify-center rounded-[4px] text-faint transition-colors hover:text-ember ${FOCUS}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
