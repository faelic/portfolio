-- Owner-only, first initialization. Deliberately fails if already initialized.
-- Also usable directly in Neon's SQL editor (execute the entire transaction).
BEGIN;
CREATE SCHEMA portfolio_rag;
CREATE TABLE portfolio_rag.metadata (
    id SMALLINT PRIMARY KEY CHECK (id=1),
    version INTEGER NOT NULL CHECK (version=1)
);
INSERT INTO portfolio_rag.metadata VALUES (1,1);
CREATE TABLE portfolio_rag.admissions (at DOUBLE PRECISION NOT NULL);
CREATE INDEX admissions_at ON portfolio_rag.admissions(at);
CREATE TABLE portfolio_rag.client_admissions (
    at DOUBLE PRECISION NOT NULL, visitor TEXT NOT NULL, ip TEXT NOT NULL
);
CREATE INDEX client_admissions_visitor ON portfolio_rag.client_admissions(visitor, at);
CREATE INDEX client_admissions_ip ON portfolio_rag.client_admissions(ip, at);
CREATE INDEX client_admissions_at ON portfolio_rag.client_admissions(at);
CREATE TABLE portfolio_rag.debits (
    at DOUBLE PRECISION NOT NULL, request_id TEXT NOT NULL, stage TEXT NOT NULL,
    micro_usd INTEGER NOT NULL CHECK (micro_usd>0), price_version TEXT NOT NULL
);
CREATE INDEX debits_at ON portfolio_rag.debits(at);
COMMIT;
