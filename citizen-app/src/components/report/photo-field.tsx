"use client";

import { useRef } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/display";
import { useLanguage } from "@/features/i18n/language-provider";
import { compressImage } from "@/lib/utils";

export function PhotoField({
  photoUrl,
  onChange,
}: {
  photoUrl: string | null;
  onChange: (file: File | null, dataUrl: string | null) => void;
}) {
  const { t } = useLanguage();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const compressed = await compressImage(file);
    onChange(compressed.file, compressed.dataUrl);
  };

  const clear = () => {
    onChange(null, null);
    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card>
      <CardTitle>{t.photoTitle}</CardTitle>
      <p className="mt-1 text-sm text-muted-foreground">{t.photoOptional}</p>
      {photoUrl ? (
        <div className="relative mt-4 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt={t.evidenceAlt} className="h-52 w-full object-cover" />
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              {t.retake}
            </Button>
            <Button type="button" variant="destructive" onClick={clear}>
              <Trash2 className="size-4" />
              {t.removePhoto}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={() => cameraRef.current?.click()}>
            <Camera className="size-4" />
            {t.takePhoto}
          </Button>
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="size-4" />
            {t.uploadPhoto}
          </Button>
        </div>
      )}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </Card>
  );
}
