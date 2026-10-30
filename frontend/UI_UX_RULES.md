# Frontend UI/UX Design Rules

> **Purpose:** This document is the implementation contract for the frontend UI/UX. Use it alongside the `Assets-Locker` resource catalog. The consuming application's repository remains the source of truth for product behavior, routes, APIs, data, and brand identity.
>
> **Important:** `Assets-Locker` is a curated resource/catalog repository. Its catalog entries point to tools, design systems, icon sets, imagery sources, and engineering references; they are not automatically bundled local images or production-ready assets. Inspect the target application before choosing or creating visuals.

## 1. Design objective

Create a distinctive, polished, production-quality interface that feels intentional rather than like a default component-library demo. The interface must be:

- **Clear:** users understand the page purpose, current state, and next action.
- **Distinctive:** product-specific visual details, original icon/illustration treatments, and deliberate interactions establish identity.
- **Consistent:** shared design tokens and components govern all routes.
- **Responsive:** every workflow works on desktop, tablet, and mobile.
- **Accessible:** keyboard, screen-reader, contrast, focus, and reduced-motion behavior are designed in.
- **Trustworthy:** data, progress, success, failure, and security states are truthful, never simulated.
- **Fast:** visual effects and assets must not make ordinary interaction feel slow.

Use reference products to study hierarchy and interaction patterns. Do not copy another product's distinctive branding or complete screen designs.

## 2. Audit before designing

Before changing the UI:

1. Inspect the actual frontend repository, framework/version, package manager, routing, CSS strategy, state model, installed dependencies, fonts, icon libraries, and all existing assets.
2. Inspect every route and important state: public, authenticated, empty, populated, loading, invalid, permission-denied, and error states.
3. Trace each visible action to its current handler, API call, form submission, navigation, or state update.
4. Inventory image, SVG, icon, font, video, animation, and background assets. Record actual path, type, dimensions, intended usage, source/license, and whether they are used.
5. Identify the current product identity and preserve established brand elements unless a rebrand is explicitly requested.
6. Produce a short audit covering current design, reuse opportunities, missing assets, dependencies, route coverage, and risks.

Never assume a file, dependency, route, feature, or API exists. Verify it in the target repository.

## 3. Use the Assets-Locker catalog correctly

Use the resource categories as a discovery guide:

| Assets-Locker source | How to use it |
|---|---|
| `catalog/design-inspiration.md` | Study layout, hierarchy, and product interaction references. |
| `catalog/design-systems.md` | Learn token, component, and consistency practices. |
| `catalog/ui-components.md` | Evaluate React component libraries and interaction primitives. |
| `catalog/icons-logos.md` | Select a coherent icon family and check its license. |
| `catalog/illustrations-imagery.md` | Find illustration, photography, and mockup sources. |
| `catalog/backgrounds-patterns.md` | Find or generate restrained SVG patterns and backgrounds. |
| `catalog/typography-colors.md` | Evaluate font families and color systems. |
| `catalog/animation-3d.md` | Evaluate motion and interactive visual tooling. |
| `catalog/forms-ui-states.md` | Design complete form and asynchronous states. |
| `catalog/responsive-patterns.md` | Validate responsive and accessible behavior. |
| `catalog/data-visualization.md` | Choose chart/table patterns when the product genuinely needs them. |
| `catalog/frontend-engineering.md` and `catalog/FRONTEND-ARCHITECTURE-PATTERNS.md` | Apply maintainable frontend engineering and architecture practices. |
| `docs/REUSE-GUIDE.md` | Follow selection, license checks, adaptation, testing, and usage documentation. |

Reuse rules:

1. Prefer suitable assets already present in the target application.
2. Verify the source page and current license/attribution terms before shipping external resources. A catalog status such as `to-review` does **not** mean a resource is approved for production.
3. Prefer original product-specific SVG/CSS visuals and properly licensed imagery over generic stock illustrations.
4. Do not hotlink third-party images for critical product UI. Store approved assets locally or use the project's approved asset delivery system.
5. Avoid adding a dependency when the existing stack already solves the requirement.
6. Do not mix unrelated illustration styles, icon families, or inconsistent stroke weights.
7. Optimize raster images; use SVG for appropriate logos, icons, diagrams, and simple illustrations. Avoid large base64 assets embedded in source code.
8. Provide useful alt text for meaningful images; hide decorative images from assistive technology.
9. Maintain an asset manifest with file path, purpose, page/component, source, license/attribution, dimensions, format, optimization status, and decorative/meaningful classification.
10. Remove unused assets only after checking imports, dynamic references, CSS URLs, and runtime use.

