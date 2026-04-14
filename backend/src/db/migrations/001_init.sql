create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  created_at timestamptz not null
);

create table if not exists workspaces (
  id text primary key,
  name text not null,
  created_at timestamptz not null
);

create table if not exists memberships (
  id text primary key,
  workspace_id text not null references workspaces(id),
  user_id text not null references users(id),
  role text not null,
  created_at timestamptz not null
);
create index if not exists idx_memberships_workspace_user on memberships(workspace_id, user_id);

create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id),
  workspace_id text not null references workspaces(id),
  refresh_token_hash text not null,
  created_at timestamptz not null
);
create index if not exists idx_sessions_refresh_hash on sessions(refresh_token_hash);

create table if not exists claims (
  id text primary key,
  workspace_id text not null references workspaces(id),
  actor_user_id text not null references users(id),
  provider text,
  model text,
  domain text not null,
  input_hash text not null,
  output_hash text not null,
  evaluation_status text not null,
  evaluation_score integer not null,
  payload jsonb not null,
  created_at timestamptz not null
);
create index if not exists idx_claims_workspace_created on claims(workspace_id, created_at desc);

create table if not exists feedback (
  id text primary key,
  workspace_id text not null references workspaces(id),
  actor_user_id text not null references users(id),
  claim_id text not null,
  rating text not null,
  issue text not null,
  created_at timestamptz not null
);

create table if not exists audits (
  id text primary key,
  workspace_id text not null references workspaces(id),
  actor_user_id text,
  action text not null,
  detail jsonb not null,
  ts timestamptz not null
);
create index if not exists idx_audits_workspace_ts on audits(workspace_id, ts desc);

create table if not exists jobs (
  id text primary key,
  workspace_id text not null references workspaces(id),
  actor_user_id text not null references users(id),
  type text not null,
  status text not null,
  payload jsonb not null,
  result_payload jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists idx_jobs_status_created on jobs(status, created_at asc);
