# Theme Migration Notes

This document provides developer guidelines for applying the **Care Indeed Light Orange Theme** to React components and pages.

## Applying the Theme Wrapper

To render a page or component using the Care Indeed Light Orange theme, wrap it in a container with the `.theme-ci-light-orange` class:

```tsx
export function MyThemedPage() {
  return (
    <div className="theme-ci-light-orange min-h-screen bg-canvas">
      {/* All children will now inherit the custom variables */}
    </div>
  );
}
```

This class overrides the standard Tailwind variable mappings (`bg-canvas`, `text-brand-teal`, etc.) to use the deep teal, mint, and orange color palette.

## Component Migrations

### 1. Cards
Replace legacy card classes or components with `CareIndeedCard`:
- For main policy viewer / document shell, use:
  ```tsx
  <CareIndeedCard variant="container">...</CareIndeedCard>
  ```
- For grid items, use:
  ```tsx
  <CareIndeedCard variant="grid-outline">...</CareIndeedCard>
  ```
- For highlight/metadata cards, use:
  ```tsx
  <CareIndeedCard variant="grid-tinted">...</CareIndeedCard>
  ```

### 2. Buttons
Replace raw HTML buttons or general Button components with `CareIndeedButton`:
- For orange filled CTAs:
  ```tsx
  <CareIndeedButton variant="primary" shape="rounded">Start Training</CareIndeedButton>
  ```
- For outline/secondary CTAs:
  ```tsx
  <CareIndeedButton variant="outline" shape="rounded">Watch Demo</CareIndeedButton>
  ```

### 3. Tabs
Replace horizontal navigation bars or tab buttons with `CareIndeedTabs`. Ensure no container background is used, as it sits on the canvas background.

### 4. Eyebrows
For section indicators, kickers, or header labels, wrap them in `CareIndeedEyebrow`:
```tsx
<CareIndeedEyebrow>Advanced Training • RN-ADV-03</CareIndeedEyebrow>
```

### 5. Metadata display
For side-by-side key-value pairs (like Status, Version, Steward), use `CareIndeedDataBlock`:
```tsx
<CareIndeedDataBlock label="Status & Version" value="Active • Version 1.0" />
```