## 4. Visual direction and product identity

Choose a visual direction that fits the product's real domain and users. Establish:

- A recognizable primary color and restrained supporting palette.
- Neutral surfaces with clear content hierarchy and readable contrast.
- One primary type family with a deliberate type scale.
- Consistent radii, borders, shadows, spacing, and icon sizing.
- Consistent visual language for navigation, statuses, data, actions, and feedback.
- One distinctive product motif, used sparingly and consistently.

Avoid random gradients on every card, excessive glassmorphism/blur/glow, oversized rounded cards everywhere, generic dashboard templates without product-specific hierarchy, competing accent colors, pale low-contrast text, emoji as primary iconography, and decorative effects that reduce legibility. The product must remain recognizable with all motion disabled.

## 5. Design tokens

Define tokens centrally before styling individual pages. Match values to the existing brand; do not impose arbitrary colors without examining the product.

Create a single source of truth for:

- **Color:** brand, hover, pressed, accent, page background, surface, elevated surface, border, primary/secondary/muted text, focus, success, warning, danger, and information.
- **Typography:** font family, display/heading/body/label/caption scale, weights, line heights, and letter spacing.
- **Spacing:** a consistent 4px or 8px base scale.
- **Radii:** controls, cards, dialogs, and pills.
- **Shadows:** restrained elevation levels.
- **Layout:** content max-width, sidebar width, header height, page gutters, and responsive breakpoints.
- **Motion:** duration, easing, distance, and reduced-motion overrides.
- **Layering:** documented z-index levels for menus, tooltips, dialogs, toasts, and overlays.

Use semantic names such as `--color-surface`, `--text-primary`, `--border-subtle`, `--radius-control`, `--space-4`, and `--motion-fast`. Avoid unexplained one-off values scattered through components.

## 6. Typography and content hierarchy

- Choose a legible type family that fits the product and current stack; verify licensing and loading strategy.
- Define styles for page title, section title, card title, body, metadata, labels, and helper text.
- Use sentence case for ordinary labels unless the brand has an established convention.
- Constrain prose width and avoid excessively long lines.
- Use tabular numerals for aligned values where helpful.
- Keep visible form labels; placeholders are not labels.
- Do not communicate meaning through color or font weight alone.
- Use real product copy. Do not ship lorem ipsum or generic filler.

## 7. Layout and visual hierarchy

- Give each screen one clear primary heading and, where appropriate, one dominant primary action.
- Group related information and separate unrelated sections.
- Use a consistent page shell and responsive content container.
- Align navigation, headings, forms, cards, tables, and page actions to a coherent grid.
- Use whitespace to express grouping; do not fill every empty region with decoration.
- Match content density to the task: data-heavy screens should be scannable, not oversized marketing cards.
- Keep actions close to the information they affect.
- Prevent horizontal overflow at supported viewport sizes.
- Use skeletons shaped like the final content rather than a generic spinner for every page.

## 8. Custom button system — required

Create a reusable, accessible `Button` component. Buttons must feel purpose-designed for the product, not like browser defaults.

### Variants

- **Primary:** highest-priority page action; strong brand fill and clear contrast.
- **Secondary:** lower-emphasis action; quiet surface or border.
- **Tertiary/Ghost:** lightweight action for toolbars, menus, and compact sections.
- **Destructive:** delete, revoke, or irreversible action; danger styling and confirmation when appropriate.
- **Outline:** secondary action when a visible boundary improves discoverability.
- **Icon-only:** compact utility action with an accessible name and tooltip where useful.
- **Branded CTA:** one deliberate product-specific treatment for a high-value action, not a different style for every button.

### Anatomy and sizing

- Support small, medium, and large sizes, plus full-width where useful.
- Standardize height, padding, icon gap, corner radius, font weight, and icon dimensions.
- Align icons optically with text and use one icon family with consistent stroke weight.
- Keep button width stable when a loading indicator appears.
- Icon-only controls need a comfortable hit area (target at least 40–44 CSS px where practical).
- Use clear action verbs; avoid vague labels such as “Click here”.

### Required states

Every button must define default, hover, focus-visible, pressed, disabled, and loading states. Add success feedback only when the action genuinely completes.

