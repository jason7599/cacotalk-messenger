# CacoTalk UI cheat sheet

A one-page reference for how the frontend is styled: which colors exist, which components to reach for, and a few rules of thumb.

> **Credits, stated plainly:** I (jason7599) wrote the app's logic, state, and API
> layer. The styling is almost entirely AI-made. The look was worked out with an
> AI, and the original component markup came from many AI sessions using that
> file as a reference. In September 2026 **Claude (Anthropic)** reorganized all
> of it into the design tokens in `src/index.css` and the components in this
> folder, and wrote this cheat sheet.

---

## The three layers

| Layer | Where | Use it for |
|---|---|---|
| **Tokens** | `src/index.css` | Colors, shadows, letter-spacing, tiny text sizes. Change a value there and it changes everywhere. |
| **Components** | this folder (`components/ui`) | Repeated pieces with structure: modal headers, buttons, cards... |
| **Plain Tailwind** | inline `className` | One-off layout: `flex`, `gap-3`, `mt-4`, widths... |

**Rule of thumb:** if you're about to copy the same markup a *third* time, make it a component.
Otherwise inline Tailwind is fine.

---

## Tokens (use these instead of hex codes)

Each color works with any Tailwind prefix: `bg-panel`, `text-bone`, `border-edge`, `shadow-shade`...

**Surfaces** (dark → light): `void` · `pit` (inputs, icon buttons) · `sunken` (page bg, headers) · `panel` (cards, rows) · `panel-hover` · `raised` (modals, active rows)

**Lines**: `edge-soft` (hairlines) · `edge` (default border) · `edge-strong` (emphasis)

**Crimson**: `crimson-deep` (own messages, selected) · `crimson` (main accent) · `crimson-bright` (hover/focus) · `crimson-hot` (armed "are you sure?")

**Text** (bright → dim): `bone` (normal text) · `ash` · `muted` (descriptions) · `faint` (meta, icons) · `dim` (placeholders)

**Status**: `error` · `warn` · `warn-edge` · `warn-bg`

**Shadows**: `shadow-hard-xs|sm|md|lg|xl` = the stamped offset shadow (1/2/3/4/6px).
Recolor with a shade: `shadow-hard-lg shadow-shade-crimson`.

**Letter-spacing**: `tracking-label` (0.12em) · `tracking-caps` (0.16em) · `tracking-loud` (0.2em)

**Tiny text**: `text-2xs` (10px) · `text-3xs` (9px)

**Helper classes** (defined in `index.css`):
- `field`: the dark bordered input look (inputs, textareas, search boxes). Border turns red on focus.
- `eyebrow`: small red spaced-out label above a title.
- `caption`: tiny dim status text (list footers, "UNIT 01").

Don't combine `caption`/`eyebrow` with another `text-*` or `tracking-*` class. Which one wins isn't guaranteed.

---

## Components

Import everything from one place:

```tsx
import { Button, ModalFrame, ModalHeader, Section } from "../../../components/ui";
```

### Modals

```tsx
<ModalFrame size="sm">            {/* sm | md | lg: sets the modal width */}
    <ModalHeader
        eyebrow="CONTACT CONTROL"  // optional red label
        title="lucifer"
        subtitle="ALTER THIS SOUL'S ACCESS."   // optional
        meta="3 SOULS"             // optional small text beside the title
        onClose={closeModal}
        closeDisabled={isBusy}     // optional
        onBack={() => ...}         // optional, shows a back arrow
    />
    ...
</ModalFrame>
```

### Section: numbered heading `01 TITLE ────────`

```tsx
<Section index={1} title="RELATION" aside={<span className="caption">3 FOUND</span>}>
    ...content...
</Section>
```

### ActionCard: bordered card with title + description + stacked children

```tsx
<ActionCard title="SEVER CONTACT" description="Remove this soul from your directory.">
    <ConsequenceList items={["You will leave.", "Messages stop."]} />
    <Button className="w-full">DO IT</Button>
</ActionCard>
```

### Button

