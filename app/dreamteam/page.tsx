const [dreamTeamPlayers, setDreamTeamPlayers] = useState(new Map());

useEffect(() => {
  async function cargarDreamTeam() {
    const { data, error } = await supabase
      .from('dream_team_ultima_fecha')
      .select('*');

    if (data) {
      const fieldMap = new Map();
      data.forEach(j => {
        const numeroPosicion = mapeoPosiciones[j.posicion];
        fieldMap.set(numeroPosicion, {
          id: j.id,
          nombre: j.nombre,
          club: j.club,
          puntos: j.puntos
        });
      });
      setDreamTeamPlayers(fieldMap);
    }
  }
  cargarDreamTeam();
}, []);