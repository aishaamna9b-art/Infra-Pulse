"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/display";
import { ReportCard } from "@/components/reports/report-card";
import { useAuth } from "@/features/auth/auth-provider";
import { useLanguage } from "@/features/i18n/language-provider";
import { useReports } from "@/features/reports/reports-provider";
import { firstName } from "@/lib/utils";
import { cn } from "@/lib/cn";

export default function HomePage() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const { reports } = useReports();
  const pending = reports.filter((item) => item.synced === 0).length;
  const synced = reports.length - pending;

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <p className="text-sm font-semibold text-primary">
          {t.welcome}, {session ? firstName(session.name) : ""}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.homeLead}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-3xl font-semibold">{pending}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.pendingCount}</p>
        </Card>
        <Card>
          <p className="text-3xl font-semibold">{synced}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.syncedCount}</p>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/report" className={cn(buttonVariants({ size: "lg" }), "justify-center")}>
          <Plus className="size-4" />
          {t.quickReport}
        </Link>
        <Link href="/reports" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "justify-center")}>
          <ClipboardList className="size-4" />
          {t.viewHistory}
        </Link>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t.recent}</h2>
          <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {t.seeAll}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        {reports.slice(0, 3).map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
    </div>
  );
}
