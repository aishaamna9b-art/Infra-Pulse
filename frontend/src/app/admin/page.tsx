"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { 
  Building2, 
  Map as MapIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Search, 
  Bell,
  Mail,
  X,
  Loader2,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import Map to avoid SSR issues with Leaflet
const DynamicMap = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-400">Loading Map...</div>
})

const API_BASE = "http://127.0.0.1:8000/api/v1"

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [addresses, setAddresses] = useState<Record<number, string>>({})
  const [isSystemOnline, setIsSystemOnline] = useState(true)
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [draftingId, setDraftingId] = useState<number | null>(null)
  const [emailDraft, setEmailDraft] = useState<string | null>(null)

  const chartData = Object.entries(
    tickets.reduce((acc: Record<string, number>, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name: name.replace('_', ' '), count }));

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/reports/master`);
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      
      const sevVal: Record<string, number> = { "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
      const sorted = data.sort((a: any, b: any) => sevVal[b.severity] - sevVal[a.severity]);
      
      setTickets(sorted);
      setIsSystemOnline(true);
      
      // Fetch addresses for new tickets
      sorted.forEach((t: any) => {
        if (!addresses[t.id]) fetchAddress(t.id, t.latitude, t.longitude);
      });
    } catch (err) {
      console.error(err);
      setIsSystemOnline(false);
    }
  }

  const fetchAddress = async (id: number, lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      let displayName = "Location unavailable";
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
      setAddresses(prev => ({...prev, [id]: "Location unavailable"}));
    }
  }

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePlan = async (ticketId: number) => {
    setModalOpen(true);
    setDraftingId(ticketId);
    setEmailDraft(null);

    try {
        const res = await fetch(`${API_BASE}/admin/reports/${ticketId}/action-plan`, { method: 'POST' });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEmailDraft(data.email_draft);
    } catch (err) {
        setEmailDraft("**Error:** Backend connection failed. Is FastAPI running on port 8000?");
    }
  }

  const issueOrder = () => {
    alert('Dispatched successfully to contractor!');
    setModalOpen(false);
  }

  return (
    <>
        
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-white">
            Live Intelligence <span className="text-slate-500 font-normal">/ Coimbatore</span>
          </h1>
          <div className="flex items-center space-x-6">
            <button className="text-slate-400 hover:text-white transition relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              Export Data
            </Button>
          </div>
        </header>

        <div className="p-10 space-y-8">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="radar-section">
            <Card className="bg-slate-900 border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Disruptions</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-black text-white mt-2">{isSystemOnline ? tickets.length : "-"}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Critical Severity</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-black text-red-500 mt-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  {isSystemOnline ? tickets.filter(t => t.severity === 'HIGH').length : "-"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-black text-green-400 mt-2">100%</div>
              </CardContent>
            </Card>
          </div>

          {/* Map and Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl relative h-[450px]">
              <div className="absolute top-6 left-6 z-10 bg-slate-900/90 backdrop-blur border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span> Live Sensor Tracking
              </div>
              {isSystemOnline && <DynamicMap tickets={tickets} />}
            </div>

            <Card className="bg-slate-900 border-slate-800 shadow-xl h-[450px]">
              <CardHeader className="border-b border-slate-800 pb-4 mb-4">
                <CardTitle className="text-lg text-slate-50">Incident Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isSystemOnline && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#6366f1" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tickets Table */}
          <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl" id="tickets-section">
            <CardHeader className="border-b border-slate-800 bg-slate-900 px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-50">Active Master Tickets</CardTitle>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-800">
                    <th className="px-8 py-5 font-bold">Ticket ID</th>
                    <th className="px-8 py-5 font-bold">Category</th>
                    <th className="px-8 py-5 font-bold">Severity</th>
                    <th className="px-8 py-5 font-bold">Location</th>
                    <th className="px-8 py-5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {!isSystemOnline && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-red-400 text-sm">
                        System Offline. Ensure FastAPI is running on port 8000.
                      </td>
                    </tr>
                  )}
                  {isSystemOnline && tickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500 text-sm">
                        No active tickets found.
                      </td>
                    </tr>
                  )}
                  {isSystemOnline && tickets.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-8 py-5 text-sm font-bold text-white">#{t.id}</td>
                      <td className="px-8 py-5 text-sm text-slate-300 capitalize flex items-center">
                        <MapIcon className="w-4 h-4 text-slate-500 mr-2" />
                        {t.category.replace('_', ' ')}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          t.severity === 'HIGH' ? 'bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                          t.severity === 'MEDIUM' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                          'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                        }`}>
                          {t.severity}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-400">
                        {addresses[t.id] || (
                          <span className="flex items-center text-slate-500">
                            <Loader2 className="w-3 h-3 animate-spin mr-2" /> Locating...
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right flex justify-end">
                        <Button 
                          onClick={() => generatePlan(t.id)}
                          className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition"
                        >
                          <Mail className="mr-2 h-4 w-4" /> Auto Draft
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </main>

      {/* AI Action Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-xl font-bold text-white flex items-center">
                <AlertTriangle className="text-indigo-400 mr-3 w-5 h-5" /> 
                Auto-Drafted Dispatch
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              {!emailDraft ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <p className="text-slate-400 text-lg">Gemini AI is analyzing parameters...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-slate-300 prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                  <ReactMarkdown>{emailDraft}</ReactMarkdown>
                </div>
              )}
            </div>
            
            <div className="px-8 py-5 border-t border-slate-800 bg-slate-800/30 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button onClick={issueOrder} className="bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition font-bold" disabled={!emailDraft}>
                <Mail className="mr-2 h-4 w-4" /> Issue Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
