-- songs: global track registry — one row per unique Spotify track, shared across all users.
-- Stores metadata and cached audio features (populated later during analysis).
create table songs (
  id               uuid        primary key default gen_random_uuid(),
  spotify_track_id text        not null unique,
  name             text        not null,
  artist           text        not null,
  album_art_url    text,
  audio_features   jsonb,
  has_audio_features boolean   not null default false,
  processed_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- Authenticated users may read any song (global data).
-- Writes are service-role-only (server-side import).
alter table songs enable row level security;
create policy "songs_select"
  on songs for select
  to authenticated
  using (true);

-- user_songs: per-user relationship between a user and a Spotify track.
-- Stores MoodSort-specific state: playlist assignment, classification status, confidence score.
create table user_songs (
  id                      uuid        primary key default gen_random_uuid(),
  user_id                 uuid        not null references auth.users(id) on delete cascade,
  song_id                 uuid        not null references songs(id) on delete cascade,
  spotify_track_id        text        not null,
  added_at                timestamptz,
  playlist_id             uuid,
  status                  text        not null default 'unsorted'
    check (status in ('unsorted', 'sorted', 'pending_review', 'unprocessable')),
  classification_confidence float,
  manually_overridden     boolean     not null default false,
  created_at              timestamptz not null default now(),
  unique (user_id, song_id)
);

-- Users can only read and write their own rows.
alter table user_songs enable row level security;

create policy "user_songs_select"
  on user_songs for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_songs_insert"
  on user_songs for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_songs_update"
  on user_songs for update
  to authenticated
  using (user_id = auth.uid());

-- Indexes for fast per-user lookups in the seed picker and sync queries.
create index user_songs_user_id_idx  on user_songs (user_id);
create index user_songs_status_idx   on user_songs (user_id, status);
create index user_songs_added_at_idx on user_songs (user_id, added_at desc);
