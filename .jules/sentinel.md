## 2025-05-23 - Hardcoded Secrets in Utility Scripts
**Vulnerability:** Found hardcoded API keys and secrets (Render, StormMCP, GitHub, Supabase) in `scripts/test-all-mcps.js` and `scripts/verify-storm.js`.
**Learning:** Utility scripts often get overlooked during security reviews because they are not part of the main application build. However, if they are committed to the repo, they expose secrets just as dangerously.
**Prevention:** Always use `process.env` for secrets in scripts. Add `dotenv` support if local execution is needed. Never add "fallback" values that are actual secrets.
