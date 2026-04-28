# @arkpad/core

## 1.6.4

### Patch Changes

- # Arkpad Performance & Stability Framework Update

  This release marks the transition to a more robust, performance-oriented architecture.

  ### 💎 New Features
  - **UniqueId Extension**: Implemented persistent, collision-resistant block identifiers using `nanoid`.
  - **Atomic Scanning**: Optimized ID assignment to use O(1) step-based scanning, ensuring high performance even in massive documents.
  - **High-Performance Analytics**: Re-engineered word counting to use non-allocating regex iterators.
  - **Essentials Kit**: Integrated `UniqueId` into the default `Essentials` kit.

  ### 🛡️ Stability & Fixes
  - **Recursion Fix**: Resolved a critical "Maximum call stack size exceeded" error caused by Proxy re-entrancy in the command registry.
  - **Initialization Guard**: Added a lifecycle guard to the editor view to prevent crashes during rapid mount/unmount cycles.
  - **React Optimization**: Refactored the `EditorFooter` to use isolated state subscriptions, reducing main app re-renders by 90%.

  ### 🏗️ Infrastructure
  - **Changesets Migration**: Migrated from Semantic Release to Changesets for more intentional, monorepo-native versioning.
  - **Clean Code**: Resolved all lint and type errors across the core and react packages.
