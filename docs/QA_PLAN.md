# Arkpad QA Plan

## Test Levels

- Unit tests: core commands, extension hooks, schema rules.
- Integration tests: editor rendering, updates, serialization.
- End-to-end tests: toolbar actions and keyboard shortcuts.

## Coverage Goals

- Core package: >= 80%
- Integration package: >= 70%

## Critical Scenarios

- Large document editing and cursor stability.
- Undo/redo consistency across extension commands.
- Link and list behavior under nested edits.

## Release Gates

- Lint and type checks pass.
- Test suite green on CI.
- Manual smoke test completed in Arkpad app.
