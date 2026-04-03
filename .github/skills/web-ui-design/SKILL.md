---
name: web-ui-design
description: 'Best In Class Web UI Design Principles and Patterns. Use for web UI design, interface reviews, responsive layouts, forms, cards, modals, navigation, accessibility, and interaction patterns.'
---

# Web UI Design — v2 (2025–2026 Edition)

Use this skill when designing, reviewing, or refining web interfaces, UI components, dashboards, forms, modals, navigation, cards, and responsive layouts.

> Optimized to produce non-generic, character-rich, human-feeling interfaces.
> Counters the sterile symmetry of default AI-generated design.

---

## Core Philosophy

The 2026 design era is defined by three words: **Human, Balanced, and Alive.**

Generic AI design produces polished but characterless output — symmetrical grids, identical card radii, safe color palettes, predictable hierarchy.

Great design in 2026 uses **controlled tension**: visual asymmetry with intent, kinetic elements with restraint, typography with personality, and tactile textures with purpose.

Every decision should serve the user's task _and_ signal that a human made a considered choice.

---

## Core Principles

- Prioritize clarity, concision, and character in UI copy.
- Optimize for the user's task, not decorative complexity — but never mistake sterility for minimalism.
- Use familiar web patterns as a floor, not a ceiling.
- Make current state obvious through immediate, visible feedback.
- Reduce memory load: show options, labels, and next actions in context.
- Prevent errors with constraints, validation, safe defaults, and clear cancel/undo paths.
- Layouts should feel calm and focused, not emptied out.
- Respect accessibility and responsive behavior on all viewports.
- Design for reduced visual noise — control brightness and contrast to prevent eye strain, especially in dashboard contexts.

---

## 2025–2026 Design Language (Anti-Generic Toolkit)

These are specific, actionable techniques to break the "template look."

### Typography as Structure

- Use **variable fonts** with tight tracking on large headings (`letter-spacing: -0.03em` to `-0.05em`) and generous line-height on body text.
- Mix one expressive display typeface with one utilitarian sans-serif — never two neutral system fonts.
- **Kinetic typography**: subtle entrance animations on key headings (slide-in, opacity fade, letter-space collapse). Reserve for hero sections and milestone moments only.
- Scale type aggressively for hierarchy — don't be afraid of 80–120px headings on desktop.
- Type scale minimum: display, heading, body, label, caption. Each step must be visually distinct.

### Layout and Spatial Design

- **Bento Grid layouts** for dashboards, landing sections, and feature showcases: modular asymmetric tiles of different sizes that coexist in a coherent visual system.
- Break the grid intentionally: offset one element, overlap an image onto a section border, or rotate a label 1–2°. This signals human authorship.
- Use **spatial hierarchy** — vary depth through shadows and layering, not just size. Cards at different perceived Z-levels communicate importance.
- Avoid equal-width column grids everywhere. Use `grid-template-columns` with intentional imbalance (`2fr 1fr`, `3fr 1fr 1fr`).
- In Bento layouts: vary tile sizes to create visual rhythm, never uniform repetition.

### Color and Surface

- **Evolved Glassmorphism**: frosted-glass surfaces with `backdrop-filter: blur()` — pair with dynamic blurs that respond to scroll or dark mode context.
- Dark mode is **standard, not optional** in 2026. Design both modes from the start; never port one to the other as an afterthought.
- Use two-tone or gradient surfaces on feature cards — subtle linear or radial gradients (low contrast, high elegance), never flat fills.
- Add **micro-texture** on large background areas: noise grain at 3–8% opacity via CSS `filter` or SVG `feTurbulence` — avoids the "printed on screen" flatness of generic AI output.
- Limit accent color use: one true accent, one muted variant, neutrals for everything else.

### Motion and Interactivity

- Interfaces should feel **alive** — use enter/exit animations on modals, list items, and route transitions.
- **Physics-based easing** over linear or ease-in-out: `cubic-bezier(0.34, 1.56, 0.64, 1)` for springy appears; slow-out for dismissals.
- Scroll-linked animations (parallax depth, sticky reveals) — subtle, purposeful. Not decoration: use to guide attention.
- Every interactive element must have a hover _and_ active state that feels visually distinct from the rest state.
- Animations that play on every scroll event are noise. Reserve motion for meaningful state transitions.

### Organic Shapes and Imperfection

- Replace sharp rectangle backgrounds with blob SVG dividers, soft rounded sections, or asymmetric hero cutouts.
- Introduce **one hand-drawn or illustrated element** per major page (icon, divider, annotation arrow) to signal human craft.
- Avoid identical border radii across all components: utility chips `4px`, cards `12–16px`, hero modules `24px+` or `0` (intentional sharp edge as a design statement).
- Pure black dark mode — `background: black` with white text, no depth — is not dark mode. It is laziness. Layer surfaces.

---

## Design Checklist

Before proposing or delivering any UI, verify:

