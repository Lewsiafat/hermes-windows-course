# lesson-1 + mac.html 新增「桌面安裝程式」簡單路線 — Walkthrough

- **分支:** `feat/desktop-installer-path`
- **日期:** 2026-06-09

## 變更摘要

在 `lesson-1.html`（Windows）與 `mac.html`（macOS）的 Step 1 新增一條「簡單路線」分岔：下載官方 Hermes Desktop Installer（Windows `.exe` / macOS `.dmg`）直接裝好，推薦給只想趕快用起來的非開發者；完整保留既有 WSL2／終端機路線作為「完整路線」。同時把兩頁安裝指令的舊 `raw.githubusercontent` install URL 改成官方現行 vanity URL `https://hermes-agent.nousresearch.com/install.sh`，並同步更新兩份 runbook 的 URL 檢查段。

## 修改的檔案

- **`lesson-1.html`** — Step 1「開始之前」新增「安裝有兩條路線」雙欄卡片（🟢 簡單路線 vs 🔧 完整路線）+「簡單路線：下載桌面安裝程式」5 步清單 +「關於簡單路線的提醒」誠實揭露摺疊；既有 checkpoints / 準備物 / 加碼預告改置於「完整路線」標題下。Step 6 install 指令 URL 改為 vanity URL。
- **`mac.html`** — 平行新增同結構簡單路線（macOS `.dmg`，標註需 macOS 12+、含 Gatekeeper 提示），跨步連結對應 mac 步號（key=Step 3、對話=Step 6、下一步=Step 7）。Step 4 install 指令 URL 改為 vanity URL。
- **`pre-class-checklist.md`** — Check 1 的 URL liveness 檢查改用 vanity URL；404 fallback 指引改指向官方安裝文件頁。
- **`ai-runbook.md`** — Stage 6 ACTION 指令與 Check 1 curl URL 改為 vanity URL；Check 1 FAIL 處理改指向官方安裝文件頁、保留舊 raw URL 當備援、並把「要更新的地方」由三處補成四處（補上 `mac.html`）。
- **`specs/desktop-installer-path.md`** — 任務規格（新檔，本任務起始時建立）。
- **`specs/desktop-installer-path-walkthrough.md`** — 本文件（新檔）。

## 技術細節

- **為何用「分岔」而非改寫成主推**：與使用者確認後選擇「並存」——簡單路線（桌面安裝）推薦給非開發者，但 WSL2 完整路線原樣保留，不改 step 結構、不動 `wizard.js`、`TOTAL_STEPS` 維持 9（lesson-1）／ 7（mac）。屬最小破壞、不影響已驗證內容。
- **頁內錨點限制**：`wizard.js` 的 `getCurrentStep()` 只認 `^#step-(\d+)$`，且每次 hashchange 結尾都 `scrollTo top`。因此簡單路線**不使用自訂頁內錨點**（會被打回頂端），改為直接排在分岔卡片下方靠自然捲動；而 `#step-3`／`#step-8`（mac 為 `#step-6`/`#step-7`）這類跨步連結會正常導航 wizard，正好用來「跳去 Step 3 拿 key」「看對話技巧」。
- **誠實揭露**：Windows `.exe` / macOS `.dmg` 桌面安裝無法在維護機（mac）對 Windows 端 smoke test，新增內容依官方安裝文件撰寫。頁面摺疊區明確標註「桌面 App 實際畫面可能略有出入」「裝不起來改走完整路線」。**未更新** README「上次驗證」與 footer 版本字串，避免宣稱已驗證。
- **install.sh URL**：實測新 vanity URL 與舊 raw URL **皆回 200**，舊 URL 並未失效；此次為「現代化到官方現行 vanity URL（更穩定、不依賴 repo 結構）」。`docs/superpowers/**`、`docs/improvements/**` 等歷史設計紀錄依 surgical change 原則未動。
- **驗證**：以 Playwright 載入兩頁 `#step-1`，確認僅 Step 1 visible、進度文字正確、雙欄卡片並排（`sameRow=true`）、簡單路線清單各 5 項、全頁截圖無破版。
