"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, HelpCircle, LogOut, ArrowLeft, ShieldCheck, CheckCircle, Send, ChevronRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/features/i18n/language-provider";
import { useAuth } from "@/features/auth/auth-provider";

type ProfileViewType = 'main' | 'settings' | 'help';

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  
  const [profileView, setProfileView] = useState<ProfileViewType>('main');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [supportQuery, setSupportQuery] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  if (profileView === 'main') {
    return (
      <div className="space-y-6 animate-in slide-in-from-left-4 duration-300 pb-20">
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border text-center mb-6">
          <div className="w-24 h-24 bg-muted border-4 border-background shadow-md text-muted-foreground rounded-full mx-auto flex items-center justify-center mb-4">
            <User className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{user?.phone || 'Citizen'}</h2>
          <p className="text-muted-foreground font-medium mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> {t.verifiedCitizen || 'Verified Citizen'}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <button 
            onClick={() => setProfileView('settings')}
            className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg"><Settings className="w-5 h-5 text-foreground" /></div>
              <span className="font-bold text-foreground">{t.accountSettings || 'Account Settings'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button 
            onClick={() => setProfileView('help')}
            className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg"><HelpCircle className="w-5 h-5 text-foreground" /></div>
              <span className="font-bold text-foreground">{t.helpSupport || 'Help & Support'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 hover:bg-destructive/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg group-hover:bg-destructive/20 transition-colors"><LogOut className="w-5 h-5 text-destructive" /></div>
              <span className="font-bold text-destructive">{t.secureLogout || 'Secure Logout'}</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (profileView === 'settings') {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 animate-in slide-in-from-right-4 duration-300 pb-20">
        <button 
          onClick={() => setProfileView('main')}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-6 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t.backToProfile || 'Back to Profile'}
        </button>
        
        <h2 className="text-xl font-bold text-foreground mb-6">{t.accountSettings || 'Account Settings'}</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">{t.registeredMobile || 'Registered Mobile'}</label>
            <input 
              type="text" 
              value={user?.phone || ''}
              readOnly
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-medium" 
            />
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {t.updateDetailsHelp || 'To update your registered mobile number, please visit your nearest civic center.'}
            </p>
          </div>
          
          <div className="pt-4 border-t border-border">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-foreground hover:text-primary transition-colors">
                Advanced Options
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Data Export</h4>
                    <p className="text-xs text-muted-foreground mt-1">Download a copy of your report history</p>
                  </div>
                  <button className="text-sm font-bold text-primary hover:underline">Request Data</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                  <div>
                    <h4 className="font-semibold text-sm text-destructive">Delete Account</h4>
                    <p className="text-xs text-muted-foreground mt-1">Permanently remove your data from our systems</p>
                  </div>
                  <button className="text-sm font-bold text-destructive hover:underline">Delete</button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (profileView === 'help') {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 animate-in slide-in-from-right-4 duration-300 pb-20">
        <button 
          onClick={() => setProfileView('main')}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-6 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t.backToProfile || 'Back to Profile'}
        </button>
        
        <h2 className="text-xl font-bold text-foreground mb-6">{t.helpSupport || 'Help & Support'}</h2>
        
        <div className="space-y-4 mb-8">
          {[
            { q: "How long does a pothole repair take?", a: "Standard pothole repairs are typically addressed within 7-14 working days after the report is verified by the engineering department." },
            { q: "My issue was marked 'Resolved' but it isn't.", a: "You can reopen a ticket within 48 hours of it being marked resolved by calling the toll-free citizen helpline." },
            { q: "Emergency Contact", a: "For life-threatening infrastructure emergencies (e.g., live fallen wires, collapsed bridges), please call 112 immediately." }
          ].map((faq, idx) => (
            <div key={idx} className="border border-border rounded-xl overflow-hidden transition-all">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 flex justify-between items-center text-left hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-bold text-foreground">{faq.q}</h3>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <p className="text-sm text-muted-foreground font-medium">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-bold text-foreground mb-4">Have another question?</h3>
          
          {supportSent ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center animate-in fade-in duration-500">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Query Submitted</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1 font-medium">Our support team will contact you on your registered mobile number within 24 hours.</p>
              <button 
                onClick={() => { setSupportSent(false); setSupportQuery(''); }}
                className="mt-4 text-sm font-bold text-emerald-800 dark:text-emerald-400 underline"
              >
                Ask another question
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea 
                value={supportQuery}
                onChange={(e) => setSupportQuery(e.target.value)}
                placeholder="Type your question or issue here..."
                className="w-full h-24 p-4 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-medium text-foreground"
              />
              <button 
                onClick={() => {
                  if(supportQuery.trim().length > 5) setSupportSent(true);
                }}
                disabled={supportQuery.trim().length <= 5}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                Submit Query <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
