# Build on a headless behaviour layer (React Aria Components), not a styled component system

Accessibility *behaviour* — focus management, ARIA wiring, keyboard navigation, dismissable layers — is delegated to **React Aria Components (RAC)**. We own the token system, styling, and component API on top of it. The styled-system route (Chakra, MUI) is rejected because those libraries bundle their own token and theming model — the exact layer this project exists to demonstrate ownership of — and hand-rolling accessibility is rejected as high-risk effort that doesn't showcase the intended skills.

React Aria was chosen over **Radix** for its accessibility rigour, its breadth of complex/data widgets (combobox, table, date & number fields — relevant to the dashboard consumer), and to avoid the "shadcn reskin" perception that the ubiquitous Radix-plus-Tailwind pairing invites. We accept its steeper learning curve and more opinionated API surface.

## Consequences

- Use the **component-level RAC API**, not the raw hooks (`useButton` + `react-stately`) — the hooks are the source of React Aria's "verbose/steep" reputation and the completion risk that comes with it.
- Complex data widgets (Table, ComboBox, DatePicker) are **stretch / consumer-driven**, not core, to protect delivery.
- Component interaction state is styled via the data attributes RAC exposes (`[data-hovered]`, `[data-pressed]`, `[data-selected]`) against our tokens.
