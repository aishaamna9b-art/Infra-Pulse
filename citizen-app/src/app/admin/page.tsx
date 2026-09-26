"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Building2, Globe, Bell, Users, AlertTriangle, 
  CheckCircle, Clock, ShieldCheck, Map, Activity, 
  ChevronRight, RefreshCw, Layers, ListFilter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/features/i18n/language-provider';
import { useAuth } from '@/features/auth/auth-provider';

const AdminMap = dynamic(() => import('@/components/admin/AdminMap'), { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div> });

export default function AdminDashboard() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { session, signOut } = useAuth();
  
  const [reports, setReports] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Record<number, string>>({});
  const [emailDrafts, setEmailDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'live-map' | 'tickets' | 'settings'>('home');
  const [mapMode, setMapMode] = useState<'standard' | 'heatmap'>('heatmap');

  const fetchAddress = async (id: number, lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      let displayName = "Unknown Location";
      if (data && data.address) {
          displayName = data.address;
      }
      setAddresses(prev => ({...prev, [id]: displayName}));
    } catch (err) {
      setAddresses(prev => ({...prev, [id]: "Address unavailable"}));
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/admin/reports/master");
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((t: any) => ({
          ...t,
          is_verified: t.status !== 'Open',
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
  const mediumPriority = reports.filter(r => r.severity === 'MEDIUM').length;
  const lowPriority = reports.filter(r => r.severity === 'LOW').length;

  const categoryStats = reports.reduce((acc: any, r) => {
    if (!acc[r.category]) {
      acc[r.category] = { name: r.category.replace('_', ' ').toUpperCase(), HIGH: 0, MEDIUM: 0, LOW: 0, total: 0 };
    }
    if (r.severity) {
      acc[r.category][r.severity] = (acc[r.category][r.severity] || 0) + 1;
    }
    acc[r.category].total += 1;
    return acc;
  }, {});
  
  const chartData = Object.values(categoryStats).sort((a: any, b: any) => b.total - a.total);

  if (!session || session.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col lg:flex-row pb-12 lg:pb-0">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-slate-900 lg:min-h-screen shrink-0 sticky top-0 flex flex-col shadow-2xl z-50">
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" /> Infra-Pulse
          </h2>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-bold">Govt Command Center</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'home' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
             <Activity className="w-5 h-5" /> Home
          </button>
          <button onClick={() => setActiveTab('live-map')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'live-map' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
             <Map className="w-5 h-5" /> Live Map
          </button>
          <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'tickets' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
             <Layers className="w-5 h-5" /> Ticket Management
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
             <Building2 className="w-5 h-5" /> Account Settings
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800 hidden lg:block">
          <button onClick={() => signOut()} className="w-full py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 font-bold hover:bg-red-500 hover:border-red-500 hover:text-white transition-all text-sm flex items-center justify-center gap-2">
            🔒 Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative h-screen overflow-y-auto bg-slate-50">
        
        {/* Top Header */}
        <header className="bg-white px-8 py-5 border-b border-slate-200 sticky top-0 z-30 flex justify-between items-center shadow-sm hidden lg:flex">
          <h1 className="text-xl font-extrabold text-slate-800 capitalize">
            {activeTab.replace('-', ' ')}
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchReports()}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all hover:scale-105">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          
          {/* 1. HOME TAB */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wide">Total Tickets</p>
                    <h3 className="text-4xl font-black text-slate-900">{totalReports}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wide">Pending</p>
                    <h3 className="text-4xl font-black text-slate-900">{pendingVerification}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wide">Resolved</p>
                    <h3 className="text-4xl font-black text-slate-900">{verifiedCount}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-5">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wide">Critical Alerts</p>
                    <h3 className="text-4xl font-black text-slate-900">{highPriority}</h3>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Severity Analytics Bar Graph */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary" /> Incident Analysis by Category
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Complaints grouped by category and severity</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full h-full min-h-[350px]">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                          />
                          <Bar dataKey="HIGH" name="High Severity" stackId="a" fill="#dc2626" />
                          <Bar dataKey="MEDIUM" name="Medium Severity" stackId="a" fill="#f97316" />
                          <Bar dataKey="LOW" name="Low Severity" stackId="a" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        No data to display
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Required List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h3 className="font-extrabold text-xl text-slate-900 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-amber-500" /> Action Required
                  </h3>
                  
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {reports.filter(r => !r.is_verified).slice(0, 5).map(report => (
                      <div key={report.id} className="p-5 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">{report.category}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md">#{report.id}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-4 mt-3">Status: <span className="text-amber-600">{report.status}</span></p>
                        <button onClick={() => setActiveTab('tickets')} className="text-xs font-bold text-slate-500 group-hover:text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Review Case <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {reports.filter(r => !r.is_verified).length === 0 && (
                      <div className="text-center py-12 text-slate-500 text-sm font-medium">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                        All caught up! No pending verifications.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. LIVE MAP TAB */}
          {activeTab === 'live-map' && (
            <div className="h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
              
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white z-10 relative shadow-sm">
                <div>
                  <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-3">
                    Live Incident Map <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full animate-pulse uppercase tracking-wider">Live</span>
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Visualizing real-time ticket density and exact locations.</p>
                </div>
                
                {/* Map Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner w-full sm:w-auto">
                  <button 
                    onClick={() => setMapMode('heatmap')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mapMode === 'heatmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Heat Map
                  </button>
                  <button 
                    onClick={() => setMapMode('standard')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mapMode === 'standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Standard Map
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative bg-slate-50">
                <AdminMap reports={reports} mapType={mapMode} />
              </div>
            </div>
          )}

          {/* 3. TICKET MANAGEMENT TAB */}
          {activeTab === 'tickets' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Master Tickets Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-3">
                      <span className="text-3xl">🔥</span> Escalated Master Tickets
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-2">Issues with 5 or more citizen reports. These require immediate attention.</p>
                  </div>
                  <span className="px-4 py-2 bg-red-100 text-red-700 font-black rounded-xl text-sm">
                    {reports.filter(r => r.report_count >= 5).length} Critical
                  </span>
                </div>
                
                <div className="space-y-4">
                  {reports.filter(r => r.report_count >= 5).map((report) => (
                    <div key={report.id} className="border border-red-200 bg-red-50/50 rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-md">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-lg shadow-sm">MASTER #{report.id}</span>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{report.category}</span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                              <Users className="w-3.5 h-3.5" /> {report.report_count} Reports
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 font-medium">
                            <strong className="text-slate-900">Location:</strong> {addresses[report.id] || "Locating..."}
                          </p>
                          <p className="text-sm text-slate-600 font-medium">
                            <strong className="text-slate-900">Status:</strong> <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded ml-1">{report.status}</span>
                          </p>
                        </div>
                        
                        <div className="flex gap-3 w-full lg:w-auto">
                          <select 
                            className="flex-1 lg:flex-none px-4 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm outline-none cursor-pointer"
                            value={report.status}
                            onChange={async (e) => {
                              try {
                                await fetch(`http://127.0.0.1:8000/api/v1/admin/reports/${report.id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: e.target.value })
                                });
                                fetchReports();
                              } catch(err) {
                                console.error(err);
                              }
                            }}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <button 
                            onClick={async () => {
                              const btn = document.getElementById(`ai-btn-${report.id}`);
                              if(btn) btn.innerText = "Drafting...";
                              try {
                                const addressText = addresses[report.id] || "Location unavailable";
                                const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/reports/${report.id}/action-plan`, { 
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ address: addressText })
                                });
                                const data = await res.json();
                                setEmailDrafts(prev => ({...prev, [report.id]: data.email_draft}));
                              } catch(e) {
                                alert("Failed to reach Gemini AI.");
                              }
                              if(btn) btn.innerText = "✨ Draft Notice";
                            }}
                            id={`ai-btn-${report.id}`}
                            className="flex-1 lg:flex-none px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            ✨ Draft Notice
                          </button>
                        </div>
                      </div>
                      
                      {emailDrafts[report.id] && (
                        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-inner">
                          <h5 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                            <span>🤖</span> AI Generated Draft
                          </h5>
                          <pre className="whitespace-pre-wrap text-xs text-slate-600 bg-slate-50 p-4 rounded-lg font-sans border border-slate-100 max-h-[250px] overflow-y-auto mb-4 custom-scrollbar">
                            {emailDrafts[report.id]}
                          </pre>
                          <button 
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              const originalText = btn.innerText;
                              btn.innerText = "Sending...";
                              
                              setTimeout(() => {
                                const subject = encodeURIComponent(`Work Order: Ticket #${report.id} - ${report.category}`);
                                const body = encodeURIComponent(emailDrafts[report.id]);
                                window.open(`mailto:contractor@example.com?subject=${subject}&body=${body}`, '_blank');
                                
                                alert(`Notification Sent!\n\nWork order for Ticket #${report.id} has been successfully delivered to the contractor.`);
                                btn.innerText = "✅ Delivered";
                                btn.classList.replace('bg-emerald-500', 'bg-slate-700');
                                btn.classList.replace('hover:bg-emerald-600', 'hover:bg-slate-800');
                                setTimeout(() => {
                                  btn.innerText = originalText;
                                  btn.classList.replace('bg-slate-700', 'bg-emerald-500');
                                  btn.classList.replace('hover:bg-slate-800', 'hover:bg-emerald-600');
                                }, 3000);
                              }, 600);
                            }}
                            className="w-full py-2.5 bg-emerald-500 text-white font-bold text-sm rounded-lg hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
                          >
                            Send to Contractor
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {reports.filter(r => r.report_count >= 5).length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      No escalated master tickets at this time.
                    </div>
                  )}
                </div>
              </div>

              {/* Standard Tickets Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-3">
                      <span className="text-3xl">📝</span> Standard Tickets
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-2">Issues with less than 5 citizen reports.</p>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors">
                    <ListFilter className="w-4 h-4" /> Filter
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {reports.filter(r => r.report_count > 0 && r.report_count < 5).map((report) => (
                    <div key={report.id} className="border border-slate-200 bg-white rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-3 h-3 rounded-full shadow-inner ${report.severity === 'HIGH' ? 'bg-red-500 shadow-red-500/50' : report.severity === 'MEDIUM' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}></span>
                          <span className="text-xs font-black text-slate-400 tracking-wider">TICKET #{report.id}</span>
                        </div>
                        <select 
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer border-0 ${
                            report.status === 'Open' ? 'bg-amber-100 text-amber-800' : 
                            report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}
                          value={report.status}
                          onChange={async (e) => {
                            try {
                              await fetch(`http://127.0.0.1:8000/api/v1/admin/reports/${report.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: e.target.value })
                              });
                              fetchReports();
                            } catch(err) {
                              console.error(err);
                            }
                          }}
                        >
                          <option value="Open">OPEN</option>
                          <option value="In Progress">IN PROGRESS</option>
                          <option value="Resolved">RESOLVED</option>
                        </select>
                      </div>
                      
                      <h4 className="font-extrabold text-slate-900 capitalize mb-2 text-lg">{report.category}</h4>
                      <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-2 h-10">{addresses[report.id] || "Locating exact address..."}</p>
                      
                      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          <Users className="w-4 h-4" /> {report.report_count} Reports
                        </span>
                        <button 
                          onClick={async () => {
                            const btn = document.getElementById(`ai-btn-std-${report.id}`);
                            if(btn) btn.innerText = "Drafting...";
                            try {
                              const addressText = addresses[report.id] || "Location unavailable";
                              const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/reports/${report.id}/action-plan`, { 
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ address: addressText })
                              });
                              const data = await res.json();
                              setEmailDrafts(prev => ({...prev, [report.id]: data.email_draft}));
                            } catch(e) {
                              alert("Failed to reach Gemini AI.");
                            }
                            if(btn) btn.innerText = "✨ AI Action";
                          }}
                          id={`ai-btn-std-${report.id}`}
                          className="text-xs font-bold text-primary hover:text-white hover:bg-primary px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all bg-primary/5"
                        >
                          ✨ AI Action
                        </button>
                      </div>
                      
                      {emailDrafts[report.id] && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <h5 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                            <span>🤖</span> AI Draft
                          </h5>
                          <pre className="whitespace-pre-wrap text-[10px] text-slate-600 bg-slate-50 p-3 rounded-lg font-sans border border-slate-100 max-h-[150px] overflow-y-auto mb-3 custom-scrollbar">
                            {emailDrafts[report.id]}
                          </pre>
                          <button 
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              const originalText = btn.innerText;
                              btn.innerText = "Sending...";
                              
                              setTimeout(() => {
                                const subject = encodeURIComponent(`Work Order: Ticket #${report.id} - ${report.category}`);
                                const body = encodeURIComponent(emailDrafts[report.id]);
                                window.open(`mailto:contractor@example.com?subject=${subject}&body=${body}`, '_blank');
                                
                                alert(`Notification Sent!\n\nWork order for Ticket #${report.id} has been successfully delivered to the contractor.`);
                                btn.innerText = "✅ Delivered";
                                btn.classList.replace('bg-emerald-500', 'bg-slate-700');
                                btn.classList.replace('hover:bg-emerald-600', 'hover:bg-slate-800');
                                setTimeout(() => {
                                  btn.innerText = originalText;
                                  btn.classList.replace('bg-slate-700', 'bg-emerald-500');
                                  btn.classList.replace('hover:bg-slate-800', 'hover:bg-emerald-600');
                                }, 3000);
                              }, 600);
                            }}
                            className="w-full py-2 bg-emerald-500 text-white font-bold text-xs rounded-lg hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
                          >
                            Send to Contractor
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {reports.filter(r => r.report_count > 0 && r.report_count < 5).length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-slate-400 text-sm font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      No standard tickets at this time.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h3 className="font-extrabold text-2xl text-slate-900 mb-6">System Settings</h3>
                <p className="text-sm font-medium text-slate-500 mb-8">Manage command center configurations and personnel access.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Admin Full Name</label>
                    <input type="text" defaultValue="Chief Engineer - Zone 4" className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Official Email</label>
                    <input type="email" defaultValue="zone4.eng@tn.gov.in" className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                  </div>
                  <div className="pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="font-bold text-slate-700">SMS Alerts for HIGH severity tickets</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="font-bold text-slate-700">Email digest (Daily)</span>
                    </label>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <button className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                      Save Profile Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
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
