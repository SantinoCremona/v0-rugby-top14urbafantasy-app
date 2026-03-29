import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 

// Definimos la "Interface" para que TypeScript sepa qué trae la View
interface JugadorDreamTeam {
  nombre: string;
  posicion: string;
  club: string;
  puntos: number;
  fecha_num: number;
  ranking_pos: number;
}

const DreamTeam = () => {
  // Le decimos a useState que va a guardar un array de JugadorDreamTeam
  const [jugadores, setJugadores] = useState<JugadorDreamTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDreamTeam = async () => {
      const { data, error } = await supabase
        .from('dream_team_titulares')
        .select('*');
      
      if (error) {
        console.error('Error cargando el XV Ideal:', error);
      } else if (data) {
        setJugadores(data as JugadorDreamTeam[]);
      }
      setLoading(false);
    };

    fetchDreamTeam();
  }, []);

  if (loading) return <div className="text-center p-10 font-bold">Cargando el XV Ideal de la URBA...</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">XV IDEAL</h1>
        <div className="bg-green-600 text-white inline-block px-4 py-1 rounded-full text-xs font-bold mt-2">
          URBA TOP 12 • FECHA 3
        </div>
      </header>

      <div className="space-y-4">
        {jugadores.map((jugador, index) => (
          <div 
            key={index} 
            className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all active:scale-95"
          >
            {/* Escudo/Club */}
            <div className="flex-shrink-0 w-12 h-12 bg-black rounded-xl flex items-center justify-center text-[10px] font-black text-white uppercase outline outline-2 outline-offset-2 outline-green-500">
              {jugador.club.substring(0, 3)}
            </div>

            {/* Datos */}
            <div className="ml-4 flex-grow">
              <p className="text-[10px] font-extrabold text-green-600 uppercase tracking-widest mb-1">
                {jugador.posicion}
              </p>
              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                {jugador.nombre}
              </h3>
              <p className="text-xs text-gray-400 italic">{jugador.club}</p>
            </div>

            {/* Puntaje */}
            <div className="text-right">
              <div className="text-2xl font-black text-gray-900 leading-none">
                {jugador.puntos}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Puntos</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-gray-300 mt-10 uppercase font-medium">
        Powered by Headcoach Engine v1.0
      </p>
    </div>
  );
};

export default DreamTeam;