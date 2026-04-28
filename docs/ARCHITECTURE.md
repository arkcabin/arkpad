# Arkpad Architecture

## Overview

Arkpad is organized as modular layers so teams can extend behavior without modifying the core.

## Layers

1. Core Engine
- Editor state lifecycle.
- Transaction dispatch and command execution.
- Extension orchestration.

2. Extension Layer
- Node/mark definitions.
- Commands, input rules, keymaps.
- Event hooks and plugins.

3. Integration Layer
- Framework adapters (React first).
- UI bindings and state synchronization.

4. Optional Service Layer
- Collaboration service adapter.
- AI assistant adapter.
- Import/export adapters.

## Package Structure (proposed)

- packages/core
- packages/extensions-basic
- packages/react
- apps/arkpad

## Key Design Decisions & Developer Experience (DX)

- **Headless-first Architecture**: Arkpad is completely decoupled from the UI. The core engine handles the complex state, leaving developers completely free to build their own UI.
- **"Bring Your Own UI" (BYOUI)**: By passing a custom `nodeViews` object, developers can inject their own React components (like shadcn/ui) directly into the editor with just a single configuration file.
- **NodeView Standard Pattern**: All high-fidelity block extensions (Checkboxes, Media, AI widgets) follow the "Shadcn + React NodeView" bridge pattern for maximum flexibility and premium UX.
- **Zero-Boilerplate Setup**: Using the `useArkpadEditor` hook, a developer can mount a fully functional, reactive rich-text editor in a single React component file within seconds.
- **Typed extension contracts for safety**.
- **Clear separation of state and presentation**.

## Risks

- Plugin conflicts from command collisions.
- Performance regressions in large documents.
- API complexity if extension hooks are overdesigned.

## Mitigations

- Deterministic extension ordering.
- Benchmarks in CI.
- Keep v1 API small and additive.
