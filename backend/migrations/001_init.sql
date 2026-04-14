create table if not exists users (
  id bigserial primary key,
  user_id text unique not null,
  email text unique not null,
  password_hash text not null,
  display_name text not null,
  created_at timestamptz not null
);

create table if not exists memberships (
  id bigserial primary key,
  membership_id text unique not null,
  workspace_id text not null,
  user_id text not null references users(user_id),
  role text not null check (role in ('admin','editor','analyst','viewer')),
  created_at timestamptz not null,
  unique (workspace_id, user_id)
);

create table if not exists claims (
  id bigserial primary key,
  claim_id text unique not null,
  workspace_id text not null,
  created_by text not null references users(user_id),
  provider text not null,
  model text not null,
  domain text not null,
  analysis_depth text not null,
  harden boolean not null,
  input_hash text not null,
  output_hash text not null,
  policy_hash text not null,
  local_status text not null,
  local_score integer not null,
  summary text not null,
  improved_prompt text not null,
  constraints_json jsonb not null,
  risk_notes_json jsonb not null,
  test_cases_json jsonb not null,
  scoring_rationale_json jsonb not null,
  created_at timestamptz not null
);

create index if not exists idx_claims_workspace_created_at on claims (workspace_id, created_at desc);

create table if not exists audits (
  id bigserial primary key,
  audit_id text unique not null,
  workspace_id text not null,
  actor_user_id text not null,
  event_type text not null,
  payload_json jsonb not null,
  created_at timestamptz not null
);

create index if not exists idx_audits_workspace_created_at on audits (workspace_id, created_at desc);

create table if not exists feedback (
  id bigserial primary key,
  feedback_id text unique not null,
  workspace_id text not null,
  claim_id text not null,
  user_id text not null,
  rating text not null check (rating in ('up','down')),
  issue text not null default '',
  issue_type text not null,
  created_at timestamptz not null
);

create table if not exists jobs (
  id bigserial primary key,
  job_id text unique not null,
  workspace_id text not null,
  created_by text not null,
  kind text not null,
  status text not null,
  payload_json jsonb not null default '{}'::jsonb,
  result_json jsonb,
  error text,
  created_at timestamptz not null,
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_jobs_kind_status_created on jobs (kind, status, created_at asc);
