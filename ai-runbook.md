# AI Runbook — Hermes Windows Course Smoke Test & Screenshot Capture

> 給有 Windows 桌面控制能力（截圖、滑鼠/鍵盤、視窗辨識）的 AI 工具使用 — 例如 Anthropic Computer Use、Skyvern、自訂 Playwright/PyAutoGUI agent。
>
> **目的：** 在乾淨 Windows 機器上跟著教學頁的 9 個步驟跑完安裝流程、依規捕捉 ~19 張截圖、確認 3 個最容易壞的地方仍正常。
>
> **對應教學頁：** https://lewsiafat.github.io/hermes-windows-course/  
> **配套人類版：** [`pre-class-checklist.md`](./pre-class-checklist.md)

---

## 重要約定

### Action Block 結構

每個 stage 都用以下 5 欄結構，AI 應嚴格遵照：

- **PRECONDITION** — 開始該 stage 之前螢幕上應該有什麼狀態
- **ACTION** — 滑鼠 / 鍵盤 / 命令動作。指令類列出完整字串。
- **WAIT** — 等待條件 + 最大超時
- **EXPECTED** — 完成後螢幕上應該看到什麼
- **SCREENSHOT** — 該 stage 要捕捉的截圖（檔名、構圖要求）；若不需截圖會註明「不需要」

### 截圖規範

- **解析度：** 最小 1280×720，PNG 格式
- **存檔路徑：** repo 內 `assets/screenshots/<filename>.png`
- **構圖：** 除非另有指定，**整個前景視窗 + 周圍少量桌面**讓觀者有上下文
- **檔名：** 嚴格依照本文件指定的檔名，全部小寫、連字號、無空白
- **隱私：** 截圖前確保沒有任何 API key、密碼、個人 email 入鏡（特別是 Stage 3-4 與 Stage 7-3）

### 失敗處理

若 ACTION 失敗或 EXPECTED 不符合：

1. **立刻停止**，不要往下走
2. 截目前狀態存為 `assets/screenshots/FAILED-stage-<N>-<short-desc>.png`
3. 在最終報告中描述偏差、可能原因、嘗試了什麼
4. 等待人類介入

### 人類檢查點

某些步驟需要人類介入（重啟、信箱驗證、UAC 同意、貼 API key）。這些 stage 會標 **🧑 HUMAN CHECKPOINT**，AI 應暫停並提示人類動作。AI **不應**代填 email 帳號 / 密碼 / API key 等敏感資料。

---

## 環境前置（執行前確認）

- [ ] Windows 10 (build 1903+) 或 Windows 11
- [ ] 登入帳號有管理員權限
- [ ] 網路通暢、能連 GitHub / OpenRouter / jsdelivr CDN
- [ ] 有可用的 email 帳號（OpenRouter 註冊用）
- [ ] AI 工具能控制此機器（截圖 + 鍵鼠 + 視窗識別）
- [ ] Repo 已 clone：`git clone https://github.com/Lewsiafat/hermes-windows-course.git`
- [ ] `assets/screenshots/` 資料夾已存在（若無：`mkdir -p assets/screenshots`）

預估時間：

| Mode | 時間 | 何時跑 |
|---|---|---|
| **Part 1 — Full Capture Run** | 60–90 分鐘 | 一次性，初次建立完整截圖集 / hermes 大改版後 |
| **Part 2 — Quick Smoke Test** | 10–15 分鐘 | 每次教學前 |

---

# Part 1: Full Capture Run

從零開始裝整套，沿途捕捉全部 ~19 張截圖。**目標是一台乾淨 Windows，沒裝過 WSL/Ubuntu/hermes。** 若機器已裝過、需先 reset：見最後「環境重置」附錄。

---

## Stage 1 · 啟動 PowerShell 系統管理員

**PRECONDITION:** Windows 桌面，沒有開啟的 PowerShell 視窗。

**ACTION:**
1. 按 `Win+R` 開啟「執行」對話框
2. 輸入 `powershell`
3. 按 `Ctrl+Shift+Enter`（以系統管理員身份執行）
4. UAC 對話框出現 → 🧑 **HUMAN CHECKPOINT**：等使用者按「是 / Yes」

**WAIT:** PowerShell 視窗開啟、藍色標題列顯示「系統管理員：Windows PowerShell」(或英文 "Administrator: Windows PowerShell")。最大 30s。

**EXPECTED:**
- 藍色標題列文字含「系統管理員」或「Administrator」
- 提示符類似 `PS C:\Windows\system32>`

**SCREENSHOT:** `assets/screenshots/step-2-powershell-admin.png`
- 整個 PowerShell 視窗 + 標題列
- **必須清楚看到**「系統管理員 / Administrator」字樣
- 視窗大小至少 1024×600，建議用預設大小

---

## Stage 2 · 啟動 WSL2 安裝

**PRECONDITION:** Stage 1 完成，PowerShell admin 視窗活躍。

**ACTION:**
1. 點 PowerShell 視窗使其聚焦
2. 輸入：`wsl --install`
3. 按 Enter

**WAIT:** 看到下載進度條開始（出現 `下載中:` 或 `Downloading: Windows Subsystem for Linux` 字樣）。最大 60s。

**EXPECTED:**
- 終端出現多行訊息：「正在安裝: 虛擬機平台」、「正在安裝: 適用於 Linux 的 Windows 子系統」、「Ubuntu」
- 接著出現百分比進度條

**SCREENSHOT:** `assets/screenshots/step-2-wsl-install-running.png`
- 整個 PowerShell 視窗 + 進度條
- **必須看到** `wsl --install` 指令本身（在 prompt 上方）
- **必須看到** 至少一個下載進度行

---

## Stage 3 · OpenRouter 註冊（瀏覽器）

> 這個 stage 與 Stage 2 並行執行。趁 WSL 在背景下載時做 OpenRouter 帳號。

**PRECONDITION:** WSL 仍在 PowerShell 中下載。

**ACTION:**
1. 開預設瀏覽器（Win+S 搜尋「Chrome」或「Edge」皆可）
2. 在網址列輸入 `https://openrouter.ai`，按 Enter
3. 等首頁完整載入

**WAIT:** OpenRouter 首頁出現（大字 logo「OpenRouter」、右上角「Sign In」按鈕）。最大 30s。

**SCREENSHOT (1/4):** `assets/screenshots/step-3-openrouter-signup.png`
- 整個瀏覽器視窗
- **必須看到** 網址列顯示 `openrouter.ai`
- **必須看到** 首頁 hero（含 logo + Sign In 按鈕）

