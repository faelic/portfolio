# Follow-up continuity correction

19 November 2026. **Offline regression replay with AI-assisted relevance judgments. No new live run or independent human grading.**

The original 12-turn live report and its raw outputs remain unchanged. This replay reuses five actual failed/weak cases, their answers, the six-exchange history and their selected public evidence. It does not regenerate answers. The notification case additionally supplies the login-session question actually displayed earlier, reproducing the new browser display-memory input.

| Case | Before | After |
|---|---|---|
| followup-04 | What did Favour contribute to Policy.ng? | What can the arbiter do in Escrow? |
| followup-07 | How does Monierave manage login sessions? | How did Favour build Monierave's frontend? |
| followup-09 | No suggestion | How does BlockScan handle failed live updates? |
| followup-11 | How does Policy.ng handle administrative workflows? | How does the Portfolio RAG Assistant resolve conversation follow-ups? |
| followup-12 | What technologies does Favour use for frontend integration at Policy.ng? | What did Favour own on Policy.ng? |

## What changed

- Fallbacks stay on the active topic, including either named side of a comparison. Generic unrelated-project transitions were removed. Broad blockchain questions use blockchain projects actually discussed in the answer.
- Generated questions with a source outside that topic are rejected. Conservative intent-overlap checks and a small known-tool-list check reject obvious questions already answered, including the recorded Policy.ng technology repeat.
- The browser sends the last 12 displayed suggestions as optional, bounded, untrusted reference data. Both generated and curated selectors skip exact reoffers. Clear conversation resets this memory; page reload/remount also loses it. The model history remains six exchanges.
- One supported RAG conversation-rewrite fallback provides a continuation after the evaluation answer. It uses existing supplied evidence.

## Verification and limits

All five saved regression cases now select a supported, on-topic continuation in this replay. This is an AI-assisted judgment of these specific outputs, not proof that all future suggestions will be relevant or unique. No similarity percentage or guaranteed follow-up after every turn is claimed. Exact display-memory matching and local intent heuristics do not detect every paraphrase; exhausted topics can still return no question.

188 backend tests ran successfully (13 skipped); 54 frontend unit tests, 24 desktop/mobile Chromium and WebKit browser checks, lint and production build passed. Tests cover bounded/malformed recent lists, inclusion in cost reservations, stale events, clearing, Tab/caret behavior and touch acceptance. Browser fixtures test transport/composer behavior and do not score real model quality. Existing dependency resource warnings and build chunk-size warnings remain.

There are no additional model calls, ledger tables or changes to provider retries, deadlines, output ceilings, production defaults or the visual design. Owner live checks now carry the same recent-display memory for future runs. No paid check was repeated for this correction.

[Replay results and code hashes](continuity-replay.json). The original [live report](REPORT.md), snapshots and manifest describe the earlier run and implementation at that time; they have not been rewritten to imply that the corrected code produced those original outputs.
