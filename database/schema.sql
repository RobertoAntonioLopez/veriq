BEGIN;

CREATE TABLE test_cases (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(200) NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 10000),
  preconditions TEXT NOT NULL DEFAULT '' CHECK (char_length(preconditions) <= 10000),
  steps TEXT NOT NULL CHECK (char_length(btrim(steps)) BETWEEN 1 AND 10000),
  expected_result TEXT NOT NULL CHECK (char_length(btrim(expected_result)) BETWEEN 1 AND 10000),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_runs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  test_case_id INTEGER NOT NULL REFERENCES test_cases(id) ON DELETE RESTRICT,
  result TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'blocked')),
  notes TEXT NOT NULL DEFAULT '' CHECK (char_length(notes) <= 10000),
  case_snapshot JSONB NOT NULL CHECK (jsonb_typeof(case_snapshot) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bugs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  test_case_id INTEGER REFERENCES test_cases(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  description TEXT NOT NULL CHECK (char_length(btrim(description)) BETWEEN 1 AND 10000),
  steps_to_reproduce TEXT NOT NULL CHECK (char_length(btrim(steps_to_reproduce)) BETWEEN 1 AND 10000),
  expected_result TEXT NOT NULL CHECK (char_length(btrim(expected_result)) BETWEEN 1 AND 10000),
  actual_result TEXT NOT NULL CHECK (char_length(btrim(actual_result)) BETWEEN 1 AND 10000),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX test_cases_created_idx ON test_cases (created_at DESC, id DESC);
CREATE INDEX test_runs_case_created_idx ON test_runs (test_case_id, created_at DESC, id DESC);
CREATE INDEX test_runs_created_idx ON test_runs (created_at DESC, id DESC);
CREATE INDEX bugs_test_case_idx ON bugs (test_case_id);
CREATE INDEX bugs_status_created_idx ON bugs (status, created_at DESC, id DESC);

COMMIT;
