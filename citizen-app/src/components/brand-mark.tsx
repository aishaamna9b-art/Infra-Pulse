import { Activity } from "lucide-react";
import { cn } from "@/lib/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-2xl bg-ink text-paper shadow-sm",
        className,
      )}
      aria-hidden
    >
      <Activity className="size-5" />
    </span>
  );
}
