# Course Hub Landing Page

- **分支:** `feat/course-hub`
- **日期:** 2026-05-18

## 描述

新增一個 course hub landing page，取代目前的 `index.html`（Lesson 1 Step 0），讓 GitHub Pages 的根 URL 改顯示「所有課程目錄」而非 Lesson 1 內容。原本的 Lesson 1 內容搬到 `lesson-1.html`，內容不動。

設計目標：
- 學員第一次訪站時看到「課程地圖」而不是 Lesson 1 Step 0，能依自身狀況挑路徑（Windows / macOS 安裝、進階整合）。
- macOS 課程 (`mac.html`) 從「藏在 footer 連結」升級為「跟 Lesson 1 並列的 OS 起點」。
- 不破壞既有 deep link：`index.html#step-N` 透過 JS 重導到 `lesson-1.html#step-N`。

設計選擇：
- **版面**：Pico CSS grid，上排 2 張卡（Lesson 1 / macOS），下排 3 張卡（Lesson 2 / 3 / 4）。每張卡只放「標題 + 1 句描述 + 預估時間 + 開始按鈕」，極簡。
- **不載入 `wizard.js`**：landing page 不是 stepped wizard，沒有 step 切換、沒有 progress 文字、沒有 copy 按鈕需求。保持零 build / 零依賴。
- **舊 URL redirect**：`index.html` 內含一段 inline `<script>`，在 DOMContentLoaded 前檢查 `location.hash`，若符合 `#step-N` 即 `location.replace('lesson-1.html#step-' + N)`。

## 任務清單

### 檔案異動

- [ ] 把 `index.html` 重命名為 `lesson-1.html`（內容完全不動，含 `<body data-storage-key="hermes-course-step">`，這樣既有學員的 localStorage 進度繼續對得上）
- [ ] 新建 `index.html` — course hub landing page（Pico grid 卡片 + JS redirect for `#step-N`）

### Cross-ref 修補（必改，否則站內連結斷掉）

- [ ] `lesson-2.html`:50 — Step 0 fallback：`<a href="index.html">Lesson 1</a>` → `lesson-1.html`
- [ ] `lesson-2.html`:66 — Step 1 prereq：同上
- [ ] `lesson-2.html`:239 — Step 4 補救 cross-ref：`index.html#step-7` → `lesson-1.html#step-7`
- [ ] `lesson-2.html`:475 — footer「回 Lesson 1」：同上
- [ ] `lesson-3.html`:62 — Step 0 prerequisites fallback：`index.html` → `lesson-1.html`
- [ ] `lesson-4.html`:48 — Step 0 prereq：兩處 `index.html` → `lesson-1.html`
- [ ] `lesson-4.html`:71 — Step 1 prereq：同上
- [ ] `lesson-4.html`:617 — footer「回 Lesson 1」：同上
- [ ] `mac.html`:465 — footer「Windows 版本」連結：`index.html` → `lesson-1.html`

### 文件同步

- [ ] `README.md` — 「結構」section 把 `index.html — Lesson 1` 改成 `lesson-1.html — Lesson 1`，並新增一行 `index.html — 課程目錄（landing hub）`；同時補上 `mac.html` 條目（v1.0.0 README 漏列）
- [ ] `CLAUDE.md` — 「跨步驟引用」section 的 `index.html` 提及改成 `lesson-1.html`；「精靈的運作」段落保留現狀（lesson-1.html 仍是 9 步 wizard）；新增一小段「landing page = `index.html`，不載入 wizard.js」
- [ ] `CHANGELOG.md` — 加 `[Unreleased]` 區塊，記錄 landing page 新增、檔案搬遷、redirect
- [ ] `pre-class-checklist.md` — 若 stage 名稱提到 `index.html` 而對應的是 Lesson 1，改成 `lesson-1.html`；landing page 本身（若值得 smoke test，例如「點得到 5 個課程連結」）視情況加一條
- [ ] `ai-runbook.md` — 同上原則修正 stage 描述

### 不動的地方

- [ ] `docs/superpowers/specs/` 和 `docs/superpowers/plans/` 內所有歷史文件**不改**（凍結 v1.0.0 前的記錄）
- [ ] `docs/improvements/2026-05-11.md`**不改**（dogfood 歷史備忘）
- [ ] `wizard.js`**不改**（landing page 不載入它就好）
- [ ] `style.css` 視 landing page 卡片視覺需要再決定是否加少量規則；能用 Pico default 就不加

### 驗證

- [ ] 本地用瀏覽器開 `index.html` — 5 張卡片可見、每個「開始」按鈕都連得到正確檔案
- [ ] 開 `index.html#step-3` — 應立刻跳到 `lesson-1.html#step-3` 並顯示 Step 3
- [ ] 開 `lesson-1.html` — Lesson 1 wizard 行為完全正常（Step 0 預設、Next/Prev、localStorage、Copy 按鈕）
- [ ] 從每個 lesson-X.html 的「回 Lesson 1」/「Lesson 1 prerequisite」連結點過去，能正確抵達 `lesson-1.html`
- [ ] 從 `mac.html` footer 點「Windows 版本」能到 `lesson-1.html`
- [ ] 手機寬度（< 600px）下 grid 自動 reflow 為單欄（Pico 預設行為）
