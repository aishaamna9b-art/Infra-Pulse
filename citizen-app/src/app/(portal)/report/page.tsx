"use client";

import { ReportWizard } from "@/components/report/report-wizard";
import { useLanguage } from "@/features/i18n/language-provider";

export default function ReportPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.reportLead}</p>
      <ReportWizard />
    </div>
  );
}
