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

## Key Design Decisions

- Headless-first architecture for flexibility.
- Typed extension contracts for safety.
- Clear separation of state and presentation.

## Risks

- Plugin conflicts from command collisions.
- Performance regressions in large documents.
- API complexity if extension hooks are overdesigned.

## Mitigations

- Deterministic extension ordering.
- Benchmarks in CI.
- Keep v1 API small and additive.
