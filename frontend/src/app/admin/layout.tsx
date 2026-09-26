import { Building2, Activity, Map as MapIcon } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row font-sans">
      {/* Persistent Sidebar */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900 flex flex-col hidden md:flex z-10">
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Infra-Pulse
          </span>
        </div>
        <nav className="flex-1 py-8 px-6 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Command Modules</p>
          <a href="/admin" className="flex items-center px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-indigo-400 font-medium shadow-sm transition">
            <Activity className="w-5 h-5 mr-3" /> Live Radar
          </a>
          <a href="/admin#tickets-section" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition">
            <MapIcon className="w-5 h-5 mr-3" /> Master Tickets
          </a>
        </nav>
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center">
            <img src="https://ui-avatars.com/api/?name=Govt+Admin&background=0f172a&color=cbd5e1" alt="Avatar" className="w-12 h-12 rounded-full border border-slate-600" />
            <div className="ml-4">
              <p className="text-sm font-bold text-white">Govt Admin</p>
              <p className="text-xs text-green-400 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span> System Online
              </p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-950 relative">
        {children}
      </main>
    </div>
  )
}
