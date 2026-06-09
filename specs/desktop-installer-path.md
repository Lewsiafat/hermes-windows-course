# lesson-1 + mac.html 新增「桌面安裝程式」簡單路線

- **分支:** `feat/desktop-installer-path`
- **日期:** 2026-06-08

## 描述

官方安裝文件（https://hermes-agent.nousresearch.com/docs/getting-started/installation）現在把 **Hermes Desktop Installer 列為「推薦」安裝法**，且 Windows 為**原生 `.exe`、不需要 WSL2**（macOS 為 `.dmg`，macOS 12+；下載頁 https://hermes-agent.nousresearch.com/desktop 目前標示 v0.16.0）。

本任務在 `lesson-1.html`（Windows）與 `mac.html`（macOS）的 Step 1 新增一條「簡單路線」分岔：下載桌面安裝程式直接裝好（推薦給只想趕快用起來的非開發者），**完整保留現有 WSL2／終端機路線作為「完整路線」**（不改 step 結構、不動 `wizard.js`、`TOTAL_STEPS` 維持 9）。同時順手把 Step 6 過時的 `raw.githubusercontent` install URL 改成官方現行的 vanity URL。

> ⚠️ **誠實揭露**：Windows `.exe` / macOS `.dmg` 桌面安裝無法在本維護機（mac）對 Windows 端 smoke test，新增內容為「依官方文件撰寫、尚未實測」。不得藉本任務更新 README「上次驗證」或 footer 版本字串宣稱已驗證。

### 已驗證的前置事實（2026-06-08）

- 新 vanity URL `https://hermes-agent.nousresearch.com/install.sh` → **200**
- 舊 raw URL `https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh` → **仍 200**（未死，這次是現代化、非修壞）
- 桌面下載頁 `https://hermes-agent.nousresearch.com/desktop` → **200**

## 任務清單

### A. lesson-1.html（Windows）簡單路線
- [x] Step 1「開始之前」新增「兩條路線」分岔區塊：**簡單路線**（下載 `.exe` 桌面安裝，推薦非開發者）vs **完整路線**（WSL2 + 終端機，現有 9 步）
- [x] 簡單路線內容：前往 https://hermes-agent.nousresearch.com/desktop → 下載 Windows `.exe` → 執行安裝（自動裝 CLI + 桌面 App + 依賴）→ 開啟桌面 App，照畫面設定 provider/model/API key → 開始對話
- [x] 簡單路線標明**仍需 OpenRouter API key**，指向 Step 3 取得；對話技巧／常用指令指向 Step 8
- [x] 簡單路線結尾的 fallback：桌面版裝不起來時改走完整路線（Step 2 起）
- [x] 調整 Step 1 既有「Windows 不支援原生 Hermes，所以要先裝 WSL2」措辭，使該理由只適用於**完整路線**，不與簡單路線矛盾
- [x] 區塊內以 callout / `<details>` 標註簡單路線為「依官方文件撰寫、尚未 smoke test，桌面 App 實際畫面可能略有不同」

### B. mac.html（macOS）平行簡單路線
- [x] 比照在 `mac.html` Step 1 新增簡單路線分岔：下載 macOS `.dmg`（macOS 12+），其餘流程對應
- [x] 維持「`mac.html` ↔ `lesson-1.html` 平行維護合約」：同一旅程、措辭與結構對應

### C. 順手修 install.sh URL（改用官方 vanity URL）
- [x] `lesson-1.html:296` 安裝指令 URL → `https://hermes-agent.nousresearch.com/install.sh`
- [x] `mac.html:230` 安裝指令 URL → 同上
- [x] `pre-class-checklist.md` 的 URL liveness 檢查（§1）改用新 URL
- [x] `ai-runbook.md` 的 URL 檢查與引用段（~244、780–793、1132、1145）同步改新 URL
- [x] **不動** `docs/superpowers/**`、`docs/improvements/**` 歷史設計紀錄

### D. 收尾驗證
- [x] 確認 wizard 行為不變：`TOTAL_STEPS` 維持 9、`wizard.js` 未改、`<pre data-copy>` 仍自動注入 Copy 按鈕
- [x] 本地瀏覽器開 `lesson-1.html` / `mac.html`，目視確認分岔區塊、內部連結（#step-3 / #step-8）、外部下載連結正確
- [x] **不**更新 README「上次驗證」與 footer 版本（桌面路線未實測，不可宣稱已驗證）

## 範圍外（本次不做）
- 原生 Windows PowerShell 安裝法 `iex (irm https://hermes-agent.nousresearch.com/install.ps1)`（官方文件有，但本次只做桌面 `.exe` 路線）
- 把桌面安裝升為「主推路線」、WSL2 降為進階（屬較大改版；本次只做兩條路線並存）
- 部署（`git push --follow-tags` + 手動觸發 Pages build）——待實作完成、使用者確認後另行處理
