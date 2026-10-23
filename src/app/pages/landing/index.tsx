import { useEffect } from "react";
import { useNavigate } from "react-router";
import { MotionConfig } from "motion/react";
import { useAuth } from "@/app/context/auth-context";
import type { ArtId } from "@/app/art/registry";
import { LandingNav } from "./landing-nav";
import { LandingHero } from "./landing-hero";
import { TurnSection } from "./turn-section";
import { CampaignsSection } from "./campaigns-section";
import { HeroesSection } from "./heroes-section";
import { DescentSection } from "./descent-section";
import { LandingFooter } from "./landing-footer";

function buildDiscordOAuthUrl(): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI as string;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function handleDiscordLogin() {
  window.location.href = buildDiscordOAuthUrl();
}

/** Every painting on the page, in order of appearance, for the footer credits. */
const PAGE_ART: ArtId[] = ["pompeii", "wrath", "sadak", "deluge"];

export function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className="min-h-svh overflow-x-clip bg-background text-foreground">
        <LandingNav onEnter={handleDiscordLogin} />
        <main>
          <LandingHero onEnter={handleDiscordLogin} />
          <TurnSection onEnter={handleDiscordLogin} />
          <CampaignsSection />
          <HeroesSection />
          <DescentSection onEnter={handleDiscordLogin} />
        </main>
        <LandingFooter onEnter={handleDiscordLogin} art={PAGE_ART} />
      </div>
    </MotionConfig>
  );
}
