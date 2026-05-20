import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Phase 4 Design-System Guardrails (2026-05-18)
 * --------------------------------------------------------------------
 * The selectors below enforce the Phase 3 / Phase 4 token contract at
 * lint time. They target the EXACT anti-patterns the 2026-05-18 honesty
 * audit found still present in operational surfaces:
 *
 *   1. Glass-on-glass `rgba(255,255,255,0.0X)` literals
 *      → migrate to `var(--ci-overlay-faint/soft/strong/border/border-strong)`
 *      or `var(--ci-text-on-surface-strong/soft/muted/faint/ghost/quiet)`.
 *   2. Dark-on-light `rgba(0,0,0,0.0X)` literals
 *      → migrate to the same `--ci-overlay-*` family (themed automatically).
 *   3. Arbitrary Tailwind `*-white/[0.0X]` opacity utilities
 *      → migrate to `.ci-bg-overlay-*`, `.ci-border-overlay*`, `.ci-text-surface-*`.
 *
 * SCOPE DECISION (honest scope-correction, 2026-05-18 Phase 4 closure):
 *
 *   - ERROR level applies ONLY to the file set that Phase 3 Pass 2 v2.2
 *     explicitly attested as "zero raw-color matches" + their structural
 *     dependents. These files MUST be zero-violation at session close.
 *
 *   - The broader src/policy/** codebase contains substantial pre-existing
 *     debt (iAdministrator surface, FormSigningWorkspace, journey/StagingM01,
 *     MasterControlInventory, DemoPage, WorkflowDrawer/EventWorkspace/
 *     BlockerPanel sibling components, etc. — ~600+ violations) that were
 *     never claimed clean by Phase 3 v2.2. Cleaning them is a follow-on
 *     program tracked as P4-DEBT-01 and is OUT OF SCOPE for the 2026-05-18
 *     Phase 4 closure session whose only promise was to make Phase 3 v2.2's
 *     attestation honest.
 *
 * Audit-only exceptions (legitimate runtime alpha composition or sub-brand
 * source-of-truth) inside the ERROR-scoped files use:
 *   // eslint-disable-next-line no-restricted-syntax -- <justification>
 *
 * See: Phase4_Current_Reality_Report.md §2.4 + Legacy_Cleanup_and_Migration_Guardrails.md.
 */
const DESIGN_SYSTEM_GUARDRAIL_RULES = [
  {
    selector: "Literal[value=/rgba\\(\\s*255\\s*,\\s*255\\s*,\\s*255\\s*,/]",
    message:
      "Raw rgba(255,255,255,...) is forbidden. Use var(--ci-overlay-faint|soft|strong|border|border-strong|active-bg|active-border) or var(--ci-text-on-surface-strong|soft|muted|faint|ghost|quiet). See Phase4_Current_Reality_Report.md §2.",
  },
  {
    selector: "Literal[value=/rgba\\(\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,/]",
    message:
      "Raw rgba(0,0,0,...) is forbidden. Use var(--ci-overlay-*) — the same tokens auto-theme to dark-on-light in Care Indeed light mode.",
  },
  {
    selector:
      "Literal[value=/\\b(?:bg|text|border|hover:bg|hover:text|hover:border|placeholder|focus:border)-white\\/\\[/]",
    message:
      "Arbitrary Tailwind *-white/[0.0X] opacity utilities are forbidden. Use canonical utility classes from src/index.css: ci-bg-overlay-faint|soft|strong, ci-border-overlay|overlay-strong, ci-text-surface-strong|soft|muted|faint|ghost|quiet.",
  },
  {
    selector: "TemplateElement[value.raw=/rgba\\(\\s*255\\s*,\\s*255\\s*,\\s*255\\s*,/]",
    message:
      "Raw rgba(255,255,255,...) inside template literals is forbidden. Use var(--ci-overlay-*) or var(--ci-text-on-surface-*).",
  },
]

// Phase 3 v2.2 attested-clean file set (must be zero-violation).
const PHASE3_V22_ATTESTED_FILES = [
  'src/policy/pages/EvidenceCenterPage.tsx',
  'src/policy/pages/MasterCalendarPage.tsx',
  'src/policy/pages/AuditModePage.tsx',
  'src/policy/components/regulatory/WorkflowExecutionPanel.tsx',
  'src/policy/components/regulatory/ComplianceCalendar.tsx',
  'src/policy/ces/components/review/RobertCesReviewLayer.tsx',
  'src/policy/ces/components/review/CesRoleReviewSwitcher.tsx',
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Phase 4 design-system guardrails — ERROR-level on the Phase 3 v2.2
  // attested-clean file set only. Broader src/policy/** cleanup is tracked
  // as follow-on ticket P4-DEBT-01.
  {
    files: PHASE3_V22_ATTESTED_FILES,
    rules: {
      'no-restricted-syntax': ['error', ...DESIGN_SYSTEM_GUARDRAIL_RULES],
    },
  },
  // Phase 4 P4-DEBT-01 visibility layer (added 2026-05-19 catch-up pass).
  // ----------------------------------------------------------------
  // The full src/policy/** codebase carries ~326 design-system
  // violations across ~57 files (see Phases_234_Catchup_Reality_Report.md
  // Appendix A). Promoting the ERROR rule to that whole glob would break
  // the build immediately. Instead, the same selectors are applied at
  // WARN level so violations are visible in `npm run lint` output and
  // can be tracked / batched as P4-DEBT-01 (rollout plan in
  // Phases_234_Catchup_Reality_Report.md §6). The attested 7 files keep
  // their ERROR rule above; ESLint flat config merges rule blocks and the
  // file-specific ERROR block takes precedence, so the attested files do
  // not regress to WARN.
  //
  // *.old.tsx, generated, and non-policy code are excluded — this
  // visibility rule is intentionally scoped to live application code in
  // src/policy/**.
  {
    files: ['src/policy/**/*.{ts,tsx}'],
    ignores: ['src/policy/**/*.old.{ts,tsx}', ...PHASE3_V22_ATTESTED_FILES],
    rules: {
      'no-restricted-syntax': ['warn', ...DESIGN_SYSTEM_GUARDRAIL_RULES],
    },
  },
])
