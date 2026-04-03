---
name: ux-design
description: 'UX design principles, heuristics, and content guidance. Use for UX reviews, microcopy, usability, information architecture, task flows, error prevention, feedback, and outcome-oriented design.'
---

# UX Design — v2 (2025–2026 Edition)

Use this skill when designing or reviewing user experiences, task flows, information architecture, usability, microcopy, feedback states, emotional tone, agentic flows, and user-facing guidance.

> This skill is optimized to produce human-feeling, non-generic UX — designed against the tide of AI-sameness.
> The 2026 UX priority: Design Deeper to Differentiate.

## Core Philosophy

Generic AI-generated UX produces flows that are technically correct but emotionally inert — correct patterns assembled without intent, taste, or empathy.
Great UX in 2026 is defined by three forces:

1. Human-centered outcomes: every decision traces back to a real user goal, not a product metric.
2. Emotional accessibility: the interface responds to the user's state, not just their input.
3. Intentional craft: at least one UX decision per flow should reflect authorship — a deliberate choice that a template would never make.

## Core Principles

- Design around user goals, not feature checklists.
- Speak the user's language — not internal product jargon, not AI-generated filler copy.
- Reduce cognitive load: make the next step obvious without requiring the user to remember previous steps.
- Make system status visible with timely, honest, human-sounding feedback.
- Prevent errors through constraints, safe defaults, and clear confirmations.
- Preserve user control: every flow needs a clear cancel, undo, or exit.
- Favor recognition over recall — show options, labels, and context in view.
- Keep interactions simple, predictable, and consistent — but not sterile.
- Design for emotional accessibility: reduce stress triggers, celebrate small wins, respond empathetically to errors.
- Apply inclusive design as innovation, not compliance — cognitive diversity, multimodal input, and situational limitations are in scope.

## 2025–2026 UX Shifts (Anti-Generic Layer)

These are the forces separating craft UX from AI-generated sameness.

### Emotional Accessibility

Emotionally accessible design reduces anxiety, friction, and user overwhelm as first-class UX goals — not afterthoughts.

- Map hesitation moments, stress triggers, and confidence indicators in the user journey.
- Rewrite error states to be supportive, not clinical: "We couldn't save your work — tap Retry and it'll be there." over "Error 500."
- Add quiet modes or reduced-motion settings as a user-controlled preference, not just an OS override.
- Celebrate micro-wins in onboarding and long forms: progress affirmations, gentle completion cues.
- Nielsen Norman Group data: emotionally accessible design improves user satisfaction by 20% and loyalty by up to 15%.

### Agentic UX

AI agents acting on behalf of users are a standard pattern in 2026 — 60% of designers expect them to have major impact this year.
Design for human-agent collaboration, not just human-UI interaction:

- Make agent actions visible and reversible: "Copilot scheduled 3 reports — undo?"
- Show agent confidence level when it matters: low confidence should surface a confirmation step.
- Design clear handoff moments: when the agent defers to the human, the transition must feel intentional and trust-building.
- Never let an agent take a destructive or irreversible action silently.

### Predictive & Context-Aware Flows

- Interfaces should surface the next likely action before the user explicitly requests it.
- Adapt content density and navigation based on usage context (task type, time of day, prior behavior).
- Use progressive disclosure as a default strategy for complex flows — show the minimum viable step, reveal more on demand.

### Ethical & Transparent UX

- EU regulation and user trust now require consent-first, bias-aware, and transparent data practices.
- Every data collection point must be clearly communicated — no dark patterns, no ambiguous opt-ins.
- AI-generated content in the UI must be disclosed. Users have the right to know.
- Bias-aware: test flows for different user groups; don't design only for the median user.

### Micro-Interactions as UX Language

- Every meaningful state change deserves a micro-interaction: save confirmation, toggle feedback, list item addition.
- Micro-interactions must communicate status, not just decorate.
- Use physics-based easing for human feel — spring on appear, ease-out on dismiss.
- 50% of designers are already adding micro-interactions to current work; it is now a baseline expectation.

## UX Checklist

Before recommending or changing any UX pattern, verify:

- The user can understand the page or step purpose within 3 seconds.
- The primary action is visually and contextually dominant.
- Labels, buttons, and helper text are task-oriented and specific.
- The interface shows what is happening right now (loading, saving, processing).
- Empty, loading, success, warning, and error states are all designed — not assumed.
- The flow supports recovery from mistakes without restarting.
- The user never needs to remember hidden context from a previous step.
- The design works on both desktop and mobile, with touch targets ≥ 44×44px.
- The most important content and action appears first.
- The experience avoids unnecessary steps — every screen earns its place.
- Emotional tone is appropriate: does this state feel stressful, punitive, or cold?
- At least one decision in this flow was a deliberate human authorship choice — not a template default.

