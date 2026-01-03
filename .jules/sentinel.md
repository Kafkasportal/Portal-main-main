# Sentinel Journal

This journal records CRITICAL security learnings specific to this codebase.

Format:
## YYYY-MM-DD - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]

## 2025-01-26 - Missing `search_path` in SECURITY DEFINER functions
**Vulnerability:** Several `SECURITY DEFINER` RPC functions (`get_dashboard_stats`, `get_top_donors`, etc.) were missing explicit `search_path` configuration.
**Learning:** Functions defined with `SECURITY DEFINER` execute with the privileges of the creator. Without a set `search_path`, they are vulnerable to search path hijacking where a malicious user could create objects in higher-priority schemas (like `public` if not carefully managed) to capture sensitive data or execute arbitrary code.
**Prevention:** Always include `SET search_path = public, pg_catalog;` (or specific schemas) in `SECURITY DEFINER` function definitions.