```tsx
<Button
    variant="primary"      // primary | secondary | outline | danger
    size="md"              // md (big) | sm (compact)
    icon={<LogOut size={17} strokeWidth={2.5} />}
    loading={isSaving}     // swaps the icon for a spinner
    className="w-full"
>
    SAVE
</Button>
```

- `primary`: solid crimson, the main action
- `secondary`: dark with crimson text, fills red on hover
- `outline`: dark and quiet, border lights up
- `danger`: bright red (mostly used automatically by `ConfirmButton`)

### ConfirmButton: two clicks: first "ARE YOU SURE?", second runs `onConfirm`

```tsx
<ConfirmButton
    onConfirm={handleLeave}
    loading={isLeaving}
    loadingLabel="DEPARTING..."
    variant="primary"          // look before it's armed: primary | secondary | outline
    icon={<LogOut size={17} strokeWidth={2.5} />}
    className="w-full"
>
    ABANDON CHANNEL
</ConfirmButton>
```

It keeps the armed state itself, so no `confirmX` useState is needed.

### IconButton: square icon-only button

```tsx
<IconButton
    aria-label="Close"         // required (there's no visible text)
    variant="default"          // default (grey → red outline) | accent (crimson, fills red)
    size="lg"                  // sm (28px) | md (32px) | lg (40px) | xl (44px)
    onClick={...}
>
    <X size={18} strokeWidth={2.5} />
</IconButton>
```

`lg` and `xl` have the shadow + press effect; `sm` and `md` are flat.

### Avatar: square first-letter (or icon) tile

```tsx
<Avatar name="lucifer" />                          // shows "L"
<Avatar icon={<Users size={18} />} size="lg" />    // sm | md | lg | xl
<Avatar name="jux" tone="active" />                // accent | muted | active
```

### CheckboxCard: whole card acts as a checkbox

```tsx
<CheckboxCard checked={block} onChange={setBlock} disabled={busy} title="SEAL THE SOURCE">
    Also block <span className="font-bold text-ash">{name}</span>.
</CheckboxCard>
```

### SearchInput: input with magnifier icon

```tsx
<SearchInput
    value={query}
    onChange={setQuery}        // gets the string directly, not the event
    placeholder="SEARCH..."
    trailing={<Spinner />}     // optional thing on the right
    className="mb-4"           // applies to the outer box
/>
```

### Small stuff

```tsx
<ConsequenceList items={["...", "..."]} />               // red-ruled "CONSEQUENCES" box
<ErrorText>{error}</ErrorText>                           // red-ruled error line
<EmptyState icon={<Users size={22} />} title="NOTHING HERE" subtitle="optional" />
<Spinner size="md" className="text-crimson" />           // sm | md | lg, takes the text color
```

### SidebarList: layout for the sidebar panels

```tsx
<SidebarList
    eyebrow="TRANSMISSIONS // LIVE"
    title="CONVERSATIONS"
    meta="UNIT 01"
    toolbar={<Button ...>}     // optional bar under the header
    footer="ACTIVE CHANNELS // LINK STABLE"
>
    {rows}
</SidebarList>
```

### Utilities

- `cn("a", cond && "b")` joins class names and skips falsy ones. It does **not** resolve Tailwind conflicts,
  so only pass extra layout classes (margins, width) to components, not colors.
- `press` is the "pushed into its shadow" active effect, as a class string: ``className={`... ${press}`}``.

---

## Components that live elsewhere

Not everything is in this folder. Some pieces are only used in one feature, so they stay next to it:

- `features/messages/components/MessageList/MessageBubble.tsx`: message bubble (`mine | theirs | pending | failed`)
- `components/SidebarPanel.tsx` → `NavButton`: the icon-rail buttons
- `features/conversations/components/ConversationWarning.tsx` → `WarningAction`
- `features/conversations/components/ConversationHeader.tsx` → `Slash` (the `//` separator)
- `pages/AuthPage.tsx` → `Field`: labeled input for the login form

---

## When asking an AI for new UI

Paste something like this so it matches instead of inventing new styles:

> Use the design tokens in `src/index.css` (no raw hex colors) and the components exported from
> `src/components/ui/index.ts`. See `src/components/ui/README.md` for how each is used.
> Only use plain Tailwind for one-off layout.
