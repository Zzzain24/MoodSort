-- user_sync_state: tracks the last time a user manually synced their liked songs.
-- One row per user, updated after each successful incremental sync.
create table user_sync_state (
  user_id        uuid        primary key references auth.users(id) on delete cascade,
  last_synced_at timestamptz not null default now()
);

alter table user_sync_state enable row level security;

create policy "user_sync_state_select"
  on user_sync_state for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_sync_state_insert"
  on user_sync_state for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_sync_state_update"
  on user_sync_state for update
  to authenticated
  using (user_id = auth.uid());
