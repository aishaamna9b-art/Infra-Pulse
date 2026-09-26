import type { Metadata, Viewport } from "next";
import { Noto_Sans_Tamil, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { SkipLink } from "@/components/layout/skip-link";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const tamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Infra-Pulse",
    template: "%s · Infra-Pulse",
  },
  description: "Report civic infrastructure issues by voice, photo, or text — even offline.",
  manifest: "/manifest.json",
  applicationName: "Infra-Pulse",
  appleWebApp: {
    capable: true,
    title: "Infra-Pulse",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10231f" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a17" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${tamil.variable} h-full`}>
      <body className="min-h-full">
        <AppProviders>
          <SkipLink />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
