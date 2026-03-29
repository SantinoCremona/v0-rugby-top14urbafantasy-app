'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client'; 

interface Jugador {
  nombre: string;
  posicion: string;
  club: string;
  puntos: number;
  ranking_pos: number;
}

const DreamTeam = () => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);

  // Inicializamos el cliente llamando a la función de tu lib
  const supabase = createClient();

  useEffect(() => {
    const fetchDreamTeam = async () => {
      const { data, error } = await supabase
        .from('dream_team_titulares')
        .select('*');

      if (error) {
        console.error('Error en View DreamTeam:', error.message);
      } else if (data) {
        setJugadores(data as Jugador[]);
      }
      setLoading(false);
    };

    fetchDreamTeam();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Escaneando Top 12...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {jugadores.length > 0 ? (
        jugadores.map((j, idx) => (
          <div 
            key={idx} 
            className="flex items-center bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 rounded-2xl p-3 transition-all duration-200 group"
          >
            {/* Badge del Club */}
            <div className="flex-shrink-0 w-10 h-10 bg-black border border-green-500/50 rounded-lg flex items-center justify-center text-[9px] font-black text-green-500 uppercase tracking-tighter">
              {j.club ? j.club.substring(0, 3) : 'URB'}
            </div>

            {/* Info Jugador */}
            <div className="ml-4 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  {j.posicion}
                </span>
                {idx < 3 && (
                   <span className="text-[7px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Top {idx + 1}</span>
                )}
              </div>
              <h3 className="text-sm font-bold text-gray-100 group-hover:text-white transition">
                {j.nombre}
              </h3>
            </div>

            {/* Puntos */}
            <div className="text-right px-2">
              <span className="text-lg font-black text-green-500 leading-none">
                {j.puntos}
              </span>
              <p className="text-[8px] font-bold text-gray-600 uppercase">Pts</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
          <p className="text-gray-500 text-xs font-bold uppercase italic">No hay datos para la Fecha 3 aún</p>
        </div>
      )}
    </div>
  );
};

export default DreamTeam;