-- Owner-only. Create a non-admin, non-owner login role separately first.
-- Safe for initial grants and for removing the earlier DELETE-on-debits grant.
BEGIN;
GRANT USAGE ON SCHEMA portfolio_rag TO portfolio_rag_runtime;
GRANT SELECT, UPDATE ON portfolio_rag.metadata TO portfolio_rag_runtime;
GRANT SELECT, INSERT, DELETE ON portfolio_rag.admissions,
    portfolio_rag.client_admissions TO portfolio_rag_runtime;
REVOKE UPDATE, DELETE, TRUNCATE ON portfolio_rag.debits FROM portfolio_rag_runtime;
GRANT SELECT, INSERT ON portfolio_rag.debits TO portfolio_rag_runtime;
COMMIT;
