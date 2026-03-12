-- Create jugadores table for Rugby Fantasy CASI
create table if not exists public.jugadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  posicion text not null check (posicion in ('Forward', 'Back')),
  precio integer not null default 100000,
  foto_url text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.jugadores enable row level security;

-- Allow public read access (anyone can view players in the market)
create policy "jugadores_select_public" on public.jugadores 
  for select using (true);

-- Insert sample players
insert into public.jugadores (nombre, posicion, precio, foto_url) values
  ('Santiago García', 'Forward', 150000, null),
  ('Matías Rodriguez', 'Back', 180000, null),
  ('Lucas Fernández', 'Forward', 120000, null),
  ('Nicolás Martinez', 'Back', 200000, null),
  ('Tomás López', 'Forward', 135000, null),
  ('Agustín Pérez', 'Back', 165000, null),
  ('Ignacio Sánchez', 'Forward', 145000, null),
  ('Federico Díaz', 'Back', 190000, null),
  ('Joaquín González', 'Forward', 110000, null),
  ('Martín Romero', 'Back', 175000, null);
