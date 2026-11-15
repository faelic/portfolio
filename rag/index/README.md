# Reviewed public release index

`knowledge.json` and `knowledge.sha256` are deliberate deployment inputs, not a live database dump. They contain only the curated public portfolio chunks, metadata, model configuration and 3072-dimensional embeddings. Never add private material or visitor data here.

The initial release was exported from the existing local `docs` Chroma collection on 15 November 2026 after verifying exact IDs/text/metadata against all 33 current chunks. No new embeddings or model calls were made. The legacy collection lacked a corpus fingerprint; export therefore verified every record against freshly split source before stamping the current fingerprint. Local Chroma files remain excluded and unchanged by the release format.

From `rag`, run `uv run --locked python -m implementation.packaged_index verify`. After deliberately updating local ingestion, run `uv run --locked python -m implementation.packaged_index export` and review/commit both files. Export does not call an embedding provider. Ingestion does.

The checksum detects corruption, not malicious changes by someone able to replace both committed files. Trust comes from reviewed repository releases, source-boundary checks and the supply chain. Runtime checks also validate corpus fingerprint, model, metric, dimensions, IDs, exact text and metadata. Exact squared-L2 retrieval replaces mutable Chroma for the small packaged production corpus. Do not claim real-model quality equivalence from artifact validation alone.
