"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/display";
import { Field, Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/display";
import { useAuth } from "@/features/auth/auth-provider";
import { useLanguage } from "@/features/i18n/language-provider";
import { sleep } from "@/lib/utils";

type Step = "details" | "busy" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { session, ready, signIn } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && session) {
      if (session.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    }
  }, [ready, router, session]);

  const sendOtp = async () => {
    if (name.trim().length < 3) {
      setError(t.nameError);
      return;
    }
    if (phone.length !== 10) {
      setError(t.phoneError);
      return;
    }
    setError("");
    setStep("busy");
    await sleep(700);
    setStep("otp");
  };

  const verify = async () => {
    if (otp.length !== 4) {
      setError(t.otpError);
      return;
    }
    setError("");
    setStep("busy");
    await sleep(500);
    signIn({ name: name.trim(), phone });
    router.push("/home");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name === 'admin' && otp === 'admin123') { // Reusing 'name' and 'otp' for admin ID/Pass
      signIn({ name: 'Admin', phone: '0000000000', role: 'admin' });
      router.push("/admin");
    } else {
      setError("Invalid admin credentials");
    }
  };

  const [loginMode, setLoginMode] = useState<"citizen" | "admin">("citizen");

  return (
    <main id="main-content" className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t.brandKicker}
              </p>
              <p className="font-semibold">{t.brand}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <Card>
          {/* Role Toggle */}
          <div className="flex p-1 bg-muted rounded-xl mb-6">
            <button 
              type="button"
              onClick={() => { setLoginMode("citizen"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${loginMode === "citizen" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Citizen Login
            </button>
            <button 
              type="button"
              onClick={() => { setLoginMode("admin"); setError(""); setName(""); setOtp(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${loginMode === "admin" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Admin Portal
            </button>
          </div>

          {loginMode === "admin" ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="size-5 text-emerald-600" aria-hidden />
                <h1 className="text-lg font-semibold">Command Center</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Secure access for government officials.</p>
              
              <Field label="Official ID" htmlFor="admin-id" error={error ? error : undefined}>
                <Input
                  id="admin-id"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Gov ID (admin)"
                  required
                />
              </Field>
              <Field label="Passcode" htmlFor="admin-pass" error={error ? error : undefined}>
                <Input
                  id="admin-pass"
                  type="password"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter Passcode (admin123)"
                  required
                />
              </Field>
              
              <Button type="submit" className="w-full" size="lg">
                Secure Login
              </Button>
            </form>
          ) : (
            <>
              {step === "busy" ? (
                <div className="flex flex-col items-center py-12">
                  <Spinner label={t.authenticating} />
                  <p className="mt-2 text-sm text-muted-foreground">{t.doNotRefresh}</p>
                </div>
              ) : null}

              {step === "details" ? (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void sendOtp();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" aria-hidden />
                    <h1 className="text-lg font-semibold">{t.authTitle}</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.authLead}</p>
                  <Field label={t.fullName} hint={t.fullNameHint} htmlFor="full-name" error={error.includes("name") || error === t.nameError ? error : undefined}>
                    <Input
                      id="full-name"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      required
                    />
                  </Field>
                  <Field label={t.mobile} hint={t.otpHelp} htmlFor="mobile" error={error === t.phoneError ? error : undefined}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-border pr-3 text-sm font-semibold text-muted-foreground">
                        +91
                      </span>
                      <Input
                        id="mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="pl-16"
                        placeholder={t.mobilePlaceholder}
                        required
                      />
                    </div>
                  </Field>
                  {error && error !== t.nameError && error !== t.phoneError ? (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {error}
                    </p>
                  ) : null}
                  <Button type="submit" className="w-full" size="lg">
                    {t.requestOtp}
                  </Button>
                </form>
              ) : null}

              {step === "otp" ? (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void verify();
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    {t.back}
                  </button>
                  <h1 className="text-lg font-semibold">{t.enterOtp}</h1>
                  <p className="text-sm text-muted-foreground">
                    {t.sentTo} <span className="font-semibold text-foreground">+91 {phone}</span>
                  </p>
                  <Field label={t.enterOtp} htmlFor="otp" error={error || undefined}>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={4}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="text-center text-3xl tracking-[0.4em]"
                      aria-describedby="otp-demo"
                    />
                  </Field>
                  <p id="otp-demo" className="text-xs text-muted-foreground">
                    {t.demoOtp}
                  </p>
                  <Button type="submit" className="w-full" size="lg">
                    {t.verify}
                  </Button>
                </form>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
