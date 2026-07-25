# Working rules — CMT (Colic Monitoring Tool)

Read this before changing any code. It exists because a previous run produced a
series of changes that looked finished but did nothing in the running app, and
the failure went unnoticed for a full session.

This is a **veterinary clinical tool**. A number on screen may be used to decide
whether a horse goes to surgery. Correctness and honesty outrank speed and
feature count.

---

## 1. What actually went wrong

**The build was broken, so the deploy shipped nothing.**
`npm run build` is `tsc -b && vite build`. Two type errors in `App.tsx` made
`tsc` exit 2, so `vite build` never ran and `npm run deploy` re-published the
*previous* `dist/`. The live site stayed frozen on an old bundle for hours while
the source kept changing. The two errors were:

- `setActiveView(...)` left behind by a half-finished rename to `setActiveTab`.
- `activePatientId` made required on `PatientBoardViewProps` but never passed at
  the call site.

Neither the compile failure nor the stale deploy was noticed, because success
was judged from the edits rather than from the build.

**Replaced components were never deleted.**
`Flowsheet.tsx`, `PrognosisCalculator.tsx`, `Identification.tsx`,
`ReferenceIntervals.tsx`, `DecisionTriggers.tsx` and `utils/algorithms.ts`
(~2,090 lines) sat on disk imported by nothing, alongside their live
replacements. Later edits landed in those dead files and changed nothing on
screen, which sent debugging in the wrong direction.

**Work was never committed.** Nine files, including a whole new component,
existed only in the working tree — one bad checkout from being lost.

**The UI claimed to be live while displaying hardcoded values.**
The patient board showed `survivalPrognosisPercent` values that were literals in
`mockData.ts` (75 / 92 / 82) and `NewPatientModal.tsx` (88 / 20). Nothing ever
recomputed them. The Prognosis screen simultaneously said *"Live Flowsheet Sync
ON"* and *"evaluated directly from the flowsheet"* over numbers that never moved.

**A clinical claim was made that the code did not implement.**
The Prognosis screen rendered a *"Validated Multivariate Logistic Model
(Blikslager & Freeman)"* table with odds ratios, p-values and confidence
intervals, while the actual computation was `survival = 96 - riskScore` — a
linear expression with no logistic regression and no connection to those
citations. This is the most serious error in the list.

**Convenient shortcuts that silently corrupted data:**

- `parseFloat(x) || fallback` discards a charted `0`. Zero litres of reflux is a
  normal finding, not missing data — it was being displayed as the 0.5 default.
- `useState(liveValue)` for values derived from props: the initializer only runs
  on mount, so the What-If sliders kept first-render values as the flowsheet
  moved on.
- `handleOpenNewPatientModal` called `prompt()` while a complete
  `NewPatientModal` component sat unused.

---

## 2. Rules

### Never report a change as done until the build passes

```
npx tsc --noEmit -p tsconfig.app.json     # must exit 0
npm run build                              # must exit 0
```

If `tsc` fails, **nothing you changed is in the app**. Do not deploy, do not
summarize, do not move on. `npm run deploy` will happily republish a stale
`dist/` and print "Published" — treat that word as meaningless on its own.
After deploying, confirm the bundle hash in the live `index.html` actually
changed.

### Verify in the running app, not in the diff

Start the dev server and confirm the behaviour you claim: the value renders, the
button fires, the state changes. "I added the component" is not evidence the
component appears. If you cannot demonstrate it, say so plainly instead of
implying it works.

### When you replace something, delete the thing it replaced

Same commit. If you introduce `XView.tsx` to supersede `X.tsx`, remove `X.tsx`
and anything it solely imported. Before assuming a file matters, check that
something imports it. Dead files are not harmless — they attract edits that do
nothing.

### Commit as you go, and push

Never end a working session with substantive changes uncommitted. A feature that
exists only in the working tree does not exist.

### Finish renames and prop changes in the same pass

After renaming a symbol, search the whole `src/` tree for the old name. After
making a prop required, update every call site. Let the compiler confirm it —
that is what it is for.

### Never display invented numbers as if they were computed

If a field is a placeholder, it may not sit under a label like "Live", "Real-time"
or "Auto-evaluated". Either wire it to real data or label it clearly as sample
data. A static number under a live banner is worse than no number, because it
cannot be distinguished from a working feature.

### Never attribute a formula to a source unless the code implements it

Do not render citations, odds ratios, p-values or confidence intervals as
decoration. If the code computes `96 - riskScore`, do not present it as a
validated logistic regression from the literature. If a real model is wanted,
implement it and keep it in one shared module so every screen reads the same
numbers. Clinical calculations live in `src/utils/prognosis.ts` — extend that
file rather than re-deriving the maths inside a component.

### Respect zero and treat missing data honestly

Use `Number.isFinite(parsed) ? parsed : fallback`, never `parsed || fallback`.
A charted zero is a clinical finding. Where a value is genuinely absent, make
that visible rather than substituting a default that reads as real.

### Prefer wiring up what exists over building something new

Before adding a component, check whether one already exists unused. Several bugs
here were finished components that were simply never connected.

---

## 3. Definition of done

A change is done when **all** of these are true:

1. `npx tsc --noEmit -p tsconfig.app.json` exits 0.
2. `npm run build` exits 0.
3. The behaviour was observed in the running app.
4. Superseded files were deleted.
5. The work is committed and pushed.
6. Every user-visible number is either computed from real data or plainly
   labelled as sample data.

If any of these is not met, say which one and why, rather than reporting
success. An accurate "this part is not wired up yet" is far more useful than an
optimistic summary that has to be discovered as wrong later.
