# Changelog

All notable changes to DSHcraft are documented in this file.

## [0.3.0] - 2026-08-21

### Added

- Canonical `dsh-minecraft-ui` npm package identity.
- Installable `dsh.bundle` manifest and package-owned `cordis.patch.yml`.
- Schemastery-backed Host configuration for storage and community catalog settings.
- Deterministic Host/Client build and package contract verification.
- Git `prepare`, release `prepack`, package whitelist, CI, and Host/manifest tests.

### Changed

- Host source now lives in `src/index.js`; `lib/index.js` is generated.
- Client factory identity is derived from `package.json.name`.
- Embedded CSS/font generation no longer modifies the source tree.
- Community plugin confirmation now always returns a Guardian-managed dry-run plan.

### Removed

- Direct `dsh plugin --profile web add` process spawning.
- `DSHCRAFT_COMMUNITY_INSTALL` live-install environment seam.
- Obsolete theme-era templates and smoke scripts.

## [0.2.0] - 2026-03-12

### Added

- Playable Three.js voxel world over the native DSH Web shell.
- Native DSH workbench integration, semantic facilities, inventory and crafting.
- Running Session work dogs, tool activity routing and world item drops.
