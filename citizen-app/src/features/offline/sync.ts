import { submitReport } from "@/lib/api";
import { getUnsyncedReports, markAsSynced, markSyncFailed } from "@/lib/db";

export async function flushPendingReports() {
  const pending = await getUnsyncedReports();
  let sent = 0;
  let failed = 0;

  for (const report of pending) {
    try {
      const result = await submitReport(report);
      await markAsSynced(report.id, {
        backendReportId: result.report_id,
        masterTicketId: result.master_ticket_id ?? undefined,
        isDuplicate: result.is_duplicate,
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      await markSyncFailed(
        report.id,
        error instanceof Error ? error.message : "Sync failed",
      );
    }
  }

  return { sent, failed, remaining: pending.length - sent };
}
