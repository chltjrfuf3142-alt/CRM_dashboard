---
name: CRM Dashboard gap fixes March 2026
description: 7 targeted gap fixes applied to raise Match Rate from 76% to >=90%
type: project
---

Applied on 2026-03-18 to lift design-implementation match rate from 76% to >=90%.

Files changed:
- vercel.json: added X-XSS-Protection header (was missing from 3-header set)
- api/generate-email.ts: added 2 KB body size guard (413 response); added optional `dealInfo` param included in prompt when present
- src/types/index.ts: added `EmailTemplate` interface after `EmailTone`
- src/pages/Email.tsx: added `hasError` state + retry button in result panel; passes `dealInfo: undefined` in complete() body
- src/pages/Buyers.tsx: added `isDataLoading` state; shows 8 animated skeleton cards while initial load is in progress and buyers array is empty
- src/stores/useDealStore.ts: added `columnOrder: DealStage[]` field initialized from `DEAL_STAGES.map(s => s.id)`

**Why:** Gap analysis report (docs/03-analysis/crm-foundation.analysis.md) identified these 7 items as unimplemented design specs.
**How to apply:** If further gap analysis flags regressions in these areas, check the files listed above first.