**ACTION (續):**
4. 點右上角「Sign In」
5. 選擇 Email 註冊或 Google 登入
6. 🧑 **HUMAN CHECKPOINT**：填 email、密碼、收驗證信。AI **不應**代填 email/密碼。

**WAIT:** 登入完成、頁面跳轉至 Dashboard（左側 nav 出現「Activity」「Models」「Keys」等項目）。最大 60s（含人類驗證信時間，可能更久）。

**SCREENSHOT (2/4):** `assets/screenshots/step-3-openrouter-dashboard.png`
- 整個瀏覽器視窗
- **必須看到** 網址列顯示 `openrouter.ai/...`（dashboard / settings 都行）
- **必須看到** 左側 nav 中「Keys」項目可見

**ACTION (續):**
7. 點左側 nav 的「Keys」

**WAIT:** Keys 頁面載入、右上角出現「Create Key」按鈕。最大 15s。

**SCREENSHOT (3/4):** `assets/screenshots/step-3-openrouter-keys.png`
- 整個瀏覽器視窗
- **必須看到** Keys 頁面標題 + Create Key 按鈕
- 若已有別的 key 在列表，**遮蔽 key 字串**（用黑矩形蓋住前綴 `sk-or-` 後的所有字元）

**ACTION (續):**
8. 點「Create Key」
9. 對話框跳出，名稱欄輸入：`hermes-course`
10. 點對話框內的「Create」

**WAIT:** 對話框顯示生成的 key 字串（以 `sk-or-` 開頭）。最大 10s。

**SCREENSHOT (4/4):** `assets/screenshots/step-3-openrouter-create-key.png`
- 整個 Create Key 對話框（不需要整個瀏覽器視窗）
- 🛡️ **隱私重要**：截圖前必須**遮蔽 key 字元** — 用黑色矩形蓋住前 8 碼之後所有字元；或截圖後立即在影像編輯器中遮蔽
- **遮蔽完才 commit**

**ACTION (續):**
11. 🧑 **HUMAN CHECKPOINT**：將完整 key 複製到 Windows 記事本暫存（**不要存進 repo 任何檔案、不要存進這份 runbook 的執行記錄**）

---

## Stage 4 · 等 WSL 下載完成 + 重啟

**PRECONDITION:** WSL `wsl --install` 仍在 PowerShell 中跑、瀏覽器分頁有 OpenRouter dashboard 開著、API key 已存在記事本。

**WAIT:** PowerShell 顯示成功訊息：「The requested operation is successful. Changes will not be effective until the system is rebooted.」或繁中對應。最大 1200s (20 分鐘)。

**EXPECTED:**
- 終端顯示成功訊息
- 沒有任何「failed」或「error」字樣

**SCREENSHOT:** 不需要

**ACTION:**
1. 🧑 **HUMAN CHECKPOINT**：
   - 確認所有開啟的工作已儲存
   - 開始功能表 → 電源 → 「重新啟動」
   - 等 Windows 重新開機並登入
2. AI 工具應在重啟期間暫停會話。重啟完、人類重新登入後，再恢復本 runbook 執行從 Stage 5 起。

---

## Stage 5 · Ubuntu 首次啟動

**PRECONDITION:** Windows 重啟完成、桌面已登入、PowerShell 已關閉。

**ACTION:**
1. 開始功能表搜尋「Ubuntu」
2. 點「Ubuntu」app（圖示為橘色圓圈）

**WAIT (1/3):** Ubuntu 視窗開啟，顯示 `Installing, this may take a few minutes...` 訊息。最大 30s 出現該訊息，最大 600s 完成。

**ACTION (續):**
3. 等到出現 `Enter new UNIX username:` 提示

**SCREENSHOT (1/2):** `assets/screenshots/step-5-ubuntu-username.png`
- 整個 Ubuntu 終端視窗
- **必須看到** `Enter new UNIX username:` 提示行
- 提示行下方應該是空的（還沒輸入）

**ACTION (續):**
4. 輸入 username（建議：`hermesuser`，全小寫、無空白、無底線開頭）
5. 按 Enter

**WAIT (2/3):** 出現 `New password:` 提示。最大 5s。

**SCREENSHOT (2/2):** `assets/screenshots/step-5-ubuntu-password.png`
- 整個 Ubuntu 終端視窗
- **必須看到** 上方剛剛輸入的 username（在 `Enter new UNIX username:` 那行的尾端）
- **必須看到** `New password:` 提示行
- 密碼欄是空的（Linux 不顯示輸入字元）

**ACTION (續):**
6. 🧑 **HUMAN CHECKPOINT**：輸入密碼（**測試用密碼，不重用個人密碼**），按 Enter
7. 🧑 **HUMAN CHECKPOINT**：再輸入一次密碼確認，按 Enter

**WAIT (3/3):** 看到 Ubuntu 提示符：`username@HOSTNAME:~$`。最大 5s。

**EXPECTED:** Ubuntu shell 已就緒。

---

## Stage 6 · 安裝 hermes

**PRECONDITION:** Ubuntu 視窗活躍、看到 `$` 提示符。

**ACTION:**
1. 點 Ubuntu 視窗使其聚焦
2. 鍵盤輸入或 Ctrl+Shift+V 貼上：

