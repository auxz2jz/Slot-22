# Built-in diagnostics — candidate v0.1.0

The application logs bounded action outcomes locally (last 100) with ISO timestamp, action type, result and a short sanitized message. It logs no token, raw JSON, or currency values.

Import errors are explicit, show failed preconditions, and do not overwrite valid state. Local save failures surface to user. GitHub sync uses API result validation and remote SHA conflict checks. Test This Version provides a manual results checklist with downloadable report and diagnostics.

Future work: stable correlation IDs, duration measures, safe-request timeout, and stronger protocol/integration tests. Do not represent an action click as proof of success; review saved state and outputs.

All diagnostics could contain unexpected user-provided strings; review before publishing. Do not commit private troubleshooting data.
