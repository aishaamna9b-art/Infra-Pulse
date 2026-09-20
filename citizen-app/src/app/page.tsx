"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Loader2, Landmark, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'sending' | 'otp'>('phone');
  const [error, setError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('citizen_authenticated');
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSendOTP = () => {
    if (fullName.trim().length < 3) {
      setError('Please enter your full official name.');
      return;
    }
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setStep('sending');
    
    // Simulate API delay for sending OTP
    setTimeout(() => {
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit OTP.');
      return;
    }
    
    setStep('sending');
    setTimeout(() => {
      localStorage.setItem('citizen_authenticated', 'true');
      localStorage.setItem('citizen_name', fullName.trim());
      localStorage.setItem('citizen_phone', phoneNumber);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>
        </div>

        {/* Official Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-full mx-auto flex items-center justify-center shadow-lg mb-4 border-4 border-slate-200">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase tracking-widest">
            {t.portalName}
          </h1>
          <p className="text-slate-600 mt-2 font-medium">{t.portalDesc}</p>
          <div className="h-1 w-16 bg-slate-900 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-xl p-8 shadow-xl border-t-4 border-slate-900 relative overflow-hidden">
          
          {step === 'phone' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-700" />
                {t.citizenAuth}
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.fullNameLabel}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-slate-800 font-medium"
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.mobileLabel}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-r border-slate-300 pr-2">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-12 pl-16 pr-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-slate-800 font-medium tracking-wide"
                      placeholder={t.mobilePlaceholder}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {t.otpHelpText}
                  </p>
                </div>
                
                {error && <p className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-200">{error}</p>}

                <Button 
                  onClick={handleSendOTP}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-md mt-4 text-base font-bold flex items-center justify-center gap-2 group transition-all uppercase tracking-wide"
                >
                  {t.requestOtp}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="py-12 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <Loader2 className="w-12 h-12 text-slate-900 animate-spin mb-4" />
              <p className="text-slate-700 font-bold">{t.authenticating}</p>
              <p className="text-slate-500 text-sm mt-1">{t.doNotRefresh}</p>
            </div>
          )}

          {step === 'otp' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button 
                onClick={() => setStep('phone')}
                className="text-sm text-slate-600 font-semibold mb-6 hover:text-slate-900 flex items-center gap-1"
              >
                &larr; {t.backToDetails}
              </button>
              
              <h2 className="text-lg font-bold text-slate-800 mb-2">{t.enterOtp}</h2>
              <p className="text-sm text-slate-600 mb-6">
                {t.sentTo} <span className="font-bold text-slate-900">+91 {phoneNumber}</span>
              </p>
              
              <div className="space-y-5">
                <div>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-14 text-center text-3xl tracking-[0.5em] bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-bold text-slate-900"
                    placeholder="••••"
                  />
                </div>
                
                {error && <p className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-200">{error}</p>}

                <Button 
                  onClick={handleVerifyOTP}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-md mt-2 text-base font-bold uppercase tracking-wide"
                >
                  {t.verifyProceed}
                </Button>
                
                <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                  For this demo, any 4-digit code will work (e.g., 1234).
                </p>
              </div>
            </div>
          )}
          
        </div>
        
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-slate-500 font-semibold">
            {t.securePortal}
          </p>
          <p className="text-[10px] text-slate-400">
            Powered by Generative AI & Next.js
          </p>
        </div>
      </div>
    </main>
  );
}
