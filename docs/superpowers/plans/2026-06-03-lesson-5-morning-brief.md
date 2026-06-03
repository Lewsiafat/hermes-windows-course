# Lesson 5 · 每日晨報自動化 Implementation Plan

> **For agentic workers:** 每個 Task 對應一個 commit，用 checkbox (`- [ ]`) 追蹤。
> **Task 0（Dogfood）是 user-run，BLOCKS 其餘所有 Task**——動 `lesson-5.html` 之前必須先驗，因為教材的 copy-paste prompt、cron 路徑、fallback 文案都依賴 dogfood 實測結果。

**Goal:** 新增 `lesson-5.html`（進階使用：cron 觸發 `morning-brief` skill 推 Telegram 晨報），並同步更新 6 份 satellite 檔讓 cross-reference 不漏接。設計依據 spec `2026-06-03-lesson-5-morning-brief-design.md`。

**Architecture:** 純靜態 HTML，零 build / 零 test framework。verification = 瀏覽器手動 walk-through + Task 0 dogfood。`lesson-5.html` 由 Step 0 前言 + 5 個 `<section data-step="N">`（N=0..5）組成，`data-total-steps="5"`、`data-storage-key="hermes-lesson5-step"`。skill 為 channel-agnostic（gather+compose），投遞「推 Telegram」寫在 cron prompt。

**Tech Stack:** HTML5 + Pico CSS (CDN) + 共用 `wizard.js`（不動，已從 `<body data-*>` 參數化）+ `<pre data-copy>` 自動注入 Copy 鈕。教材 zh-Hant。

---

## File Structure

| 檔案 | 動作 | 責任 |
|---|---|---|
| `lesson-5.html` | **新增** | 主教材，Step 0 + 5 個 `<section data-step="N">`、`<pre data-copy>` prompts、每步 `<details>` troubleshoot |
| `index.html` | 卡片 patch | 課程目錄新增 Lesson 5 `<article>` 卡片 |
| `lesson-3.html` | 1 section patch | Step 5 加碼/預告區新增一條 → `lesson-5.html` 出口 |
| `CLAUDE.md` | section patch | Lesson 地圖加 `lesson-5` 行＋跨步驟引用加「L3→L5 出口」＋L5 多 source 守護條目 |
| `pre-class-checklist.md` | section 新增 | Lesson 5 必檢 3 條（skill-creator 可用 / cron 推 Telegram 通 / 新聞當天抓得到） |
| `ai-runbook.md` | 2 section 新增 | Part 1 full capture + Part 2 quick smoke 各補 Lesson 5 章 |
| `wizard.js` / `style.css` | **不動** | 已參數化 |
| `README.md` / `CHANGELOG.md` | release 時處理 | minor bump（新 lesson）——走 `/release`，不在本 plan 內 |

---

## Task 0: Dogfood 必驗（**user-run，BLOCKS Task 1+**）

依 spec §6 dogfood 驗證點。**動 `lesson-5.html` 之前必須驗**，結果記到本檔末段「Dogfood Results」。

**Files:** 無（runtime 行為驗證）

- [ ] **Dogfood 1：skill-creator 造得出 morning-brief（v1 天氣）**

  TUI 跑 `/skill-creator`，給種子 prompt：
  ```
  幫我造一個叫 morning-brief 的 skill。工作是：抓台北今天的天氣和降雨機率，整理成一則簡短的早安晨報訊息。
  ```
  驗證：skill 落地（`ls ~/.hermes/skills/` 看到 morning-brief，記下實際路徑/類別）、reload 後 `/morning-brief` 手動跑有產出（天氣+降雨）。

- [ ] **Dogfood 2：cron 觸發 skill → Telegram（管線）**

  對 hermes 講：
  ```
  5 分鐘後跑一次 morning-brief，把結果推到 Telegram
  ```
  驗證：**cron 設定真的被寫入**（`cat ~/.hermes/cron/jobs.json` ——若路徑/檔名不同記下實際的）、5 分鐘後 Telegram 真的收到天氣晨報。

- [ ] **Dogfood 3：cron 管理三式可用**

  依序講 `列出我現在所有 cron 排程` / `把 morning-brief 改成每天早上 7:00` / `刪掉 morning-brief 排程`，各驗證 hermes 有正確反應 + jobs.json 有對應變化。

- [ ] **Dogfood 4：skill-creator 能乾淨修訂既有 skill（養大）**

  重跑 `/skill-creator` 指向既有 morning-brief：
  ```
  幫我把 morning-brief 加兩件事：(1) 今天 3 條重點新聞頭條 (2) 結尾加一句今日提醒語。順序：天氣 → 新聞 → 提醒。
  ```
  驗證：skill 被修訂（非另造新 skill）、reload 後手動跑 → **天氣 + 3 條新聞 + 提醒**都在。

- [ ] **Dogfood 5：新聞 web-fetch 當天真的抓得到（主風險）**

  從 Dogfood 4 的輸出看 3 條新聞頭條是否真實、合理。
  **若抓不到/品質差：記下實際狀況，Step 4 教材改成「以天氣+提醒為主、新聞為加分」的寫法，並強化 fallback `<details>`（沿用 L3「那是 web/tool-use 議題、非 cron 議題」）。不可降級成單一 source（CLAUDE.md 守護條目）。**

