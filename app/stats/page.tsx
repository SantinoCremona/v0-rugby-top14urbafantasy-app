'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client'; 
import DreamTeam from '../../components/DreamTeam';

interface StatClub {
  club: string;
  cantidad_hinchas: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatClub[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inicializamos el cliente
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // Recordá que esta View 'stats_hinchas_club' la tenés que haber creado en SQL
      const { data, error } = await supabase
        .from('stats_hinchas_club')
        .select('*');
      
      if (error) {
        console.error('Error fetching stats:', error.message);
      } else if (data) {
        setStats(data as StatClub[]);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 font-sans">
      {/* Header Estilo Dark Dashboard */}
      <div className="bg-black border-b border-green-500/20 p-8 mb-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Central de <span className="text-green-500 underline decoration-2 underline-offset-4">Stats</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase mt-2 tracking-[0.3em]">
              Headcoach Analytics • 2026
            </p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
             <span className="text-green-500 font-black text-xl">#1</span>
             <span className="ml-2 text-xs font-bold uppercase text-gray-300">Ranking URBA</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1 & 2: EL XV IDEAL (Dream Team) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-gray-800/30 rounded-[2rem] p-6 border border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black italic uppercase flex items-center">
                <span className="w-1.5 h-8 bg-green-500 mr-4 rounded-full"></span>
                XV Ideal de la Fecha 3
              </h2>
              <span className="bg-white/5 text-[10px] font-bold px-3 py-1 rounded-full text-gray-400 border border-white/10 uppercase">
                Actualizado hace 1m
              </span>
            </div>
            
            {/* Llamamos al componente del Dream Team */}
            <DreamTeam />
          </section>
        </div>

        {/* COLUMNA 3: COMUNIDAD (Censo de Hinchas) */}
        <div className="lg:col-span-1">
          <section className="bg-gray-800/30 rounded-[2rem] p-6 border border-gray-800 sticky top-8 shadow-2xl">
            <h2 className="text-xl font-black italic uppercase mb-8 flex items-center">
              <span className="w-1.5 h-6 bg-blue-500 mr-3 rounded-full"></span>
              Censo de Hinchas
            </h2>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-700/50 rounded-xl"></div>)}
              </div>
            ) : (
              <div className="space-y-5">
                {stats.length > 0 ? stats.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center">
                      <span className="text-gray-700 font-black mr-4 w-4 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-gray-300 group-hover:text-white transition uppercase text-xs tracking-tight">
                        {item.club || 'Desconocido'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                       {/* Mini barra de progreso relativa al puntero */}
                      <div className="h-1 w-12 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(item.cantidad_hinchas / (stats[0]?.cantidad_hinchas || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-black text-gray-100">{item.cantidad_hinchas}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-[10px] uppercase font-bold text-center italic">No hay registros de hinchas</p>
                )}
              </div>
            )}

            <div className="mt-12 pt-6 border-t border-gray-800 text-center">
               <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest leading-none">
                 Headcoach Database Project
               </p>
               <p className="text-[8px] text-gray-700 font-medium uppercase mt-1">
                 Universidad del Cema - 2026
               </p>
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}