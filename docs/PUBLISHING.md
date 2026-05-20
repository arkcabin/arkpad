# NPM Package Publishing Guide

This document outlines how packages in the Arkpad monorepo are versioned, released, and published to the npm registry.

---

## 🚀 Release Workflow

The release process is fully automated via GitHub Actions in [.github/workflows/release.yml](file:///c:/Work/arkpad/.github/workflows/release.yml). When commits are merged to the `main` branch:

1. **Change Detection**: The CI checks if any packages have source changes since the last release commit.
2. **Version Bump**: If changes are detected, a changeset is processed to bump versions in the package-specific `package.json` files and append CHANGELOG entries.
3. **Commit & Tag**: Version bumps are committed back to `main` with the commit message `release: version packages [skip ci]`, and corresponding git tags are created.
4. **Publish**: The workflow publishes the newly versioned packages to npm.

---

## 🔑 NPM Authentication & Two-Factor Authentication (2FA)

To publish packages to the public npm registry (`https://registry.npmjs.org`), the GitHub Actions runner must authenticate with npmjs.com. This can be configured in two ways:

### 1. Granular Access Token (with 2FA Bypass)
If your npm account has Two-Factor Authentication (2FA) enabled for write actions (publishing), standard classic tokens or default granular tokens will fail with `npm error code EOTP` (One-Time Password required).

To fix this:
1. Log in to [npmjs.com](https://www.npmjs.com/).
2. Navigate to **Access Tokens** -> **Generate New Token** -> **Granular Access Token**.
3. Configure the token permissions:
   - **Scopes**: Read and write access to the specific packages or scope (e.g. `@arkpad`).
   - **2FA Bypass**: **Check the box** for **"Bypass Two-Factor Authentication"** (or choose the option that allows publishing without OTP).
4. Save the generated token as a secret named `NPM_TOKEN` in your GitHub repository (**Settings** -> **Secrets and variables** -> **Actions**).

> [!WARNING]
> If the "Bypass Two-Factor Authentication" option is unchecked or not supported by your token configuration, the release workflow will fail with an `EOTP` error.

---

### 2. Trusted Publishing (OIDC) - Recommended
Trusted Publishing allows GitHub Actions workflows to publish packages directly to npm without managing any long-lived secrets or tokens.

#### How to configure OIDC:
1. Go to your package settings on [npmjs.com](https://www.npmjs.com/).
2. Under the **Publishing** or **Integrations** tab, look for **Trusted Publishing** / **GitHub Actions**.
3. Add a new publisher config:
   - **GitHub Organization/Owner**: `arkcabin` (or your GitHub owner)
   - **Repository**: `arkpad`
   - **Workflow File**: `release.yml`
   - **Environment / Branch**: Leave blank or set to `main`.
4. Remove the `NPM_TOKEN` secret from your GitHub repository settings.
5. In `.github/workflows/release.yml`, ensure the publish step has:
   ```yaml
   permissions:
     id-token: write
   ```
   *(Note: This permission is already configured in the workflow).*

When no `NPM_TOKEN` is found in the repository secrets, the workflow automatically falls back to OIDC Trusted Publishing and authenticates securely via the OpenID Connect token.
