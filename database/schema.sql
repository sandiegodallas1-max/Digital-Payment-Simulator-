CREATE TABLE app_user (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE payment_transaction (
  id UUID PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES app_user(id),
  receiver_id UUID NOT NULL REFERENCES app_user(id),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status transaction_status NOT NULL DEFAULT 'pending',
  fraud_flag BOOLEAN NOT NULL DEFAULT FALSE,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_transaction_sender_id
  ON payment_transaction(sender_id);

CREATE INDEX idx_payment_transaction_receiver_id
  ON payment_transaction(receiver_id);

CREATE INDEX idx_payment_transaction_status
  ON payment_transaction(status);
