## 2024-05-23 - [Icon-Only Buttons Accessibility]
**Learning:** Icon-only buttons (common in headers and tables) often lack accessible names, relying only on visual icons. Shadcn UI `Button` component supports `aria-label` which is cleaner than `sr-only` spans. `title` attributes are insufficient for full accessibility.
**Action:** Always check `size="icon"` buttons. Use `aria-label` directly on the `Button` component. Remove redundant `sr-only` spans if `aria-label` is present to avoid double announcements.