```
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

3. 按 Enter

**WAIT (1/2):** 看到下載開始（`% Total ... Received ... Speed ...` 進度行）。最大 30s。

**SCREENSHOT (1/2):** `assets/screenshots/step-6-install-running.png`
- 整個 Ubuntu 終端視窗
- **必須看到** `curl ... install.sh | bash` 指令（往上捲一點點看得到）
- **必須看到** 至少一行下載/安裝輸出（curl 進度行、apt 進度、或 Python venv 建立訊息）

**WAIT (2/2):** 看到 `Hermes installed!` 或類似的安裝完成訊息。最大 1200s (20 分鐘)。實際時間取決於網速。

**SCREENSHOT (2/2):** `assets/screenshots/step-6-install-complete.png`
- 整個 Ubuntu 終端視窗
- **必須看到** 「Hermes installed!」訊息或類似宣告（可能是「Installation complete」、「✓ hermes installed」等）
- **必須看到** 安裝結束後的最後幾行輸出 + 回到 `$` 提示符

**EXPECTED:** 回到 `$` 提示符，可繼續輸指令。

---

## Stage 7 · hermes setup 設定精靈

**PRECONDITION:** Ubuntu 視窗仍開著、安裝完成、`$` 提示符。

**ACTION:**
1. 輸入 `source ~/.bashrc`，按 Enter
2. 輸入 `hermes setup`，按 Enter

**WAIT (1/5):** Wizard 啟動，第一個提示出現：`? Choose your provider`（或類似文字）+ 選單列表。最大 30s。

**SCREENSHOT (1/5):** `assets/screenshots/step-7-setup-provider.png`
- 整個 Ubuntu 終端視窗
- **必須看到** provider 選單，**必須含** `openrouter` 選項
- 高亮應該停在 openrouter 或還沒選

**ACTION (續):**
3. 用方向鍵移到 `openrouter`，按 Enter

**WAIT (2/5):** 第二個提示：`? Choose a model` + model 選單。最大 30s。

**SCREENSHOT (2/5):** `assets/screenshots/step-7-setup-model.png`
- 整個 Ubuntu 終端視窗
- **必須看到** model 選單
- **必須能看到** 至少一個含 `:free` 字樣的 model（理想是 deepseek 系列）。例：
  - `deepseek/deepseek-chat:free`
  - `deepseek/deepseek-r1:free`
  - 或其他 `:free` model
- 若選單需要往下捲動才能看到 free model：先用方向鍵捲到能看到 free 那段再截圖

**ACTION (續):**
4. 選一個 `deepseek + :free` model（若沒有，挑任何 `:free` model），按 Enter

**WAIT (3/5):** 第三個提示：`? Enter your API key` 文字輸入框。最大 10s。

**SCREENSHOT (3/5):** `assets/screenshots/step-7-setup-apikey.png`
- 整個 Ubuntu 終端視窗
- **必須看到** API key 輸入提示行
- 🛡️ **隱私重要**：輸入框**必須是空的**，截圖在貼 key 之前。**截完才貼**。

**ACTION (續):**
5. 🧑 **HUMAN CHECKPOINT**：人類從 Windows 記事本複製 OpenRouter key、回 Ubuntu 視窗、Ctrl+Shift+V 貼上、按 Enter

**WAIT (4/5):** 第四個提示：`? Configure tools?` 或類似文字。最大 10s。

**SCREENSHOT (4/5):** `assets/screenshots/step-7-setup-tools.png`
- 整個 Ubuntu 終端視窗
- **必須看到** tools 設定提示
- 預設選項應該被高亮（通常是 `Yes` 或某個預設 set）

**ACTION (續):**
6. 直接按 Enter（接受預設）

**WAIT (5/5):** 第五個提示：`? Choose terminal backend` 或類似。最大 10s。

**SCREENSHOT (5/5):** `assets/screenshots/step-7-setup-terminal.png`
- 整個 Ubuntu 終端視窗
- **必須看到** terminal backend 選單
- **必須看到** 預設值是 `local`（高亮位置在 local 上）

**ACTION (續):**
7. 直接按 Enter（接受 `local` 預設）

**EXPECTED:** 看到 `Setup complete!` 或 `Configuration saved` 之類的成功訊息，回到 `$` 提示符。

---

## Stage 8 · 第一次對話

**PRECONDITION:** Ubuntu 視窗 active、`hermes setup` 成功完成、`$` 提示符。

**ACTION:**
1. 輸入 `hermes`，按 Enter

**WAIT (1/3):** Hermes TUI 啟動，顯示 ASCII art logo（含「HERMES」字樣）+ 底部輸入框。最大 30s。

**SCREENSHOT (1/3):** `assets/screenshots/step-8-hermes-tui.png`
- 整個 Ubuntu 終端視窗
- **必須看到** ASCII art HERMES logo
- **必須看到** 底部輸入框（含 `>` 或類似提示符）
- 輸入框**應該是空的**（還沒打字）

**ACTION (續):**
2. 輸入 `介紹一下你自己`，按 Enter

**WAIT (2/3):** Streaming 回應開始浮現，文字一個字一個字出現。最大 30s 開始流，可能需要 60s 完成。

**SCREENSHOT (2/3):** `assets/screenshots/step-8-streaming.png`
- 整個 Ubuntu 終端視窗
- **必須看到** 使用者剛才打的 `介紹一下你自己`
- **必須看到** hermes 正在輸出回應（**回應未完成**，正在串流）
- 在回應到約一半時截圖（不要等回應完，否則拍不到 streaming 的視覺感）

**ACTION (續):**
3. 等回應完成（畫面停止更新、回到輸入框可打字狀態）
4. 輸入 `/exit`，按 Enter

**WAIT (3/3):** Hermes TUI 關閉，回到 Ubuntu shell `$` 提示符。最大 5s。

**SCREENSHOT (3/3):** `assets/screenshots/step-8-exit.png`
- 整個 Ubuntu 終端視窗
- **必須看到** 對話的最後幾行（hermes 結束了一次完整回答）
- **必須看到** 輸入 `/exit` 的指令
- **必須看到** 回到 `$` 提示符

---

## Stage 9 · hermes doctor 體檢

**PRECONDITION:** Ubuntu shell active、`$` 提示符。

**ACTION:**
1. 輸入 `hermes doctor`，按 Enter

**WAIT:** doctor 輸出完成，顯示各項檢查結果（多半是綠色 ✓ 或紅色 ✗ 的清單）。最大 30s。

**SCREENSHOT:** `assets/screenshots/step-9-doctor.png`
- 整個 Ubuntu 終端視窗
- **必須看到** `hermes doctor` 指令本身
- **必須看到** 完整檢查清單輸出（多半 5–15 行）
- 理想是全部 ✓（綠色），若有 ✗ 也截下來作為紀錄

---

## Stage 10 · 紀錄驗證資訊 + commit

**ACTION:**
1. 在 Ubuntu 跑 `hermes --version`，記下輸出（例：`hermes 0.12.0`）
2. 在 Windows 開「設定 → 系統 → 關於」，找到 Windows 版本（例：`Windows 11 23H2 (build 22631.xxxx)`）
3. 在本機 repo 編輯 `README.md`，更新「上次驗證」區塊：

```markdown
## 上次驗證

