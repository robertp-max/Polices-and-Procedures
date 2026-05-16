# Component Anatomy & Code Examples — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document provides detailed anatomy, props, states, and code examples for the most frequently used canonical components. Engineers should refer to this when implementing or reviewing components.

---

## 2. Button

### Anatomy
- Label (required)
- Optional leading icon
- Loading spinner (replaces label when `loading={true}`)
- Focus ring (teal)

### Props
```ts
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}
```

### Code Example
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" onPress={handleSignAndLock}>
  Sign & Lock
</Button>

<Button variant="secondary" loading={isUploading}>
  Capture Evidence
</Button>
```

### States
- Default
- Hover (desktop)
- Focus (teal ring)
- Active / Pressed
- Loading
- Disabled

---

## 3. Card / GlassPanel

### Recommended Usage
- Use `ui/Card` for most elevated content (Layer 2)
- Use `GlassPanel` for lower-level or custom surfaces

### Props
```ts
interface CardProps {
  layer?: 1 | 2;
  padding?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  children: ReactNode;
}
```

### Code Example
```tsx
<Card layer={2} padding="md" onPress={handleTaskPress}>
  <TaskContent />
</Card>
```

---

## 4. Input

### Anatomy
- Label (always shown above)
- Input field
- Optional helper text
- Error message (when invalid)

### Props
```ts
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}
```

### Code Example
```tsx
<Input
  label="Patient Name"
  value={patientName}
  onChangeText={setPatientName}
  error={errors.patientName}
  helperText="Enter the legal name as it appears on the ID"
/>
```

---

## 5. Badge

### Props
```ts
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
}
```

### Code Example
```tsx
<Badge variant="error">Overdue 4d</Badge>
<Badge variant="success">Completed</Badge>
```

---

## 6. EmptyState

### Props
```ts
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode; // Usually a Button
}
```

### Code Example
```tsx
<EmptyState
  title="No evidence captured yet"
  description="Capture a clear photo of the signed document."
  action={<Button variant="primary">Capture Evidence</Button>}
/>
```

---

## 7. Loading States

| Type       | When to Use                     | Component |
|------------|----------------------------------|---------|
| Skeleton   | Lists, cards, dashboards         | `ui/Skeleton` or `Loading type="skeleton"` |
| Spinner    | Buttons, small inline areas      | `Loading type="spinner"` |
| Full screen| Major actions (signing, activation) | `Loading type="full"` |

---

## 8. Best Practices

- Always import from `@/components/ui/*` (or the designated barrel export)
- Never hardcode colors, spacing, or radius values
- Compose complex screens using the primitives above instead of building one-off components
- Review `BUILDING_V2_SCREEN_PLAYBOOK.md` before starting a new screen

---

*This document will be expanded as more components are finalized in the `ui/` folder.*

---

**Related:** `COMPONENT_GUIDELINES.md`, `BUILDING_V2_SCREEN_PLAYBOOK.md`, `FIGMA_TO_CODE_MAPPING.md`