---

## Task 1: 新增 `lesson-5.html`（主教材，1 commit）

**Files:** `lesson-5.html`（新增）

**Depends on:** Task 0（prompt 文案、cron 路徑、新聞 fallback 依 dogfood 結果定稿）

- [ ] 複製既有 lesson（建議 `lesson-3.html`）的 `<head>` / nav / footer 骨架，改 `<title>`、`<body data-total-steps="5" data-storage-key="hermes-lesson5-step">`
- [ ] **Step 0 前言**（`data-step="0"`）：為什麼學自動化 workflow ＋心智模型 trigger→gather→compose→deliver（一小段）＋前置 fallback 連結 `lesson-1/2/3.html`＋「假設 gateway 常駐、24/7 留給下一課」call out
- [ ] **Step 1 / 5 開始之前**：確認 hermes 在跑、Telegram 通、L3 cron 玩過
- [ ] **Step 2 / 5 造 v1 skill**：`/skill-creator` 種子 prompt（`<pre data-copy>`）＋「不要 eval、只 vibe」＋ reload-skills ＋手動跑驗證；`<details>` 🚨 skill 沒造出來/沒生效
- [ ] **Step 3 / 5 cron 觸發 + 管理**：5 分鐘測試 prompt → 看手機 → 改每天 07:00；cron 管理三式（`<pre data-copy>`）；cron 路徑用 Task 0 實測值；`<details>` 🚨 沒收到（gateway status / Telegram 連通 cross-ref L2）
- [ ] **Step 4 / 5 養大 skill**：重跑 `/skill-creator` 修訂 prompt（`<pre data-copy>`）→ reload → 重跑 cron 看完整晨報；`<details>` 🚨 新聞抓不到 fallback（依 Dogfood 5）
- [ ] **Step 5 / 5 完成**：串接鏈回顧、checkpoint 4 條、加碼（換 source/多城市/換時間）、**預告下一課 gateway install 24/7**（純文字，可連 hermes gateway 官方文件 URL）
- [ ] 確認每個 `Step N / 5` 文字與 `data-total-steps="5"` 一致；所有可複製指令用 `<pre data-copy>`（不自加按鈕）

## Task 2: 接上入口 + 課程目錄（1 commit）

**Files:** `index.html`, `lesson-3.html`

- [ ] `index.html` 新增 Lesson 5 `<article>` 卡片（對齊既有卡片 markup）
- [ ] `lesson-3.html` Step 5 加碼/預告區新增一條 → `lesson-5.html`（保留既有預告條目，新增不取代）

## Task 3: CLAUDE.md 同步（1 commit）

**Files:** `CLAUDE.md`

- [ ] Lesson 地圖新增 `- lesson-5.html — 進階使用 / 每日晨報自動化（5 步）` 一行
- [ ] 跨步驟引用「Lesson 之間」新增條目：**Lesson 3 Step 5 預告 → lesson-5.html**（標「改 L3 Step 5 預告區時保留 → L5 出口」）
- [ ] 新增 L5 守護條目：晨報多 source（天氣+新聞+提醒）不可降級成單一資訊（呼應 L3 cron prompt 守護條目）

## Task 4: 兩份 runbook 同步（1 commit）

**Files:** `pre-class-checklist.md`, `ai-runbook.md`

- [ ] `pre-class-checklist.md` 新增 Lesson 5 段，3 易壞點：① skill-creator 還能裝/用、造得出 skill ② cron 觸發推 Telegram 還通（5min 測試收得到）③ 新聞 web-fetch 當天抓得到嗎
- [ ] `ai-runbook.md` Part 1（full capture）+ Part 2（quick smoke）各新增 Lesson 5 stage

## Task 5: 瀏覽器 walk-through 驗證（無 commit / 或補截圖）

**Files:** 無（或 `assets/screenshots/lesson-5/step-N-*.png`）

- [ ] 雙擊 `lesson-5.html`：Step 0→5 切換正常、進度文字 `Step N / 5` 正確、`#step-N` deep link 正常、Copy 鈕都注入
- [ ] 從 `index.html` 卡片 + `lesson-3.html` Step 5 出口都能正確連到 lesson-5
- [ ] （可選）dogfood 時依 ai-runbook 命名規範補 `assets/screenshots/lesson-5/` 截圖

## Release（不在本 plan，完成後走 `/release`）

- 新 lesson → **minor bump**；更新 CHANGELOG.md、README.md「目前版本」+「上次驗證」、打 annotated tag、push。

---

## Dogfood Results

> Task 0 執行後在此記錄實測（特別是：morning-brief skill 落地路徑、cron 設定檔實際路徑/檔名、新聞 source 當天抓取品質、skill-creator 修訂既有 skill 的行為）。

- **Dogfood 1（造 v1 skill）：** _待填_
- **Dogfood 2（cron→Telegram 管線）：** _待填_
- **Dogfood 3（cron 管理三式）：** _待填_
- **Dogfood 4（skill-creator 修訂既有 skill）：** _待填_
- **Dogfood 5（新聞 web-fetch 品質）：** _待填_