- 日期：YYYY-MM-DD（今天，依機器當地日期）
- hermes 版本：vX.Y.Z（從 `hermes --version` 抓）
- Windows 版本：XX HXX (build XXXXX.XXXX)
```

4. 確認 `assets/screenshots/` 內有約 19 張預期檔名的 PNG，**沒有任何 `FAILED-*` 檔**
5. 加進 git 並 commit + push：

```bash
cd /path/to/hermes-windows-course
git add assets/screenshots/ README.md
git commit -m "feat: smoke test screenshots + verified record YYYY-MM-DD"
git push origin main
```

6. 等 GitHub Pages 重新 build（10–30 秒），開 https://lewsiafat.github.io/hermes-windows-course/ 隨機驗證 Step 6 / Step 7 是否能看到截圖

---

## Part 1 預期截圖列表（共 19 張）

完成 Part 1 後，`assets/screenshots/` 應有：

| # | 檔名 | Stage |
|---|---|---|
| 1 | `step-2-powershell-admin.png` | 1 |
| 2 | `step-2-wsl-install-running.png` | 2 |
| 3 | `step-3-openrouter-signup.png` | 3-1 |
| 4 | `step-3-openrouter-dashboard.png` | 3-2 |
| 5 | `step-3-openrouter-keys.png` | 3-3 |
| 6 | `step-3-openrouter-create-key.png` | 3-4 |
| 7 | `step-5-ubuntu-username.png` | 5-1 |
| 8 | `step-5-ubuntu-password.png` | 5-2 |
| 9 | `step-6-install-running.png` | 6-1 |
| 10 | `step-6-install-complete.png` | 6-2 |
| 11 | `step-7-setup-provider.png` | 7-1 |
| 12 | `step-7-setup-model.png` | 7-2 |
| 13 | `step-7-setup-apikey.png` | 7-3 |
| 14 | `step-7-setup-tools.png` | 7-4 |
| 15 | `step-7-setup-terminal.png` | 7-5 |
| 16 | `step-8-hermes-tui.png` | 8-1 |
| 17 | `step-8-streaming.png` | 8-2 |
| 18 | `step-8-exit.png` | 8-3 |
| 19 | `step-9-doctor.png` | 9 |

---

## Lesson 2 · Stage 11–17（Telegram 整合）

> Lesson 2 對應 `lesson-2.html`，預期 30–45 分鐘。**截圖留給下次 Full Capture Run**，本批次以動作驗證為主，不要求拍圖。

## Stage 11 · 開啟 lesson-2.html、走 Step 0–1

### Action Block
1. 瀏覽器開 `lesson-2.html`，停在 Step 0
2. 確認進度文字顯示「前言」
3. 點「下一步 →」進 Step 1
4. 確認進度文字顯示「Step 1 / 7」、3 條前置 checklist 顯示

### 失敗處理
- 進度文字沒變 → wizard.js 沒讀到 `<body data-total-steps>`，回 Lesson 1 Step 1（人類）/ Stage 0（AI）核對 body 標籤。

## Stage 12 · 申請 Telegram bot（Step 2）

### Action Block
1. 在 lesson-2.html Step 2 點主連結 `https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html`
2. 在另一分頁完成 BotFather 流程：`/newbot` → 名稱 → username → 拿 token
3. token 存到記事本（含冒號前後）
4. 回 lesson-2.html，點「下一步 →」進 Step 3

### 失敗處理
- 主連結 4xx/5xx → 展開「🚨 主連結打不開」`<details>`，照 inline 5 步走。
- BotFather username 撞名 → 加亂數或日期再試。

## Stage 13 · 拿 user_id（Step 3）

### Action Block
1. 手機 / 桌面 Telegram 開 https://t.me/userinfobot
2. 按 Start
3. 抄回應裡 `Id:` 後的純數字到記事本
4. 點「下一步 →」進 Step 4

### 失敗處理
- @userinfobot 不存在 → 用 @username_to_id_bot 或在桌面 Telegram 「設定 → 進階 → ID」找。

## Stage 14 · `hermes gateway setup`（Step 4）

### Action Block
1. WSL 開新終端
2. 跑 `hermes gateway setup`
3. 選 `telegram` → Enter
4. 貼 token（手動 key in 或先按 Ctrl+Shift+V）→ Enter
5. 貼 user_id → Enter
6. 確認看到 `Setup complete!`
7. 跑 `grep -E '^(export )?TELEGRAM_' ~/.hermes/.env` 確認兩行都寫入

### 失敗處理
- token / user_id 寫錯（log 出 401 / unauthorized）→ 用 lesson-2.html Step 4 補救 section 的 Variant A 或 B sed 改 .env。
- Ctrl+C 中斷 → 重跑 `hermes gateway setup`。

## Stage 15 · 啟動 gateway 背景（Step 5）

### Action Block
1. 跑 `hermes gateway run`（前景）試啟動，確認啟動 banner 出現、無 401，按 Ctrl+C
2. 跑 `nohup hermes gateway run > /dev/null 2>&1 &`
3. 按 Enter 把 prompt 推下一行
4. 跑 `hermes gateway status`，預期 `✓ Gateway is running (PID: ...)` 且 `(Running manually, not as a system service)`
5. 跑 `tail -n 30 ~/.hermes/logs/gateway.log`，確認無 fatal / 401 / 409

### 失敗處理
- log 401 → token 寫錯，回 Stage 14 sed 補救。
- 看到 `Gateway already running (PID ...)` → 之前跑過沒清，`hermes gateway restart`。
- log network error → `ping 8.8.8.8` 確認 WSL 對外。

## Stage 16 · 第一次手機 ↔ hermes（Step 6）

### Action Block
1. 手機 Telegram 搜你 bot 的 username
2. 按 Start
3. 傳 `hello, you there?`
4. 等 1–5 秒，確認 bot 有回
5. 傳 `what was my first message?`，確認回應提到 hello（context 連動）
6. 在另一個 WSL 分頁 `tail -f ~/.hermes/logs/gateway.log`，確認傳訊時 log 即時跑出 `Received message from user <id>`

### 失敗處理
- log 出 unauthorized → user_id 寫錯，回 Stage 14 sed 改 `TELEGRAM_ALLOWED_USERS=` + `hermes gateway restart`。
- log 完全沒新訊息 → bot username 找錯。
- bot 找不到 → BotFather `/mybots` 對 username。

## Stage 17 · 收尾（Step 7）

### Action Block
1. lesson-2.html 點「下一步 →」進 Step 7
2. 確認 4 個 ✓ checkpoints 都對得上實際完成項
3. 展開 5 個加碼 `<details>` 至少瀏覽一次（不必實作）
4. 跑 `hermes gateway stop` 結束本次驗證

### 失敗處理
- 任何一條 ✓ 對不上 → 回對應 Stage 重做。

---

## Lesson 4 · Stage 18–24（LINE 整合）

對應 lesson-4.html 的 Step 0–7。本 Part 假設 Lesson 1 + Lesson 2 已驗證過、hermes / Telegram 都跑著。

## Stage 18 · 開啟 lesson-4.html、走 Step 0–1

1. 開 https://lewsiafat.github.io/hermes-windows-course/lesson-4.html
2. Step 0：前言、結束時你會有
3. Step 1：4 條前置 checklist 顯示、7 步預告、OpenRouter 警告

截圖：`step-4-0-preface.png`、`step-4-1-checklist.png`

## Stage 19 · 申請 LINE bot（Step 2）

1. 開外部教材 `https://lewsi.ddns.net/apply-tutorials/bots/line/line_bot_tutorial_zh.html`
2. 走到 step 5「取得 Channel Access Token」
3. 暫存：Channel Access Token (~170 字元)、Channel Secret (32 hex)、Bot basic ID (`@xxx`)

