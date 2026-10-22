import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";

interface PlayHeaderProps {
  title: string;
  meta: string;
}

export function PlayHeader({ title, meta }: PlayHeaderProps) {
  return (
    <header className="flex shrink-0 items-start gap-x-4 gap-y-1 px-6 py-[14px] max-[759px]:px-4">
      <Link
        to="/dashboard"
        aria-label="Back to the dashboard"
        className={`-ml-2 inline-flex size-11 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-foreground ${FOCUS}`}
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-0.5 pt-[3px]">
        <h1 className="m-0 min-w-0 break-words font-display text-[28px] font-normal leading-tight text-foreground">
          {title}
        </h1>
        <span className="min-w-0 break-words text-[15px] text-muted-foreground">{meta}</span>
      </div>
      <motion.button
        type="button"
        whileTap={{ y: 1 }}
        className={`h-11 shrink-0 rounded-[4px] border border-input bg-transparent px-5 text-base font-medium text-foreground transition-colors hover:bg-raised ${FOCUS}`}
      >
        Save
      </motion.button>
    </header>
  );
}
