import { useState } from "react";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { deleteCampaign } from "@/app/api/campaigns";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";

interface DeleteCampaignDialogProps {
  campaignId: number;
  campaignName: string;
  onDeleted: (campaignId: number) => void;
}

/** The trash button on a campaign row, and the confirmation it opens. */
export function DeleteCampaignDialog({ campaignId, campaignName, onDeleted }: DeleteCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    setFailed(false);
    try {
      await deleteCampaign(campaignId);
      setOpen(false);
      onDeleted(campaignId);
    } catch (err) {
      console.error(err);
      setFailed(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (deleting) return;
        setOpen(next);
        if (!next) setFailed(false);
      }}
    >
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label={`Delete ${campaignName}`}
          className={`inline-flex size-11 items-center justify-center rounded-[4px] text-faint transition-colors hover:text-ember ${FOCUS}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[4px] border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words text-xl font-semibold">Delete {campaignName}?</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground">
            The story so far, its checkpoints and everything the Dungeon Master remembers about it are deleted for good.
            Your characters are kept and can begin a new campaign.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="m-0 text-base text-ember">
            Couldn't delete the campaign. Try again.
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting} className={`h-11 rounded-[4px] text-base ${FOCUS}`}>
            Cancel
          </AlertDialogCancel>
          <motion.button
            type="button"
            onClick={confirm}
            disabled={deleting}
            whileTap={{ y: 1 }}
            className={`inline-flex h-11 items-center justify-center rounded-[4px] border border-ember px-[22px] text-base font-semibold text-ember transition-colors hover:bg-ember hover:text-destructive-foreground disabled:opacity-60 ${FOCUS}`}
          >
            {deleting ? "Deleting…" : "Delete campaign"}
          </motion.button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