截圖：`step-4-2-line-console-tokens.png`（兩段 token 已模糊 redact）

## Stage 20 · 裝 ngrok + authtoken（Step 3）

```
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok
ngrok version
# 開 https://dashboard.ngrok.com → Your Authtoken → 複製
ngrok config add-authtoken <token>
```

預期：`Authtoken saved to configuration file: ~/.config/ngrok/ngrok.yml`

截圖：`step-4-3-ngrok-installed.png`、`step-4-3-authtoken-saved.png`

## Stage 21 · 開 ngrok tunnel + 一鍵寫 .env（Step 4）

Window B：

```
ngrok http 8646
# 抄 Forwarding 那行 URL
```

Window A（互動腳本，bash heredoc，default shell 是 bash / zsh 都可跑）：

```
bash <<'BASH'
set -euo pipefail
cd ~/.hermes
read -sp "Paste LINE Channel Access Token: " TOKEN </dev/tty && echo
read -sp "Paste LINE Channel Secret: "        SECRET </dev/tty && echo
read -p  "Paste ngrok HTTPS URL: "            PUBURL </dev/tty
grep -q '^LINE_CHANNEL_ACCESS_TOKEN=' .env || echo 'LINE_CHANNEL_ACCESS_TOKEN=' >> .env
grep -q '^LINE_CHANNEL_SECRET='       .env || echo 'LINE_CHANNEL_SECRET='       >> .env
grep -q '^LINE_PUBLIC_URL='           .env || echo 'LINE_PUBLIC_URL='           >> .env
grep -q '^LINE_ALLOWED_USERS='        .env || echo 'LINE_ALLOWED_USERS='        >> .env
grep -q '^LINE_ALLOW_ALL_USERS='      .env || echo 'LINE_ALLOW_ALL_USERS=true'  >> .env
sed -i "s|^LINE_CHANNEL_ACCESS_TOKEN=.*|LINE_CHANNEL_ACCESS_TOKEN=$TOKEN|" .env
sed -i "s|^LINE_CHANNEL_SECRET=.*|LINE_CHANNEL_SECRET=$SECRET|"            .env
sed -i "s|^LINE_PUBLIC_URL=.*|LINE_PUBLIC_URL=$PUBURL|"                    .env
BASH

awk -F= '/^LINE_/{print $1, "len="length($2)}' ~/.hermes/.env
```

預期 5 行 LINE_* 都列出、token len ~170、secret len=32。

截圖：`step-4-4-ngrok-panel.png`（URL redact）、`step-4-4-redacted-verify.png`

## Stage 22 · LINE Console webhook + 5 toggles（Step 5）

回 LINE Console → Messaging API → Webhook URL 填 `<ngrok>/line/webhook` → 5 toggles 對應設定。

**先不要按 Verify**。

截圖：`step-4-5-webhook-url.png`、`step-4-5-toggles.png`

## Stage 23 · 啟動 gateway + 手機 smoke + UID 收緊（Step 6）

Window C：

```
hermes gateway run
```

預期 log 含 `✓ line connected`。

回 LINE Console 按 Verify → ✅ Success。

手機掃 QR code 加 bot → 送「測試」→ Window C log 出現 inbound U-ID → 收下。

Window A：

```
cd ~/.hermes && read -p "Paste your LINE User ID (U<32-hex>): " USER_ID && sed -i "s|^LINE_ALLOWED_USERS=.*|LINE_ALLOWED_USERS=$USER_ID|" .env && sed -i 's|^LINE_ALLOW_ALL_USERS=.*|LINE_ALLOW_ALL_USERS=false|' .env && grep -E '^LINE_(ALLOWED_USERS|ALLOW_ALL_USERS)' .env && unset USER_ID
```

預期：`LINE_ALLOWED_USERS=U...`、`LINE_ALLOW_ALL_USERS=false`。

Window C 重啟 gateway，手機再送一句 → 仍收到回應。

截圖：`step-4-6-gateway-banner.png`、`step-4-6-verify-success.png`、`step-4-6-phone-reply.png`（U-ID redact）

## Stage 24 · 收尾（Step 7）

確認學員看完 LINE quirks 表（4 條）、知道兩個加碼是 out of scope。

截圖：`step-4-7-completion.png`

---

# Lesson 3 · Stage 25–29（日常使用）

接續 Lesson 4 的 Stage 24。本批 stage 假設學員已完成 Lesson 1+2，hermes 已裝、Telegram bot 已接。**注意：原 Stage 25–31 已重寫為 Stage 25–29（少 2 stage），對應 lesson-3.html 從 7 sections（Step 0–6）改為 6 sections（Step 0–5）。**

## Stage 25 · 開啟 lesson-3.html、走 Step 0–1

1. 在已開的瀏覽器 tab 開 `https://lewsiafat.github.io/hermes-windows-course/lesson-3.html`
2. 確認進度顯示「前言」、標題「Lesson 3 · hermes 日常使用」
3. 讀完 Step 0 4 個 checkpoints + 「★ 現在就想好一個 daily skill 主題」、心裡選定一個主題（例：「每天早上推一條英文俚語」）
4. 點「下一步 →」進 Step 1
5. Step 1 「實作：試一次 `/new`」步驟在 Telegram bot 跑：先傳算術題、再傳 `/new`、確認 context 清空

預期：bot 回 `/new` 後再問 "what was my last question" 回答無法回憶。Step 0 確認進度顯示「Step 1 / 5」（不是 / 6）。

## Stage 26 · 進 Step 2 跑 cron 對話式設定

