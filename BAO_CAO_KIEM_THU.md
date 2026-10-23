# EduPlan AI 5.4 - Technical QA record

## Executed checks
- Node.js syntax check passed: `app/api/[action]/route.js`.
- TypeScript compiler parser check passed on React JSX: `app/page.jsx`.
- Pure Node unit tests: 6 passing (shuffle, answer mapping, /10, decimal answers, missing data refusal, four-part true/false partial credit).
- JSON schema files valid: checked during packaging.

## Not executed in this environment
- `npm run build`: `npm install` failed due to EAI_AGAIN DNS resolution for registry.npmjs.org.
- No live Supabase project connection or real Vercel deployment; need owner configuration.
- Gemini online generation and Wikipedia online retrieval cannot be verified in this environment.
- Browser UI responsiveness has NOT been inspected with deployed Next.js and real data.

## Manual acceptance checklist
1. Run Supabase schema or 5.3->5.4 migration.
2. Test student cannot access teacher endpoints (403) or view unpublished answers.
3. Create 3 variants, confirm distinct code and shuffled A-D options.
4. Submit each variant using correct displayed answers and verify score 10/10.
5. Verify expired session rejects submission.
6. Enable a practice question, check instant feedback; confirm it cannot be practice-enabled inside an active exam.
7. Import legacy JSON, check draft state; approve after reviewing Chemistry accuracy.
8. Trigger shortage: with Gemini configured, review generated drafts AND references; with key missing, check clear error.
9. Confirm visits are stored in Supabase and teacher daily overview reflects two separate browsers.
10. Do privacy review and load/security testing before deployment to students.
