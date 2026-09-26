"use client";

import { Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/display";
import { ReportCard } from "@/components/reports/report-card";
import { useLanguage } from "@/features/i18n/language-provider";
import { useNetwork } from "@/features/offline/network-provider";
import { useReports } from "@/features/reports/reports-provider";

export default function ReportsPage() {
  const { t } = useLanguage();
  const { reports, ready } = useReports();
  const { syncNow } = useNetwork();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.statusLead}</p>
      {ready && reports.length === 0 ? (
        <EmptyState title={t.noReports} body={t.noReportsBody} icon={<Clock className="size-6" />} />
      ) : (
        reports.map((report) => (
          <ReportCard key={report.id} report={report} onRetry={() => void syncNow()} />
        ))
      )}
    </div>
  );
}
