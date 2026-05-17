# Typography Scale — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Font Stack

| Purpose       | Font Family                  | Weight     | Fallback |
|---------------|------------------------------|------------|----------|
| Headings      | Montserrat                   | 600 / 700  | System sans-serif |
| Body & UI     | Inter (preferred) or system  | 400 / 500 / 600 | System UI sans-serif |
| Monospace     | JetBrains Mono               | 400 / 500  | ui-monospace, monospace |

---

## 2. Type Scale (Mobile-First)

We use a **modular, responsive scale** optimized for clinical readability and operational clarity.

### Mobile (< 768px)

| Token              | Size   | Line Height | Weight | Letter Spacing | Usage |
|--------------------|--------|-------------|--------|----------------|-------|
| `text-display`     | 28px   | 1.2         | 700    | -0.02em        | Major page titles (rare) |
| `text-title`       | 24px   | 1.25        | 700    | -0.015em       | Screen titles, section headers |
| `text-subtitle`    | 20px   | 1.3         | 600    | -0.01em        | Card titles, important labels |
| `text-body-lg`     | 16px   | 1.5         | 500    | Normal         | Primary body text |
| `text-body`        | 15px   | 1.5         | 400    | Normal         | Default body text |
| `text-body-sm`     | 13px   | 1.45        | 400    | Normal         | Secondary information |
| `text-label`       | 12px   | 1.4         | 600    | 0.02em         | Form labels, tags, metadata |
| `text-caption`     | 11px   | 1.35        | 400    | 0.03em         | Timestamps, helper text |
| `text-mono`        | 12px   | 1.4         | 400    | Normal         | IDs, hashes, codes |

### Desktop (≥ 1024px)

| Token              | Size   | Line Height | Weight | Letter Spacing | Usage |
|--------------------|--------|-------------|--------|----------------|-------|
| `text-display`     | 32px   | 1.15        | 700    | -0.025em       | Major page titles |
| `text-title`       | 26px   | 1.2         | 700    | -0.02em        | Screen titles |
| `text-subtitle`    | 22px   | 1.25        | 600    | -0.015em       | Card titles |
| `text-body-lg`     | 17px   | 1.55        | 500    | Normal         | Primary body |
| `text-body`        | 16px   | 1.55        | 400    | Normal         | Default body |
| `text-body-sm`     | 14px   | 1.5         | 400    | Normal         | Secondary |
| `text-label`       | 13px   | 1.4         | 600    | 0.02em         | Labels, tags |
| `text-caption`     | 12px   | 1.35        | 400    | 0.03em         | Metadata |
| `text-mono`        | 13px   | 1.4         | 400    | Normal         | Code / IDs |

---

## 3. Responsive Behavior

- On mobile, headings are intentionally tighter to save vertical space.
- On desktop, we allow slightly more breathing room and larger sizes.
- Line height increases slightly on desktop for better long-form readability (especially policy documents and audit views).

---

## 4. Usage Guidelines

- **Never** go below 11px for any text.
- Use **Montserrat 700** for the most important titles only.
- Use **Inter 500** for medium emphasis (e.g., card titles, important labels).
- Monospace should be used consistently for IDs, audit hashes, timestamps, and technical data.
- In light mode, body text should have enough weight (minimum 400) for readability on clinical backgrounds.

---

## 5. Recommended Tailwind / CSS Mapping (Example)

```css
.text-display   { font-size: 28px; line-height: 1.2; font-weight: 700; }
.text-title     { font-size: 24px; line-height: 1.25; font-weight: 700; }
.text-subtitle  { font-size: 20px; line-height: 1.3; font-weight: 600; }
.text-body-lg   { font-size: 16px; line-height: 1.5; font-weight: 500; }
.text-body      { font-size: 15px; line-height: 1.5; font-weight: 400; }
.text-body-sm   { font-size: 13px; line-height: 1.45; font-weight: 400; }
.text-label     { font-size: 12px; line-height: 1.4; font-weight: 600; letter-spacing: 0.02em; }
.text-caption   { font-size: 11px; line-height: 1.35; font-weight: 400; letter-spacing: 0.03em; }
.text-mono      { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
```

---

*This scale is designed for high readability in high-stakes healthcare compliance environments.*