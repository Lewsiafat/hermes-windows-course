# Changelog

本專案遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) 格式，版號採 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [Unreleased]

## [1.4.0] - 2026-07-11

新增「觀念四部曲」第 4 支 article 課程頁：AI Agent 使用（Context 管理 / MCP / Skill / 常見 AI Agent 選擇），並將「觀念三部曲」stage 全面改稱「觀念四部曲」。

### Added

- **`ai-agent-usage.html`**：新 article 課程頁，內容為既有獨立站 [ai-agent-usage-course](https://lewsi.ddns.net/ai-agent-usage-course/) 的逐字複製（沿用 agent-basics.html / rag-basics.html 的先例：article 頁是對應獨立站 `index.html` 的原樣拷貝，不加修改）。6 章：Context 管理／上下文管理／MCP 介紹／Skill 介紹／常見 AI Agent 的選擇／結業考，第 1 章內嵌互動「Context 儀表板」lab。
- **`course.json`**：`concepts` stage 新增第 4 筆頁面 entry（`ai-agent-usage.html`），stage 標題由「觀念三部曲」改為「觀念四部曲」。

### Changed

- **index.html**：hero-stats 課程數由 13 堂改為 14 堂；「先懂再上手」區塊標題與文案由「三部曲／這三堂」改為「四部曲／這四堂」；新增第 ④ 張課程卡片連到 `ai-agent-usage.html`；footer 版號更新為 `v1.4.0`。
- **README.md**、**CLAUDE.md**：課程頁總數 13 → 14，「觀念三部曲」→「觀念四部曲」，article 頁數 3 → 4。

## [1.3.0] - 2026-07-07

重構文件與課程資訊架構：新增 `course.json` 作為課程地圖的單一事實來源（SSOT），補齊自 v1.2.0 以來未記錄的內容（AI Agent 101 / RAG 101 / Git 基礎 / Hermes Vibe Coding / Skill 比較系列等），並修正 README.md、CLAUDE.md 中過時或錯誤的資訊。**未變動任何課程 HTML 頁面內容**，僅同步 `index.html` footer 版號。

### Added

- **`course.json`**：新增課程地圖 manifest，記錄 5 個階段、13 個頁面的 file / title / type（wizard 或 article）/ storageKey / stepsTotal / added（新增日期），作為往後新增或調整課程頁時第一個要改的檔案。
- **`scripts/check-course-map.mjs`**：零依賴 Node 腳本，檢查 `course.json`、`index.html`、實際 HTML 檔案三者是否一致（頁面存在性、`index.html` 連結、footer 版號）。

### Changed

- **README.md**：改寫為 AgentVibe 品牌定位，改用 5 階段總覽表格取代逐頁手寫清單，指向 `course.json` 作為 SSOT，誠實記錄「兩套設計文件並存、不整併」現況，修正過時的部署段落（auto-deploy 已確認正常運作）。
- **CLAUDE.md**：改寫「專案性質」「由來與走向」「Lesson／頁面地圖」等段落以反映實際 13 頁架構；新增「課程地圖 SSOT」與「新增課程頁的命名慣例」（root-level + kebab-case）說明；修正過時的 `assets/screenshots/` 參照（該目錄實際不存在）；Release 段落補充版號需同步的 3 處位置。所有安全關鍵的跨步驟引用合約、runbook 合約、mac.html 平行維護合約均保留原文，未變動語意。
- **index.html**：footer 版號由 `v1.0.0` 更新為 `v1.3.0`（唯一改動的課程頁面內容）。

## [1.2.0] - 2026-06-09

新增「桌面安裝程式」簡單路線（Hermes Desktop Installer），並把安裝指令的 install.sh 改用官方現行 vanity URL。

### Added

- **Lesson 1 / macOS 頁新增「簡單路線」分岔**：`lesson-1.html`、`mac.html` 的 Step 1 新增「安裝有兩條路線」雙欄卡片 + 桌面安裝程式流程（Windows `.exe` / macOS `.dmg`，下載頁 https://hermes-agent.nousresearch.com/desktop 標示 v0.16.0）。推薦給只想趕快用起來、不想碰終端機的非開發者；既有 WSL2／終端機路線原樣保留為「完整路線」，`wizard.js` 與 `TOTAL_STEPS`（9 / 7）不變。簡單路線含誠實揭露摺疊（依官方文件撰寫、未經 smoke test、裝不起來可改走完整路線）。

### Changed

- **install.sh 改用官方 vanity URL**：`lesson-1.html` Step 6 與 `mac.html` Step 4 的安裝指令由 `raw.githubusercontent.com/.../scripts/install.sh` 改為 `https://hermes-agent.nousresearch.com/install.sh`（舊 URL 仍回 200，屬現代化、非修壞）。`pre-class-checklist.md`、`ai-runbook.md` 的 URL 檢查段與 404 fallback 指引同步更新。

## [1.1.1] - 2026-06-04

### Fixed

- **部署流程修正**：GitHub Pages 的 push 後自動 build 自 2026-05-23 起失效，`git push` 不再自動更新網站。CLAUDE.md 與 README 的「部署」段改為「push 後手動觸發 `gh api --method POST .../pages/builds`」並標註以 `curl -sI` 驗證上線。

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

[1.1.1]: https://github.com/lewsiafat/hermes-windows-course/releases/tag/v1.1.1
[1.1.0]: https://github.com/lewsiafat/hermes-windows-course/releases/tag/v1.1.0
[1.0.0]: https://github.com/lewsiafat/hermes-windows-course/releases/tag/v1.0.0