- **Hover:** subtle color, elevation, underline, or small icon movement. Do not reveal essential functionality only on hover.
- **Pressed:** quick, restrained scale/translation or surface change; avoid toy-like bounce.
- **Focus:** high-contrast visible outline with adequate offset. Never remove the browser outline without a replacement.
- **Disabled:** visually distinct and non-interactive; explain why when useful.
- **Loading:** prevent duplicate submission when appropriate, preserve width, and expose busy state to assistive technology.
- **Success:** show only after the real operation resolves successfully.
- **Destructive:** explain the consequence and confirm high-impact or irreversible actions.

### Distinctive treatments

Use only one or two signature treatments across the product, for example:

- A primary action with a restrained two-tone brand surface and a directional icon that shifts a few pixels on hover.
- An upload action whose icon responds subtly while files are dragged over its drop zone.
- An AI action with a restrained accent edge or indicator only while genuinely processing.
- Compact toolbar buttons with consistent icon containers and soft hover surfaces.

These are directions, not a mandate for gradients, glows, animated borders, or motion on every button. The same semantic variant must look and behave consistently throughout the application. All actions must remain wired to existing behavior. Do not use clickable `div` elements instead of buttons.

## 9. Reusable components and interactions

Build a small UI system that fits the existing stack. Reuse or adapt installed components rather than adding duplicate libraries.

Common primitives, as needed:

- Button, IconButton, Link, Input, Textarea, Select, Checkbox, Radio, Switch, FormField.
- Badge/StatusBadge, Avatar, Tooltip, Dropdown/Menu, Tabs, Breadcrumbs.
- Card, Divider, Skeleton, Spinner/Progress.
- Dialog/Modal, Drawer, Popover, Toast/Alert, ConfirmationDialog.
- SearchField, FilterControl, Pagination, Table/List.
- EmptyState and ErrorState.

Shared UI components must remain business-agnostic. Feature-specific components belong with their feature. Components need clear props and predictable controlled/uncontrolled behavior. Avoid giant components, excessive prop drilling, premature abstraction, and nested interactive controls (such as a button inside a clickable card). Use semantic HTML and accessible interaction primitives.

## 10. Cards, surfaces, and data presentation

- Cards need a clear purpose and consistent internal padding.
- Use border, surface contrast, or subtle shadow to establish hierarchy; do not maximize all three.
- Add hover elevation only when a card is interactive.
- Keep metadata quieter than primary content but still readable.
- Align values, units, labels, and actions consistently.
- Use lists or tables when scanning and comparison matter more than decoration.
- Charts must use real data, truthful axes, labels, units, legends, and empty/error states.
- Never invent metrics, percentages, activity, names, or chart data to make a screen look populated.
- Pair color with text, icons, or patterns when communicating statuses.

## 11. Forms and feedback states

Every field must support applicable states: idle, hover, focus-visible, filled, invalid, disabled/read-only, submitting, success, and failure.

- Associate labels and help text programmatically with fields.
- Do not use placeholder text as the only label.
- Validate at an appropriate time; avoid premature errors.
- Place specific corrective errors near the field.
- Preserve user-entered values when a recoverable request fails.
- Clearly identify required fields.
- Expose asynchronous status to screen readers.
- Confirmation, toast, and alert copy must state what happened and what the user can do next.

## 12. Motion and animation language

Motion should explain cause and effect, provide feedback, and guide attention. It must not merely decorate the screen.

### Principles

- Keep motion short, purposeful, consistent, and interruptible.
- Prefer opacity and transform animations where possible.
- Avoid animating layout-heavy properties if they cause reflow.
- Never delay clicks, navigation, form submission, or important content for an animation.
- Avoid continuous animation on large areas or many simultaneous elements.
- Do not require users to wait for an animation to access content.
- Use a restrained hierarchy: micro-interactions, component transitions, and rare page-level transitions.

### Suggested timing tokens

Tune these through implementation and testing:

| Motion | Suggested duration |
|---|---:|
| Micro interaction | 100–160ms |
| Control/surface transition | 160–220ms |
| Popover/dialog transition | 180–260ms |
| Page/section reveal | 220–360ms |

Use consistent ease-out for entry and ease-in for exit. Avoid spring/bounce unless it has a clear functional purpose.

### Appropriate patterns

- Buttons: quick pressed feedback and small directional icon shift.
- Interactive cards: subtle border, surface, or elevation change on hover.
- Menus/popovers: opacity plus small scale/translate, with correct focus management.
- Dialogs/drawers: restrained fade/slide; restore focus to the trigger on close.
- Page content: optional small staggered reveal; never stagger every row in a large dataset.
- Upload: progress must reflect real upload progress; show a clear drag-over state.
- Search: clear focus and result-update feedback; debounce only where appropriate.
- AI processing: truthful progress or indeterminate status; never fake percentages.
- Success: small confirmation or toast only after application/server success.
- Empty states: static or very subtle illustration detail; keep the primary action obvious.

