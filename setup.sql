-- ============================================================
-- POCKET TOON — Supabase Setup SQL
-- Run this entire script in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ── PRODUCTS ────────────────────────────────────────────────
create table if not exists pt_products (
  id          text        primary key,
  name        text        not null,
  vendor      text        default '',
  price       numeric     not null default 0,
  category    text        not null default '',
  img         text        default '',
  images      jsonb       not null default '[]',
  description text        default '',
  in_stock    boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

alter table pt_products enable row level security;
drop policy if exists "pt_products_all" on pt_products;
create policy "pt_products_all" on pt_products for all using (true) with check (true);

-- ── CATEGORIES ──────────────────────────────────────────────
create table if not exists pt_categories (
  id         text    primary key,
  name       text    not null,
  type       text    not null default 'anime',
  img        text    default '',
  caption    text    default '',
  sort_order integer not null default 0
);

alter table pt_categories enable row level security;
drop policy if exists "pt_categories_all" on pt_categories;
create policy "pt_categories_all" on pt_categories for all using (true) with check (true);

-- ── STOREFRONT USERS ────────────────────────────────────────
create table if not exists pt_users (
  id          text        primary key,
  name        text        default '',
  email       text        not null unique,
  phone       text        default '',
  address     text        default '',
  password    text        default '',
  orders      integer     not null default 0,
  last_order  timestamptz,
  registered  timestamptz not null default now()
);

alter table pt_users enable row level security;
drop policy if exists "pt_users_all" on pt_users;
create policy "pt_users_all" on pt_users for all using (true) with check (true);

-- ── ORDERS ──────────────────────────────────────────────────
create table if not exists pt_orders (
  id         text        primary key,
  user_id    text        not null,
  user_name  text        default '',
  user_email text        default '',
  items      jsonb       not null default '[]',
  total      numeric     not null default 0,
  address    text        default '',
  status     text        not null default 'pending',
  created_at timestamptz not null default now()
);

alter table pt_orders enable row level security;
drop policy if exists "pt_orders_all" on pt_orders;
create policy "pt_orders_all" on pt_orders for all using (true) with check (true);

-- ── STORAGE BUCKET ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('pocket-toon-images', 'pocket-toon-images', true)
on conflict (id) do nothing;

drop policy if exists "pocket_toon_images_select" on storage.objects;
drop policy if exists "pocket_toon_images_insert" on storage.objects;
drop policy if exists "pocket_toon_images_delete" on storage.objects;

create policy "pocket_toon_images_select" on storage.objects
  for select using (bucket_id = 'pocket-toon-images');

create policy "pocket_toon_images_insert" on storage.objects
  for insert with check (bucket_id = 'pocket-toon-images');

create policy "pocket_toon_images_delete" on storage.objects
  for delete using (bucket_id = 'pocket-toon-images');

-- ── DEFAULT CATEGORIES SEED ─────────────────────────────────
insert into pt_categories (id, name, type, img, caption, sort_order) values
  ('cat_bey1', 'Plastic Gen',      'beyblade', 'https://placehold.co/750x750/29abe2/ffffff?text=Plastic+Gen',     'Classic plastic generation Beyblades',                  1),
  ('cat_bey2', 'Metal Gen',        'beyblade', 'https://placehold.co/750x750/1565c0/ffffff?text=Metal+Gen',       'Authentic Takara Tomy Metal Fusion Beyblades',           2),
  ('cat_bey3', 'Burst Gen',        'beyblade', 'https://placehold.co/750x750/0c2461/ffffff?text=Burst+Gen',       'Authentic Takara Tomy Beyblade Burst collection',        3),
  ('cat_bey4', 'Beyblade X',       'beyblade', 'https://placehold.co/750x750/0d47a1/ffffff?text=Beyblade+X',      'The most powerful Beyblade X series',                    4),
  ('cat_ani1', 'One Piece',        'anime',    'https://placehold.co/750x750/e65100/ffffff?text=One+Piece',        'Official One Piece figures',                             5),
  ('cat_ani2', 'Demon Slayer',     'anime',    'https://placehold.co/750x750/b71c1c/ffffff?text=Demon+Slayer',    'Official Demon Slayer figures',                          6),
  ('cat_ani3', 'Spy x Family',     'anime',    'https://placehold.co/750x750/e91e63/ffffff?text=Spy+x+Family',    'Official Spy x Family figures',                          7),
  ('cat_ani4', 'My Hero Academia', 'anime',    'https://placehold.co/750x750/1565c0/ffffff?text=My+Hero',          'Official My Hero Academia figures',                      8),
  ('cat_ani5', 'Tokyo Revengers',  'anime',    'https://placehold.co/750x750/37474f/ffffff?text=Tokyo+Revengers', 'Official Tokyo Revengers figures',                       9),
  ('cat_ani6', 'Waifu Figures',    'anime',    'https://placehold.co/750x750/c62828/ffffff?text=Waifu+Figures',   'Premium waifu anime figures',                           10),
  ('cat_ani8', 'TenSura',          'anime',    'https://placehold.co/750x750/7b1fa2/ffffff?text=TenSura',          'That Time I Got Reincarnated as a Slime',               11)
on conflict (id) do nothing;

-- ── DEFAULT PRODUCTS SEED ───────────────────────────────────
insert into pt_products (id, name, vendor, price, category, img, images, description, in_stock, sort_order) values
  ('p1', 'Takaratomy Beyblade Burst B-193 Astral Spriggan', 'TAKARA TOMY', 1299, 'Burst Gen',        'https://placehold.co/400x400/29abe2/ffffff?text=Burst+Spriggan', '[]', 'Authentic Takara Tomy Beyblade Burst.',       true, 1),
  ('p2', 'Monkey D. Luffy Gear 5 — One Piece Figure',       'BANPRESTO',   2499, 'One Piece',        'https://placehold.co/400x400/e65100/ffffff?text=Luffy',          '[]', 'Official Banpresto One Piece figure.',        true, 2),
  ('p3', 'Tanjiro Kamado Demon Slayer Figure',               'BANPRESTO',   1999, 'Demon Slayer',     'https://placehold.co/400x400/b71c1c/ffffff?text=Tanjiro',        '[]', 'Official Banpresto Demon Slayer figure.',     true, 3),
  ('p4', 'Beyblade X BX-11 Dran Sword 3-60F',               'TAKARA TOMY',  849, 'Beyblade X',       'https://placehold.co/400x400/0d47a1/ffffff?text=Dran+Sword',     '[]', 'Latest Beyblade X series.',                  true, 4),
  ('p5', 'Rimuru Tempest Vol.3 TenSura Figure',              'BANPRESTO',   2299, 'TenSura',          'https://placehold.co/400x400/7b1fa2/ffffff?text=Rimuru',         '[]', 'Official Banpresto TenSura figure.',         true, 5),
  ('p6', 'Anya Forger — SPY x FAMILY Figure',               'BANPRESTO',   1799, 'Spy x Family',     'https://placehold.co/400x400/e91e63/ffffff?text=Anya',           '[]', 'Official Banpresto Spy x Family figure.',    true, 6),
  ('p7', 'Metal Beyblade BB-47 Earth Eagle Original',        'TAKARA TOMY',  699, 'Metal Gen',        'https://placehold.co/400x400/37474f/ffffff?text=Earth+Eagle',    '[]', 'Original Takara Tomy Metal Fusion.',         false,7),
  ('p8', 'Deku My Hero Academia Battle Figure',              'BANPRESTO',   2199, 'My Hero Academia', 'https://placehold.co/400x400/1565c0/ffffff?text=Deku',           '[]', 'Official Banpresto MHA figure.',             true, 8)
on conflict (id) do nothing;

-- Done! Your Pocket Toon database is ready.
