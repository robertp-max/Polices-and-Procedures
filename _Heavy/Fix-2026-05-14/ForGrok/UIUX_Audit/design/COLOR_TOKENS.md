# Color Tokens — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Brand:** Care Indeed (Single Canonical Identity)

---

## 1. Core Brand Colors

| Token Name              | Hex       | Usage                                      | Notes |
|-------------------------|-----------|--------------------------------------------|-------|
| `--color-brand-orange`  | `#E07B2C` | Primary actions, CTAs, pending states      | Use sparingly and with purpose |
| `--color-brand-teal`    | `#007970` | Secondary actions, stable/compliant states | Primary supporting color |
| `--color-brand-navy`    | `#0F172A` | Dark mode surfaces, headers, emphasis      | Deep professional base |

---

## 2. Semantic Colors

| Token Name                  | Hex       | Meaning                              | Light Mode Usage          | Dark Mode Usage           |
|-----------------------------|-----------|--------------------------------------|---------------------------|---------------------------|
| `--color-success`           | `#10B981` | Compliant, complete, stable          | Text + Background tint    | Text + Background tint    |
| `--color-warning`           | `#F59E0B` | Pending, review required             | Text + Background tint    | Text + Background tint    |
| `--color-error`             | `#EF4444` | Failed, blocked, overdue critical    | Text + Background tint    | Text + Background tint    |
| `--color-info`              | `#3B82F6` | Informational / neutral status       | Text + Background tint    | Text + Background tint    |

---

## 3. Surface & Glass Colors

### Light Mode

| Token Name                    | Value                          | Usage |
|-------------------------------|--------------------------------|-------|
| `--color-bg-page`             | `#F8FAFC`                      | Page background (Layer 0) |
| `--color-surface-1`           | `#FFFFFF`                      | Main app surface (Layer 1) |
| `--color-surface-2`           | `#FFFFFF` + subtle tint        | Elevated cards (Layer 2) |
| `--color-glass-light`         | `rgba(255, 255, 255, 0.72)`    | Glass panels |
| `--color-border-subtle`       | `#E5E4E3`                      | Very soft hairline borders |
| `--color-border-medium`       | `#CBD5E1`                      | Medium strength borders |

### Dark Mode

| Token Name                    | Value                          | Usage |
|-------------------------------|--------------------------------|-------|
| `--color-bg-page-dark`        | `#0F172A`                      | Page background (Layer 0) |
| `--color-surface-1-dark`      | `rgba(15, 23, 42, 0.72)`       | Main app surface (Layer 1) |
| `--color-surface-2-dark`      | `rgba(15, 23, 42, 0.82)`       | Elevated cards (Layer 2) |
| `--color-glass-dark`          | `rgba(15, 23, 42, 0.72)`       | Glass panels |
| `--color-border-subtle-dark`  | `rgba(241, 245, 249, 0.10)`    | Very soft hairline borders |
| `--color-border-medium-dark`  | `rgba(241, 245, 249, 0.18)`    | Medium strength borders |

---

## 4. Text Colors

| Token Name               | Light Mode     | Dark Mode      | Usage |
|--------------------------|----------------|----------------|-------|
| `--color-text-primary`   | `#0F172A`      | `#F1F5F9`      | Headings, primary body text |
| `--color-text-secondary` | `#475569`      | `#94A3B8`      | Metadata, secondary text |
| `--color-text-muted`     | `#64748B`      | `#64748B`      | Disabled, low priority |
| `--color-text-on-orange` | `#FFFFFF`      | `#FFFFFF`      | Text on orange buttons |
| `--color-text-on-teal`   | `#FFFFFF`      | `#FFFFFF`      | Text on teal buttons |

---

## 5. Accent & Interaction Colors

| Token Name                  | Hex       | Usage |
|-----------------------------|-----------|-------|
| `--color-accent-teal`       | `#007970` | Focus rings, active states, links |
| `--color-accent-orange`     | `#E07B2C` | Primary CTAs, pending actions |
| `--color-focus-ring`        | `#007970` | Keyboard focus indicator |

---

## 6. Usage Rules

- **Orange** should be used **strategically** — primarily for CTAs, pending approvals, signatures, and escalations. Avoid scattering it everywhere.
- **Teal** is the workhorse color for stable, compliant, and secondary actions.
- In **light mode**, favor stronger shadows and subtle tints over heavy transparency.
- In **dark mode**, glass can be slightly more opaque while still feeling elegant.

---

## 7. Token Export (Recommended for Engineering)

```json
{
  "color": {
    "brand": {
      "orange": "#E07B2C",
      "teal": "#007970",
      "navy": "#0F172A"
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    },
    "surface": {
      "light": {
        "page": "#F8FAFC",
        "level1": "#FFFFFF",
        "level2": "#FFFFFF",
        "glass": "rgba(255, 255, 255, 0.72)"
      },
      "dark": {
        "page": "#0F172A",
        "level1": "rgba(15, 23, 42, 0.72)",
        "level2": "rgba(15, 23, 42, 0.82)",
        "glass": "rgba(15, 23, 42, 0.72)"
      }
    }
  }
}
```

---

*This token set is the single source of truth for all Care Indeed production interfaces.*