1. 點「下一步 →」進 Step 2
2. Copy 「2 分鐘後跑 ⟨天氣+降雨+SP500⟩」prompt block、貼到 hermes CLI / Telegram
3. hermes 應主動把 cron job 寫進 `~/.hermes/cron.yaml`，回覆「已設定，2 分鐘後會自動跑」
4. 在 WSL terminal 看：`cat ~/.hermes/cron.yaml` 確認 job 在
5. 等 2 分鐘，Telegram 收到 ⟨天氣+降雨預報+SP500⟩ 三件事
6. Copy「把剛剛那個改成每天早上 7:00 跑」prompt、貼，hermes 更新 cron.yaml
7. Copy「列出我目前的 cron 排程」prompt、確認 daily 7:00 job 在

預期：Telegram 收到推送、cron.yaml 確實被更新兩次。**Checkpoint 2 在此 stage 達成。**

若 hermes 沒主動寫 cron.yaml：執行 lesson-3.html Step 2「我卡住了」`<details>` 的 fallback（更明確要求編輯 file path）。

## Stage 27 · 進 Step 3 探索 hermes + 對話式裝 skill-creator

1. 點「下一步 →」進 Step 3
2. Copy `/skills list`、貼 → 看到 bundled skill 清單分頁（至少含 plan / excalidraw / 其他類別）
3. Copy `/plan 寫一份本週讀書計畫`、貼 → 看到 plan skill 輸出 markdown
4. Copy「幫我裝這個 skill: https://github.com/anthropics/skills/tree/main/skills/skill-creator」prompt、貼
5. hermes 應主動裝、回覆「裝好了」之類
6. Copy `/skills list --source local`、確認看到 `skill-creator`

預期：`/skills list --source local` 含 `skill-creator`。**Checkpoint 3 在此 stage 達成。**

若 hermes 沒主動裝：fallback 用 `/skills install <url>` 或 git clone（lesson-3.html Step 3「我卡住了」內第三段）。

## Stage 28 · 進 Step 4 用 skill-creator 對話造 skill

1. 點「下一步 →」進 Step 4
2. Copy「我想用 skill-creator 造一個 skill: ⟨主題⟩」prompt、把 ⟨主題⟩ 換成 Stage 25 選的主題（例：「每天早上推一條英文俚語」），貼到 hermes
3. skill-creator 開始訪談、依序回答（用簡單版本即可）
4. **看到「evaluation / benchmarks / test cases」相關問題時**，回「不用 eval、只 vibe 就好」或「skip evaluation」
5. skill-creator 寫完 SKILL.md，提示重啟。記下落地路徑（例：`~/.hermes/skills/productivity/morning-slang/SKILL.md`）
6. Copy `sudo $(which hermes) gateway restart --system`、跑、等 gateway restart
7. Copy `/skills list --source local`、確認看到剛造的 skill 名字
8. CLI 跑 `/<your-skill-name>`、看 skill 輸出
9. （可選）手機 Telegram bot 跑 `/<your-skill-name>`、看跨 channel 也認

預期：CLI 端 skill 輸出符合預期。**Checkpoint 4 在此 stage 達成 → Lesson 3 全 4 checkpoints 達標。**

若訪談卡住 / 跑不起來：lesson-3.html Step 4「我卡住了」`<details>` 三段（「不知道怎麼回」/「認不出來」/「行為不對」）為 fallback。

## Stage 29 · 進 Step 5 完成 + 加碼預告

1. 點「下一步 →」進 Step 5
2. 確認 4 個 ✓ checkmark 都顯示、文字跟 Stage 25 看到的 Step 0 一致
3. 點開加碼 A/B/C/D 四個 `<details>`，每個收起再展開一次（**新版加碼 D 沒有巢狀 `<details>`**）
4. （選做）加碼 A：對 hermes 講「把 ⟨skill-name⟩ 串到 cron 每天 7:00」→ 看 `~/.hermes/cron.yaml` 是否多一條 job
5. （選做）加碼 D：`cat ~/.hermes/skills/*/⟨your-skill-name⟩/SKILL.md` → 看 frontmatter + markdown 結構

預期：所有 `<details>` 可開可收。

---

# Part 2: Quick Smoke Test

每次教學前 10–15 分鐘做完。**不重新捕捉截圖**（除非發現 UI 已改），只驗證 3 個最容易壞的地方。

---

## Check 1 · install.sh URL 還活著

**ACTION:** 在任意機器（Linux/Mac/WSL2/macOS Terminal）跑：

```bash
curl -fsI https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh
```

**EXPECTED:**
- 第一行 `HTTP/2 200`
- exit code 0（沒輸出錯誤）

**FAIL 處理:**
- 若 404 / 403：去 `https://github.com/NousResearch/hermes-agent` 找新的 install.sh URL（可能在 `scripts/` 或 `docs/` 下）
- 找到後 → 更新 repo 三處：
  - `lesson-1.html` 的 Step 6 指令塊
  - `pre-class-checklist.md` Check 1 的 URL
  - 本檔 (`ai-runbook.md`) Stage 6 與 Check 1 的 URL
- commit、push

---

## Check 2 · `hermes setup` 提示順序與選項

**PRECONDITION:** WSL2 Ubuntu 已裝過 hermes（可用前次安裝的環境）。

**ACTION:**
1. 在 Ubuntu 跑 `hermes setup`
2. 觀察 5 個提示依序出現
3. **不要實際完成**，看到所有 5 個提示後按 Ctrl+C 取消

**EXPECTED 5 個提示，依序：**

| 提示 | 內容 | 預期選項 |
|---|---|---|
| 1 | `? Choose your provider` | 選單含 `openrouter` |
| 2 | `? Choose a model` | 選單含至少一個 `:free` 標記、最好是 deepseek 系列 |
| 3 | `? Enter your API key` | 文字輸入框（按 Ctrl+C 結束本次驗證）|
| 4 | `? Configure tools?` | 預設選項 |
| 5 | `? Choose terminal backend` | 預設 `local` |

**SCREENSHOT:** 不需要（除非順序變了 → 重跑 Part 1 Stage 7 補新截圖）

**FAIL 處理:**
- 順序變了 → 重跑 Part 1 Stage 7，覆蓋 step-7-*.png 5 張
- 完全沒有 `:free` deepseek → 找 OpenRouter 上仍存在的任何 `:free` model（用瀏覽器去 https://openrouter.ai/models 過濾 free）
- 提示數變動（多 / 少於 5）→ 對應更新 `lesson-1.html` Step 7 表格（plan §6.2 第 7 task）
- 完全壞掉、wizard 不啟動 → hermes-agent 大改版，整個課程要重評，**停止其他教學前 smoke test**

