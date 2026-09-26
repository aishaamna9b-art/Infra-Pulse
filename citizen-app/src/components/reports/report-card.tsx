"use client";

import Link from "next/link";
import { CheckCircle, Clock, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/display";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/features/i18n/language-provider";
import { formatDateTime } from "@/lib/utils";
import type { StoredReport } from "@/types/report";

export function ReportCard({
  report,
  onRetry,
}: {
  report: StoredReport;
  onRetry?: (id: string) => void;
}) {
  const { t, locale } = useLanguage();
  const pending = report.synced === 0;

  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${pending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
      >
        {pending ? <Clock className="size-5" /> : <CheckCircle className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="truncate font-semibold">
              <Link href={`/reports/${report.id}`} className="hover:underline">
                {(report.category || 'other').replace("_", " ")}
              </Link>
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatDateTime(report.timestamp, locale)} · #{report.id.slice(-4)}
            </p>
          </div>
          {report.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.photoDataUrl}
              alt={t.evidenceAlt}
              className="size-16 rounded-lg object-cover"
            />
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-sm">{report.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={pending ? (report.lastError ? "danger" : "warning") : "success"}>
            {pending ? (report.lastError ? t.failedSync : t.pendingSync) : t.sentToGovt}
          </Badge>
          {!pending && report.status ? (
            <Badge tone={report.status === 'Resolved' ? 'success' : report.status === 'In Progress' ? 'warning' : 'neutral'}>
              {report.status.toUpperCase()}
            </Badge>
          ) : null}
          {pending && onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={() => onRetry(report.id)}>
              <RotateCw className="size-3.5" />
              {t.retryNow}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
