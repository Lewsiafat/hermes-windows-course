# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案性質

純靜態 GitHub Pages 教學站，**已上線於 https://lewsiafat.github.io/hermes-windows-course/**。教材語言為繁體中文 (zh-Hant)。

**沒有 build step、沒有 framework、沒有測試套件、沒有 package.json。** 只有一個 landing `index.html` + 多支 `lesson-N.html` / `mac.html` + 一支 CSS + 一支 JS + 兩份 markdown runbook。

### 由來與走向

- **由來**：本 repo 最初由另一個 spec/plan 專案產出（見 `docs/superpowers/{specs,plans}/`），現在是獨立維護。改動時若要回溯設計意圖，先翻 specs，但**不要把 specs 當成限制當下方向的法律**。
- **原本範圍**：60 分鐘從零裝好 [hermes-agent](https://github.com/NousResearch/hermes-agent)、完成第一次對話。
- **現在走向**：擴展成 **「如何使用 hermes-agent 的完整教材」**，安裝只是其中一塊。新增內容時要意識到：這不再只是「安裝精靈」，而是 hermes 的整體入門教材，未來會涵蓋使用層面的章節。

### Lesson／頁面地圖

- `index.html` — 課程目錄（landing hub）
- `lesson-1.html` — **Windows 安裝**（9 步，storage key `hermes-course-step`）
- `mac.html` — **macOS 安裝**，lesson-1 的平行版（7 步，`hermes-mac-course-step`），從 index/lesson-1 的「macOS 版本」連入
- `lesson-2.html` — **Telegram 整合**（7 步）
- `lesson-3.html` — **日常使用 / cron + tool-use**（5 步，假設 Lesson 1+2 已完成）
- `lesson-4.html` — **LINE 整合**（7 步）
- `lesson-5.html` — **進階使用 / 每日晨報自動化**（5 步，`hermes-lesson5-step`，假設 Lesson 1+2+3 已完成）

## 開發指令

```bash
# 本地預覽（無 server，直接用瀏覽器開）
open index.html          # macOS（本 repo 維護機）
xdg-open index.html      # Linux
# 或瀏覽器手動開啟此檔

# 部署
git push                 # GitHub Pages 自動發佈，10–30s 生效
```

不需要 `npm install`、不需要起任何 dev server。Pico CSS 從 jsdelivr CDN 載入。

### Release

版本記錄在 `CHANGELOG.md`（Keep a Changelog 格式），對應 git annotated tag `vX.Y.Z`。Semver：lesson 新增 / 大改 = minor，bug fix / 文字修正 = patch。release 時 README.md 的「目前版本」連結要一併更新。

## 架構重點（big picture）

### Landing page (`index.html`)

- `index.html` 是課程目錄（landing hub），**不載入 `wizard.js`**、沒有 `<body data-total-steps>` / `data-storage-key`。
- 只有兩件事：列出所有 lesson 卡片、以及把舊 deep link `#step-N` 用 inline `<script>` 重導到 `lesson-1.html#step-N`（保留舊書籤）。
- 改 landing 卡片內容直接編輯 `index.html` 的 `<article>`；不要把 wizard 機制塞進來。

### Lesson 精靈的運作（以 Lesson 1 為例：Step 0 + 9 個安裝步驟）

1. `lesson-1.html` 用 `<section class="step" data-step="N">` 切出區塊：`data-step="0"` 是前言（為什麼選 hermes），`data-step="1"` 到 `data-step="9"` 是安裝流程。**只有當前步驟 visible，其他 `hidden`。**
2. `wizard.js` 用 URL hash (`#step-N`) 當 source of truth，配合 `localStorage['hermes-course-step']` 記住進度（學員重啟 Windows 後回來會自動跳回正確步驟）。預設首頁是 Step 0；範圍檢查為 `n >= 0 && n <= TOTAL_STEPS`。
3. **`TOTAL_STEPS` 與 `STORAGE_KEY` 從 `<body>` data-attributes 讀**：`wizard.js` 不再硬編碼，每支 lesson HTML 用 `<body data-total-steps="N" data-storage-key="...">` 自己宣告。新增 / 刪除 lesson 步驟時改 `<body>` attribute + 同步改該頁所有 `Step N / X` 文字。**不要在 wizard.js 寫 fallback**：fail loud 是設計，attribute 漏寫應該讓 console 噴錯而不是降級。
4. 進度文字 (`#progress-text`)：Step 0 顯示「前言」，Step 1–9 顯示 `Step N / 9`。
5. 任何 `<pre data-copy>` 區塊會被 `wizard.js` 自動注入「Copy」按鈕。新增可複製指令時用這個 attribute，不要自行加按鈕 markup。

### 內容編輯流程

- 改步驟內容 = 編輯對應的 `lesson-N.html` / `mac.html` 的 `<section data-step="N">`。零 build。改課程目錄則改 `index.html` 的 `<article>`。
- 樣式只調 `style.css` 裡的覆寫；版面骨架靠 Pico CSS 的 default styles。
- **截圖存 `assets/screenshots/<filename>.png`**，檔名規則嚴格遵守 `ai-runbook.md` §截圖規範（小寫、連字號、`step-N-*`）。

### 兩份必讀的 runbook

這兩份不只是文件，是**教材正確性的測試替身**：

- `pre-class-checklist.md` — 人類版 smoke test，每次教學前 10–15 min 跑完。**重點檢查 3 個最容易壞的地方**：install.sh URL 是否還是 200、`hermes setup` 提示順序、OpenRouter UI。
- `ai-runbook.md` — AI 工具版（Computer Use / Skyvern 等）的完整螢幕控制 runbook，分 Part 1 (Full Capture Run, 60–90 min) 和 Part 2 (Quick Smoke Test, 10–15 min)。

> **變更教材時的隱性合約**：如果你改了 `lesson-1.html`（或任何 lesson）的步驟順序、指令、或 `hermes setup` 流程，必須對應檢查這兩份 runbook 的 stage 是否還對得上。它們之間沒有自動 lint。

### `mac.html` ↔ `lesson-1.html` 平行維護合約

`mac.html` 是 lesson-1（Windows 安裝）的 macOS 對應版，兩者走同一條旅程（裝 hermes → OpenRouter key → `hermes setup` → 首次對話）。改 lesson-1 的安裝步驟、hermes 版本、`hermes setup` 提示順序或 OpenRouter UI 描述時，**必須檢查 `mac.html` 是否要同步**。`pre-class-checklist.md` 列的 3 個最易壞點對兩頁都適用。兩頁之間沒有自動 lint。

### 設計與實作文件

- `docs/superpowers/specs/` — 課程設計規格（學員定位、時間表、教學原則）
- `docs/superpowers/plans/` — 實作計畫

改動方向有疑慮時先去 specs 確認原始設計意圖（特別是「為什麼選 OpenRouter free model」「為什麼 9 步而不是更少」這類問題）。

## 重要慣例

- **不要把這份教材設計成多語**，spec 明確只做 zh_TW。
- **不要加上 build tooling**（webpack / vite / 任何 bundler）— 「零 build、雙擊任一 HTML 就能改」是核心設計目標。
- **`<details>` block 是教學節奏的一部分**：用來放「等下載時可以順便讀」「🚨 我卡住了」這類 optional content，不要把它們扁平化成普通段落。
- 修改完 smoke test 確認的條目（hermes 版本、Windows 版本、最後驗證日期）後，要更新 README.md 的「上次驗證」區塊。

## 跨步驟引用（不可任意刪除）

某些步驟之間有 cross-reference，重構時請維持引用關係：

- **Step 7「補救：直接改 hermes 的 .env」section（Variant A / B 兩個 sed 腳本）** ← 被 Step 8「我卡住了」的 400 error 條目直接引用。改寫或搬位置時必須同步更新 Step 8 的指路文字。
- 該 sed 腳本（含 `export` 前綴的替換寫法）是 hermes 上游官方暫未修正 paste 問題的**繞行解**，**寫法原樣引用、不可擅自簡化**（例如不要拿掉 `export`、不要改 sed delimiter）。

### Lesson 之間（lesson-1.html ↔ lesson-2.html / lesson-3.html / lesson-4.html / lesson-5.html）

- **Lesson 1 `lesson-1.html` Step 9 加碼 A 末段** → 連到 `lesson-4.html`。改寫加碼 A 時必須保留這個出口（與加碼 B → Lesson 2 對稱）。
- **Lesson 1 `lesson-1.html` Step 9 加碼 B 末段** → 連到 `lesson-2.html`。改寫加碼 B 時必須保留這個出口。
- **Lesson 2 `lesson-2.html` Step 7「下次預告」第一條** → 連到 `lesson-3.html`。改寫 Step 7 預告區時必須保留這個出口（與 Lesson 1 加碼 B → Lesson 2 對稱）。
- **Lesson 3 `lesson-3.html` Step 0 「必備：先做完 Lesson 1 + Lesson 2」`<details>`** → fallback 連到 `lesson-1.html` + `lesson-2.html`、並 call out 教學場景假設付費 model。改 Step 0 文案時保留這兩個 fallback 連結（Lesson 3 假設 Lesson 1+2 已完成）+ 付費 model call out（spec 2026-05-14 §1 audience 假設）。
- **Lesson 3 Step 2「2 分鐘後跑 ⟨天氣+降雨+SP500⟩」cron prompt** 是學員第一次接觸 cron + tool-use 組合的範本。**不可任意換成簡單範例**（換掉就失去「cron + 多 tool 一次 demo」的 hands-on 價值）。若 dogfood 階段發現 hermes 拿不到 SP500（缺財經 skill），可改其他「多 source 一次」組合（例如 SP500 → 鴻海昨日收盤、或加一條台北空氣品質），但不可降級成單一資訊。
- **Lesson 3 `lesson-3.html` Step 5「下次預告」** → 連到 `lesson-5.html`（與 Lesson 4 並列）。改寫 Step 5 預告區時必須保留這個出口（Lesson 5 接在「日常使用」之後）。注意：該處原本的「Lesson 5（待開）= 進階 skill 寫法」舊預告已改寫成真 Lesson 5（晨報自動化），skill-authoring 主題降級為「更之後」無編號；加碼 D 末段同步去除舊 Lesson 5 指向。
- **Lesson 5 `lesson-5.html` Step 0「必備：先做完 Lesson 1+2+3」`<details>`** → fallback 連到 `lesson-1/2/3.html`（Lesson 5 假設 1+2+3 已完成、教學場景付費 model）。改 Step 0 文案時保留這三個 fallback 連結 + 付費 model call out。
- **Lesson 5 Step 2/4 `morning-brief` skill 的多 source 組合（天氣+新聞+提醒）不可降級成單一資訊**（同 Lesson 3 Step 2 cron prompt 守護精神）。新聞當天抓不到時 fallback 成「天氣+提醒」，但不可砍到只剩一項。
- **Lesson 5 Step 3 cron 投遞「跟著 channel 走」** 是 dogfood 實證機制：cron prompt 不需寫「推到 X」，投遞自動綁定建 cron 的 channel。這是 channel-agnostic skill 架構的關鍵賣點，改 Step 3 時保留這個 callout。cron 設定檔路徑 `~/.hermes/cron/jobs.json` 與 Lesson 3 一致。
- **Lesson 5 Step 5「下次預告」→ Lesson 6（待開）gateway install 24/7 常駐**。這是 Lesson 2 Step 5 / 下方 gateway install「留給後續課程」伏筆的正式落點（Lesson 5 明確假設「機器醒著」，把常駐維運外推給 Lesson 6）。
- **Lesson 2 `lesson-2.html` Step 0 / Step 1** → 提到沒做過 Lesson 1 請先去 `lesson-1.html`。改 Step 0 / Step 1 文案時保留這個 fallback 連結。
- **Lesson 2 Step 4 補救 section** → cross-ref `lesson-1.html#step-7`，提示是同根因（hermes 上游 paste 雷）。Lesson 1 Step 7 搬位置或 anchor 改名時，Lesson 2 Step 4 的連結要對應改。
- Lesson 2 Step 4 的兩段 sed 補救（Variant A 互動 + Variant B 手動範本）跟 Lesson 1 Step 7 同模式但操作不同變數（`TELEGRAM_BOT_TOKEN` / `TELEGRAM_ALLOWED_USERS`，含 `export`）—— **寫法原樣引用、不可擅自簡化**。
- **Lesson 2 Step 5 用 hermes 原生 lifecycle**（`hermes gateway run` / `status` / `stop` / `restart`，log 路徑 `~/.hermes/logs/gateway.log`），`pkill` 只當 fallback。`hermes gateway install`（systemd 24/7 服務）是「out of scope, 留給後續課程」——加碼 5 提及但不展開。此伏筆的正式落點是 **Lesson 6（待開）**，由 `lesson-5.html` Step 5 預告指向。
- **Lesson 2 Variant A sed 用 `USER_ID` 變數名**（不是 `UID`，因為 `UID` 是 bash readonly built-in，會靜默賦值失敗導致 .env 寫入學員的系統 UID 數字）。修補救腳本時切勿改回 `UID`。
