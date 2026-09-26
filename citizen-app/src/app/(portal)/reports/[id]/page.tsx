"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge, Card } from "@/components/ui/display";
import { useLanguage } from "@/features/i18n/language-provider";
import { getReport } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import type { StoredReport } from "@/types/report";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useLanguage();
  const [report, setReport] = useState<StoredReport | null | undefined>(undefined);

  useEffect(() => {
    void getReport(params.id).then((value) => setReport(value ?? null));
  }, [params.id]);

  if (report === undefined) {
    return <p>{t.loading}</p>;
  }

  if (!report) {
    return <p>{t.notFound}</p>;
  }

  return (
    <div className="space-y-4">
      <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="size-4" />
        {t.backToList}
      </Link>
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold capitalize">{report.category.replace("_", " ")}</h2>
            <p className="text-sm text-muted-foreground">{formatDateTime(report.timestamp, locale)}</p>
          </div>
          <Badge tone={report.synced ? "success" : "warning"}>
            {report.synced ? t.sentToGovt : t.pendingSync}
          </Badge>
        </div>
        <p>{report.description}</p>
        {report.location.address ? <p className="text-sm">{report.location.address}</p> : null}
        
        {report.masterTicketId ? (
          <p className="text-sm font-medium">
            {t.ticketId} #{report.masterTicketId}
            {report.isDuplicate ? ` · ${t.clustered}` : ""}
          </p>
        ) : null}
        {report.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={report.photoDataUrl} alt={t.evidenceAlt} className="h-56 w-full rounded-xl object-cover" />
        ) : null}
      </Card>
    </div>
  );
}