## Pattern Guidance

### Flows and Tasks

- Break complex tasks into clear, meaningful steps — each step should feel like progress.
- Keep each step reversible wherever technically feasible.
- Surface progress indicators for tasks that take time or have multiple stages.
- Never force a restart because of a single error — preserve user input across validation failures.
- Name steps with user-language outcomes: "Choose your plan" not "Step 2 of 5."
- For agentic flows: design visible checkpoints where the user can review, approve, or cancel agent actions.

### Microcopy

- Use the 3 C's: Clarity, Concision, Character.
- Plain language over product jargon. No AI-sounding filler: "Streamline your workflow" means nothing.
- Button labels are task verbs: "Save Draft", "Delete Account", "Run Report" — never "Submit" or "OK."
- Error messages name the problem and give the fix: "Email already in use — sign in or use a different address."
- Empty states guide the next action: "No reports yet — create your first one →"
- Success states confirm with specificity: "Report saved to your dashboard" not "Done!"
- Emotionally high-stakes moments (deletion, payment, account changes) warrant warmer, slower-paced copy.

### Feedback and States

- Confirm important changes within 300ms of user action.
- Distinguish success (green/checkmark), warning (amber/triangle), and error (red/!) states visually and semantically.
- Loading states: use skeleton screens for content-heavy areas; spinners only for brief, bounded waits.
- Design empty states as opportunities: include a clear CTA, a short human explanation, and optionally a visual.
- Undoable destructive actions should show an inline undo toast for 5–8 seconds before finalizing.

### Forms and Inputs

- Ask only for what is necessary at this step — defer optional fields to later in the flow.
- Group related fields with visible section labels.
- Always-visible labels; never use placeholder-as-label.
- Validate on blur, not on submit — surface errors as they occur, not all at once.
- Smart defaults reduce input burden: pre-fill known data, suggest based on context.
- Every form needs a Cancel path that does not silently discard unsaved work without warning.
- For long or multi-step forms: show a summary before the final submission action.

### Navigation and Information Architecture

- Prioritize the most common path — secondary paths should be findable, not equal in prominence.
- Use familiar category labels — creative navigation names add friction.
- Apply progressive disclosure in dense sections: collapse secondary options behind a clear "More" affordance.
- Never bury an essential action (account settings, export, delete) more than 2 levels deep.
- On mobile: bottom navigation bar for app-like products with 3–5 top-level destinations. Hamburger menus are a last resort.

### Inclusive and Accessible UX

- Design for cognitive diversity: support users with ADHD, dyslexia, or anxiety through clean layout, short chunked content, and clear signposting.
- Multimodal input is a baseline expectation: flows should work with keyboard, touch, voice, and assistive technology.
- Provide user-controlled accessibility settings where feasible: font size, contrast level, reduced motion, text-to-speech.
- WCAG AA is the floor, not the target. Aim for AA+ on text contrast and focus visibility.
- Test flows with screen readers and keyboard-only navigation before shipping.

## Common Anti-Patterns

- Vague labels: "Submit", "Continue", "OK" — use the action the user is actually performing.
- Too many competing actions at the same visual level.
- Hidden or unclear selection state — the user cannot tell what is selected or active.
- Long forms without grouping, progress, or context — users lose orientation.
- Errors that describe the problem but give no path to resolution.
- Flows that assume the user remembers decisions made 3 screens ago.
- Emotionally flat error states that feel punitive rather than helpful.
- Agentic actions that execute silently without a visible confirmation or undo path.
- Progressive disclosure used to hide important actions rather than manage complexity.
- Onboarding flows that front-load every feature before the user has context to understand them.
- Consent dialogs designed to confuse rather than inform (dark patterns).
- Interfaces that only work for the median user — no accommodation for different abilities, contexts, or mental models.

## Output Expectations

When using this skill, every output should include:

- A recommended UX direction with specific reasoning.
- Microcopy improvements — before and after examples where applicable.
- Emotional tone assessment: is this state calm, stressful, or cold? How to correct it.
- Feedback state coverage: loading, empty, success, warning, error.
- Accessibility and recovery path considerations.
- Agentic UX notes if the flow involves AI acting on the user's behalf.
- Risks and tradeoffs for each proposed approach.
- One explicitly called-out human authorship decision — what makes this not a template.

## Default Response Style

- State the recommended option first, then justify it.
- Explain the human or emotional quality that separates it from a generic pattern.
- Call out UX risks, friction points, and likely user misunderstandings explicitly.
- Provide before/after microcopy rewrites when copy is in scope.
- Keep guidance implementation-friendly: reference specific patterns, component names, or interaction models by name.
- When in doubt: reduce the steps, sharpen the copy, raise the emotional quality.