- [ ] The primary action is visually dominant and unambiguous.
- [ ] The page has one dominant focal point and a clear visual hierarchy.
- [ ] Labels are specific, action-oriented, and need no additional explanation.
- [ ] Buttons use task-aligned verbs — not "Submit", use "Save Template", "Run Analysis", "Add Member".
- [ ] Status, loading, success, and error states are all designed — not assumed.
- [ ] Spacing and sizing follow an 8px base grid throughout.
- [ ] The layout works at 375px, 768px, and 1440px.
- [ ] Color contrast passes WCAG AA: 4.5:1 for body text, 3:1 for large text and UI components.
- [ ] All interactive elements are keyboard-reachable and focus-visible.
- [ ] Modals render above all content and have a discoverable close path.
- [ ] Does this look like a template? If yes, apply one anti-generic technique before shipping.
- [ ] Is there at least one typographic, color, or layout decision that required a conscious human choice?

---

## Pattern Guidance

### Forms

- Group related fields together with clear section labels.
- Always-visible labels — no placeholder-as-label.
- Short helper text only when it prevents a common error.
- **Inline validation on blur**, not on submit.
- Single-column layouts on mobile; max 2 columns on desktop for complex forms.
- Provide clear Reset / Cancel actions; never assume the user wants to lose progress.
- Use **smart defaults** to reduce input burden: pre-fill known values, suggest based on context.

### Buttons and Actions

- One primary CTA per view. Secondary actions are visually quiet (ghost or text-style).
- Button labels mirror the user's goal: "Export as PDF", "Create Workspace", "Delete Forever".
- Destructive actions require a distinct visual treatment (error/warning color) plus a confirmation step.
- Avoid icon-only controls unless the icon is universally understood (✕, ☰, ↑).
- On mobile, minimum touch target: 44×44px.

### Cards and Lists

- Content must be scannable — lead with the most important attribute.
- Metadata is secondary: smaller, muted, never competing with the title.
- Preserve whitespace; card padding minimum 16px, prefer 20–24px.
- Expansion and collapse affordance must be obvious (chevron icon + hover state).
- In Bento layouts: vary tile sizes to create visual rhythm, not uniform repetition.

### Modals and Overlays

- Use modals only for tasks requiring focused attention: confirmation, form completion, detail view.
- Overlay dims background to `rgba(0,0,0,0.5)` minimum — blocks background interaction explicitly.
- Close button: top-right, always visible, `aria-label="Close"`.
- Constrain modal height to `90vh`; allow inner scroll if content overflows.
- Render via portal or top-level to avoid `z-index` stack conflicts.
- Do not use a modal for information that can live inline or in a drawer.

### Responsive Layouts

- Design mobile-first; desktop is an enhancement.
- Avoid any fixed pixel widths on containers — use `max-width` with `width: 100%`.
- Bento grids collapse to single-column on mobile via `grid-template-columns: 1fr`.
- Touch targets, tap areas, and font sizes (minimum 16px body) must be rechecked at 375px.
- Navigation: hamburger menu is acceptable on mobile only when there are more than 5 items; prefer a bottom tab bar for app-like interfaces.

---

## UX Writing Guidance

- Use the **3 C's**: Clarity, Concision, Character.
- Microcopy must be short and task-focused: "Add as Prompt" beats "Click here to add".
- Avoid jargon unless the audience expects it — a DevOps dashboard can say "pipeline"; a consumer app cannot.
- Error messages: state the problem and the fix. "Password must be 8+ characters — try again." not "Invalid input."
- Empty states are not an afterthought: write copy that guides the next action ("No templates yet — create your first one →").
- Avoid AI-sounding copy: "Streamline your workflow with powerful synergies" signals template. Write like a human who knows the user's actual job.

---

## Common Anti-Patterns

**Visual and Layout**

- Too many competing primary actions on one screen.
- Decorative gradients and shadows that serve no hierarchy purpose.
- Identical card grids — same size, same radius, same padding, uniform columns: the hallmark of generic AI output.
- Equal-weight typography — if everything is 16px medium, nothing is important.
- Dark mode that is just `background: black` with white text — no depth, no surface layering.
- Animations that play on every scroll event rather than on meaningful state transitions.

**Interaction and State**

- Hidden or unclear selection state.
- Overusing popovers, modals, and tooltips as a substitute for clear inline design.
- Forms requiring excessive scrolling before the user can complete the task.
- Inconsistent spacing, border-radius, or icon weight within one view.

---

## Output Expectations

Every UI proposal must include:

- **Recommended layout approach** with grid structure specified (`grid-template-columns`, breakpoints, container widths).
- **Typography scale**: at minimum display, heading, body, label, and caption sizes.
- **Spacing and rhythm** annotated against the 8px base grid.
- **Color decisions**: surface, text, accent, destructive, muted — both light and dark mode.
- **Motion notes**: what animates, how (easing curve), and why it earns its place.
- **One anti-generic decision explicitly called out**: what makes this not a template — the conscious human choice.
- **Accessibility and responsive notes**: contrast ratios, keyboard behavior, mobile viewport verification.
- **Risks and tradeoffs** for each proposed pattern.

---

## Default Response Style

- State the recommended option first, then justify it.
- Explain the **human design choice** that separates it from AI-generated output.
- Call out layout, accessibility, and responsiveness risks explicitly.
- Keep recommendations implementation-friendly: name CSS properties, grid strategies, and component patterns by name.
- When in doubt: simplify the layout, amplify the typography.
