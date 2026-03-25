import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/app/components/ui/button";

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

export function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-screen bg-background dark relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-background to-emerald-900/10 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 bg-purple-400/30 rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
            ⚔ Dungeon Master AI
          </span>
          <Button
            onClick={handleDiscordLogin}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-0"
          >
            Login with Discord
          </Button>
        </nav>

        {/* Hero */}
        <section className="text-center px-6 py-28 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-purple-400 mb-5">
              Your AI Dungeon Master Awaits
            </p>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.05] mb-6 bg-gradient-to-br from-white via-white to-purple-400 bg-clip-text text-transparent">
              Epic Adventures,<br />Infinite Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Create your character, step into any world, and let an AI dungeon master guide your
              journey — solo or with friends.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDiscordLogin}
                className="bg-purple-600 hover:bg-purple-500 text-white border-0 px-8"
              >
                Start Playing Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 text-muted-foreground hover:text-white"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works ↓
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="px-8 py-20 max-w-5xl mx-auto border-t border-white/5">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-3 text-center">Features</p>
          <h2 className="text-3xl font-black text-center mb-12">Everything you need to adventure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🧙",
                title: "AI Dungeon Master",
                desc: "Reactive storytelling that adapts to every choice you make.",
                accent: "purple",
              },
              {
                icon: "⚔️",
                title: "Character Builder",
                desc: "Create and save characters across unlimited campaigns.",
                accent: "emerald",
              },
              {
                icon: "📜",
                title: "Campaign History",
                desc: "Every adventure saved. Pick up right where you left off.",
                accent: "pink",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-xl border p-6 bg-gradient-to-br ${
                  f.accent === "purple"
                    ? "from-purple-500/10 to-transparent border-purple-500/20"
                    : f.accent === "emerald"
                    ? "from-emerald-500/10 to-transparent border-emerald-500/20"
                    : "from-pink-500/10 to-transparent border-pink-500/20"
                }`}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="px-8 py-20 max-w-3xl mx-auto border-t border-white/5">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-purple-400 mb-3 text-center">Pricing</p>
          <h2 className="text-3xl font-black text-center mb-12">Simple, free to start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-7">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest mb-2">FREE</p>
              <p className="text-4xl font-black mb-5">$0</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-7">
                {["3 campaigns", "1 character", "50 AI turns/month", "Campaign history"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-white/10" onClick={handleDiscordLogin}>
                Get started free
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-7 relative">
              <span className="absolute -top-3 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                POPULAR
              </span>
              <p className="text-xs font-semibold text-purple-400 tracking-widest mb-2">PRO</p>
              <p className="text-4xl font-black mb-5">
                $9<span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-7">
                {["Unlimited campaigns", "Unlimited characters", "Unlimited AI turns", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-purple-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white border-0" onClick={handleDiscordLogin}>
                Start with Pro
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="px-8 py-24 text-center border-t border-white/5 bg-[radial-gradient(ellipse_at_50%_100%,rgba(124,58,237,0.08),transparent_70%)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4">Ready to roll?</h2>
            <p className="text-muted-foreground mb-8">
              Sign in with Discord and your first adventure starts in seconds.
            </p>
            <Button
              size="lg"
              onClick={handleDiscordLogin}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 px-10 py-5 text-base font-bold"
            >
              Login with Discord
            </Button>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
