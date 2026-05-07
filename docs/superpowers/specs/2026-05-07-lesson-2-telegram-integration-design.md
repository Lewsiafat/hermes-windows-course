# Lesson 2 — Telegram 整合：設計文件

- **日期：** 2026-05-07
- **對應 hermes-agent：** 依教學前 smoke test 抓到的版本
- **教學形式：** 1-on-1 線上、預估 30–45 分鐘
- **前置：** 學員已完成 Lesson 1（hermes 在 WSL 裝好、可對話）

---

## 1. 摘要

接續 Lesson 1（60 分鐘從零裝好 hermes-agent），設計第二堂 30–45 分鐘的延伸課程：把學員裝好的 hermes 接到 Telegram，讓他們可以從手機跟 hermes 對話。本支教材獨立成一份精靈頁面 `lesson-2.html`，跟 Lesson 1 共用同一支 `wizard.js`（小 refactor 成 data-attribute 參數化）和 `style.css`，視覺與互動風格完全一致。範圍鎖在「機器開著時可用」的 polling 模式，不碰 24/7 部署、webhook、雲端託管。

---

## 2. 目標與終點

### 2.1 課程終點（學員結束時擁有）

1. Telegram bot 已申請、token 在手
2. 自己的 Telegram user_id 已知（hermes allowlist 用）
3. `~/.hermes/.env` 內已有 `TELEGRAM_BOT_TOKEN` 與 `TELEGRAM_ALLOWED_USERS`
4. `hermes gateway` 已能在背景跑（`nohup ... &`），log 寫到 `~/.hermes/gateway.log`
5. 至少完成一次「從手機 Telegram → bot → hermes 回覆 → 回手機」的對話
6. 知道怎麼看 gateway 狀態 (`pgrep`)、看 log (`tail -f`)、停掉 (`pkill`)
7. 知道 Windows 整個重啟後 gateway 會掛、要重跑（自動啟動暫不教）

### 2.2 教材成果（教師端）

- `lesson-2.html`：獨立精靈頁面（Step 0 + 7 步）
- `wizard.js`：refactor 成讀 `<body data-total-steps data-storage-key>`，同時支援 `index.html` 與 `lesson-2.html`
- `index.html` Step 9 加碼 B 末段加導引到 `lesson-2.html` 的連結
- 純靜態，無 build，部署仍是 git push → GitHub Pages

---

## 3. 對象與預設

| 維度 | 設定 |
|---|---|
| 程度 | 已完成 Lesson 1（用過 hermes 至少一次），對 Linux 終端機略有熟悉 |
| Pre-work | Lesson 1 完成、有手機 Telegram 帳號 |
| 形式 | 1-on-1 線上（也可獨立自學） |
| 語言 | 繁體中文 (zh_TW) |
| 範圍 | 機器（學員筆電）開著時可用。**不**處理 24/7、不部署到雲、不寫 webhook |

---

## 4. 範圍

### 4.1 In Scope
- BotFather 申請 bot（**外連**現有教材，不重做）
- @userinfobot 拿 user_id（**新內容**，舊教材沒涵蓋）
- `hermes gateway setup` 互動式精靈
- 手動編 `~/.hermes/.env`（含 paste 失敗的補救 sed，cross-ref Lesson 1 Step 7）
- `nohup hermes gateway > ~/.hermes/gateway.log 2>&1 &` 背景啟動
- `pgrep` / `tail -f` / `pkill` 三件式狀態管理
- 第一次手機 ↔ hermes 對話
- 加碼（`<details>`）：群組使用、語音、`/topic`、`/model`

### 4.2 Out of Scope（明示給後續課程）
- Windows / WSL 開機自動啟動（systemd / Task Scheduler）→ 留到 Lesson 4 後
- 24/7 雲端部署、webhook、Cloudflare Tunnel、Fly.io → 之後課程
- LINE Messaging API channel 接通 → Lesson 4
- hermes 日常使用（命令、context、skills）→ Lesson 3
- Multi-user 公開 bot（本教材的 allowlist 只設學員自己）

