'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import DreamTeam from '../../components/DreamTeam';
import MainHeader from '../../components/main-header'; // Tu componente de cabecera

interface StatClub {
  club: string;
  cantidad_hinchas: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatClub[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.from('stats_hinchas_club').select('*');
      if (!error && data) setStats(data as StatClub[]);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* HEADER QUE YA VENÍAMOS USANDO */}
      <MainHeader />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-12 border-b-2 border-green-500 pb-6 inline-block">
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
            Analytics <span className="text-green-500">Center</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SECCIÓN XV IDEAL (COL 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-2 h-8 bg-green-500 italic rotate-12"></div>
               <h2 className="text-3xl font-black uppercase italic">Dream Team Fecha 3</h2>
            </div>
            <div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-2xl">
              <DreamTeam />
            </div>
          </div>

          {/* SECCIÓN HINCHADAS (COL 5) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-white italic rotate-12"></div>
                <h2 className="text-3xl font-black uppercase italic">Hinchadas</h2>
              </div>

              <div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-2xl">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse"></div>)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-white/5 group hover:border-green-500/30 transition">
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black italic text-gray-700 italic">#{idx + 1}</span>
                          <img 
                            src={`/escudos/${item.club?.toLowerCase().replace(/\s/g, '')}.png`} 
                            className="w-8 h-8 object-contain"
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).hidden = true }}
                          />
                          <span className="font-bold uppercase italic text-sm tracking-tight">{item.club}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-green-500">{item.cantidad_hinchas}</span>
                          <span className="text-[10px] font-black text-gray-600 uppercase">Users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-8 text-center border-t border-white/5 pt-6">
                   <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                   </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}