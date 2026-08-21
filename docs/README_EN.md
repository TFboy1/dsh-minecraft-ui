<p align="center">
  <img src="./banner.png" alt="DSHcraft — Play Your Agent Workspace" width="100%">
</p>

[![npm](https://img.shields.io/npm/v/dsh-minecraft-ui?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/dsh-minecraft-ui) [![Video Demo](https://img.shields.io/badge/Bilibili-Video_Demo-00A1D6?style=for-the-badge&logo=bilibili&logoColor=white)](https://www.bilibili.com/video/BV1d48c6BEPj) [![Afdian](https://img.shields.io/badge/Afdian-Support_Me-FF69B4?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://www.ifdian.net/item/1a20ed042f0711f1865a52540025c377) [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.creem.io/payment/prod_1yc40mIhKwwrc7iqFOG9G2) [![GitHub Stars](https://img.shields.io/github/stars/TFboy1/dsh-minecraft-ui?style=for-the-badge&logo=github&color=F5C542)](https://github.com/TFboy1/dsh-minecraft-ui/stargazers) [![License](https://img.shields.io/github/license/TFboy1/dsh-minecraft-ui?style=for-the-badge&color=4C8EDA)](../LICENSE)

[![CI](https://img.shields.io/github/actions/workflow/status/TFboy1/dsh-minecraft-ui/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/TFboy1/dsh-minecraft-ui/actions/workflows/ci.yml) [![npm downloads](https://img.shields.io/npm/dm/dsh-minecraft-ui?style=flat-square&logo=npm)](https://www.npmjs.com/package/dsh-minecraft-ui) [![DSH](https://img.shields.io/badge/DeepSeek_Harness-Web-5CDB95?style=flat-square)](#overview) [![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?style=flat-square&logo=threedotjs)](https://threejs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Node.js-22+-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[![简体中文](https://img.shields.io/badge/简体中文-README-blue?style=flat-square)](../README.md) [![English](https://img.shields.io/badge/English-Current-red?style=flat-square)](#) [![日本語](https://img.shields.io/badge/日本語-README-blue?style=flat-square)](./README_JA.md) [![Français](https://img.shields.io/badge/Français-README-blue?style=flat-square)](./README_FR.md) [![Deutsch](https://img.shields.io/badge/Deutsch-README-blue?style=flat-square)](./README_DE.md)

<p align="center">
  Turn DeepSeek Harness into a playable, Minecraft-inspired Agent workspace.<br>
  <sub>Explore a voxel world · Equip models · Enchant reasoning effort · Adventure alongside active Agents</sub>
</p>

## Installation

DSHcraft is a formal combo package declaring both `dsh.bundle` and `dsh.client`. Once installed, it contributes the stable Cordis row `minecraft-ui`; its browser module identity is `dsh-minecraft-ui`.

Do not enable a candidate build directly in your primary Web profile. Install it in an isolated canary profile first, inspect the composition layer, and then promote it through the Guardian stage / canary / promote workflow.

### npm (recommended)

Install the prebuilt package:

```bash
dsh plugin --profile <canary> add dsh-minecraft-ui
dsh --profile <canary> --dump-config
```

### Local tarball

```bash
pnpm install
pnpm run verify
pnpm pack
dsh plugin --profile <canary> add ./dsh-minecraft-ui-0.3.0.tgz
dsh --profile <canary> --dump-config
```

### Pin a Git commit

```bash
dsh plugin --profile <canary> add github:TFboy1/dsh-minecraft-ui#<commit-sha>
```

Git installation runs the package's `prepare` build. pnpm 10+ requires users to explicitly allow this install script. Only authorize trusted source code and configure `allowBuilds: dsh-minecraft-ui` using the exact package key shown by DSH. Use the prebuilt npm package or a tarball if you do not want to grant install-time build permission.

Uninstall:

```bash
dsh plugin --profile <canary> remove dsh-minecraft-ui
```

## Overview

DSHcraft does not reimplement the chat interface. As a Cordis Client Plugin, it mounts into the official `shell.overlay` and preserves DSH-native Workspace, Session, Conversation, Trajectory, Composer, permissions, model selection, and context statistics. It only transforms how you enter and experience them into a block-world metaphor.

## Screenshots

<p align="center">
  <a href="https://www.bilibili.com/video/BV1d48c6BEPj"><strong>▶ Watch the complete DSHcraft video demo on Bilibili</strong></a>
</p>

<table>
  <tr>
    <td align="center" width="50%"><strong>Playable voxel world</strong><br><img src="./screenshots/voxel-world.png" alt="DSHcraft voxel world and game HUD"></td>
    <td align="center" width="50%"><strong>Inventory and crafting</strong><br><img src="./screenshots/inventory-crafting.png" alt="DSHcraft inventory, hotbar, and crafting interface"></td>
  </tr>
  <tr>
    <td align="center" width="50%"><strong>Agent plugin chest</strong><br><img src="./screenshots/agent-plugin-chest.png" alt="DSHcraft Agent plugin chest and tool details"></td>
    <td align="center" width="50%"><strong>Model repository</strong><br><img src="./screenshots/model-chest.png" alt="DSHcraft model repository and equipped model"></td>
  </tr>
  <tr>
    <td align="center" width="50%"><strong>Reasoning enchantments</strong><br><img src="./screenshots/reasoning-enchantment.png" alt="DSHcraft reasoning-effort selection"></td>
    <td align="center" width="50%"><strong>Semantic facilities</strong><br><img src="./screenshots/enchanting-table.png" alt="DSHcraft enchanting table and interaction hint"></td>
  </tr>
</table>

## Core Metaphors

| DSH concept | DSHcraft representation |
| --- | --- |
| Running work | A working dog indoors |
| Latest Agent progress | A status sign above the dog |
| Model | Equipment |
| Reasoning effort | Enchantment |
| Tool / Plugin capability | Items stored in chests |
| Chat / Composer | Crafting table |
| Context / Token | Experience bar and inventory pressure |
| Memory | Ender-chest-like long-term storage metaphor (reserved) |
| MCP | Redstone system (reserved) |
| Workspace / Project | Map and cartography table |
| Community Plugin | Static community loot chests in the wild |

## Features

### Block world

- First-person voxel world powered by Three.js.
- Move, jump, sprint, sneak, mine, place blocks, and switch hotbar slots.
- Persist world differences, player position, inventory, chests, and selection state.
- Broken blocks become physical world drops with pop-out, falling, rotation, pickup delay, and proximity pickup.
- When the inventory is full, uncollected quantities remain in the world.

### Native DSH workbench

Press `G` or use the indoor crafting table to enter a Minecraft-inspired native DSH interface:

- Expand, collapse, and sort Workspace / Project folders.
- Create, open, rename, fork, and archive Sessions.
- Use native Conversation / Trajectory views and history pagination.
- Keep native Composer, Queue, Steer, Stop, Slash Command, and attachment logic.
- Keep native permission modes, approvals, models, reasoning effort, Context, and Token statistics.
- Use an additional 3×3 crafting panel without replacing native conversation features.

### Working dogs

- Dogs are created only for work that is currently running; idle Sessions do not spawn creatures.
- One dog represents one active Session job.
- Status signs cover thoughts, response streams, Tool Calls, commands, queues, approval waits, errors, and context compaction.
- Tool Calls guide the dog to a semantic facility and play quadruped movement:
  - Read → reference bookshelf
  - Command → Agent terminal
  - Web Search → cartography table
  - Write / Edit → crafting table
- Right-click a dog to switch to its Session and open the native workbench directly.

### Semantic facilities

| Facility | Function | Shortcut |
| --- | --- | --- |
| Crafting table | Native DSH conversation and 3×3 crafting | `G` |
| Model chest | Browse and equip models | `M` |
| Plugin chest | Manage tools available to the current Agent | `P` |
| Enchanting table | Adjust reasoning effort | `R` |
| Cartography table | Browse Workspace / Project maps | `N` |
| Community plugin chest | Explore the community plugin catalog | `L` |
| Reference bookshelf | Activity location for Read tools | — |
| Agent terminal | Activity location for Command tools | — |
| Notice board | Controls tutorial | — |

Workbench, chest, enchanting table, bookshelf, terminal, and cartography facilities drop themselves when broken, can enter the inventory, and can be placed again. Core indoor facilities lost because of early incorrect drop rules are restored once in older saves.

## Controls

| Input | Action |
| --- | --- |
| `W A S D` | Move |
| `Space` | Jump |
| `Ctrl` | Sprint |
| `Shift` | Sneak |
| Mouse movement | Look around |
| Hold left mouse button | Mine blocks |
| Right mouse button | Use blocks, facilities, or working dogs |
| Middle mouse button | Pick the targeted block |
| Mouse wheel / `1`–`9` | Switch hotbar slot |
| `E` | Inventory |
| `F` | Swap with offhand |
| `T` | In-game chat |
| `Tab` | Session list |
| `Esc` | Game menu |
| `G` | Native workbench |
| `M` | Model chest |
| `P` | Plugin chest |
| `R` | Enchanting table |
| `N` | Workspace map |
| `L` | Community plugin chest |

The browser requests Pointer Lock after the first click. Opening any facility releases the pointer immediately.

## Configuration

The bundle ships with safe defaults. Override the stable `minecraft-ui` row in a later patch for the selected profile:

```yaml
- id: minecraft-ui
  config:
    dataDirectory: dshcraft
    catalogUrl: https://awesome-dsh-plugin.com/plugins.json
    catalogCacheTtlMs: 21600000
    catalogLimit: 2000
    confirmationTtlMs: 60000
```

| Field | Default | Description |
| --- | ---: | --- |
| `dataDirectory` | `dshcraft` | Safe relative directory inside `$DSH_HOME` |
| `catalogUrl` | Community catalog URL | HTTP(S) only |
| `catalogCacheTtlMs` | `21600000` | Community catalog cache duration |
| `catalogLimit` | `2000` | Maximum catalog entries, range 1–5000 |
| `confirmationTtlMs` | `60000` | Lifetime of a community-plugin confirmation token |

Cordis validates the configuration with Schemastery and fills defaults. Invalid paths, protocols, and numeric ranges fail immediately during plugin activation.

## Community Plugin Security Model

Community plugins use a Discover → Collect → Inspect → Explicitly Confirm flow:

1. Read plugin metadata from a curated catalog.
2. Collect candidate plugins into community chests.
3. Show the install command, risk markers, and third-party code warning.
4. Return a Guardian installation plan after user confirmation.

Confirmation is always a **dry run**. DSHcraft never spawns the CLI or modifies a profile by itself. Candidate plugins must go through Guardian stage, be verified in an isolated canary, and only then be promoted by the user.

## Architecture

```text
dsh-minecraft-ui/
├─ src/index.js                    # Host plugin, Config, RPC, persistence
├─ cordis.patch.yml                # Composition layer contributed by dsh.bundle
├─ client/src/index.jsx            # shell.overlay registration and style lifecycle
├─ client/src/game-root.jsx        # DSH state binding and game UI composition
├─ client/src/engine.js            # Three.js world, interaction, drops, working dogs
├─ client/src/world.js             # Terrain, buildings, blocks, save migration
├─ client/src/inventory.js         # Item definitions and stacking rules
├─ client/src/inventory/           # Crafting, containers, player-inventory state machine
├─ client/src/dsh/                 # Session projections, tool routing, community loot
├─ client/src/ui/                  # Workbench, chests, map, and HUD
├─ scripts/build.mjs               # Deterministic Host / Client build
├─ scripts/verify-package.mjs      # Bundle, identity, license, and size contracts
├─ lib/index.js                    # Built Host entry point
├─ lib/client.js                   # lazy-CJS browser bundle
└─ test/                           # Node test runner tests
```

### Why `shell.overlay`

The official DSH Root and AppFrame continue to own Sidebar, Conversation, Details, and Composer. DSHcraft registers only a reversible world overlay and reveals/restyles the native interface inside the workbench.

This avoids mounting Session / Conversation a second time in another React Root, protecting drafts, attachments, streaming state, and Session lifecycle consistency.

## Development

### Requirements

- Node.js 22+
- pnpm 11+
- A working DeepSeek Harness Web environment

### Commands

```bash
pnpm install
pnpm test
pnpm run build
pnpm run package:check
pnpm run verify
pnpm pack --dry-run
```

- `pnpm test`: Host, package, inventory, crafting, movement, Session, model, world, working-dog, and drop tests.
- `pnpm run build`: generates `lib/index.js` and `lib/client.js` from `src/` and `client/src/` without rewriting source directories.
- `pnpm run package:check`: checks Bundle manifest, Client factory identity, publish allowlist, dual licenses, and bundle size.
- `pnpm run verify`: runs syntax checks, build, tests, package contracts, and artifact checks.
- `prepare`: supports Git installs pinned to a commit.
- `prepack`: enforces full verification before tarball / npm publication.

Re-run `pnpm run build` after changing Client source. Perform manual frontend verification in an isolated canary profile.

## Persistence

Capability and community state is stored by default in:

```text
$DSH_HOME/dshcraft/capabilities.json
$DSH_HOME/dshcraft/community.json
$DSH_HOME/dshcraft/community-cache.json
```

World, player, and inventory saves are managed by the game persistence service. Do not edit DSH Session logs directly.

## Known Limitations

- Current interaction targets keyboard and mouse; touch game mode is not supported.
- This is a spatial DSH theme and client, not a complete Minecraft implementation.
- When the community catalog is unavailable, DSHcraft falls back to cache or built-in candidates.
- Some facilities are semantic DSH mappings and do not behave exactly like vanilla Minecraft blocks.
- The Client bundle embeds Three.js and fonts, so it has an explicit size budget below 2 MB.

## License

Project code is released under the [MIT License](../LICENSE).

The pixel font is Monocraft; its license is stored at [`licenses/Monocraft-LICENSE.txt`](../licenses/Monocraft-LICENSE.txt). Minecraft is a trademark of Mojang Studios. This project is not affiliated with Mojang Studios or Microsoft.