### Reduced motion

Respect `prefers-reduced-motion: reduce`:

- Remove parallax, looping, large spatial movement, and non-essential reveal animations.
- Replace spatial transitions with immediate state changes or simple opacity changes where appropriate.
- Preserve functional feedback and focus indication.
- Never make information available only through animation.

### 3D and high-cost effects

Use Motion, GSAP, Lottie, Spline, Rive, or Three.js only when the experience genuinely benefits and the dependency is justified. The catalog lists options; it does not mandate them. Check framework compatibility, bundle size, fallback behavior, licensing, keyboard/touch support, and reduced-motion behavior. Do not introduce 3D into ordinary dashboard screens merely to appear modern.

## 13. Backgrounds, textures, and decorative effects

- Use a quiet base surface with limited, purposeful texture.
- Prefer CSS or small local SVG patterns for light decoration.
- Keep decorative layers behind content and preserve text contrast.
- Reserve mesh gradients or glows for selected hero/marketing areas, not dense data or forms.
- Decorative shapes must not intercept pointer events or create overflow.
- Avoid large background videos, high-cost WebGL, and multiple blurred layers without a measured reason.
- Provide a clean fallback if an asset or animation fails.

## 14. Icons, logos, and original visual assets

- Choose one primary icon family (such as Lucide, Heroicons, Tabler, or Phosphor) after checking existing dependencies.
- Do not mix icon families without a strong reason.
- Keep icon sizes, stroke weights, alignment, and optical padding consistent.
- Use filled/duotone icons only as a deliberate status or brand treatment.
- Never distort or add unapproved effects to an existing logo.
- Create original product-specific SVG illustrations for important feature explanations and meaningful empty states when no suitable asset exists.
- Prefer a small coherent illustration set over unrelated stock visuals.
- Preserve aspect ratio, responsive sizing, crisp rendering, and accessible labels.
- Do not use emoji as primary product iconography.

## 15. Responsive behavior

Test at minimum these viewport widths: 320–360px, 375–430px, 768–1024px, 1280–1440px, and 1600px+.

- Design mobile deliberately; do not merely shrink desktop.
- Adapt navigation without hiding core routes.
- Use single-column forms when appropriate.
- Give tables a deliberate mobile pattern: responsive columns, clear horizontal scrolling, or stacked records. Never silently clip important values.
- Ensure dialogs/drawers fit viewport height and remain usable with the on-screen keyboard.
- Use comfortable, separated touch targets.
- Keep primary actions reachable without covering content.
- Resize imagery, charts, and typography without distortion.
- Test landscape mobile where relevant.

## 16. Accessibility and inclusive UX

Aim for WCAG 2.2 AA where practical.

- Use semantic landmarks, headings, lists, buttons, and links.
- Make all functionality keyboard operable.
- Maintain visible focus and logical tab order.
- Manage focus in menus, dialogs, drawers, and popovers.
- Maintain sufficient text and non-text contrast.
- Do not communicate status by color alone.
- Provide labels, instructions, and useful error identification.
- Give meaningful images alternative text; hide decorative imagery from assistive technology.
- Respect reduced motion and zoom/reflow.
- Announce meaningful asynchronous changes with appropriate live regions.
- Avoid autoplay audio/video and flashing content.
- Test major workflows with keyboard-only navigation and, where feasible, a screen reader.

## 17. Performance and engineering constraints

- Preserve the current framework, routing, state model, API client, authentication flow, and backend integration unless explicitly requested otherwise.
- Do not rewrite backend services, schemas, endpoints, payloads, authorization, or business rules as part of visual redesign.
- Do not replace the dependency stack without an evidenced need.
- Optimize images, fonts, and SVGs; lazy-load non-critical below-the-fold media.
- Reserve media dimensions to prevent layout shifts.
- Use route-level code splitting when compatible with the project.
- Avoid unnecessary dependencies and duplicate component systems.
- Prefer transform/opacity for motion.
- Avoid expensive filters, large blur surfaces, and perpetual GPU animations.
- Remove console errors, broken imports, missing asset paths, and React key warnings.
- Never fake loading, upload, AI response, notifications, or server success.
- Never put secrets, tokens, or private user files in frontend source or public assets.

## 18. Architecture and file organization

Follow the architecture already present in the target project unless it is clearly harmful. Do not restructure the whole application as a side effect of visual design.