---

## 5. 教材結構（Step 0 + 7 步）

| Step | 標題 | 估時 | 重點 |
|---|---|---|---|
| **0** | 前言 · 為什麼把 hermes 接到 Telegram | 1 min | 4 checkpoints overview、polling 限制（機器要開）、跟 Lesson 1 Step 9 加碼 B 的銜接 |
| **1** | 開始之前 | 2 min | 前置確認（Lesson 1 完成、`hermes` 可用、有 Telegram）、4 個 checkpoints checklist、加碼預告 |
| **2** | 申請 Telegram bot | 5 min | BotFather → `/newbot` → 拿 token。**主流程外連**舊教材 `https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html`，這頁只放 2–3 句速覽 + 提醒暫存 token |
| **3** | 拿你的 Telegram user_id | 2 min | 找 [@userinfobot](https://t.me/userinfobot) → `/start` → 抄純數字。`<details>` 解釋 user_id 是什麼、為什麼要它（allowlist） |
| **4** | `hermes gateway setup` | 8 min | 跑 `hermes gateway setup` → 選 telegram → 貼 token → 貼 user_id → Setup complete!。Paste 失敗有雷（同 Lesson 1 Step 7），補救方案：sed 改 `~/.hermes/.env` 的 `TELEGRAM_BOT_TOKEN=` / `TELEGRAM_ALLOWED_USERS=` 兩行（**Variant A 互動 + Variant B 手動範本** 兩個版本，跟 Lesson 1 Step 7 同模式） |
| **5** | 啟動 `hermes gateway`（背景） | 5 min | 先前景試跑 `hermes gateway run`（看啟動 banner、Ctrl+C 停）；再背景跑 `nohup hermes gateway run > /dev/null 2>&1 &`（hermes 自己寫 log 到 `~/.hermes/logs/gateway.log`，所以 stdout/stderr 丟 `/dev/null`）。狀態 `hermes gateway status`；看 log `tail -f ~/.hermes/logs/gateway.log`；停掉 `hermes gateway stop`（萬一不行 fallback 用 `pkill -f "hermes gateway"`）。**`<details>` 解釋 `nohup` / `&` / `> /dev/null 2>&1`**。**`<details>` 誠實說 Windows 重啟會掛 gateway、要重跑；hermes 內建 `gateway install` 可裝 systemd 服務 24/7，但超出本堂範圍**。 |
| **6** | 第一次手機 ↔ hermes | 5 min | Telegram 搜 bot username → `/start` → 傳訊。練習多輪對話確認 context 連動。我卡住了：沒回應 / Unauthorized / bot 找不到 |
| **7** | 完成 + 加碼 + 下一步 | 5 min | ✓ 4 checkpoints。`<details>` 加碼：群組、語音、`/topic`、`/model`。下次預告：**Lesson 3 hermes 日常使用入門**、**Lesson 4 LINE gateway 設定** |

**總時數：33 min（落在 30–45 預算內）**

---

## 6. 技術架構

### 6.1 檔案

```
hermes-windows-course/
├── index.html              # Lesson 1（Step 0 + 9 步），加 body data-attrs
├── lesson-2.html           # 新建：Lesson 2（Step 0 + 7 步）
├── wizard.js               # 改 refactor：從 <body> 讀 data-total-steps、data-storage-key
├── style.css               # 不動
├── docs/superpowers/specs/2026-05-07-lesson-2-telegram-integration-design.md   # 本文件
├── docs/superpowers/plans/ # 後續 writing-plans 產出
├── pre-class-checklist.md  # 加 Lesson 2 smoke test items
├── ai-runbook.md           # 加 Lesson 2 stage（後續任務，本 spec 不展開）
└── README.md               # 結構說明加 lesson-2.html
```

### 6.2 `wizard.js` 重構

從硬編碼改成讀 `<body>` 的 data-attributes：

```js
const TOTAL_STEPS = parseInt(document.body.dataset.totalSteps, 10);
const STORAGE_KEY = document.body.dataset.storageKey;
```

對應 HTML：
- `index.html`：`<body data-total-steps="9" data-storage-key="hermes-course-step">`
- `lesson-2.html`：`<body data-total-steps="7" data-storage-key="hermes-lesson2-step">`

不寫 hard fallback——若 attribute 漏寫就讓 JS 爛掉（fail loud），避免哪天忘加屬性卻跑成 undefined 行為。

Step 0 仍是「前言頁」，不算進 TOTAL_STEPS、為各自精靈的預設首頁，跟 Lesson 1 既有處理一致。

### 6.3 既有資源重用

- **BotFather 申請流程**：Step 2 主動作外連 `https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html`，不重做截圖、不複製文字。這頁只放 2–3 句速覽提示「拿到 token 暫存到 Notes」。
- **`<details>` UX 模式**：沿用 Lesson 1 既有的「等待時可順便讀」「🚨 我卡住了」風格，不新發明。
- **`pre[data-copy]` Copy 按鈕**：`wizard.js` 既有功能直接適用，不必改。
- **paste 失敗補救 sed**：跟 Lesson 1 Step 7 同模式（`cd ~/.hermes && sed ...`），但操作的兩行是 `TELEGRAM_BOT_TOKEN=` 與 `TELEGRAM_ALLOWED_USERS=`，不是 `OPENROUTER_API_KEY=`。Step 4 cross-ref Lesson 1 Step 7 給有興趣的學員看完整邏輯。**保留 Lesson 1 既有的 `export` 前綴 convention**（CLAUDE.md 列為「原樣引用、不可擅自簡化」）——即使 hermes 預設寫的 .env 沒 `export`，加上去無害且維持兩堂一致。
- **hermes 原生 gateway lifecycle**：`hermes gateway` 本身提供 `run` / `start` / `stop` / `restart` / `status` / `install` 子命令，且自己管 PID lock（`~/.hermes/gateway.pid` / `gateway.lock`）與 log（`~/.hermes/logs/gateway.log`）。Step 5 用 `nohup hermes gateway run > /dev/null 2>&1 &`（背景跑、關 terminal OK）+ `hermes gateway status` / `stop`，把「能用 hermes 原生指令就用」當 default、`pgrep` / `pkill` 當 fallback。

### 6.4 Lesson 1 ↔ Lesson 2 串接

- `index.html` Step 9 加碼 B（申請 Telegram bot）末段加：「✓ 拿到 token 了？接著進 [Lesson 2](lesson-2.html) 把它接通到 hermes」
- `lesson-2.html` Step 0 / Step 1 提到「假設你已經完成 Lesson 1，且 `hermes` 指令在 PATH 裡。沒做過？先去 [Lesson 1](index.html)」
- `README.md` 結構區補列 `lesson-2.html`

---

## 7. 失敗模式與卡住對策

### Step 4 paste 失敗 → token 或 user_id 寫錯
- 跟 Lesson 1 Step 7 同根因（hermes 上游 paste 雷）。Step 4 的補救 section 處理。

### Step 5 跑 `hermes gateway run` 立刻 401
- token 寫錯。`hermes gateway stop`（或 fallback `pkill -f "hermes gateway"`）砍掉、回 Step 4 用 sed 補救改 `TELEGRAM_BOT_TOKEN=`、再背景跑一次。

### Step 5 重複啟動
- hermes 有 PID lock（`~/.hermes/gateway.pid` / `gateway.lock`），第二隻會被擋下、輸出 `Gateway already running (PID ...)`。看到這訊息：要嘛 `hermes gateway restart` 直接重啟、要嘛 `hermes gateway stop` 後再背景跑一次。

### Step 6 從手機傳訊沒回應
- 最有效 debug：去看 `~/.hermes/logs/gateway.log`（hermes 原生 log 路徑）。
- 常見三類：
  - log 顯示 unauthorized user → user_id 寫錯，回 Step 4
  - log 沒新訊息 → bot 找錯了（username 不對）或 polling 卡住
  - log 顯示 network error → WSL 網路問題

### 學員沒裝過 Lesson 1
- Step 0 / Step 1 已明示前置；學員若直接進 lesson-2.html 會看到提示連回 Lesson 1。

### Windows 重啟後 gateway 掛了
- 在 Step 5 `<details>` 誠實說明，告知重新登入 Ubuntu 後跑同一行 `nohup hermes gateway run > /dev/null 2>&1 &` 即可。**不教自動啟動**——`hermes gateway install --system` 雖然 hermes 內建可裝 systemd，但 24/7 / 開機自動啟動的 trade-off（資源、安全、啟動順序）值得整堂課展開，留給後續課程。

---

## 8. Smoke Test 範圍（pre-class-checklist 與 ai-runbook 的補充）

### 必檢項目（每次教學前）
- [ ] BotFather 仍存在、`/newbot` 流程順序仍與舊教材一致
- [ ] @userinfobot 仍可用、回應仍是純數字 user_id
- [ ] `hermes gateway setup` 互動精靈仍存在、欄位仍是 token + allowed users
- [ ] `~/.hermes/.env` 變數名仍是 `TELEGRAM_BOT_TOKEN` 與 `TELEGRAM_ALLOWED_USERS`（hermes 上游若改名要同步改 Step 4 補救 sed）
- [ ] `hermes gateway run` / `status` / `stop` 三個 native 子命令都還在、`status` 仍能識別 manual mode
- [ ] hermes 仍把 log 寫到 `~/.hermes/logs/gateway.log`、PID lock 仍在 `~/.hermes/gateway.pid`、polling 仍是預設

### 完整流程（教學前 / hermes 大改版後）
- 從 Lesson 1 結尾接著走 Lesson 2 全 7 步、傳訊成功一次
- 確認 `nohup hermes gateway run > /dev/null 2>&1 &` 後關 Ubuntu 視窗、再開、`hermes gateway status` 仍報 running

`pre-class-checklist.md` 與 `ai-runbook.md` 對應補項，由 implementation 階段處理（不在本 spec 詳列）。

---

## 9. 不在範圍（明示給後續工作）

- 截圖：本次先把文字版上線，截圖（BotFather、userinfobot、gateway log、手機對話）留給下次 Full Capture Run
- LINE gateway 接通：Lesson 4
- hermes 日常使用（命令、skills、cron）：Lesson 3
- 24/7 部署、systemd、Task Scheduler、Cloudflare Tunnel、Fly.io：Lesson 4 之後
- Multi-user 公開 bot、語音深度教學、群組進階使用：本教材以 `<details>` 點到，不展開

---

## 10. 開放問題（implementation 階段需確認）

> **2026-05-07 Smoke Check 結論（Task 0）：**
> - hermes v0.12.0 (2026.4.30) 確認 `hermes gateway` 有完整原生 lifecycle（`run` / `start` / `stop` / `restart` / `status` / `install`），且自己寫 log 到 `~/.hermes/logs/gateway.log`、自己管 PID lock。spec §5 / §6.3 / §7 / §8 已對應更新成原生指令版，`pgrep` / `pkill` 降為 fallback。
> - BotFather 舊教材主連結 `https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html` HTTP 200 仍存活。inline `<details>` 備援仍照寫（防失聯）。
> - `.env` 變數名 `TELEGRAM_BOT_TOKEN` / `TELEGRAM_ALLOWED_USERS` 確認；hermes 預設寫的 .env **不**含 `export` 前綴，但 Lesson 2 Step 4 sed 補救沿用 Lesson 1 Step 7 的 `export` convention（CLAUDE.md 規定原樣引用、加上去無害）。
> - `hermes gateway --log` flag 不存在——但因為 native log path 已固定，不需要。
>
> （原問題作為歷史紀錄留存：`~/.hermes/gateway.log` 路徑假設、`--log` flag 確認、BotFather 連結存活、`export` 前綴 convention）。
