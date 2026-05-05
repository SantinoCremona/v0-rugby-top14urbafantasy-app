import React, { useState } from 'react';
import './Prode.css';

// Interfaces para tipado fuerte
interface Match {
  id: number;
  home: string;
  away: string;
}

interface Prediction {
  winner?: 'L' | 'E' | 'V';
  margin?: '1-7' | '8-15' | '16-25' | '+25';
}

interface UserPredictions {
  [key: number]: Prediction;
}

const matchesData: Match[] = [
  { id: 1, home: "Pucará", away: "San Fernando" },
  { id: 2, home: "Pueyrredón", away: "Deportiva Francesa" },
  { id: 3, home: "Universitario LP", away: "San Cirano" },
  { id: 4, home: "San Andrés", away: "San Albano" },
  { id: 5, home: "Hurling", away: "GEBA" },
  { id: 6, home: "Lomas Athletic", away: "Olivos" },
  { id: 7, home: "Curupaytí", away: "San Luis" }
];

const ProdePrimeraA: React.FC = () => {
  const [predictions, setPredictions] = useState<UserPredictions>({});

  const handleSelection = (matchId: number, type: keyof Prediction, value: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [type]: value
      }
    }));
  };

  const isComplete = matchesData.every(m => predictions[m.id]?.winner && predictions[m.id]?.margin);

  const handleSubmit = () => {
    if (!isComplete) {
      alert("Por favor, completa todos los pronósticos para participar.");
      return;
    }
    console.log("Payload para la DB:", predictions);
    alert("¡Pronósticos enviados! 🚀 Estamos a nada de los 500 seguidores.");
  };

  return (
    <div className="headcoach-prode">
      <div className="prode-header">
        <span className="pill">FECHA 7 • SÁBADO 9 MAYO</span>
        <h1>PRODE <span>PRIMERA A</span></h1>
        <p>Demostrá quién es el verdadero cerebro de la categoría.</p>
      </div>

      <div className="prode-grid">
        {matchesData.map((match) => (
          <div key={match.id} className="match-card">
            <div className="teams-container">
              <span className="team">{match.home}</span>
              <span className="vs">VS</span>
              <span className="team">{match.away}</span>
            </div>

            <div className="winner-selector">
              {(['L', 'E', 'V'] as const).map((opt) => (
                <button
                  key={opt}
                  className={`hc-btn ${predictions[match.id]?.winner === opt ? 'active' : ''}`}
                  onClick={() => handleSelection(match.id, 'winner', opt)}
                >
                  {opt === 'L' ? 'LOCAL' : opt === 'E' ? 'EMPATE' : 'VISITA'}
                </button>
              ))}
            </div>

            <div className="margin-section">
              <label>MARGEN DE VICTORIA</label>
              <div className="margin-options">
                {['1-7', '8-15', '16-25', '+25'].map((margin) => (
                  <button
                    key={margin}
                    className={`margin-pill ${predictions[match.id]?.margin === margin ? 'active' : ''}`}
                    onClick={() => handleSelection(match.id, 'margin', margin)}
                  >
                    {margin}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-action">
        <button 
          className={`submit-prode-btn ${isComplete ? 'ready' : ''}`}
          onClick={handleSubmit}
        >
          ENVIAR PRONÓSTICOS
        </button>
      </div>
    </div>
  );
};

export default ProdePrimeraA;