For a growing React product, a pragmatic feature-based structure with shared UI and route-level composition may be appropriate. Example only—adapt to the actual project:

```text
src/
  app/                 # application setup, providers, routing
  components/
    ui/                # generic reusable primitives
    layout/            # shell, navigation, page containers
  features/
    feature-name/
      components/
      hooks/
      services/
      styles/
      tests/
  pages/               # route-level composition
  assets/
    brand/
    icons/
    illustrations/
    images/
    fonts/
  styles/
    tokens.css
    global.css
    motion.css
  services/            # shared API infrastructure, if used
  hooks/
  utils/
```

Do not force this structure if the target already follows a sound convention. Keep business logic close to the feature that owns it and shared UI generic.

## 19. Page-level design review

For every existing route, document and implement:

- Page purpose and primary user task.
- Heading and visual hierarchy.
- Primary and secondary actions.
- Main content structure.
- Loading, empty, populated, validation, permission, and failure states as applicable.
- Responsive behavior.
- Keyboard/focus behavior.
- Motion used and reduced-motion fallback.
- Assets and source/licensing notes.

Maintain visual consistency across public pages, authentication, dashboards, detail views, settings, and any specialist routes that actually exist. Do not invent product pages or features.

## 20. UX writing

- Use clear, direct, action-oriented labels.
- Use consistent terminology across navigation, buttons, dialogs, errors, and help text.
- Explain the consequence of destructive or irreversible actions.
- Make errors actionable and non-blaming.
- Explain why an area is empty and how the user can populate it.
- Describe long-running operations honestly.
- Avoid marketing or security claims the product cannot substantiate.
- Do not ship placeholder copy.

## 21. QA and acceptance criteria

A redesign is not complete because one screenshot looks attractive.

### Visual QA

- Check all routes at desktop, tablet, and mobile sizes.
- Check alignment, spacing, typography, contrast, overflow, image cropping, and asset loading.
- Confirm all button and field states exist.
- Check consistency of radii, shadows, type scale, and icon styles.
- Check only the theme modes actually supported by the product.

### Functional QA

- Click every visible action.
- Verify links navigate to the intended route.
- Verify forms preserve current validation and submission behavior.
- Verify menus, tabs, dialogs, drawers, filters, pagination, and search.
- Confirm loading, success, and failure correspond to real state changes.
- Confirm authentication and protected routes behave as before.

### Accessibility QA

- Navigate major flows using keyboard only.
- Inspect focus order and focus restoration.
- Check labels, accessible names, alt text, contrast, reduced motion, and live status announcements.

### Technical QA

- Run the project's existing lint, test, and build commands.
- Fix newly introduced warnings/errors.
- Test supported browsers.
- Record what actually ran and what remains untested. Never claim a test passed unless it was run.

### Definition of done

- The UI has a coherent and distinctive visual language.
- Shared tokens and reusable components are used consistently.
- Custom buttons have all required visual and interaction states.
- Every route is responsive and has appropriate asynchronous/empty/error states.
- Assets are optimized, licensed, documented, and used intentionally.
- Motion is purposeful and reduced-motion safe.
- Existing product behavior and backend contracts are preserved.
- No fake data, fake success, dead controls, broken assets, or known critical accessibility issues remain.
- Build and available tests pass, or remaining failures are clearly reported.

## 22. Implementation workflow

1. Audit the target repository and existing behavior.
2. Map routes, components, API touchpoints, and current assets.
3. Choose the visual direction and define design tokens.
4. Create the asset manifest and identify missing custom visuals.
5. Build/refine shared primitives, starting with buttons, fields, statuses, dialogs, and navigation.
6. Apply the system to one representative page and validate at multiple viewport sizes.
7. Roll the design through remaining routes and states.
8. Add restrained motion and reduced-motion fallbacks.
9. Run accessibility, visual, functional, and technical QA.
10. Report files changed, assets reused/created, dependencies added, tests run, known issues, and behavior preserved.

## 23. Required deliverables

Create or maintain these files in the **target application repository** where appropriate:

- `UI_UX_RULES.md` — this design and implementation contract.
- `docs/design/asset-manifest.md` — source, license, purpose, path, dimensions, and usage of shipped assets.
- `docs/design/design-tokens.md` — documented semantic token choices.
- A reusable Button component with documented variants and states.
- A component showcase/story when supported by the existing project.
- A route QA checklist with responsive and accessibility coverage.

Do not modify the Assets-Locker catalog just to implement another product's UI. Keep project-specific design rules and selected-resource records in the consuming application repository.
