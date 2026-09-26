"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mic, Shield, WifiOff } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { useLanguage } from "@/features/i18n/language-provider";
import { cn } from "@/lib/cn";

export default function LandingPage() {
  const { t } = useLanguage();
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && session) {
      router.replace("/home");
    }
  }, [ready, router, session]);

  return (
    <main id="main-content" className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t.brandKicker}
              </p>
              <p className="text-lg font-semibold">{t.brand}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </header>

        <section className="space-y-6">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {t.landingTitle}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{t.landingLead}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
              {t.startReport}
            </Link>
            <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              {t.alreadyCitizen}
            </Link>
          </div>
        </section>

        <section aria-labelledby="how-heading" className="space-y-4">
          <h2 id="how-heading" className="text-xl font-semibold">
            {t.howItWorks}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Mic, title: t.stepVoice, body: t.stepVoiceBody },
              { icon: Shield, title: t.stepEvidence, body: t.stepEvidenceBody },
              { icon: WifiOff, title: t.stepAction, body: t.stepActionBody },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <item.icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl bg-ink p-6 text-paper">
            <h2 className="text-lg font-semibold">{t.worksOffline}</h2>
            <p className="mt-2 text-sm text-paper/80">{t.worksOfflineBody}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{t.bilingual}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.bilingualBody}</p>
          </article>
        </section>

        <p className="text-xs text-muted-foreground">{t.privacyNote}</p>
        <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
          <p>{t.footerSecure}</p>
          <p className="mt-1">{t.footerPowered}</p>
          <p className="mt-2">
            <Link href="/design-system" className="underline underline-offset-2">
              {t.designSystem}
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
