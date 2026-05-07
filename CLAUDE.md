# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案性質

純靜態 GitHub Pages 教學站，**已上線於 https://lewsiafat.github.io/hermes-windows-course/**。教材語言為繁體中文 (zh-Hant)。

**沒有 build step、沒有 framework、沒有測試套件、沒有 package.json。** 只有一個 `index.html` + 一支 CSS + 一支 JS + 兩份 markdown runbook。

### 由來與走向

- **由來**：本 repo 最初由另一個 spec/plan 專案產出（見 `docs/superpowers/{specs,plans}/`），現在是獨立維護。改動時若要回溯設計意圖，先翻 specs，但**不要把 specs 當成限制當下方向的法律**。
- **原本範圍**：60 分鐘從零裝好 [hermes-agent](https://github.com/NousResearch/hermes-agent)、完成第一次對話。
- **現在走向**：擴展成 **「如何使用 hermes-agent 的完整教材」**，安裝只是其中一塊。新增內容時要意識到：這不再只是「安裝精靈」，而是 hermes 的整體入門教材，未來會涵蓋使用層面的章節。

## 開發指令

```bash
# 本地預覽（無 server，直接用瀏覽器開）
xdg-open index.html      # Linux
# 或瀏覽器手動開啟此檔

# 部署
git push                 # GitHub Pages 自動發佈，10–30s 生效
```

不需要 `npm install`、不需要起任何 dev server。Pico CSS 從 jsdelivr CDN 載入。

## 架構重點（big picture）

### 精靈的運作（Step 0 + 9 個安裝步驟）

1. `index.html` 用 `<section class="step" data-step="N">` 切出區塊：`data-step="0"` 是前言（為什麼選 hermes），`data-step="1"` 到 `data-step="9"` 是安裝流程。**只有當前步驟 visible，其他 `hidden`。**
2. `wizard.js` 用 URL hash (`#step-N`) 當 source of truth，配合 `localStorage['hermes-course-step']` 記住進度（學員重啟 Windows 後回來會自動跳回正確步驟）。預設首頁是 Step 0；範圍檢查為 `n >= 0 && n <= TOTAL_STEPS`。
3. **`TOTAL_STEPS = 9` 在 `wizard.js` 是硬編碼**：它代表「安裝步驟數」，不含 Step 0。新增/刪除安裝步驟時必須同步改這個常數，並對應改 index.html 裡每個 step 標題的 `Step N / 9` 文字。
4. 進度文字 (`#progress-text`)：Step 0 顯示「前言」，Step 1–9 顯示 `Step N / 9`。
5. 任何 `<pre data-copy>` 區塊會被 `wizard.js` 自動注入「Copy」按鈕。新增可複製指令時用這個 attribute，不要自行加按鈕 markup。

### 內容編輯流程

- 改步驟內容 = 編輯 index.html 對應的 `<section data-step="N">`。零 build。
- 樣式只調 `style.css` 裡的覆寫；版面骨架靠 Pico CSS 的 default styles。
- **截圖存 `assets/screenshots/<filename>.png`**，檔名規則嚴格遵守 `ai-runbook.md` §截圖規範（小寫、連字號、`step-N-*`）。

### 兩份必讀的 runbook

這兩份不只是文件，是**教材正確性的測試替身**：

- `pre-class-checklist.md` — 人類版 smoke test，每次教學前 10–15 min 跑完。**重點檢查 3 個最容易壞的地方**：install.sh URL 是否還是 200、`hermes setup` 提示順序、OpenRouter UI。
- `ai-runbook.md` — AI 工具版（Computer Use / Skyvern 等）的完整螢幕控制 runbook，分 Part 1 (Full Capture Run, 60–90 min) 和 Part 2 (Quick Smoke Test, 10–15 min)。

> **變更教材時的隱性合約**：如果你改了 index.html 的步驟順序、指令、或 `hermes setup` 流程，必須對應檢查這兩份 runbook 的 stage 是否還對得上。它們之間沒有自動 lint。

### 設計與實作文件

- `docs/superpowers/specs/` — 課程設計規格（學員定位、時間表、教學原則）
- `docs/superpowers/plans/` — 實作計畫

改動方向有疑慮時先去 specs 確認原始設計意圖（特別是「為什麼選 OpenRouter free model」「為什麼 9 步而不是更少」這類問題）。

## 重要慣例

- **不要把這份教材設計成多語**，spec 明確只做 zh_TW。
- **不要加上 build tooling**（webpack / vite / 任何 bundler）— 「零 build、雙擊 index.html 就能改」是核心設計目標。
- **`<details>` block 是教學節奏的一部分**：用來放「等下載時可以順便讀」「🚨 我卡住了」這類 optional content，不要把它們扁平化成普通段落。
- 修改完 smoke test 確認的條目（hermes 版本、Windows 版本、最後驗證日期）後，要更新 README.md 的「上次驗證」區塊。

## 跨步驟引用（不可任意刪除）

某些步驟之間有 cross-reference，重構時請維持引用關係：

- **Step 7「補救：直接改 hermes 的 .env」section（Variant A / B 兩個 sed 腳本）** ← 被 Step 8「我卡住了」的 400 error 條目直接引用。改寫或搬位置時必須同步更新 Step 8 的指路文字。
- 該 sed 腳本（含 `export` 前綴的替換寫法）是 hermes 上游官方暫未修正 paste 問題的**繞行解**，**寫法原樣引用、不可擅自簡化**（例如不要拿掉 `export`、不要改 sed delimiter）。
