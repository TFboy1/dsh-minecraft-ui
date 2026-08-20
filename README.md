# DSHcraft

把 DeepSeek Harness 变成一座可游玩的 Minecraft 风格 Agent 工作空间。

DSHcraft 不是一套重新实现的聊天界面。它以 Cordis Client Plugin 的形式挂载到官方 `shell.overlay`，保留 DSH 原生的 Workspace、Session、Conversation、Trajectory、Composer、权限、模型选择和上下文统计，只把进入方式、空间隐喻与视觉表现改造成方块世界。

> 当前版本：`0.2.0`  
> 适用平台：DSH Web（桌面浏览器）  
> 状态：实验性主题 / 可玩客户端

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

## 社区插件安全模型

社区插件采用“收集 → 检查 → 明确确认”的流程：

1. 从策展目录读取插件元数据。
2. 将候选插件收集到社区宝箱。
3. 展示安装命令、风险标记和第三方代码警告。
4. 用户明确确认后才继续。

默认安装模式是 **dry-run**，不会修改 Web profile。只有 Host 环境显式设置 `DSHCRAFT_COMMUNITY_INSTALL=enabled` 时才允许真实执行安装命令。生产环境仍应通过 DSH Guardian 的 stage / canary / promote 流程管理插件变更。

## 架构

```text
minecraft-ui/
├─ lib/index.js                    # Host RPC、能力限制、社区目录与持久化
├─ client/src/index.jsx            # shell.overlay 注册与全局样式生命周期
├─ client/src/game-root.jsx        # DSH 状态绑定与游戏 UI 组合
├─ client/src/engine.js            # Three.js 世界、交互、掉落物和工作小狗
├─ client/src/world.js             # 地形、建筑、方块与存档迁移
├─ client/src/inventory.js         # 物品定义和堆叠规则
├─ client/src/inventory/           # 合成、容器和玩家背包状态机
├─ client/src/dsh/                 # Session 投影、工具路由和社区战利品
├─ client/src/ui/                  # 工作台、箱子、地图和 HUD
├─ scripts/build.mjs               # Client bundle 构建
└─ test/                           # Node test runner 测试
```

### 为什么使用 `shell.overlay`

官方 DSH Root 和 AppFrame 继续拥有 Sidebar、Conversation、Details 与 Composer。DSHcraft 只注册一层可逆的世界 Overlay，并在进入工作台时露出、换肤原生界面。

这种方式避免在第二个 React Root 中重复挂载 Session/Conversation，从而保护草稿、附件、流式状态和 Session 生命周期的一致性。

## 开发

### 环境要求

- Node.js 22+
- pnpm
- 可运行的 DeepSeek Harness Web 环境

### 常用命令

```bash
pnpm install
pnpm test
pnpm run build
pnpm run verify
```

- `pnpm test`：运行背包、合成、移动、Session 命令、模型、世界、工作小狗和掉落物测试。
- `pnpm run build`：生成 `lib/client.js` 与内联样式。
- `pnpm run verify`：依次执行语法检查、测试、构建和产物检查。

修改 Client 源码后必须重新运行 `pnpm run build`。

### 安全测试流程

不要在主 Web profile 或当前生产浏览器中直接启用候选版本：

1. 使用 `guardian_stage_plugin` 或部署提供的 `dsh-guardian plugin stage` 流程暂存插件。
2. 在独立 canary profile / 端口中验证。
3. 由用户确认后再通过 Guardian promote。
4. 浏览器自动化只使用一个独立测试 profile，结束后关闭该浏览器实例。

## 持久化

游戏状态通过 Host Bridge 写入 DSH 数据目录。能力与社区状态位于：

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

## License

项目代码采用 [MIT License](./LICENSE)。

像素字体使用 Monocraft，其许可文件位于 [`licenses/Monocraft-LICENSE.txt`](./licenses/Monocraft-LICENSE.txt)。Minecraft 是 Mojang Studios 的商标；本项目与 Mojang Studios 或 Microsoft 无隶属关系。
