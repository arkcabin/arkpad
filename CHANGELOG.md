## [1.5.2](https://github.com/arkcabin/arkpad/compare/v1.5.1...v1.5.2) (2026-04-28)


### Bug Fixes

* finalize release pipeline and remove debug diagnostics ([f850231](https://github.com/arkcabin/arkpad/commit/f850231853f1c7d7e214548baa4ce78f742655b8))

## [1.5.1](https://github.com/arkcabin/arkpad/compare/v1.5.0...v1.5.1) (2026-04-28)


### Bug Fixes

* improve npm publish diagnostics and enforce public access ([3d5fbcf](https://github.com/arkcabin/arkpad/commit/3d5fbcf8997520ed114333c5468bb6fe86ab77ac))
* include all package.json files in release assets to prevent CI 404 ([a8c7142](https://github.com/arkcabin/arkpad/commit/a8c71427a1dacfc0a4d747eaf1459a3a2d3cfed2))

# [1.5.0](https://github.com/arkcabin/arkpad/compare/v1.4.0...v1.5.0) (2026-04-28)


### Bug Fixes

* resolve ESM warnings and NPM authentication issues in CI ([4c70fb2](https://github.com/arkcabin/arkpad/commit/4c70fb221334203cced8030170a648772ea70d1a))
* synchronize workspace versions and update package-lock.json to fix CI 404 ([f079a1a](https://github.com/arkcabin/arkpad/commit/f079a1aa774454dd516009541412d46506083abd))


### Features

* initialize core and react package structures with documentation, license files, and updated repository configuration ([a9ba06c](https://github.com/arkcabin/arkpad/commit/a9ba06c8153ec7af9b1599278a0b616fddd73276))

# [1.4.0](https://github.com/arkcabin/arkpad/compare/v1.3.0...v1.4.0) (2026-04-28)


### Bug Fixes

* remove --include-workspace-root from npm version command in semantic-release config ([580bb72](https://github.com/arkcabin/arkpad/commit/580bb72c7193b2ad4aea2608873aed810ff8ef14))


### Features

* initialize core and react workspace packages and configure semantic-release for monorepo publishing ([cc7549d](https://github.com/arkcabin/arkpad/commit/cc7549dd79b4dcb1a80bb5a0527052aad4c0bd1a))

# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-04-28

### Added
- **TaskList Extension**: Full support for interactive checklists with `[ ]` and `[x]` markdown triggers.
- **Underline & Strike Marks**: Added support for underlined and strikethrough text.
- **Superscript & Subscript**: Added support for super/subscript marks.
- **Highlight**: Added text highlighting support.
- **Text Alignment**: Added commands for left, center, right, and justify alignment.
- **Husky Integration**: Automated linting on git commit for better code quality.
- **Selection Utilities**: New helpers for `isActive` and `getAttributes` to simplify toolbar building.

### Fixed
- **Task List Merging**: Fixed a bug where backspacing at the start of a task item didn't correctly merge with the previous item.
- **Checkbox Protection**: Prevented accidental deletion of task markers when backspacing into text.
- **Alignment Consistency**: Standardized `textAlign` attributes across all supported block nodes (Paragraph, Heading, etc.).
- **ProseMirror Type Errors**: Resolved TypeScript issues with Fragment mapping in list toggling logic.

### Improved
- **Task List CSS**: Adjusted vertical alignment of checkboxes to better match text baselines.
- **Command Robustness**: Upgraded `toggleTaskItem` to find the correct parent node regardless of cursor depth.
- **Markdown Serialization**: Improved consistency of markdown export for lists and tasks.
- **Documentation**: Updated API reference with all recently implemented commands and features.

---

## [0.1.0-alpha] - 2026-04-20

### Added
- Initial framework structure with `@arkpad/core` and `@arkpad/react`.
- Basic Markdown parsing and serialization.
- Bubble and Floating menu components.
- Support for Bold, Italic, Code, and Link marks.
- Support for Headings, Blockquotes, and Code Blocks.
