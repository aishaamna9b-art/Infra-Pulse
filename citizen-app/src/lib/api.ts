import type { CreateReportResponse, StoredReport } from "@/types/report";
import { dataUrlToFile } from "@/lib/utils";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { detail?: string; error?: string; message?: string };
    return json.detail || json.error || json.message || text;
  } catch {
    return text || `Request failed with ${response.status}`;
  }
}

export async function submitReport(report: StoredReport): Promise<CreateReportResponse> {
  const formData = new FormData();
  formData.append("description", report.description);
  formData.append("latitude", String(report.location.latitude || 0));
  formData.append("longitude", String(report.location.longitude || 0));
  formData.append("category", report.category);

  if (report.photoDataUrl) {
    formData.append("file", dataUrlToFile(report.photoDataUrl, `evidence-${report.id}.jpg`));
  } else {
    formData.append("file", new Blob([""], { type: "image/jpeg" }), "empty.jpg");
  }

  const response = await fetch("/api/v1/reports", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return response.json() as Promise<CreateReportResponse>;
}

export async function validateImage(file: Blob, category: string): Promise<{is_valid: boolean; message: string}> {
  const formData = new FormData();
  formData.append("file", file, "validation.jpg");
  formData.append("category", category);

  const response = await fetch("/api/v1/reports/validate-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  
  return response.json() as Promise<{is_valid: boolean; message: string}>;
}

export async function reverseGeocode(lat: number, lon: number) {
  const response = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  const data = (await response.json()) as { address?: string };
  return data.address ?? "";
}

export async function transcribeAudio(audio: Blob, language: "en" | "ta") {
  const formData = new FormData();
  formData.append("audio", audio, "recording.webm");
  formData.append("language", language);

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { text?: string; error?: string };
  if (!response.ok) {
    throw new ApiError(data.error || "Transcription failed", response.status);
  }
  return data.text ?? "";
}
