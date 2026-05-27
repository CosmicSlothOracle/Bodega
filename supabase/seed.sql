-- ─────────────────────────────────────────────────────────────────────────────
-- Bodega Bloom — Seed data for development / demo
-- Run via Supabase Dashboard SQL editor or `supabase db reset --linked`
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Physical tables (seating) ───────────────────────────────────────────────
insert into tables (number, capacity, zone, pos_x, pos_y) values
  ('1',  2, 'bodega',   0.1, 0.2),
  ('2',  2, 'bodega',   0.25, 0.2),
  ('3',  4, 'bodega',   0.4, 0.2),
  ('4',  4, 'bodega',   0.55, 0.2),
  ('5',  6, 'bodega',   0.7, 0.2),
  ('6',  4, 'bodega',   0.1, 0.5),
  ('7',  4, 'bodega',   0.25, 0.5),
  ('8',  8, 'bodega',   0.45, 0.5),
  ('9',  2, 'bar',      0.8, 0.1),
  ('10', 2, 'bar',      0.85, 0.1),
  ('T1', 4, 'terrasse', 0.1, 0.8),
  ('T2', 4, 'terrasse', 0.3, 0.8),
  ('T3', 6, 'terrasse', 0.5, 0.8),
  ('P1', 10, 'private', 0.9, 0.5)
on conflict do nothing;

-- ── Menu sections ───────────────────────────────────────────────────────────
insert into menu_sections (slug, title, intro, position) values
  ('tapas',     'Tapas',           'Kleine Köstlichkeiten zum Teilen', 1),
  ('hauptgang', 'Hauptgerichte',   'Mediterrane Klassiker',            2),
  ('dessert',   'Desserts',        'Süße Verführungen',                3),
  ('wein',      'Weine',           'Ausgewählte Tropfen',              4)
on conflict (slug) do nothing;

-- ── Menu items ──────────────────────────────────────────────────────────────
insert into menu_items (section_id, name, description, price, allergens, is_vegetarian, position) values
  ((select id from menu_sections where slug = 'tapas'), 'Patatas Bravas',         'Knusprige Kartoffeln mit Aioli & Brava-Sauce',   7.50,  '{}',          true,  1),
  ((select id from menu_sections where slug = 'tapas'), 'Gambas al Ajillo',       'Knoblauch-Garnelen in Olivenöl',                 12.90, '{crustaceans}', false, 2),
  ((select id from menu_sections where slug = 'tapas'), 'Chorizo a la Sidra',     'Chorizo in Apfelwein geschmort',                 9.50,  '{}',          false, 3),
  ((select id from menu_sections where slug = 'tapas'), 'Pimientos de Padrón',    'Gebratene Paprika mit Meersalz',                 6.90,  '{}',          true,  4),
  ((select id from menu_sections where slug = 'hauptgang'), 'Paella Mixta',       'Safran-Reis mit Meeresfrüchten & Huhn',         24.90, '{crustaceans,molluscs}', false, 1),
  ((select id from menu_sections where slug = 'hauptgang'), 'Secreto Ibérico',    'Iberico-Schwein mit Romesco',                   26.50, '{}',          false, 2),
  ((select id from menu_sections where slug = 'hauptgang'), 'Pulpo a la Gallega', 'Oktopus mit Paprika & Kartoffeln',              22.90, '{molluscs}',  false, 3),
  ((select id from menu_sections where slug = 'dessert'), 'Crema Catalana',       'Karamellisierte Vanillecreme',                   8.50,  '{eggs,milk}', true,  1),
  ((select id from menu_sections where slug = 'dessert'), 'Churros con Chocolate','Frittiertes Spritzgebäck mit Schokolade',        7.90,  '{gluten,milk}', true, 2),
  ((select id from menu_sections where slug = 'wein'), 'Rioja Reserva',          'Bodegas Muga, 2019',                             42.00, '{}',          true,  1),
  ((select id from menu_sections where slug = 'wein'), 'Albariño',               'Pazo de Señorans, Rías Baixas 2022',             38.00, '{}',          true,  2),
  ((select id from menu_sections where slug = 'wein'), 'Cava Brut',              'Gramona Imperial, Penedès',                      35.00, '{}',          true,  3)
on conflict do nothing;

-- ── Sample event ────────────────────────────────────────────────────────────
insert into events (slug, title, date, start_time, description, capacity, published) values
  ('flamenco-nacht-juni', 'Flamenco Nacht', '2026-06-14', '20:00', 
   'Erleben Sie einen unvergesslichen Abend mit Live-Flamenco, Tapas und erlesenen Weinen.', 
   60, true)
on conflict (slug) do nothing;

-- ── Sample page (Über uns) ──────────────────────────────────────────────────
insert into pages (slug, title, published) values
  ('ueber-uns', 'Über uns', true)
on conflict (slug) do nothing;
