# 教材修正與補強：API key 流程、購買 credit、常見錯誤

- **分支:** `fix/tutorial-fixes-and-notices`
- **日期:** 2026-05-07

## 描述

針對實際教學遇到的痛點集中修正。三個方向：
1. **OpenRouter 流程不完整**：Step 3 只教申請 key，沒教儲值，免費 model 速率限制與不穩定也沒提，學員容易上完課用幾分鐘就被擋。
2. **API key 進 hermes setup 容易壞**：Ubuntu 終端機 paste 行為不一致，常把 key 截斷或變空白，導致 Step 8 跑 `hermes` 收到 OpenRouter 400 error，學員看不出問題在哪。**此為 hermes 上游官方尚未完全修正的問題**，本教材以直接改 `~/.hermes/.env` 作為繞行解。
3. **WSL 重裝阻擋**：之前裝過 Ubuntu 的學員會撞 `Wsl/InstallDistro/ERROR_ALREADY_EXISTS`，目前 Step 2 沒寫處置方式。

## 任務清單

### Step 2 · WSL 安裝錯誤
- [x] 在「🚨 我卡住了」`<details>` 加新項目：`ERROR_ALREADY_EXISTS`（中 + 英文版錯誤訊息）。處置：用 `wsl -d Ubuntu` 啟動既有發行版，或 `wsl --unregister Ubuntu` 砍掉重裝（會清資料、警告學員）。

### Step 3 · OpenRouter 申請流程
- [x] 在現有「Create Key」步驟之後新增第 6 個動作：**儲值 Credits**
  - UI 路徑：`openrouter.ai/credits` 或側邊欄 Credits
  - 動作：選 $5 / $10 / $20 / $50 → 信用卡付款 → 餘額立即更新
  - 建議新手 $5 起跳
- [x] 在「免費 model 是什麼意思」`<details>` 補一段：免費 model 有**速率限制、回應較不穩定**，課後重度使用建議儲值。
- [x] 新增 `<details>`「為什麼建議付費」：按量計費、用多少付多少、解鎖 GPT/Claude/Gemini 等主流付費 model。
- [x] 在 step 內明確列出**推薦付費 model**：
  - `deepseek/deepseek-v4-pro`
  - `minimax/minimax-m2.7`
  - 跟既有「免費 deepseek 系列」並列，讓學員知道有兩條路徑可選。

### Step 7 · hermes setup 設定精靈
- [x] 「Choose a model」row 補上推薦付費 model（兩個字串），跟免費路徑並列。
- [x] 改寫「Enter your API key」段落：
  - 標註 **paste 容易失敗**（Ubuntu 終端機 paste 行為不一致 → 字元被截斷/空白）。
  - 建議：**手動 key in** 比較安全；或先用下面的 helper script 把 key 存進環境變數，再從 `$OPENROUTER_API_KEY` 看一次確認沒壞掉。
- [x] 在 step 結尾新增章節「**補救：直接改 hermes 的 .env**」（標為選用 / 補救）：
  - hermes 安裝後會讀取 `~/.hermes/.env`。`hermes setup` 在 TUI 裡 paste 失敗（被截斷/變空白）時，最快的修法是直接 sed 改這支檔案。
  - **Variant A — 互動腳本**（貼 key 進去自動產生完整指令）：
    ```bash
    cd ~/.hermes && read -sp "Paste your OpenRouter API key: " KEY && echo && sed -i "s/^OPENROUTER_API_KEY=.*/export OPENROUTER_API_KEY=$KEY/" .env && unset KEY
    ```
  - **Variant B — 手動範本**（學員自己把 `YOUR_API_KEY` 替換成實際 key 再貼進終端機）：
    ```bash
    cd ~/.hermes && sed -i 's/^OPENROUTER_API_KEY=.*/export OPENROUTER_API_KEY=YOUR_API_KEY/' .env
    ```
  - 兩種都列出，學員可選慣用方式。
  - **此 sed 為 hermes 上游官方暫未修好 paste 問題的繞行解。** 寫法（包含 `export` 前綴）依官方狀態原樣引用，**不對其語義做擅自改動**。
  - 執行完後再跑 `hermes` 即可，**不需要重跑 `hermes setup`**（因為已經直接寫入 hermes 讀取的 config）。

### Step 8 · 第一次對話
- [x] 「🚨 我卡住了」加一條：
  - 跑 `hermes` 收到 **400 / Unauthorized** → API key 沒寫對。最常見原因是 Step 7 paste 時被截斷。
  - 處置：回 Step 7「補救：直接改 hermes 的 .env」section，跑 Variant A（互動）或 Variant B（手動範本）任一個，再執行 `hermes` 即可。**不必重跑 `hermes setup`。**

### 文件同步
- [x] CLAUDE.md：補上「Step 7 結尾的補救 script section 不可任意移除，Step 8 的 400 error troubleshooting 會 cross-ref 它」。
- [x] `pre-class-checklist.md` / `ai-runbook.md`：本次新增的內容（Credits 頁面 UI、推薦 model 是否仍存在）要納入下次 smoke test 範圍。如果 OpenRouter 之後改了 Credits UI 或這兩個推薦 model 下架，文案要重抓。

## 不在範圍內

- 不動 `wizard.js` / `style.css`（純內容修改）。
- 不重排步驟順序、不改 `TOTAL_STEPS`。
- 不新增截圖（Credits 頁面、推薦 model 等截圖留待下次 Full Capture Run 補；本次先把文字版上線）。
