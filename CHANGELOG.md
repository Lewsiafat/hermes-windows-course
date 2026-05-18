# Changelog

本專案遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) 格式，版號採 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [Unreleased]

### Added

- **Course hub landing page (`index.html`)**：列出所有 lesson 的目錄頁，Pico grid 卡片版面（上 2 下 3），不載入 `wizard.js`。學員第一次訪站可直接挑路徑（Windows / macOS / 進階整合）。
- 每個 lesson 與 macOS 頁的 footer 新增「課程首頁」連結，可從任一頁回到 hub。

### Changed

- **`index.html` 變成 landing hub，原 Lesson 1 內容搬到 `lesson-1.html`**（內容完全不動，含 `<body data-storage-key>` 不變，學員既有 localStorage 進度仍對得上）。
- 舊 deep link `index.html#step-N` 由新 `index.html` 的 inline `<script>` 重導到 `lesson-1.html#step-N`，舊書籤不會壞。
- `lesson-2.html` / `lesson-3.html` / `lesson-4.html` / `mac.html` 內所有 `href="index.html"` cross-ref 改為 `lesson-1.html`（含 `#step-7` 補救連結）。
- README / CLAUDE.md 同步更新檔案結構描述。

## [1.0.0] - 2026-05-18

首次正式 release。涵蓋 Windows / macOS 安裝路徑 + 三條第三方串接（Telegram、LINE、日常使用），各 lesson 可獨立或依序教學。

### Added

#### 教學內容

- **Lesson 1** — `index.html`：Windows + WSL2 + hermes-agent 安裝精靈（Step 0 前言 + 9 步，60 分鐘）。涵蓋 OpenRouter 申請、`hermes setup` 5-prompt 流程、第一次對話、加碼 A/B 出口（→ Lesson 4 / Lesson 2）。
- **Lesson 2** — `lesson-2.html`：Telegram 整合（Step 0 + 7 步，30–45 分鐘）。BotFather + `@userinfobot` + `hermes gateway` 原生 lifecycle，含 paste-fallback sed 補救腳本（`USER_ID` 變數，避開 bash readonly `UID` 衝突）。
- **Lesson 3** — `lesson-3.html`：hermes 日常使用入門（Step 0 + 5 步，45–55 分鐘）。對話式 cron + 用 `skill-creator` 造自己的 skill，含 `/daily-journal` Telegram end-to-end。
- **Lesson 4** — `lesson-4.html`：LINE 整合（Step 0 + 7 步，60 分鐘）。ngrok 公網隧道 + LINE Console webhook 設定 + bash heredoc 互動式 `.env` 寫入（取代 nano flow）。
- **macOS 安裝課程** — `mac.html`：macOS 路徑（無 WSL2，直接安裝）。

#### 共用基礎

- `wizard.js` — Hash routing (`#step-N`) + `localStorage` 進度持久化 + `<body data-total-steps>` / `data-storage-key` 參數化（無 fallback，fail loud 設計）+ `<pre data-copy>` 自動注入 Copy 按鈕。
- `style.css` — Pico CSS default 的版面 / RWD 覆寫。

#### 文件與驗證流程

- `pre-class-checklist.md` — 教學前 10–15 min 人類版 smoke test。
- `ai-runbook.md` — AI 工具（Computer Use / Skyvern 等）版 runbook，含 Full Capture Run + Quick Smoke Test。
- `docs/superpowers/specs/` — 各 lesson 設計規格。
- `docs/superpowers/plans/` — 實作計畫。

[1.0.0]: https://github.com/lewsiafat/hermes-windows-course/releases/tag/v1.0.0
