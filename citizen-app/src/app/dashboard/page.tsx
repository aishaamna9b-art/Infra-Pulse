"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ComplaintForm from '@/components/ComplaintForm';
import { getAllComplaints } from '@/lib/db';
import { Home, History, User, Bell, LogOut, ChevronRight, ChevronDown, CheckCircle, Clock, ShieldCheck, HelpCircle, Settings, ArrowLeft, Building2, Send, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

type TabType = 'home' | 'activity' | 'profile';
type ProfileViewType = 'main' | 'settings' | 'help';

export default function Dashboard() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [profileView, setProfileView] = useState<ProfileViewType>('main');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [supportQuery, setSupportQuery] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  
  // User Data
  const [userData, setUserData] = useState({ name: 'Citizen', phone: '' });

  useEffect(() => {
    setIsMounted(true);
    const isAuthenticated = localStorage.getItem('citizen_authenticated');
    if (!isAuthenticated) {
      router.replace('/');
    } else {
      const name = localStorage.getItem('citizen_name') || 'Citizen User';
      const phone = localStorage.getItem('citizen_phone') || 'N/A';
      setUserData({ name, phone });
    }
    
    // Load complaints
    getAllComplaints().then(data => {
      // Sort by newest first
      setComplaints(data.sort((a, b) => b.timestamp - a.timestamp));
    });
  }, [router, activeTab]); // Reload complaints when tab changes

  const handleLogout = () => {
    localStorage.removeItem('citizen_authenticated');
    localStorage.removeItem('citizen_name');
    localStorage.removeItem('citizen_phone');
    router.replace('/');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* Official Government Header */}
      <div className="bg-slate-900 px-6 py-6 rounded-b-[2rem] shadow-md border-b-4 border-slate-700 mb-6 sticky top-0 z-10 transition-all">
        <div className="flex justify-between items-center text-white mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-0.5">
                {activeTab === 'home' && t.civicPortal}
                {activeTab === 'activity' && t.reportStatus}
                {activeTab === 'profile' && t.citizenCenter}
              </p>
              <h1 className="text-xl font-bold tracking-tight">
                {activeTab === 'home' && t.portalName}
                {activeTab === 'activity' && t.myHistory}
                {activeTab === 'profile' && t.myAccount}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-8 max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white border-l-4 border-slate-900 rounded-r-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                {t.welcome}, {userData.name.split(' ')[0]}
              </h2>
              <p className="text-slate-600 text-sm font-medium">
                {t.dashboardDesc}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 md:p-6">
              <ComplaintForm />
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 px-2">{t.recentReports}</h2>
            
            {complaints.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">{t.noReports}</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t.noReportsDesc}</p>
              </div>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${complaint.synced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {complaint.synced ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{complaint.category || complaint.description || "Issue Reported"}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {new Date(complaint.timestamp).toLocaleDateString()} • ID: #{complaint.id.slice(-4)}
                    </p>
                    <div className={`mt-3 inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${complaint.synced ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {complaint.synced ? t.sentToGovt : t.pendingSync}
                    </div>
                  </div>
                  {complaint.photoDataUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <img src={complaint.photoDataUrl} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {profileView === 'main' && (
              <div className="animate-in slide-in-from-left-4 duration-300">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center mb-6">
                  <div className="w-24 h-24 bg-slate-100 border-4 border-white shadow-md text-slate-700 rounded-full mx-auto flex items-center justify-center mb-4">
                    <User className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{userData.name}</h2>
                  <p className="text-slate-500 font-medium mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> {t.verifiedCitizen}
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <button 
                    onClick={() => setProfileView('settings')}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg"><Settings className="w-5 h-5 text-slate-700" /></div>
                      <span className="font-bold text-slate-800">{t.accountSettings}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                  
                  <button 
                    onClick={() => setProfileView('help')}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg"><HelpCircle className="w-5 h-5 text-slate-700" /></div>
                      <span className="font-bold text-slate-800">{t.helpSupport}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors"><LogOut className="w-5 h-5 text-red-600" /></div>
                      <span className="font-bold text-red-600">{t.secureLogout}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-view: Account Settings */}
            {profileView === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setProfileView('main')}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" /> {t.backToProfile}
                </button>
                
                <h2 className="text-xl font-bold text-slate-900 mb-6">{t.accountSettings}</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.fullLegalName}</label>
                    <input 
                      type="text" 
                      value={userData.name}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-600 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.registeredMobile}</label>
                    <input 
                      type="text" 
                      value={`+91 ${userData.phone}`}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-600 font-medium" 
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      {t.updateDetailsHelp}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view: Help & Support */}
            {profileView === 'help' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setProfileView('main')}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Profile
                </button>
                
                <h2 className="text-xl font-bold text-slate-900 mb-6">Help & Support</h2>
                
                <div className="space-y-4 mb-8">
                  {[
                    { q: "How long does a pothole repair take?", a: "Standard pothole repairs are typically addressed within 7-14 working days after the report is verified by the engineering department." },
                    { q: "My issue was marked 'Resolved' but it isn't.", a: "You can reopen a ticket within 48 hours of it being marked resolved by calling the toll-free citizen helpline." },
                    { q: "Emergency Contact", a: "For life-threatening infrastructure emergencies (e.g., live fallen wires, collapsed bridges), please call 112 immediately." }
                  ].map((faq, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden transition-all">
                      <button 
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                      >
                        <h3 className="font-bold text-slate-800">{faq.q}</h3>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {activeFaq === idx && (
                        <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                          <p className="text-sm text-slate-600 font-medium">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-4">Have another question?</h3>
                  
                  {supportSent ? (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center animate-in fade-in duration-500">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-bold text-green-800">Query Submitted</h4>
                      <p className="text-sm text-green-700 mt-1 font-medium">Our support team will contact you on your registered mobile number within 24 hours.</p>
                      <button 
                        onClick={() => { setSupportSent(false); setSupportQuery(''); }}
                        className="mt-4 text-sm font-bold text-green-800 underline"
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
                        className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none font-medium text-slate-700"
                      />
                      <button 
                        onClick={() => {
                          if(supportQuery.trim().length > 5) setSupportSent(true);
                        }}
                        disabled={supportQuery.trim().length <= 5}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                      >
                        Submit Query <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto w-full flex justify-between px-6 pb-4 pt-1">
          
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-slate-100' : 'bg-transparent'}`}>
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-wide">{t.navHome}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'activity' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'activity' ? 'bg-slate-100' : 'bg-transparent'}`}>
              <History className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-wide">{t.navStatus}</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('profile');
              setProfileView('main');
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-slate-100' : 'bg-transparent'}`}>
              <User className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-wide">{t.navProfile}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
