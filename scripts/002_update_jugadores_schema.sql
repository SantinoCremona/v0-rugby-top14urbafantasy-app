-- Add missing columns to jugadores table
ALTER TABLE jugadores 
ADD COLUMN IF NOT EXISTS puntos_totales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tendencia TEXT DEFAULT 'estable';

-- Update existing records with sample data
UPDATE jugadores SET 
  puntos_totales = FLOOR(RANDOM() * 150 + 50)::INTEGER,
  tendencia = CASE 
    WHEN RANDOM() < 0.33 THEN 'subiendo'
    WHEN RANDOM() < 0.66 THEN 'bajando'
    ELSE 'estable'
  END
WHERE puntos_totales IS NULL OR puntos_totales = 0;

-- Insert more players for a complete squad
INSERT INTO jugadores (nombre, posicion, precio, puntos_totales, tendencia, foto_url)
SELECT * FROM (VALUES
  ('Martin Gonzalez', 'Pilar', 850, 95, 'subiendo', NULL),
  ('Lucas Fernandez', 'Pilar', 780, 82, 'estable', NULL),
  ('Agustin Creevy', 'Hooker', 1200, 145, 'subiendo', NULL),
  ('Julian Montoya', 'Hooker', 950, 110, 'estable', NULL),
  ('Tomas Lavanini', 'Segunda', 1100, 125, 'subiendo', NULL),
  ('Matias Alemanno', 'Segunda', 980, 105, 'bajando', NULL),
  ('Guido Petti', 'Segunda', 1050, 118, 'estable', NULL),
  ('Pablo Matera', 'Ala', 1500, 175, 'subiendo', NULL),
  ('Marcos Kremer', 'Ala', 1300, 155, 'subiendo', NULL),
  ('Santiago Grondona', 'Ala', 1100, 130, 'estable', NULL),
  ('Facundo Isa', 'N8', 1250, 140, 'bajando', NULL),
  ('Rodrigo Bruni', 'N8', 1050, 115, 'estable', NULL),
  ('Gonzalo Bertranou', 'Medio', 900, 95, 'estable', NULL),
  ('Tomas Cubelli', 'Medio', 850, 88, 'bajando', NULL),
  ('Santiago Carreras', 'Apertura', 1400, 165, 'subiendo', NULL),
  ('Nicolas Sanchez', 'Apertura', 1350, 160, 'estable', NULL),
  ('Jeronimo de la Fuente', 'Centro', 1200, 135, 'subiendo', NULL),
  ('Matias Moroni', 'Centro', 1100, 120, 'estable', NULL),
  ('Lucio Cinti', 'Centro', 950, 105, 'subiendo', NULL),
  ('Emiliano Boffelli', 'Wing', 1450, 170, 'subiendo', NULL),
  ('Mateo Carreras', 'Wing', 1300, 150, 'subiendo', NULL),
  ('Bautista Delguy', 'Wing', 1150, 130, 'estable', NULL),
  ('Juan Imhoff', 'Fullback', 1350, 155, 'estable', NULL),
  ('Juan Cruz Mallia', 'Fullback', 1250, 140, 'subiendo', NULL)
) AS new_players(nombre, posicion, precio, puntos_totales, tendencia, foto_url)
WHERE NOT EXISTS (
  SELECT 1 FROM jugadores WHERE jugadores.nombre = new_players.nombre
);
