"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CheckCircle, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/display";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { PhotoField } from "@/components/report/photo-field";
import { useLanguage } from "@/features/i18n/language-provider";
import { useNetwork } from "@/features/offline/network-provider";
import { useReports } from "@/features/reports/reports-provider";
import { reverseGeocode, submitReport, validateImage } from "@/lib/api";
import { markAsSynced, markSyncFailed } from "@/lib/db";
import { dataUrlToFile } from "@/lib/utils";
import type { IssueCategory, StoredReport } from "@/types/report";
import { ISSUE_CATEGORIES } from "@/types/report";

const AudioRecorder = dynamic(
  () => import("@/components/report/audio-recorder").then((mod) => mod.AudioRecorder),
  { ssr: false },
);

type Step = 0 | 1 | 2;

export function ReportWizard() {
  const { t } = useLanguage();
  const { upsert, refresh } = useReports();
  const { online } = useNetwork();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<StoredReport | null>(null);
  const [sentOnline, setSentOnline] = useState(false);

  const fetchGps = () => {
    if (!("geolocation" in navigator)) {
      setError(t.geoUnsupported);
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setCoords({ latitude, longitude });
        try {
          const resolved = await reverseGeocode(latitude, longitude);
          if (resolved) setAddress(resolved);
        } catch {
          // Address is optional when GPS is present.
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError(t.gpsError);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const goNext = async () => {
    if (step === 0 && (!category || description.trim().length < 8)) {
      setError(t.missingIssue);
      return;
    }
    if (step === 1) {
      if (!coords && address.trim().length < 5) {
        setError(t.missingPlace);
        return;
      }
    }
    setError("");
    setStep((current) => (current + 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    const report: Omit<StoredReport, "synced"> = {
      id: `${Date.now()}`,
      description: description.trim(),
      category: category || "uncategorized",
      photoDataUrl: photoUrl || undefined,
      location: {
        latitude: coords?.latitude ?? 0,
        longitude: coords?.longitude ?? 0,
        address: address.trim() || undefined,
      },
      timestamp: Date.now(),
    };

    try {
      const stored = await upsert(report);
      let synced = false;
      if (online) {
        try {
          const result = await submitReport({ ...stored, photoDataUrl: photoUrl || undefined });
          await markAsSynced(stored.id, {
            backendReportId: result.report_id,
            masterTicketId: result.master_ticket_id ?? undefined,
            isDuplicate: result.is_duplicate,
          });
          synced = true;
        } catch (err) {
          await markSyncFailed(stored.id, err instanceof Error ? err.message : "Failed");
        }
      }
      await refresh();
      setSentOnline(synced);
      setSaved(stored);
    } catch {
      setError("Failed to save the report on this device.");
    } finally {
      setSubmitting(false);
    }
  };

  if (saved) {
    return (
      <Card className="py-10 text-center">
        <CheckCircle className="mx-auto size-12 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">{t.successTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {sentOnline ? t.successOnline : t.successOffline}
        </p>
        <p className="mt-3 text-sm font-medium">
          {t.ticketId} #{saved.id.slice(-6)}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => router.push(`/reports/${saved.id}`)}>
            {t.viewThis}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSaved(null);
              setStep(0);
              setCategory("");
              setDescription("");
              setAddress("");
              setCoords(null);
              setPhotoUrl(null);
              setSentOnline(false);
            }}
          >
            {t.reportAnother}
          </Button>
        </div>
      </Card>
    );
  }

  const categoryLabel: Record<IssueCategory, string> = {
    pothole: t.categoryPothole,
    streetlight: t.categoryStreetlight,
    garbage: t.categoryGarbage,
    water_leakage: t.categoryWater,
    other: t.categoryOther,
  };

  return (
    <div className="space-y-5">
      <ProgressSteps steps={[t.stepIssue, t.stepPlace, t.stepReview]} current={step} />

      {step === 0 ? (
        <Card className="space-y-4">
          <Field label={t.category} htmlFor="category" error={error && !category ? error : undefined}>
            <Select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as IssueCategory)}
              required
            >
              <option value="" disabled>
                {t.selectCategory}
              </option>
              {ISSUE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabel[value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.description} htmlFor="description">
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t.descriptionPlaceholder}
            />
          </Field>
          <p className="text-center text-xs font-medium text-muted-foreground">{t.preferSpeaking}</p>
          <AudioRecorder onTranscriptionComplete={setDescription} />
        </Card>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label={t.locationTitle} htmlFor="address">
              <div className="relative flex items-center">
                <Input
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="pr-[160px]"
                />
                <Button 
                  type="button" 
                  size="sm"
                  variant="secondary" 
                  onClick={fetchGps} 
                  disabled={locating}
                  className="absolute right-1 h-8 text-muted-foreground hover:text-foreground"
                >
                  <MapPin className="mr-2 size-4" />
                  {locating ? t.locating : t.useGps}
                </Button>
              </div>
            </Field>
            {address ? (
              <p className="text-sm font-medium text-emerald-800">
                {t.gpsSaved}: {address}
              </p>
            ) : null}
          </Card>
          <PhotoField
            photoUrl={photoUrl}
            onChange={async (file, dataUrl) => {
              if (!file || !dataUrl) {
                setPhotoUrl(null);
                return;
              }
              if (category && online) {
                setSubmitting(true);
                setError("");
                try {
                  const result = await validateImage(file, category);
                  if (!result.is_valid) {
                    setError("image unrelated");
                    setPhotoUrl(null);
                    setSubmitting(false);
                    return;
                  }
                } catch (err) {
                  setError("image unrelated");
                  setPhotoUrl(null);
                  setSubmitting(false);
                  return;
                }
                setSubmitting(false);
              }
              setPhotoUrl(dataUrl);
              setError("");
            }}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-4">
          <CardTitle>{t.reviewTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.reviewHint}</p>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{t.category}</dt>
              <dd className="font-semibold">{category ? categoryLabel[category] : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t.description}</dt>
              <dd className="font-medium">{description}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t.locationTitle}</dt>
              <dd className="font-medium">{address || t.gpsSaved}</dd>
            </div>
          </dl>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={t.evidenceAlt} className="h-40 w-full rounded-xl object-cover" />
          ) : null}
        </Card>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        {step > 0 ? (
          <Button type="button" variant="outline" className="flex-1" onClick={() => setStep((current) => (current - 1) as Step)}>
            {t.previous}
          </Button>
        ) : null}
        {step < 2 ? (
          <Button type="button" className="flex-1" onClick={() => void goNext()} disabled={submitting}>
            {submitting ? t.submitting : t.continue}
          </Button>
        ) : (
          <Button type="button" className="flex-1" onClick={() => void handleSubmit()} disabled={submitting}>
            <ShieldCheck className="size-4" />
            {submitting ? t.submitting : t.submitReport}
          </Button>
        )}
      </div>
    </div>
  );
}
