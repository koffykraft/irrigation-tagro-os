-- TAGRO Irrigation Environment
-- Anonymous job persistence v1.0
-- No user/account table is introduced here.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS irrigation_jobs (
  job_id TEXT PRIMARY KEY,
  access_token_hash TEXT NOT NULL,
  title TEXT,
  maturity TEXT NOT NULL DEFAULT 'preliminary',
  state_version INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_opened_at TEXT,
  deleted_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_irrigation_jobs_access_hash
  ON irrigation_jobs(access_token_hash);

CREATE TABLE IF NOT EXISTS irrigation_job_snapshots (
  job_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  state_json TEXT NOT NULL,
  state_hash TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (job_id, version),
  FOREIGN KEY (job_id) REFERENCES irrigation_jobs(job_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS irrigation_events (
  event_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  object_ids_json TEXT NOT NULL DEFAULT '[]',
  payload_json TEXT NOT NULL DEFAULT '{}',
  actor_type TEXT NOT NULL DEFAULT 'anonymous_job_holder',
  occurred_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES irrigation_jobs(job_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_irrigation_events_job_time
  ON irrigation_events(job_id, occurred_at);

CREATE TABLE IF NOT EXISTS irrigation_proposals (
  proposal_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed',
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  resolution_note TEXT,
  FOREIGN KEY (job_id) REFERENCES irrigation_jobs(job_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_irrigation_proposals_job_status
  ON irrigation_proposals(job_id, status);

CREATE TABLE IF NOT EXISTS irrigation_learning_evidence (
  evidence_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'job',
  kind TEXT NOT NULL,
  subject_ids_json TEXT NOT NULL DEFAULT '[]',
  proposal_id TEXT,
  observed_at TEXT NOT NULL,
  source_json TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'observed',
  summary TEXT NOT NULL,
  facts_json TEXT NOT NULL DEFAULT '[]',
  interpretations_json TEXT NOT NULL DEFAULT '[]',
  confidence REAL,
  may_generalize INTEGER NOT NULL DEFAULT 0 CHECK (may_generalize IN (0,1)),
  generalization_conditions_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (job_id) REFERENCES irrigation_jobs(job_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_irrigation_learning_job_time
  ON irrigation_learning_evidence(job_id, observed_at);

CREATE INDEX IF NOT EXISTS idx_irrigation_learning_kind
  ON irrigation_learning_evidence(kind);
