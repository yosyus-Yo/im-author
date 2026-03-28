# Design System Specification: High-End Editorial

## 1. Overview & Creative North Star
**Creative North Star: The Modern Scriptorium**
This design system moves away from the sterile "SaaS-blue" aesthetic and into the realm of high-end literary craftsmanship. It treats the digital screen as a physical desk—warm, layered, and tactile. We achieve a premium feel not through complexity, but through intentionality. 

By leveraging **Asymmetric Composition** (e.g., pairing a large `display-lg` header with generous whitespace to its right) and **Tonal Depth**, we create an experience that feels like reading a limited-edition hardcover. We break the "template" look by favoring organic spacing over rigid 1px dividers, allowing content to breathe and command authority.

---

## 2. Colors & Surface Philosophy

### The "No-Line" Rule
**Explicit Instruction:** Use of 1px solid borders for sectioning is strictly prohibited. 
Structural boundaries must be defined solely through background color shifts. For instance, a `surface-container-low` section sitting on a `surface` background creates a clear but sophisticated division.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine papers. 
- **Base Layer:** `surface` (#fff9ef)
- **Primary Content Area:** `surface-container-low` (#f9f3ea)
- **Interactive Cards:** `surface-container-lowest` (#ffffff)
- **Contextual Sidebars:** `surface-container` (#f3ede4)

### The Glass & Gradient Rule
To provide visual "soul," use subtle linear gradients for large hero backgrounds, transitioning from `primary` (#5a5653) to `primary-container` (#736e6b). For floating navigation elements, apply **Glassmorphism**: use `surface` at 80% opacity with a `backdrop-blur` of 12px.

---

## 3. Typography
The type system relies on the interplay between the intellectual authority of **Noto Serif** and the functional clarity of **Inter**.

| Token | Font | Size | Weight | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **display-lg** | Noto Serif | 3.5rem | 700 | Hero titles, Book titles |
| **headline-md**| Noto Serif | 1.75rem | 600 | Chapter headings, Section starts |
| **title-md**   | Inter | 1.125rem | 500 | Sub-headers, Card titles |
| **body-lg**    | Inter | 1rem | 400 | Long-form reading, descriptions |
| **label-md**   | Inter | 0.75rem | 600 | Metadata, overlines, buttons |

**Editorial Note:** Always set `display` and `headline` levels with a slightly tighter letter-spacing (-0.02em) to mimic high-end typesetting. Use `body-lg` with a generous line-height (1.6) to ensure a comfortable "literary" reading experience.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering** rather than drop shadows. 
*   **Example:** Place a `surface-container-lowest` card (the "white paper") on top of a `surface-container` background (the "stone desk"). This creates a natural lift.

### Ambient Shadows
When a floating effect is functionally required (e.g., a dropdown or a modal), use "Ambient Shadows":
*   **Blur:** 24px - 40px
*   **Opacity:** 4% - 6%
*   **Color:** Use a tinted version of `on-surface` (#1d1b16) to ensure the shadow feels like a natural obstruction of warm light.

### The "Ghost Border" Fallback
If accessibility requires a boundary, use a **Ghost Border**: `outline-variant` (#ddc1b3) at 20% opacity. Never use 100% opaque lines.

---

## 5. Components

### Buttons
*   **Primary (Stone):** Background `primary` (#5a5653), Text `on-primary` (#ffffff). High-end minimalism.
*   **Secondary (Amber):** Background `secondary` (#9b4500), Text `on-secondary` (#ffffff). Used for high-conversion calls to action (e.g., "Buy Now").
*   **Shape:** Use `rounded-md` (0.75rem) for a friendly, premium feel.

### Cards & Lists
*   **No Dividers:** Forbid the use of line dividers between list items. Use the Spacing Scale (specifically `spacing-4` or `spacing-6`) to create separation.
*   **The Inset Effect:** For secondary list items, use a background of `surface-container-high` (#ede7de) to visually "recess" the content into the page.

### Chips (Genre & Tags)
*   **Style:** Background `secondary-fixed` (#ffdbca) with text `on-secondary-fixed` (#331200). Use `rounded-full` for a soft, pebble-like appearance.

### Input Fields
*   **Styling:** No bottom border or full border. Use a subtle fill of `surface-container-highest` (#e7e2d9) with a `rounded-sm` (0.25rem) corner. Upon focus, transition the background to `surface-container-lowest` and apply a 1px "Ghost Border" of `primary`.

### Specialized Component: The Book Spine
*   A vertical navigation or indicator element using `tertiary` (#8a421c) to act as a visual bookmark within the layout.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. A 2/3 and 1/3 split feels more editorial than a 50/50 split.
*   **Do** prioritize whitespace. If a section feels "tight," double the spacing using the `spacing-12` or `spacing-16` tokens.
*   **Do** use `secondary` (Amber) sparingly as a "high-lite"—it should guide the eye, not overwhelm it.

### Don't
*   **Don't** use pure black (#000000). Always use `on-background` (#1d1b16) for text to maintain the "ink-on-paper" warmth.
*   **Don't** use traditional "Material" elevation. No heavy shadows, no sharp 90-degree corners.
*   **Don't** use icons without purpose. Icons should be thin-stroke (2pt) to match the elegance of the Inter typeface.