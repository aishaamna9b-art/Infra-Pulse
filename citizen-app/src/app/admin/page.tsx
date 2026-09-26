"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Globe, Bell, Users, AlertTriangle, 
  CheckCircle, Clock, ShieldCheck, Map, Activity, 
  ChevronRight, RefreshCw, Layers, ListFilter
} from 'lucide-react';
import { useLanguage } from '@/features/i18n/language-provider';
import { useAuth } from '@/features/auth/auth-provider';

export default function AdminDashboard() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { session, signOut } = useAuth();
  
  const [reports, setReports] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');

  const fetchAddress = async (id: number, lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      let displayName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      if (data && data.address) {
          const road = data.address.road || data.address.street;
          const suburb = data.address.suburb || data.address.neighbourhood || data.address.city_district;
          const parts = [];
          if (road) parts.push(road);
          if (suburb) parts.push(suburb);
          if (parts.length > 0) {
            displayName = parts.join(", ");
          } else {
            displayName = data.display_name.split(",").slice(0, 2).join(", ");
          }
      }
      setAddresses(prev => ({...prev, [id]: displayName}));
    } catch (err) {
      setAddresses(prev => ({...prev, [id]: `${lat.toFixed(4)}, ${lon.toFixed(4)}`}));
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Pointing to the FastAPI backend running on port 8000
      const res = await fetch("http://127.0.0.1:8000/api/v1/admin/reports/master");
      if (res.ok) {
        const data = await res.json();
        // Map the backend fields to the frontend UI
        const mappedData = data.map((t: any) => ({
          ...t,
          is_verified: t.status !== 'Open', // For the UI, we'll treat non-open as verified/handled
          priority: t.severity === 'HIGH' ? 'Critical' : t.severity === 'MEDIUM' ? 'High' : 'Medium'
        }));
        setReports(mappedData);
        mappedData.forEach((t: any) => {
          if (!addresses[t.id]) fetchAddress(t.id, t.latitude, t.longitude);
        });
      }
    } catch (e) {
      console.error("Failed to fetch reports", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      router.replace('/login');
    } else {
      fetchReports();
    }
  }, [session, router]);

  const totalReports = reports.length;
  const pendingVerification = reports.filter(r => !r.is_verified).length;
  const highPriority = reports.filter(r => r.severity === 'HIGH').length;
  const verifiedCount = reports.filter(r => r.is_verified).length;

  if (!session || session.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Premium Header */}
      <div className="bg-slate-900 px-6 py-6 pb-12 rounded-b-[2rem] shadow-xl border-b-4 border-primary sticky top-0 z-10 transition-all">
        <div className="flex justify-between items-center text-white mb-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Government Command Center
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Infra-Pulse Admin
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchReports()}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all hover:scale-105"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all hover:scale-105">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => signOut()}
              className="px-4 h-10 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-sm font-bold hover:bg-red-500/30 transition-all"
            >
              Exit
            </button>
          </div>
        </div>
        
        {/* Navigation Pills */}
        <div className="flex max-w-7xl mx-auto gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Activity className="w-4 h-4" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'reports' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" /> All Reports
          </button>
        </div>
      </div>

      <main className="px-4 md:px-8 max-w-7xl mx-auto w-full -mt-6 relative z-20">
        
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Total Master Tickets</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{totalReports}</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Pending Resolution</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{pendingVerification}</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-1">In Progress / Resolved</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{verifiedCount}</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-1">High Severity Alerts</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{highPriority}</h3>
                </div>
              </div>
              
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Map Placeholder or Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" /> Live Infrastructure Map
                  </h3>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full animate-pulse">Live</span>
                </div>
                <div className="flex-1 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Geospatial visualization requires mapbox integration.</p>
                    <p className="text-sm text-slate-400">Map view is available in the Python Dashboard.</p>
                  </div>
                </div>
              </div>

              {/* Action Required List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Action Required
                </h3>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {reports.filter(r => !r.is_verified).slice(0, 5).map(report => (
                    <div key={report.id} className="p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{report.category}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Ticket #{report.id}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-3">Status: {report.status}</p>
                      <button className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Review Case <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {reports.filter(r => !r.is_verified).length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm font-medium">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      All caught up! No pending verifications.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Master Tickets Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">🔥</span> Escalated Master Tickets
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Issues with 5 or more citizen reports. These require immediate attention.</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full text-sm">
                  {reports.filter(r => r.report_count >= 5).length} Critical
                </span>
              </div>
              
              <div className="space-y-4">
                {reports.filter(r => r.report_count >= 5).map((report) => (
                  <div key={report.id} className="border border-red-200 bg-red-50/30 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">MASTER #{report.id}</span>
                          <span className="text-sm font-bold text-slate-800 uppercase">{report.category}</span>
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                            <Users className="w-3 h-3" /> {report.report_count} Reports
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          <strong>Location:</strong> {addresses[report.id] || "Locating..."}
                        </p>
                        <p className="text-sm text-slate-600">
                          <strong>Status:</strong> <span className="font-semibold">{report.status}</span>
                        </p>
                      </div>
                      
                      <div className="flex gap-3 w-full lg:w-auto">
                        <button className="flex-1 lg:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">
                          Update Status
                        </button>
                        <button 
                          onClick={async () => {
                            const btn = document.getElementById(`ai-btn-${report.id}`);
                            if(btn) btn.innerText = "Drafting...";
                            try {
                              const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/reports/${report.id}/action-plan`, { method: 'POST' });
                              const data = await res.json();
                              alert("Draft Generated by Gemini AI:\\n\\n" + data.email_draft);
                            } catch(e) {
                              alert("Failed to reach Gemini AI.");
                            }
                            if(btn) btn.innerText = "✨ Draft Notice";
                          }}
                          id={`ai-btn-${report.id}`}
                          className="flex-1 lg:flex-none px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                          ✨ Draft Notice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {reports.filter(r => r.report_count >= 5).length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
                    No escalated master tickets at this time.
                  </div>
                )}
              </div>
            </div>

            {/* Standard Tickets Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">📝</span> Standard Tickets
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Issues with less than 5 reports.</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                  <ListFilter className="w-4 h-4" /> Filter
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.filter(r => r.report_count < 5).map((report) => (
                  <div key={report.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-5 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${report.severity === 'HIGH' ? 'bg-red-500' : report.severity === 'MEDIUM' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                        <span className="text-xs font-bold text-slate-500">TICKET #{report.id}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        report.status === 'Open' ? 'bg-amber-100 text-amber-800' : 
                        report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 capitalize mb-1">{report.category}</h4>
                    <p className="text-xs text-slate-500 mb-4">Location: {addresses[report.id] || "Locating..."}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Users className="w-3.5 h-3.5" /> {report.report_count} Reports
                      </span>
                      <button 
                        onClick={async () => {
                          const btn = document.getElementById(`ai-btn-std-${report.id}`);
                          if(btn) btn.innerText = "Drafting...";
                          try {
                            const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/reports/${report.id}/action-plan`, { method: 'POST' });
                            const data = await res.json();
                            alert("Draft Generated by Gemini AI:\\n\\n" + data.email_draft);
                          } catch(e) {
                            alert("Failed to reach Gemini AI.");
                          }
                          if(btn) btn.innerText = "✨ AI Action";
                        }}
                        id={`ai-btn-std-${report.id}`}
                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                      >
                        ✨ AI Action
                      </button>
                    </div>
                  </div>
                ))}
                {reports.filter(r => r.report_count < 5).length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center py-8 text-slate-500 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
                    No standard tickets at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
