"use client"

import Link from "next/link"
import { ShieldAlert, Activity, ArrowRight, Building2, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center">
      {/* Background decoration */}
      <div className="absolute top-0 -translate-y-12 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10 blur-3xl opacity-50" />
      
      <main className="container mx-auto px-4 py-16 flex flex-col items-center text-center space-y-12">
        
        {/* Header */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4">
            <Activity className="w-4 h-4" />
            <span>Infra Pulse 2.0 is Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            The Civic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Nervous System</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Bridging the gap between citizens and city officials with AI-powered reporting, automated severity scoring, and smart dispatching.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mt-12">
          {/* Citizen Portal */}
          <Link href="/citizen" className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-2xl hover:border-primary/50 flex flex-col h-full text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Citizen Portal</h2>
            <p className="text-muted-foreground flex-grow mb-8">
              Report infrastructure issues instantly. Multilingual support, audio reporting, and smart photo analysis.
            </p>
            <div className="flex items-center text-primary font-medium">
              Start Reporting
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Admin Command Center */}
          <Link href="/admin" className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-2xl hover:border-blue-500/50 flex flex-col h-full text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
              <Building2 className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Command Center</h2>
            <p className="text-muted-foreground flex-grow mb-8">
              Enterprise dashboard for officials. AI deduplication, live incident mapping, and one-click dispatch.
            </p>
            <div className="flex items-center text-blue-500 font-medium">
              Enter Dashboard
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
