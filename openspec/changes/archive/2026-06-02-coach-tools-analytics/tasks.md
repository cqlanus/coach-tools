## 1. TypeScript Type Declaration

- [x] 1.1 Create `apps/web/src/types/umami.d.ts` declaring `interface Window { umami?: { track: (event: string, data?: Record<string, unknown>) => void } }`

## 2. Layout — Script Tag

- [x] 2.1 In `apps/web/src/app/layout.tsx`, import `Script` from `"next/script"`
- [x] 2.2 Add the Umami `<Script>` tag inside the `<body>`: `src="https://analytics.chrislanus.com/script.js"`, `strategy="afterInteractive"`, `data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}` — render only when `process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID` is truthy

## 3. Lineup Event Tracking

- [x] 3.1 In `generate()` in `page.tsx`, after confirming `res.assignments.length > 0`, add: `window.umami?.track('lineup-generated', { players: input.battingOrder.length, innings, repeats: res.repeats, has_locks: input.lockedFieldPositions?.some(l => Object.keys(l).length > 0) ?? false, has_specs: input.battingOrder.some(p => p.specializations?.length) })`
- [x] 3.2 In `downloadDocx()`, after `setDownloadUrl(data.docx_url)`, add: `window.umami?.track('docx-exported')`
- [x] 3.3 In `handleImport()`, after `setImportOpen(false)` and before `applyLineupInput(input)`, add: `window.umami?.track('file-imported')`
- [x] 3.4 In `handleLoad()`, add: `window.umami?.track('lineup-loaded-from-history')`
- [x] 3.5 In `handleExport()`, inside the `.then()` success callback after `setCopiedFormat(format)`, add: `window.umami?.track(format === 'markdown' ? 'lineup-exported-markdown' : 'lineup-exported-org')`

## 4. Defense Event Tracking

- [x] 4.1 In `apps/web/src/app/defense/page.tsx`, wrap the base state buttons' `onClick` to also call `window.umami?.track('defense-scenario-viewed', { base: opt.value, play: playType })` after `setBaseState(opt.value)`
- [x] 4.2 Wrap the play type `<select>` `onChange` to also call `window.umami?.track('defense-scenario-viewed', { base: baseState, play: e.target.value })` after `setPlayType(...)`
- [x] 4.3 On the "▶ Example N" clip links, add `onClick={() => window.umami?.track('defense-clip-clicked', { scenario: \`${baseState}:${playType}\`, example: i + 1 })}` to each anchor
- [x] 4.4 On the "Browse Statcast ↗" anchor, add `onClick={() => window.umami?.track('defense-search-clicked', { scenario: \`${baseState}:${playType}\\` })}`

## 5. Environment Variable

- [x] 5.1 Set `NEXT_PUBLIC_UMAMI_WEBSITE_ID=793e2f93-bcb1-484e-bea5-918d77945be0` in the deployment environment (lanbuntu systemd service or `.env.local`)

## 6. Verification

- [x] 6.1 TypeScript type check passes: `npx tsc --noEmit`
- [x] 6.2 In browser devtools, confirm no errors in console related to the Script tag
- [x] 6.3 After Umami is deployed and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set: generate a lineup, confirm the event appears in the Umami dashboard under the website's events
- [x] 6.4 Confirm defense scenario changes appear as `defense-scenario-viewed` events in Umami
