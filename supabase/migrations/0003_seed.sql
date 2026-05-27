-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data — only inserted if the rows don't already exist.
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- Tables (physical seating layout)
insert into tables (number, capacity, zone, pos_x, pos_y) values
  ('B1', 2, 'bodega',   80, 110),
  ('B2', 2, 'bodega',  180, 110),
  ('B3', 4, 'bodega',  300, 110),
  ('B4', 4, 'bodega',   80, 230),
  ('B5', 6, 'bodega',  220, 230),
  ('B6', 8, 'bodega',  380, 230),
  ('T1', 4, 'terrasse', 80, 360),
  ('T2', 4, 'terrasse',180, 360),
  ('T3', 6, 'terrasse',300, 360),
  ('T4', 2, 'terrasse', 80, 460),
  ('T5', 2, 'terrasse',180, 460),
  ('BR1', 2, 'bar',    420, 110)
on conflict (number, zone) do nothing;

-- Standard time slots for the next 60 days (Tue–Sat only)
insert into time_slots (date, time, capacity)
select d::date, t::time, 36
from generate_series(current_date, current_date + interval '60 days', interval '1 day') as d
cross join unnest(array[
  '17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'
]::text[]) as t
where extract(dow from d) between 2 and 6
on conflict (date, time) do nothing;

-- Demo events
insert into events (slug, title, date, start_time, description, capacity, published, dj)
values
  ('voices-and-ivories-2026',
   'Voices & Ivories',
   (date_trunc('month', current_date) + interval '32 days')::date,
   '20:00',
   'Swing, Rock und Blues live im MusikSommer.',
   60, true, 'The Ivory Trio'),
  ('clave-de-sol-2026',
   'Clave de Sol',
   (date_trunc('month', current_date) + interval '50 days')::date,
   '20:00',
   'Lateinamerikanische Klänge und Sommer-Vibe.',
   60, true, 'Clave de Sol Quartet')
on conflict (slug) do nothing;

-- Menu sections
insert into menu_sections (slug, title, intro, position) values
  ('kalt',  'Tapas frías', 'Kalt, frisch, mediterran.', 1),
  ('warm',  'Tapas calientes', 'Frisch aus der Küche.', 2),
  ('fisch', 'Pescado & Marisco', null, 3),
  ('wein',  'Vinos tintos', 'Aus den großen Anbaugebieten.', 4),
  ('cocktails', 'Cocktails', 'Klassiker mit Charakter.', 5)
on conflict (slug) do nothing;

-- A handful of menu items for the warm section
do $$
declare warm_id uuid;
begin
  select id into warm_id from menu_sections where slug = 'warm';
  if warm_id is not null then
    insert into menu_items (section_id, name, description, price, is_vegetarian, is_spicy, position)
    values
      (warm_id, 'Patatas bravas', 'Knusprige Kartoffeln, Brava-Sauce, Aioli.', 6.5, true, true, 1),
      (warm_id, 'Gambas al ajillo', 'Garnelen in Olivenöl, Knoblauch, Peperoncino.', 11.5, false, false, 2),
      (warm_id, 'Pimientos de Padrón', 'Gebratene Paprika mit Meersalz.', 7.5, true, false, 3),
      (warm_id, 'Croquetas de jamón', 'Hausgemachte Croquetas mit Serrano.', 8.5, false, false, 4)
    on conflict do nothing;
  end if;
end $$;
