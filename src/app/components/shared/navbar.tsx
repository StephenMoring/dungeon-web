import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Wordmark } from "./wordmark";
import { NavLinks } from "./nav-links";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";

interface NavbarProps {
  variant?: "solid" | "overlay";
}

export function Navbar({ variant = "solid" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const solid = variant === "solid";

  return (
    <nav
      data-variant={variant}
      aria-label="Main"
      className={
        solid
          ? "h-14 shrink-0 flex items-center gap-8 px-4 min-[760px]:px-6 border-b border-border bg-background"
          : "absolute inset-x-0 top-0 z-20 h-14 flex items-center gap-8 px-4 min-[760px]:px-6"
      }
    >
      <Wordmark />

      <div className="hidden min-[760px]:flex items-center gap-6">
        <NavLinks />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="min-[760px]:hidden inline-flex h-9 items-center gap-2 rounded-[4px] px-2 text-base font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
            >
              <MenuIcon className="size-5" aria-hidden="true" />
              Menu
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 gap-0">
            <SheetHeader>
              <SheetTitle className="font-body font-semibold">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              <NavLinks linkClassName="py-3" onNavigate={() => setMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <UserMenu />
      </div>
    </nav>
  );
}
