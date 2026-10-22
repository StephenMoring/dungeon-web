import { Link } from "react-router";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";

export function NotFound() {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto px-6 py-10">
      <div className="max-w-md text-center">
        <h1 className="m-0 break-words font-display text-[32px] font-normal leading-tight text-foreground max-[759px]:text-[24px]">
          Lost in the dark
        </h1>
        <p className="m-0 mt-3 text-base text-muted-foreground">This path leads nowhere. The torches have gone out.</p>
        <Link
          to="/dashboard"
          className={`mt-8 inline-flex h-11 items-center rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground transition-[filter] hover:brightness-110 ${FOCUS}`}
        >
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}
