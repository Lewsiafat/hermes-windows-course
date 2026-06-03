# Changelog

本專案遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) 格式，版號採 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [Unreleased]

## [1.1.0] - 2026-06-03

新增 Lesson 5（進階使用 / 每日晨報自動化）與 course hub landing page，並擴充 / 修正 Lesson 2–4 多處。

### Added

- **Lesson 5** — `lesson-5.html`：進階使用 / 每日晨報自動化（Step 0 + 5 步，30–40 分鐘）。cron 觸發自製 `morning-brief` skill，把天氣 + 新聞頭條 + 今日提醒整理成晨報推到 Telegram。skill 為 channel-agnostic，投遞跟著「你建 cron 的 channel」走（dogfood 實證）。前置 Lesson 1+2+3；常駐維運（`gateway install`）留給 Lesson 6。
- **Course hub landing page (`index.html`)**：列出所有 lesson 的目錄頁，Pico grid 卡片版面，不載入 `wizard.js`。學員第一次訪站可直接挑路徑（Windows / macOS / 進階整合）。
- 每個 lesson 與 macOS 頁的 footer 新增「課程首頁」連結，可從任一頁回到 hub。
- **Lesson 2 擴充**：group / DM / mention / pairing 章節 + 對應 smoke test 條目。
- **Lesson 3**：skill 載入方法表（`reload-skills` / `/new` / `/skill`）、針對未知來源 skill 的安全警告、安全 skill 探索資源區。
- **CLAUDE.md**：Lesson／頁面地圖、`mac.html ↔ lesson-1` 平行維護合約、macOS `open` 本地預覽指令。
- Lesson 5 設計與實作文件（`docs/superpowers/specs/` + `plans/`）。

### Changed

- **`index.html` 變成 landing hub，原 Lesson 1 內容搬到 `lesson-1.html`**（內容完全不動，含 `<body data-storage-key>` 不變，學員既有 localStorage 進度仍對得上）。
- 舊 deep link `index.html#step-N` 由新 `index.html` 的 inline `<script>` 重導到 `lesson-1.html#step-N`，舊書籤不會壞。
- `lesson-2.html` / `lesson-3.html` / `lesson-4.html` / `mac.html` 內所有 `href="index.html"` cross-ref 改為 `lesson-1.html`（含 `#step-7` 補救連結）。
- `lesson-3.html` 的 provider / model 切換說明與 cron 範例。
- README / CLAUDE.md 同步更新檔案結構與 Lesson 地圖。

### Fixed

- `/skills list` 系列指令標明 **TUI-only**、Telegram bot 不支援。
- `lesson-3.html` cron 設定檔路徑 `cron.yaml` → `cron/jobs.json`。
- 兩份 runbook（`pre-class-checklist.md` / `ai-runbook.md`）Lesson 3 段殘留的 `~/.hermes/cron.yaml` → `~/.hermes/cron/jobs.json`（dogfood 證實）。
- skill 資源區從 `lesson-4.html` 移到 `lesson-3.html`（位置更合理）。

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

[1.1.0]: https://github.com/lewsiafat/hermes-windows-course/releases/tag/v1.1.0
[1.0.0]: https://github.com/lewsiafat/hermes-windows-course/releases/tag/v1.0.0
