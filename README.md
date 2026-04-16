# MoodSort

MoodSort analyzes your Spotify liked songs and uses AI to build custom playlists from your existing library. No new music added, just your songs organized around whatever vibe you describe.

## How it works

1. **Describe a vibe**: give the playlist a name and an optional description (e.g. "late night drive", "Sunday morning cooking")
2. **Pick 10 seed songs**: choose songs from your liked library that capture the feeling you're going for
3. **AI analysis**: the seed songs are analyzed for energy, tempo, mood, and genre to build a vibe profile, then every song in your library is scored against it
4. **Review and confirm**: preview the matched songs, remove any that don't fit, and create the playlist directly on your Spotify account

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) — Postgres database + Auth (Spotify OAuth)
- [OpenAI API](https://platform.openai.com) — vibe extraction and song scoring
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) — library sync and playlist creation
- [Tailwind CSS](https://tailwindcss.com)

## Running locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Spotify Developer App](https://developer.spotify.com/dashboard) with the redirect URI `http://localhost:3000/auth/callback` added
- An [OpenAI API](https://platform.openai.com) key

### 1. Clone and install

```bash
git clone https://github.com/your-username/moodsort.git
cd moodsort
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-nano
```

### 3. Set up a Spotify Developer App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in with your Spotify account
2. Click **Create app**
3. Fill in a name and description (anything works for local dev), then set the **Redirect URI** to `http://localhost:3000/auth/callback` and check **Web API** under APIs used
4. Save, then open the app's settings and copy the **Client ID** and **Client Secret** into your `.env`

By default your app is in **Development mode**, which limits it to 25 users. Those users must be explicitly added under **User Management** in the dashboard before they can sign in. For personal use this is fine. To open the app to everyone, you'd need to apply for an Extended Quota through Spotify.

### 4. Set up Supabase

In the Supabase dashboard, go to **Authentication → Providers → Spotify** and add your Spotify client ID and secret. Set the redirect URL to `http://localhost:3000/auth/callback`.

Run the following in the Supabase SQL editor to create the required tables:

```sql
-- Songs catalog
create table songs (
  spotify_track_id text primary key,
  name text not null,
  artist text not null,
  album_art_url text,
  audio_features jsonb,
  has_audio_features boolean not null default false
);

-- Per-user library
create table user_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spotify_track_id text not null references songs(spotify_track_id),
  unique (user_id, spotify_track_id)
);

alter table user_songs enable row level security;
create policy "user_songs_select" on user_songs for select to authenticated using (user_id = auth.uid());
create policy "user_songs_insert" on user_songs for insert to authenticated with check (user_id = auth.uid());
create policy "user_songs_delete" on user_songs for delete to authenticated using (user_id = auth.uid());

-- Sync state
create table user_sync_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_synced_at timestamptz,
  total_songs int not null default 0
);

alter table user_sync_state enable row level security;
create policy "sync_state_select" on user_sync_state for select to authenticated using (user_id = auth.uid());
create policy "sync_state_upsert" on user_sync_state for insert to authenticated with check (user_id = auth.uid());
create policy "sync_state_update" on user_sync_state for update to authenticated using (user_id = auth.uid());

-- Created playlists
create table playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spotify_playlist_id text not null,
  name text not null,
  vibe_description text,
  song_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table playlists enable row level security;
create policy "playlists_select" on playlists for select to authenticated using (user_id = auth.uid());
create policy "playlists_insert" on playlists for insert to authenticated with check (user_id = auth.uid());
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Spotify.