---

## Check 3 · OpenRouter UI

**ACTION:**
1. 開瀏覽器到 `https://openrouter.ai`
2. 登入測試帳號
3. 進入 Dashboard，確認五件事：
   - 左側 nav 仍有「Keys」入口
   - Keys 頁仍是獨立路由（URL 含 `/keys`）
   - 點 Create Key 仍是「點按鈕 → 跳對話框 → 顯示 key 一次 → 不再顯示」流程
   - 左側 nav 仍有「Credits」入口（或 `openrouter.ai/credits` 仍可達）；儲值流程仍是「選金額 → 信用卡 → 餘額即時更新」
   - 推薦付費 model 仍存在：在 `openrouter.ai/models` 搜 `deepseek/deepseek-v4-pro` 與 `minimax/minimax-m2.7`，兩者都能搜到
4. **不要實際建新 key、不要實際儲值**（測試帳號避免累積廢 key 與小額花費）

**EXPECTED:** 五項與本檔 Stage 3 截圖描述一致。

**SCREENSHOT:** 不需要（除非 UI 變了）

**FAIL 處理:**
- UI 重大改版 → 重跑 Part 1 Stage 3，覆蓋 step-3-*.png
- Keys 改名 / 路由變 → 對應更新 `lesson-1.html` Step 3 動作清單
- Credits 入口變 → 更新 Step 3 第 6 個動作（儲值）的指路文字
- 推薦付費 model 任一下架 → **必須**改 `lesson-1.html` 中 Step 3 與 Step 7 兩處的 model ID 字串

---

## Check 4 · 補救 sed script 仍能正確改 .env

確認 hermes 安裝後 `~/.hermes/.env` 真的存在、且裡面真的有 `OPENROUTER_API_KEY=` 這行（Step 7 補救 section 與 Step 8 的 400 troubleshooting 都依賴此 invariant）。

**ACTION:**
```bash
ls ~/.hermes/.env && grep '^OPENROUTER_API_KEY=' ~/.hermes/.env
```

**EXPECTED:** 檔案存在、grep 命中 1 行。

**FAIL 處理:**
- 檔案路徑變了 → 改 `lesson-1.html` Step 7 補救 section 的兩段 sed（Variant A / B）的 `cd ~/.hermes` 與 Step 8 的 cross-ref 文字。
- 變數名變了（例如改成 `OPENROUTER_KEY=`）→ 改兩段 sed 的 pattern。
- 整個 .env 不見了（hermes 改成別的儲存方式）→ 補救 section 整個重寫。

---

## Check 5 · BotFather 教材連結還活著

```bash
curl -I https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html
```

預期：`HTTP/2 200`。失聯時學員可用 lesson-2.html Step 2 的 inline `<details>` 備援。

## Check 6 · `hermes gateway setup` 流程不變

```bash
hermes gateway setup
```

走到選 telegram 那頁就 Ctrl+C。確認：仍可選 telegram、提示仍是 token + allowed users 兩個欄位。

若改了：lesson-2.html Step 4「3 個提示怎麼答」表格與 ai-runbook.md Stage 14 動作要對應改。

## Check 7 · .env 變數名仍是 TELEGRAM_BOT_TOKEN / TELEGRAM_ALLOWED_USERS

```bash
grep -E '^(export )?TELEGRAM_(BOT_TOKEN|ALLOWED_USERS)=' ~/.hermes/.env
```

預期：兩行都在。若變數名變了：lesson-2.html Step 4 的兩段 sed 補救（Variant A / B）+ ai-runbook.md Stage 14 失敗處理一起改。

## Check 8 · `hermes gateway` 原生 lifecycle 沒變、log 路徑沒變

```bash
hermes gateway --help | grep -E '\b(run|status|stop|restart)\b'
nohup hermes gateway run > /dev/null 2>&1 &
sleep 3
hermes gateway status
test -f ~/.hermes/logs/gateway.log && echo "log path ok" || echo "LOG PATH CHANGED"
tail -n 20 ~/.hermes/logs/gateway.log
hermes gateway stop
```

預期：
- [ ] 4 個 subcommand 都還在
- [ ] `status` 報 running、識別 manual mode
- [ ] log 路徑仍是 `~/.hermes/logs/gateway.log`
- [ ] log 無 401 / 409 / fatal、polling 仍是預設

---

## Check 9 · LINE Bot 外部教材連結還活著

```bash
curl -I https://lewsi.ddns.net/apply-tutorials/bots/line/line_bot_tutorial_zh.html
```

預期 200。失敗：lesson-4.html Step 2 fallback 升主文。

## Check 10 · ngrok apt repo 仍可達

```bash
curl -I https://ngrok-agent.s3.amazonaws.com/ngrok.asc
```

預期 200。失敗：更新 lesson-4.html Step 3 安裝指令。

## Check 11 · hermes 升級到最新 release

```bash
npm update -g @nousresearch/hermes && hermes --version
```

預期：升級成功、版本號顯示。`npm` 權限 / 網路問題 → 排除後再開課。

## Check 12 · hermes gateway 認得 line 平台

```bash
hermes gateway --help 2>&1 | grep -i line || hermes gateway list-platforms 2>&1
```

預期：含 `line`。沒有 → 升級 hermes (`npm update -g @nousresearch/hermes`)，仍沒有 → 暫緩開課。

---

## Check 13 · hermes CLI / `/skills list` 仍可用

```bash
hermes --version
```

預期：印出版本字串（例：`Hermes Agent v0.13.x`）。

```bash
hermes -z "/skills list" 2>&1 | head -20
```

預期：印出 bundled skill 清單（一行行類別 + 各類底下的 skill 名）。

```bash
hermes -z "/skills list --source local" 2>&1 | head -10
```

預期：印出本地 skill 清單表格（可能 0 項，但不該報錯）。

若 `/skills list` 或 `--source local` 報錯 / Unknown：hermes 可能改了指令命名，對照 plan §Dogfood Results 更新教材所有 `/skills list` 字串。

---

## Check 14 · cron 對話式設定仍可用（Step 2 核心依賴）

進 hermes CLI 或對 Telegram bot 講：

```
幫我設一個 cron job，2 分鐘後跑一次，內容：台北今日天氣，把結果推到我的 Telegram。
```

