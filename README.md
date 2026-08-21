<p align="center">
  <img src="./docs/banner.png" alt="DSHcraft — Play Your Agent Workspace" width="100%">
</p>

[![npm](https://img.shields.io/npm/v/dsh-minecraft-ui?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/dsh-minecraft-ui) [![视频演示](https://img.shields.io/badge/Bilibili-Video_Demo-00A1D6?style=for-the-badge&logo=bilibili&logoColor=white)](https://www.bilibili.com/video/BV1d48c6BEPj) [![爱发电](https://img.shields.io/badge/爱发电-Support_Me-FF69B4?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://www.ifdian.net/item/1a20ed042f0711f1865a52540025c377) [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.creem.io/payment/prod_1yc40mIhKwwrc7iqFOG9G2) [![GitHub Stars](https://img.shields.io/github/stars/TFboy1/dsh-minecraft-ui?style=for-the-badge&logo=github&color=F5C542)](https://github.com/TFboy1/dsh-minecraft-ui/stargazers) [![License](https://img.shields.io/github/license/TFboy1/dsh-minecraft-ui?style=for-the-badge&color=4C8EDA)](./LICENSE)

[![CI](https://img.shields.io/github/actions/workflow/status/TFboy1/dsh-minecraft-ui/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/TFboy1/dsh-minecraft-ui/actions/workflows/ci.yml) [![npm downloads](https://img.shields.io/npm/dm/dsh-minecraft-ui?style=flat-square&logo=npm)](https://www.npmjs.com/package/dsh-minecraft-ui) [![DSH](https://img.shields.io/badge/DeepSeek_Harness-Web-5CDB95?style=flat-square)](#项目介绍) [![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?style=flat-square&logo=threedotjs)](https://threejs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Node.js-22+-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[![简体中文](https://img.shields.io/badge/简体中文-当前语言-red?style=flat-square)](#) [![English](https://img.shields.io/badge/English-README-blue?style=flat-square)](./docs/README_EN.md) [![日本語](https://img.shields.io/badge/日本語-README-blue?style=flat-square)](./docs/README_JA.md) [![Français](https://img.shields.io/badge/Français-README-blue?style=flat-square)](./docs/README_FR.md) [![Deutsch](https://img.shields.io/badge/Deutsch-README-blue?style=flat-square)](./docs/README_DE.md)

<p align="center">
  把 DeepSeek Harness 变成一座可游玩的 Minecraft 风格 Agent 工作空间。<br>
  <sub>探索体素世界 · 装备模型 · 附魔推理强度 · 与正在工作的 Agent 并肩冒险</sub>
</p>

## 安装

DSHcraft 是一个同时声明 `dsh.bundle` 和 `dsh.client` 的正式组合包。安装后，它会贡献稳定 Cordis 行 `minecraft-ui`，浏览器模块身份为 `dsh-minecraft-ui`。

不要直接在正在使用的主 Web profile 中启用候选版本。先安装到独立 canary profile，检查组合层，再通过 Guardian stage / canary / promote 流程提升。

### npm（推荐）

安装预构建包：

```bash
dsh plugin --profile <canary> add dsh-minecraft-ui
dsh --profile <canary> --dump-config
```

### 本地 tarball

```bash
pnpm install
pnpm run verify
pnpm pack
dsh plugin --profile <canary> add ./dsh-minecraft-ui-0.3.0.tgz
dsh --profile <canary> --dump-config
```

### 固定 Git commit

```bash
dsh plugin --profile <canary> add github:TFboy1/dsh-minecraft-ui#<commit-sha>
```

Git 安装会运行本包的 `prepare` 构建。pnpm 10+ 要求用户显式允许该安装脚本；只对可信源码授权，并按 DSH 输出的准确包键配置 `allowBuilds: dsh-minecraft-ui`。不希望授予安装时构建权限时，请使用 npm 预构建包或 tarball。

卸载：

```bash
dsh plugin --profile <canary> remove dsh-minecraft-ui
```

## 项目介绍

把 DeepSeek Harness 变成一座可游玩的 Minecraft 风格 Agent 工作空间。

DSHcraft 不是一套重新实现的聊天界面。它以 Cordis Client Plugin 的形式挂载到官方 `shell.overlay`，保留 DSH 原生的 Workspace、Session、Conversation、Trajectory、Composer、权限、模型选择和上下文统计，只把进入方式、空间隐喻与视觉表现改造成方块世界。

## 界面预览

<p align="center">
  <a href="https://www.bilibili.com/video/BV1d48c6BEPj"><strong>▶ Minecraft 版 DeepSeek Harness 长这样？【B站AI创作公开赛】</strong></a><br>
  <sub>点击前往哔哩哔哩观看完整视频演示</sub>
</p>

<table>
  <tr>
    <td align="center" width="50%">
      <strong>可游玩的方块世界</strong><br>
      <img src="./docs/screenshots/voxel-world.png" alt="DSHcraft 方块世界与游戏 HUD">
    </td>
    <td align="center" width="50%">
      <strong>背包与合成界面</strong><br>
      <img src="./docs/screenshots/inventory-crafting.png" alt="DSHcraft 背包、快捷栏与合成界面">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Agent 插件箱</strong><br>
      <img src="./docs/screenshots/agent-plugin-chest.png" alt="DSHcraft Agent 插件箱与工具详情">
    </td>
    <td align="center" width="50%">
      <strong>模型仓库</strong><br>
      <img src="./docs/screenshots/model-chest.png" alt="DSHcraft 模型仓库与模型装备">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>推理强度附魔</strong><br>
      <img src="./docs/screenshots/reasoning-enchantment.png" alt="DSHcraft 推理强度选择界面">
    </td>
    <td align="center" width="50%">
      <strong>语义化设施</strong><br>
      <img src="./docs/screenshots/enchanting-table.png" alt="DSHcraft 附魔台与场景交互提示">
    </td>
  </tr>
</table>

## 核心理念

| DSH 概念 | DSHcraft 表现 |
| --- | --- |
| 正在运行的工作 | 室内工作小狗 |
| 最新 Agent 进展 | 小狗头顶状态牌 |
| Model | 装备 |
| Reasoning effort | 附魔 |
| Tool / Plugin capability | 箱子中的物品 |
| Chat / Composer | 工作台 |
| Context / Token | 经验条与背包压力 |
| Memory | 末影箱式长期存储隐喻（概念预留） |
| MCP | 红石系统（概念预留） |
| Workspace / Project | 地图与制图台 |
| Community Plugin | 野外静态社区宝箱 |

## 功能

### 方块世界

- 基于 Three.js 的第一人称体素世界。
- 可移动、跳跃、疾跑、潜行、挖掘、放置方块和切换快捷栏。
- 世界差异、玩家位置、背包、箱子与选择状态可持久化。
- 方块破坏后生成世界掉落物，包含弹出、下落、旋转、拾取延迟和靠近自动拾取。
- 背包空间不足时，未能拾取的剩余数量继续留在世界中。

### 原生 DSH 工作台

按 `G` 或使用室内工作台进入 Minecraft 风格的原生 DSH 界面：

- Workspace / Project 文件夹展开、收起和排序。
- 新建、打开、重命名、Fork、归档 Session。
- 原生“对话 / 轨迹”视图和历史分页。
- 原生 Composer、Queue、Steer、Stop、Slash Command 与附件逻辑。
- 原生权限模式、审批、模型、推理强度、Context 和 Token 统计。
- 额外提供 3×3 合成面板，但不替代原生会话功能。

### 工作小狗

- 只为**正在运行的工作**生成小狗；空闲 Session 不生成生物。
- 一只小狗对应一项运行中的 Session 工作。
- 状态牌显示该 Agent 最新进展，可覆盖思考、回复流、Tool Call、命令、队列、审批等待、错误和上下文整理等状态。
- Tool Call 会把小狗引导到对应设施并播放四足动作：
  - Read → 资料书架
  - Command → Agent 终端
  - Web Search → 制图台
  - Write / Edit → 工作台
- 右击小狗会切换到它对应的 Session，并直接打开原生工作台。

### 语义设施

| 设施 | 功能 | 快捷键 |
| --- | --- | --- |
| 工作台 | 原生 DSH 会话与 3×3 合成 | `G` |
| 模型箱 | 查看与选择模型装备 | `M` |
| 插件箱 | 管理当前 Agent 的工具能力 | `P` |
| 附魔台 | 调整推理强度 | `R` |
| 制图台 | 浏览 Workspace / Project 地图 | `N` |
| 社区插件宝箱 | 探索社区插件目录 | `L` |
| 资料书架 | Read 工具活动位置 | — |
| Agent 终端 | Command 工具活动位置 | — |
| 公告牌 | 操作教程 | — |

工作台、箱子、附魔台、书架、终端、制图台等设施被破坏后会掉落其自身物品，可进入背包并重新放置。旧存档中因早期错误掉落规则而丢失的室内核心设施会恢复一次。

## 操作

| 输入 | 行为 |
| --- | --- |
| `W A S D` | 移动 |
| `Space` | 跳跃 |
| `Ctrl` | 疾跑 |
| `Shift` | 潜行 |
| 鼠标移动 | 转动视角 |
| 左键长按 | 挖掘方块 |
| 右键 | 使用方块、打开设施或工作小狗 |
| 鼠标中键 | 选取目标方块 |
| 滚轮 / `1`–`9` | 切换快捷栏 |
| `E` | 背包 |
| `F` | 与副手交换 |
| `T` | 游戏内聊天 |
| `Tab` | Session 列表 |
| `Esc` | 游戏菜单 |
| `G` | 原生工作台 |
| `M` | 模型箱 |
| `P` | 插件箱 |
| `R` | 附魔台 |
| `N` | Workspace 地图 |
| `L` | 社区插件宝箱 |

首次点击画面后浏览器会请求 Pointer Lock。打开任何设施时会立即释放鼠标锁定。

## 配置

Bundle 自带安全默认值，用户可以在该 profile 的后置 patch 中覆盖稳定行 `minecraft-ui`：

```yaml
- id: minecraft-ui
  config:
    dataDirectory: dshcraft
    catalogUrl: https://awesome-dsh-plugin.com/plugins.json
    catalogCacheTtlMs: 21600000
    catalogLimit: 2000
    confirmationTtlMs: 60000
```

| 字段 | 默认值 | 说明 |
| --- | ---: | --- |
| `dataDirectory` | `dshcraft` | `$DSH_HOME` 内的安全相对目录 |
| `catalogUrl` | 社区目录 URL | 仅允许 HTTP(S) |
| `catalogCacheTtlMs` | `21600000` | 社区目录缓存时长 |
| `catalogLimit` | `2000` | 最多保留的目录条目数，范围 1–5000 |
| `confirmationTtlMs` | `60000` | 社区插件确认 token 有效期 |

Cordis 会用 Schemastery 校验配置并填充默认值；非法路径、协议和数值范围会在插件激活时直接报错。

## 社区插件安全模型

社区插件采用“发现 → 收集 → 检查 → 明确确认”的流程：

1. 从策展目录读取插件元数据。
2. 将候选插件收集到社区宝箱。
3. 展示安装命令、风险标记和第三方代码警告。
4. 用户确认后返回一份 Guardian 安装计划。

确认结果始终是 **dry-run**。DSHcraft 不会 spawn CLI，也不会自行修改任何 profile。候选插件必须交给 Guardian stage，在独立 canary 验证后再由用户决定是否 promote。

## 架构

```text
dsh-minecraft-ui/
├─ src/index.js                    # Host 插件、Config、RPC 与持久化
├─ cordis.patch.yml                # dsh.bundle 贡献的组合层
├─ client/src/index.jsx            # shell.overlay 注册与样式生命周期
├─ client/src/game-root.jsx        # DSH 状态绑定与游戏 UI 组合
├─ client/src/engine.js            # Three.js 世界、交互、掉落物和工作小狗
├─ client/src/world.js             # 地形、建筑、方块与存档迁移
├─ client/src/inventory.js         # 物品定义和堆叠规则
├─ client/src/inventory/           # 合成、容器和玩家背包状态机
├─ client/src/dsh/                 # Session 投影、工具路由和社区战利品
├─ client/src/ui/                  # 工作台、箱子、地图和 HUD
├─ scripts/build.mjs               # Host / Client 确定性构建
├─ scripts/verify-package.mjs      # Bundle、身份、许可与体积契约检查
├─ lib/index.js                    # 构建后的 Host 入口
├─ lib/client.js                   # lazy-CJS 浏览器 bundle
└─ test/                           # Node test runner 测试
```

### 为什么使用 `shell.overlay`

官方 DSH Root 和 AppFrame 继续拥有 Sidebar、Conversation、Details 与 Composer。DSHcraft 只注册一层可逆的世界 Overlay，并在进入工作台时露出、换肤原生界面。

这种方式避免在第二个 React Root 中重复挂载 Session/Conversation，从而保护草稿、附件、流式状态和 Session 生命周期的一致性。

## 开发

### 环境要求

- Node.js 22+
- pnpm 11+
- 可运行的 DeepSeek Harness Web 环境

### 常用命令

```bash
pnpm install
pnpm test
pnpm run build
pnpm run package:check
pnpm run verify
pnpm pack --dry-run
```

- `pnpm test`：运行 Host、Package、背包、合成、移动、Session、模型、世界、工作小狗和掉落物测试。
- `pnpm run build`：从 `src/` 与 `client/src/` 生成 `lib/index.js`、`lib/client.js`；构建不改写源码目录。
- `pnpm run package:check`：检查 Bundle manifest、Client factory 身份、发布白名单、双许可和 bundle 体积。
- `pnpm run verify`：依次执行语法检查、构建、测试、Package 契约和产物检查。
- `prepare`：支持固定 commit 的 Git 安装。
- `prepack`：在 tarball / npm 发布前强制执行完整验证。

修改 Client 源码后必须重新运行 `pnpm run build`。前端人工验证由用户在独立 canary 中执行。

## 持久化

能力与社区状态默认写入：

```text
$DSH_HOME/dshcraft/capabilities.json
$DSH_HOME/dshcraft/community.json
$DSH_HOME/dshcraft/community-cache.json
```

世界、玩家与背包存档由游戏持久化服务管理。不要直接修改 DSH Session 日志。

## 已知限制

- 当前交互面向键盘和鼠标，不支持触屏游戏模式。
- 这是 DSH 的空间化主题与客户端，不是完整 Minecraft 实现。
- 社区目录不可用时会回退到缓存或内置候选条目。
- 部分设施属于 DSH 语义映射，行为与原版 Minecraft 方块不完全相同。
- Client bundle 包含 Three.js 和内嵌字体，因而被设置为 2 MB 以内的显式体积预算。

## License

项目代码采用 [MIT License](./LICENSE)。

像素字体使用 Monocraft，其许可文件位于 [`licenses/Monocraft-LICENSE.txt`](./licenses/Monocraft-LICENSE.txt)。Minecraft 是 Mojang Studios 的商标；本项目与 Mojang Studios 或 Microsoft 无隶属关系。
