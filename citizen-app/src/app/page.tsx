"use client";

import ComplaintForm from '@/components/ComplaintForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Infra-Pulse</h1>
          <p className="opacity-90 text-sm mt-1">Report civic issues seamlessly</p>
        </div>
        
        <div className="p-6">
          <ComplaintForm />
        </div>
      </div>
    </main>
  );
}