預期：
- hermes 主動寫入 `~/.hermes/cron.yaml`
- `cat ~/.hermes/cron.yaml` 看到剛才那條 job
- 2 分鐘後 Telegram 收到推送

若 hermes 沒主動寫 cron.yaml：教學場景免費 model 也可能會這樣，但 lesson-3.html Step 2「我卡住了」`<details>` 已給 fallback（更明確指 file path）。

若付費 model 也不寫：hermes 上游可能改了 cron 介面 → 整段 Step 2 重新驗證教材後再教學。

收尾：對 hermes 講「刪掉剛才那個 2 分鐘 cron」或編輯 `~/.hermes/cron.yaml` 移除。

---

## Check 15 · 對話式裝 skill-creator 仍可用（Step 3 核心依賴）

```bash
curl -fsI https://raw.githubusercontent.com/anthropics/skills/main/skills/skill-creator/SKILL.md
```

預期：第一行 `HTTP/2 200`、URL 仍有效。

接著對 hermes 講：

```
幫我裝這個 skill：https://github.com/anthropics/skills/tree/main/skills/skill-creator
```

預期：hermes 主動抓 URL、放到 `~/.hermes/skills/...`；`hermes -z "/skills list --source local"` 看到 `skill-creator`。

若 URL 失效（404）：去 https://github.com/anthropics/skills 找新位置，更新 lesson-3.html Step 3 + 本 check 的 URL。

收尾：保留 skill-creator（學員會用到）。

---

## Check 16 · skill-creator 訪談 UX 沒變（Step 4 核心依賴）

接 Check 15（skill-creator 已裝），跑：

```bash
hermes -z "/skill-creator 造一個 skill：每天推一句英文俚語" 2>&1 | head -50
```

或互動模式 `hermes` 進 CLI 後貼：

```
我想用 skill-creator 造一個 skill：每天推一句英文俚語
```

預期：skill-creator 開始訪談、會在某個問題問「evaluation / benchmarks / test cases」相關。**看到那個問題就 Ctrl+C 結束本驗證**（不必真造一個 skill）。

若訪談順序大改 / 沒有 evaluation 那題：對照 plan §Dogfood Results 4 更新 lesson-3.html Step 4 訪談描述。

---

## Part 2 完成後

更新 `README.md` 的「上次驗證」區塊（**只更新日期**，hermes 版本與 Windows 版本同上次）：

```markdown
- 日期：YYYY-MM-DD（今天）
- hermes 版本：（沿用上次或重跑 `hermes --version`）
- Windows 版本：（沿用上次）
```

```bash
git add README.md
git commit -m "chore: smoke test passed YYYY-MM-DD"
git push
```

---

# 完成回報範本

執行完 Part 1 或 Part 2 後，AI 應產出最終報告（人類審閱用）：

## Part 1 完成範本

```
[Part 1: Full Capture Run] — DONE / FAILED
- 開始時間: HH:MM
- 結束時間: HH:MM
- Total time: XX 分鐘
- Stages 完成: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Stages 失敗: <none / list>
- Screenshots captured (target 19): <實際數量, 列出檔名 + 大小>
- 異常觀察: 
  - <例：Stage 7-2 OpenRouter 沒有任何 deepseek :free，改選 qwen2.5-7b-instruct:free>
  - <例：Stage 6-2 install.sh 結尾訊息是 "Installation complete" 而非 "Hermes installed!"，已捕捉>
- README.md 更新: yes/no — <commit SHA>
- Screenshots 已 commit + push: yes/no — <commit SHA>
- GitHub Pages 線上驗證: pass/fail
- 下一步建議: <e.g., 已可教學 / 需先補 X>
```

## Part 2 完成範本

```
[Part 2: Quick Smoke Test] — PASS / FAIL
- 日期: YYYY-MM-DD
- 執行機器: <Windows 機 / Linux WSL>
- Check 1 (install.sh URL): PASS / FAIL — <details>
- Check 2 (hermes setup prompts): PASS / FAIL — <details>
- Check 3 (OpenRouter UI): PASS / FAIL — <details>
- Action items: <none / 列出要修的東西>
- Re-run Part 1 needed: yes/no
```

---

# 附錄

## 環境重置（若機器已裝過）

若你要在已經裝過 WSL/hermes 的機器跑 Part 1，先重置：

**移除 hermes：**
```bash
# 在 WSL Ubuntu 內
rm -rf ~/.hermes ~/.local/share/hermes
sudo rm /usr/local/bin/hermes 2>/dev/null
sudo rm ~/.local/bin/hermes 2>/dev/null
```

**移除 WSL Ubuntu（保留 WSL 引擎）：**
```powershell
# 在 PowerShell 系統管理員
wsl --unregister Ubuntu
```

**完全移除 WSL2（恢復到 Stage 1 之前狀態）：**
```powershell
wsl --unregister Ubuntu
dism.exe /online /disable-feature /featurename:Microsoft-Windows-Subsystem-Linux /norestart
dism.exe /online /disable-feature /featurename:VirtualMachinePlatform /norestart
# 重啟
```

⚠️ 完全移除 WSL2 會影響該機器所有 WSL distro，包括其他無關的 Linux 子系統。**只在乾淨測試機跑這個。**

## OpenRouter 測試帳號管理

建議：開一個專用測試帳號（與你個人 OpenRouter 帳號分離），這樣：
- 拍 Stage 3 截圖時不會洩漏個人 key 列表
- 重跑 smoke test 時可大膽試刪 / 試建 key
- key 額度耗盡也不影響個人使用

帳號 email 用免費 email 服務（gmail、outlook），密碼用 password manager 生成。

## 圖像隱私 checklist

commit 截圖前最後檢查一次：
- [ ] step-3-openrouter-keys.png：若有舊 key 列表，前綴 `sk-or-` 後字元已遮蔽
- [ ] step-3-openrouter-create-key.png：新 key 字串已遮蔽
- [ ] step-7-setup-apikey.png：輸入框是空的（截圖在貼之前）
- [ ] 任何截圖內：沒有個人 email 地址
- [ ] 任何截圖內：沒有真實密碼（即使是 `••••`，密碼欄該空白就空白）

若發現已 commit 並 push 過敏感截圖：
1. **立刻**去 OpenRouter dashboard 刪那把 key
2. 用 `git filter-branch` 或 BFG Repo-Cleaner 從 git history 移除（push --force 取代）
3. 重發新 key 給後續使用
