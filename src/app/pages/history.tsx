import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";

// TODO(data): sample sessions and the all-time figures below are hard-coded mock data (spec "Known content issues"); replace with real data from dungeon-service.
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

const figures = [
  { label: "Total sessions", value: "63" },
  { label: "Time played", value: "142h" },
  { label: "Active campaigns", value: "4" },
  { label: "Quests completed", value: "28" },
];

export function History() {
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
              History
            </h1>
            <p className="m-0 mt-1 text-base text-muted-foreground">Your past sessions, newest first</p>
          </div>
        </header>

        <ul className="m-0 flex list-none flex-col rounded-[4px] border border-border bg-card p-0">
          {sessions.map((session) => (
            <li key={session.id} className="border-b border-border px-[18px] py-4 last:border-b-0">
              <h2 className="m-0 break-words font-display text-[22px] font-normal leading-tight text-foreground">
                {session.campaign}
              </h2>
              <p className="m-0 mt-1 text-sm text-muted-foreground tabular-nums">
                <time dateTime={session.date}>{session.date}</time> · {session.duration}
              </p>
              <p className="m-0 mt-2 break-words text-base leading-relaxed text-foreground">{session.summary}</p>
              <p className="m-0 mt-2 break-words text-sm text-muted-foreground">{session.highlights.join(" · ")}</p>
            </li>
          ))}
        </ul>

        <section aria-labelledby="alltime-heading" className="mt-6">
          <h2 id="alltime-heading" className="m-0 mb-2 text-lg font-semibold text-foreground">
            All time
          </h2>
          <dl className="m-0 grid grid-cols-4 gap-px overflow-hidden rounded-[4px] border border-border bg-border max-[759px]:grid-cols-2">
            {figures.map((figure) => (
              <div key={figure.label} className="bg-card px-[18px] py-4">
                <dt className="text-sm text-muted-foreground">{figure.label}</dt>
                <dd className="m-0 mt-1 text-[28px] font-medium leading-tight text-foreground tabular-nums">
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
