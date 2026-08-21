<p align="center">
  <img src="./banner.png" alt="DSHcraft — Play Your Agent Workspace" width="100%">
</p>

[![npm](https://img.shields.io/npm/v/dsh-minecraft-ui?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/dsh-minecraft-ui) [![動画デモ](https://img.shields.io/badge/Bilibili-Video_Demo-00A1D6?style=for-the-badge&logo=bilibili&logoColor=white)](https://www.bilibili.com/video/BV1d48c6BEPj) [![Afdian](https://img.shields.io/badge/Afdian-Support_Me-FF69B4?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://www.ifdian.net/item/1a20ed042f0711f1865a52540025c377) [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.creem.io/payment/prod_1yc40mIhKwwrc7iqFOG9G2) [![GitHub Stars](https://img.shields.io/github/stars/TFboy1/dsh-minecraft-ui?style=for-the-badge&logo=github&color=F5C542)](https://github.com/TFboy1/dsh-minecraft-ui/stargazers) [![License](https://img.shields.io/github/license/TFboy1/dsh-minecraft-ui?style=for-the-badge&color=4C8EDA)](../LICENSE)

[![CI](https://img.shields.io/github/actions/workflow/status/TFboy1/dsh-minecraft-ui/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/TFboy1/dsh-minecraft-ui/actions/workflows/ci.yml) [![npm downloads](https://img.shields.io/npm/dm/dsh-minecraft-ui?style=flat-square&logo=npm)](https://www.npmjs.com/package/dsh-minecraft-ui) [![DSH](https://img.shields.io/badge/DeepSeek_Harness-Web-5CDB95?style=flat-square)](#概要) [![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?style=flat-square&logo=threedotjs)](https://threejs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Node.js-22+-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[![简体中文](https://img.shields.io/badge/简体中文-README-blue?style=flat-square)](../README.md) [![English](https://img.shields.io/badge/English-README-blue?style=flat-square)](./README_EN.md) [![日本語](https://img.shields.io/badge/日本語-現在の言語-red?style=flat-square)](#) [![Français](https://img.shields.io/badge/Français-README-blue?style=flat-square)](./README_FR.md) [![Deutsch](https://img.shields.io/badge/Deutsch-README-blue?style=flat-square)](./README_DE.md)

<p align="center">
  DeepSeek Harness を、遊べる Minecraft 風 Agent ワークスペースへ。<br>
  <sub>ボクセル世界を探索 · モデルを装備 · 推論強度をエンチャント · 稼働中の Agent と冒険</sub>
</p>

## インストール

DSHcraft は `dsh.bundle` と `dsh.client` の両方を宣言する正式なコンボパッケージです。インストールすると、安定した Cordis 行 `minecraft-ui` を追加し、ブラウザーモジュールは `dsh-minecraft-ui` として登録されます。

候補版を普段使いのメイン Web profile で直接有効にしないでください。まず独立した canary profile に導入し、構成レイヤーを確認したうえで、Guardian の stage / canary / promote フローで昇格してください。

### npm（推奨）

```bash
dsh plugin --profile <canary> add dsh-minecraft-ui
dsh --profile <canary> --dump-config
```

### ローカル tarball

```bash
pnpm install
pnpm run verify
pnpm pack
dsh plugin --profile <canary> add ./dsh-minecraft-ui-0.3.0.tgz
dsh --profile <canary> --dump-config
```

### Git commit を固定

```bash
dsh plugin --profile <canary> add github:TFboy1/dsh-minecraft-ui#<commit-sha>
```

Git からのインストールでは `prepare` ビルドが実行されます。pnpm 10+ では、このインストールスクリプトを明示的に許可する必要があります。信頼できるソースだけを許可し、DSH が表示する正確なパッケージキーで `allowBuilds: dsh-minecraft-ui` を設定してください。インストール時のビルド権限を与えたくない場合は、npm のビルド済みパッケージまたは tarball を使用してください。

アンインストール：

```bash
dsh plugin --profile <canary> remove dsh-minecraft-ui
```

## 概要

DSHcraft はチャット画面を再実装するものではありません。Cordis Client Plugin として公式の `shell.overlay` にマウントされ、DSH 標準の Workspace、Session、Conversation、Trajectory、Composer、権限、モデル選択、コンテキスト統計をそのまま保ちます。変えるのは入口、空間的な比喩、そして見た目だけです。

## 画面プレビュー

<p align="center">
  <a href="https://www.bilibili.com/video/BV1d48c6BEPj"><strong>▶ Bilibili で DSHcraft の完全な動画デモを見る</strong></a>
</p>

<table>
  <tr>
    <td align="center" width="50%"><strong>遊べるボクセル世界</strong><br><img src="./screenshots/voxel-world.png" alt="DSHcraft のボクセル世界と HUD"></td>
    <td align="center" width="50%"><strong>インベントリとクラフト</strong><br><img src="./screenshots/inventory-crafting.png" alt="DSHcraft のインベントリ、ホットバー、クラフト画面"></td>
  </tr>
  <tr>
    <td align="center" width="50%"><strong>Agent プラグインチェスト</strong><br><img src="./screenshots/agent-plugin-chest.png" alt="Agent プラグインチェストとツール詳細"></td>
    <td align="center" width="50%"><strong>モデル倉庫</strong><br><img src="./screenshots/model-chest.png" alt="モデル倉庫と装備中のモデル"></td>
  </tr>
  <tr>
    <td align="center" width="50%"><strong>推論強度のエンチャント</strong><br><img src="./screenshots/reasoning-enchantment.png" alt="推論強度の選択画面"></td>
    <td align="center" width="50%"><strong>意味を持つ施設</strong><br><img src="./screenshots/enchanting-table.png" alt="エンチャントテーブルと操作ヒント"></td>
  </tr>
</table>

## コアコンセプト

| DSH の概念 | DSHcraft での表現 |
| --- | --- |
| 実行中の作業 | 室内で働く犬 |
| Agent の最新進捗 | 犬の頭上にあるステータス看板 |
| Model | 装備 |
| Reasoning effort | エンチャント |
| Tool / Plugin capability | チェスト内のアイテム |
| Chat / Composer | 作業台 |
| Context / Token | 経験値バーとインベントリ負荷 |
| Memory | エンダーチェスト風の長期保存メタファー（予約） |
| MCP | レッドストーンシステム（予約） |
| Workspace / Project | 地図と製図台 |
| Community Plugin | フィールドにあるコミュニティチェスト |

## 機能

### ブロック世界

- Three.js を使った一人称視点のボクセル世界。
- 移動、ジャンプ、ダッシュ、スニーク、採掘、ブロック設置、ホットバー切り替え。
- ワールド差分、プレイヤー位置、インベントリ、チェスト、選択状態を永続化。
- 破壊したブロックは飛び出し、落下、回転、取得待ち、近接自動取得を備えたドロップになります。
- インベントリが満杯の場合、拾えなかった残数はワールドに残ります。

### DSH ネイティブ作業台

`G` キー、または室内の作業台から Minecraft 風の DSH ネイティブ画面に入れます。

- Workspace / Project フォルダーの展開、折りたたみ、並び替え。
- Session の新規作成、オープン、名前変更、Fork、アーカイブ。
- 標準の Conversation / Trajectory ビューと履歴ページング。
- 標準の Composer、Queue、Steer、Stop、Slash Command、添付処理。
- 標準の権限モード、承認、モデル、推論強度、Context、Token 統計。
- ネイティブ会話機能を置き換えない追加の 3×3 クラフトパネル。

### 働く犬

- **現在実行中の作業**にだけ犬が生成され、アイドル Session には出現しません。
- 1 匹の犬が 1 つの実行中 Session 作業に対応します。
- 看板には思考、応答ストリーム、Tool Call、コマンド、キュー、承認待ち、エラー、コンテキスト整理などの最新状態が表示されます。
- Tool Call に応じて犬が対応施設へ移動します：Read → 資料本棚、Command → Agent 端末、Web Search → 製図台、Write / Edit → 作業台。
- 犬を右クリックすると対応 Session に切り替わり、ネイティブ作業台が直接開きます。

### 意味を持つ施設

| 施設 | 機能 | ショートカット |
| --- | --- | --- |
| 作業台 | DSH ネイティブ会話と 3×3 クラフト | `G` |
| モデルチェスト | モデルの閲覧と装備 | `M` |
| プラグインチェスト | 現在の Agent が使えるツールを管理 | `P` |
| エンチャントテーブル | 推論強度を調整 | `R` |
| 製図台 | Workspace / Project マップを閲覧 | `N` |
| コミュニティプラグインチェスト | コミュニティカタログを探索 | `L` |
| 資料本棚 | Read ツールの活動場所 | — |
| Agent 端末 | Command ツールの活動場所 | — |
| 掲示板 | 操作チュートリアル | — |

作業台、チェスト、エンチャントテーブル、本棚、端末、製図台などは破壊すると自身をドロップし、インベントリに入れて再設置できます。初期バージョンの誤ったドロップ規則で失われた室内の主要施設は、古いセーブで一度だけ復元されます。

## 操作方法

| 入力 | 動作 |
| --- | --- |
| `W A S D` | 移動 |
| `Space` | ジャンプ |
| `Ctrl` | ダッシュ |
| `Shift` | スニーク |
| マウス移動 | 視点移動 |
| 左クリック長押し | ブロックを採掘 |
| 右クリック | ブロック、施設、働く犬を使用 |
| 中クリック | 対象ブロックを選択 |
| ホイール / `1`–`9` | ホットバー切り替え |
| `E` | インベントリ |
| `F` | オフハンドと交換 |
| `T` | ゲーム内チャット |
| `Tab` | Session 一覧 |
| `Esc` | ゲームメニュー |
| `G` | ネイティブ作業台 |
| `M` | モデルチェスト |
| `P` | プラグインチェスト |
| `R` | エンチャントテーブル |
| `N` | Workspace マップ |
| `L` | コミュニティプラグインチェスト |

最初に画面をクリックすると、ブラウザーが Pointer Lock を要求します。いずれかの施設を開くと、マウスロックは直ちに解除されます。

## 設定

Bundle には安全な初期値が含まれます。対象 profile の後段 patch で安定行 `minecraft-ui` を上書きできます。

```yaml
- id: minecraft-ui
  config:
    dataDirectory: dshcraft
    catalogUrl: https://awesome-dsh-plugin.com/plugins.json
    catalogCacheTtlMs: 21600000
    catalogLimit: 2000
    confirmationTtlMs: 60000
```

| フィールド | 既定値 | 説明 |
| --- | ---: | --- |
| `dataDirectory` | `dshcraft` | `$DSH_HOME` 内の安全な相対ディレクトリ |
| `catalogUrl` | コミュニティカタログ URL | HTTP(S) のみ |
| `catalogCacheTtlMs` | `21600000` | カタログキャッシュ時間 |
| `catalogLimit` | `2000` | 最大エントリ数（1–5000） |
| `confirmationTtlMs` | `60000` | 確認トークンの有効期間 |

Cordis は Schemastery で設定を検証し、初期値を補完します。不正なパス、プロトコル、数値範囲はプラグイン有効化時に直ちにエラーになります。

## コミュニティプラグインのセキュリティ

コミュニティプラグインは「発見 → 収集 → 確認 → 明示的承認」の流れを採用します。承認結果は常に **dry-run** です。DSHcraft 自身が CLI を起動したり profile を変更したりすることはありません。候補は Guardian stage に渡し、独立 canary で検証した後、ユーザーが promote を判断します。

## アーキテクチャ

```text
dsh-minecraft-ui/
├─ src/index.js                    # Host プラグイン、Config、RPC、永続化
├─ cordis.patch.yml                # dsh.bundle の構成レイヤー
├─ client/src/index.jsx            # shell.overlay 登録とスタイルライフサイクル
├─ client/src/game-root.jsx        # DSH 状態バインドとゲーム UI 構成
├─ client/src/engine.js            # Three.js 世界、操作、ドロップ、働く犬
├─ client/src/world.js             # 地形、建物、ブロック、セーブ移行
├─ client/src/inventory/           # クラフト、コンテナ、インベントリ状態機械
├─ client/src/dsh/                 # Session 投影、ツールルーティング、コミュニティ戦利品
├─ client/src/ui/                  # 作業台、チェスト、マップ、HUD
├─ scripts/build.mjs               # Host / Client の決定的ビルド
├─ lib/index.js                    # ビルド済み Host エントリ
├─ lib/client.js                   # lazy-CJS ブラウザーバンドル
└─ test/                           # Node test runner テスト
```

公式 DSH Root と AppFrame が Sidebar、Conversation、Details、Composer を引き続き所有します。DSHcraft は可逆な世界 Overlay だけを登録するため、別の React Root に Session / Conversation を二重マウントせず、下書き、添付、ストリーミング状態、Session ライフサイクルの一貫性を守ります。

## 開発

要件：Node.js 22+、pnpm 11+、動作する DeepSeek Harness Web 環境。

```bash
pnpm install
pnpm test
pnpm run build
pnpm run package:check
pnpm run verify
pnpm pack --dry-run
```

Client ソースを変更した後は `pnpm run build` を再実行してください。フロントエンドの手動確認は独立した canary profile で行います。

## 永続化

```text
$DSH_HOME/dshcraft/capabilities.json
$DSH_HOME/dshcraft/community.json
$DSH_HOME/dshcraft/community-cache.json
```

ワールド、プレイヤー、インベントリのセーブはゲーム永続化サービスが管理します。DSH Session ログを直接編集しないでください。

## 既知の制限

- キーボードとマウス向けで、タッチ操作のゲームモードは未対応です。
- 完全な Minecraft 実装ではなく、DSH の空間的テーマ／クライアントです。
- コミュニティカタログが利用できない場合は、キャッシュまたは内蔵候補にフォールバックします。
- 一部の施設は DSH の意味マッピングであり、Minecraft の通常ブロックと完全には同じ動作をしません。
- Client バンドルには Three.js と埋め込みフォントが含まれ、2 MB 未満の明示的なサイズ予算があります。

## ライセンス

プロジェクトコードは [MIT License](../LICENSE) で公開されています。

ピクセルフォントには Monocraft を使用し、ライセンスは [`licenses/Monocraft-LICENSE.txt`](../licenses/Monocraft-LICENSE.txt) にあります。Minecraft は Mojang Studios の商標です。本プロジェクトは Mojang Studios および Microsoft と関係ありません。
