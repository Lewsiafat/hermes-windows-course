# Lesson 4 · LINE 整合 — Design Spec（2026-05-12）

> 60 分鐘 1-on-1 線上課程；前置：Lesson 1 已裝好 hermes + 完成 first chat、Lesson 2 已接 Telegram；本課把 hermes 再接到 LINE 帳號，達成「手機 LINE 訊息 ↔ hermes」。  
> 來源：2026-05-11 dogfood memo（[`docs/improvements/2026-05-11.md`](../../improvements/2026-05-11.md)）+ 外部既有 LINE bot 申請教學。  
> 外部 LINE bot 申請教學（外連）：https://lewsi.ddns.net/apply-tutorials/bots/line/line_bot_tutorial_zh.html

## 設計原則

1. **不重複既有教學**：LINE Developers Console 註冊、Provider、channel、token/secret 取得已有完整外部教學，本課 Step 2 直接外連。
2. **單文件交付**：只一份 spec，不出實作 plan；課程不綁定特定 upstream PR — Step 1 直接請學員升級到 hermes 最新 release，把 LINE plugin 修復收進來。
3. **60 分鐘可完課**：systemd 24/7 守護、URL watcher 自動同步等進階項目放最末「加碼預告」，主流程不依賴。
4. **沿用 Lesson 1/2 的精靈 9/7 步結構**：本課 8 個 sections（Step 0-7），跟 Lesson 2 同形。
5. **採納 2026-05-11 dogfood memo §A/§B/§C/§D/§F 的高優先改進**：保留 redacted-verify 命令模式、wizard 完整 prompt 列表、LINE plugin 整合限制等學員會踩的雷。

---

## 範圍

### In scope
- 學員「Lesson 1+2 已過、想再接 LINE」的完整流程，含 ngrok 設定、`.env` 編輯、LINE Console webhook 補設、hermes gateway 啟動、手機端到端 smoke
- ngrok 申請、authtoken、tunnel 啟動三步合一節（memo §B5.1-5.4）
- redacted-verify 命令模式（memo §C2 / §D4）
- LINE Console 外部教學沒涵蓋的：webhook URL、Verify 按鈕、Webhook redelivery、Error statistics 兩個進階 toggle
- LINE-specific quirks 警告：Markdown strip / 雙 send / reply token TTL（memo §F）
- LINE_ALLOWED_USERS 從 gateway log 抓 U-ID 收緊

### Out of scope（明確不教）
- 上游 hermes patch 操作 — Step 1 升級到 latest release 後直接用，不教學員手動套 patch
- systemd 24/7 守護 ngrok + hermes gateway（放 Step 7 加碼預告，連結到單獨 advanced.md 文件，本 lesson 不必修）
- ngrok URL 變動 watcher 自動同步 `.env`（同上，加碼）
- LINE 多人 group / room 設定（memo §B 未提到，本 lesson 只教 1:1 DM）
- LINE 媒體（圖片、音、影）傳送（spec §F 提到要 LINE_PUBLIC_URL 配 HTTPS）：dogfood 沒驗證，本 lesson 不教
- LINE Rich Menu / Flex Message 等進階 UI

### 前置 checklist（在 Step 1 列給學員）
- Lesson 1 完成：`hermes chat` CLI 第一次對話通了
- Lesson 2 完成：Telegram bot 端到端可用（學員已熟悉 .env、hermes gateway 概念）
- 手機 LINE app 已登入個人帳號
- 一個還未用過的 LINE 帳號（避免和個人 ID 撞）— 或用個人帳號加 bot 也行
- WSL / Linux shell（與 Lesson 1/2 同一個）

---

## 課程結構（8 個 sections，60 分鐘）

| Step | 時段 | 標題 | 核心動作 | 主要素材出處 |
|---|---|---|---|---|
| 0 | 0:00-0:05 | 前言 · 為什麼把 hermes 接到 LINE | 對齊預期；列出結束時學員會有的東西 | 全新撰寫 |
| 1 | 0:05-0:15 | 開始之前 | 前置 checklist + 7 步預告 + 警告：訊息會花 OpenRouter credits | 全新撰寫 |
| 2 | 0:15-0:25 | 申請 LINE bot | 外連既有教學走到「Channel Access Token + Channel Secret + Bot basic ID」（外部 step 5），step 6 webhook 設定先停下回 Lesson 4 | 外連 https://lewsi.ddns.net/apply-tutorials/bots/line/line_bot_tutorial_zh.html |
| 3 | 0:25-0:32 | 裝 ngrok + 設 authtoken | apt repo 安裝 → 註冊 → 取 authtoken → `ngrok config add-authtoken` | memo §B5.1-5.3 |
| 4 | 0:32-0:40 | 開 ngrok tunnel + 寫 `.env` LINE block | 第二 shell 跑 `ngrok http 8646` 抓 URL → nano 編輯 `.env` 加 LINE 區塊 → redacted-verify | memo §B4 表 + §B5.4 + §C2 |
| 5 | 0:40-0:48 | 回 LINE Console 設 webhook | webhook URL 填 `<NGROK>/line/webhook` → 5 個 toggles → Verify 通過 | memo §B4 表（5 toggles）+ Verify 流程 |
| 6 | 0:48-0:57 | 啟動 hermes gateway + 手機端到端 | 第三 shell `hermes gateway` → 手機 LINE 送訊 → 看 gateway log 抓 U-ID → 收緊 LINE_ALLOWED_USERS → 重啟 gateway 驗證 | memo §F 端到端表 + 收緊流程 |
| 7 | 0:57-1:00 | 完成 + LINE quirks + 加碼預告 | LINE quirks 警告區塊 + systemd 24/7 加碼預告（連結 `docs/advanced/lesson-4-systemd.md`，本 lesson 不必走完）+ 下次預告 | memo §F LINE quirks + §B5.5 |

---

## Step 0 · 前言 · 為什麼把 hermes 接到 LINE

對齊內容（為何學員想學 LINE）：
- LINE 是台 / 港學員每天最常用的 messenger，比 Telegram 親民
- 接 LINE 後，hermes 變成「手機隨身助手」：通勤、會議、走路時都可以丟訊息給 hermes 處理
- 跟 Lesson 2 Telegram 差別：LINE 需要 public webhook URL（不能像 Telegram 長 poll），所以多一層 ngrok 概念

「結束時你會有」清單：
- 一個 LINE bot 已加為好友、能用手機送訊息給它
- ngrok tunnel 跑在背景（前景版，加碼才教 systemd）
- hermes gateway 跑在背景，會即時把 LINE 訊息 dispatch 給 LLM
- 知道 LINE 三大 quirks（Markdown strip / 雙 send / reply token TTL），不會誤以為 bot 壞了

---

## Step 1 · 開始之前

**前置 checklist**（同範圍那段，呈現給學員）

**這 7 步在做什麼**（學員預告）：
1. 申請 LINE bot 拿到 token 與 secret（外連既有教學）
2. 裝 ngrok 並設 authtoken（讓 LINE webhook 能從 internet 打進 hermes）
3. 啟 ngrok tunnel 並寫 `.env`
4. 回 LINE Console 把 webhook URL 對上 ngrok URL
5. 啟動 hermes gateway 接受訊息
6. 手機送訊息驗證
7. 收尾 + 進階預告

**警告**（在 Step 1 顯式提）：
- 每則手機送出去的訊息會經 OpenRouter 扣費（Lesson 1 若用付費 model 更明顯）
- 課堂示範控制在 < 5 則訊息

---

## Step 2 · 申請 LINE bot（外連既有教學）

> **直接走這個外部教學**：https://lewsi.ddns.net/apply-tutorials/bots/line/line_bot_tutorial_zh.html

**走到第 5 步「取得 Channel Access Token」結束就停下**回來 Lesson 4 Step 3。外部教學的 step 6（設定 Bot 回應方式 — webhook + toggles）**先不要做**，因為現在還沒有 ngrok URL 可以填 webhook URL；Lesson 4 Step 5 才回去處理。

**結束時你應該有：**
- Channel Access Token（長 ~170 字元的 base64 字串）
- Channel Secret（32 hex 字元）
- Bot basic ID（@ 開頭，例：`@123abcde`）— 也可從 Messaging API 分頁的 QR code 直接掃

**安全提醒（本課強化）**：
- token / secret 都是 secret — 不要截圖共享、不要 commit 進 git、不要貼進公開聊天
- 等等填進 `.env` 時用 nano，不要 `echo` 或命令列 paste（避免進 shell history）

---

## Step 3 · 裝 ngrok + 設 authtoken

> ngrok 是把 LINE 雲端送來的 webhook 訊息轉發到你本機 hermes 的橋樑。LINE 不接受 `localhost` 或內網 IP，必須公開 HTTPS URL。ngrok free tier 適合學員入門。

### 動作

1. **裝 ngrok（aarch64 / amd64 都可用同一個 apt repo）**

```bash
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
  && echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list \
  && sudo apt update && sudo apt install ngrok
```

驗證：`ngrok version` → 看到 v3.x.x

2. **註冊 ngrok 帳號**

開瀏覽器 https://dashboard.ngrok.com/signup → 用 GitHub 或 Google OAuth 註冊（最快）→ 進 Dashboard

3. **取得 authtoken**

Sidebar → "Your Authtoken" → 複製顯示的字串

⚠️ authtoken 也是 secret，**不要截圖、不要 commit、不要貼進公開聊天**

4. **設定 authtoken**

```bash
ngrok config add-authtoken <貼上你的 authtoken>
```

預期輸出：`Authtoken saved to configuration file: ~/.config/ngrok/ngrok.yml`

### 為什麼這步是核心

ngrok free tier **沒設 authtoken 時 session 撐不過半小時就會斷**；**設了 authtoken 之後 session 不會主動 timeout，agent process 不死就不斷**。學員若把 ngrok 當「打開 tunnel 就好」，下午 bot 就斷了會以為是 bug。

---

## Step 4 · 開 ngrok tunnel + 寫 `.env` LINE block

### 動作

1. **第二個 shell window / tmux pane 跑 ngrok**（記為 Window B，保留到課程結束）

```bash
ngrok http 8646
```

ngrok panel 出現後，把 `Forwarding` 那行的 `https://xxxx-yyyy.ngrok-free.app` URL 抄下來（**完整含 `https://`**），下一步要用。

2. **回第一個 shell（Window A），nano 編輯 `.env`**

```bash
nano ~/.hermes/.env
```

捲到檔尾，**手動 append 以下區塊**（注意 hermes 的 `.env` 預設**沒有** LINE 區塊，要自己加）：

```
# =============================================================================
# LINE INTEGRATION
# =============================================================================
LINE_CHANNEL_ACCESS_TOKEN=<貼 Step 2 拿到的 token>
LINE_CHANNEL_SECRET=<貼 Step 2 拿到的 secret>
LINE_PUBLIC_URL=<貼上面 ngrok 那條 URL>
LINE_ALLOWED_USERS=
LINE_ALLOW_ALL_USERS=true
```

> **為什麼 `LINE_ALLOWED_USERS=` 留空 + `LINE_ALLOW_ALL_USERS=true`：** 我們現在還不知道學員自己的 LINE User ID（U 開頭 32 字元 hex），Step 6 從 gateway log 抓到後再收緊。

按 `Ctrl+O` 存檔 → `Ctrl+X` 退出。

3. **redacted verify**（**不要直接 `cat .env`，會把 token 暴露**）

```bash
awk -F= '/^LINE_/{print $1, "len="length($2)}' ~/.hermes/.env
```

預期看到類似：
```
LINE_CHANNEL_ACCESS_TOKEN len=170
LINE_CHANNEL_SECRET len=32
LINE_PUBLIC_URL len=40
LINE_ALLOWED_USERS len=0
LINE_ALLOW_ALL_USERS len=4
```

token 長度若 < 100 或 secret 長度不是 32 → token/secret 貼錯，回 nano 重貼。

> **學員第一大踩雷點**：複製貼上時帶到換行 / 空白。redacted verify 是抓這個的最快檢查。

---

## Step 5 · 回 LINE Console 設 webhook URL + 5 個 toggles + Verify

### 動作

1. **回 https://developers.line.biz/console/ → 你的 Provider → 你的 channel → Messaging API 分頁**

2. **設 Webhook URL**

在「Webhook settings」section：
- Webhook URL 欄填 `<ngrok URL>/line/webhook`（**注意 path 結尾是 `/line/webhook`，不要漏**）
- 按 **Update / 更新**

**現在還不要按 Verify** — gateway 沒起來，必失敗。

3. **5 個 Toggles 對照表**（外部教學只教前 3 個；後 2 個是本課新增）

| Toggle | 設定 | 為什麼 |
|---|---|---|
| **Use webhook** | ON ✅ | 必開，不然 LINE 不會送 webhook 給你 |
| **Auto-reply messages** | OFF ❌ | 預設開的話 LINE 會自動回客服訊息蓋掉 hermes 回應 |
| **Greeting messages** | OFF ❌ | 預設開的話加好友時學員會收到 LINE 預設歡迎訊息，造成困擾 |
| **Webhook redelivery** | OFF ❌ | 開的話 hermes crash 時 LINE 重送同一訊息 → log 難辨識、bug 會被放大 |
| **Error statistics aggregation** | ON ✅（隨意）| 純資料收集，無風險；debugging 友善 |

4. **Step 6 起動 gateway 後再回來按 Verify**（本步驟先打住）

---

## Step 6 · 啟動 hermes gateway + 手機端到端 smoke

### 動作

1. **第三個 shell window / tmux pane（Window C）啟動 gateway**

```bash
hermes gateway
```

預期看到的 log 關鍵字（任何一個 traceback 都先停下）：
- `✓ line connected`
- `Gateway running with 1 platform(s)`
- `Secret redaction: ENABLED`

2. **回 LINE Console 按 Verify**

預期：✅ Success
若失敗：
- "Status 4xx" → webhook URL 路徑漏 `/line/webhook`
- "Signature mismatch" → channel secret 抄錯，回 Step 4 redacted verify 確認 secret len=32
- "Timeout" → ngrok（Window B）已斷，重起 ngrok 並更新 `LINE_PUBLIC_URL`

3. **手機 LINE 加 bot 為好友 → 送第一個訊息**

加好友兩條路徑（外部教學第 7 步已教，這裡是引用）：
- 掃 LINE Console > Messaging API > QR code
- 或在 LINE app 搜尋 bot basic ID（`@xxxxxx`）

加好友後，送一句：「測試」或「你好」。

4. **看 Window C gateway log**

預期會看到類似：
```
inbound message: platform=line user=U<32-hex> chat=U<32-hex> msg='測試'
response ready: platform=line chat=U<32-hex> time=5.x s api_calls=1 response=<N> chars
[Line] Sending response (<N> chars) to U<32-hex>
```

**抓你自己的 `U<32-hex>` user ID，下一步要用。**

5. **手機 LINE 確認收到 bot 回應**

✅ 收到 → 你的 LINE bot 已經能跑！
❌ 沒收到但 log 顯示 Send 成功 → `LINE_ALLOWED_USERS` 把你檔掉（但本課 Step 4 設 `LINE_ALLOW_ALL_USERS=true`，理論上不會）

6. **收緊 `LINE_ALLOWED_USERS`**（避免別人也加你 bot 用你 OpenRouter 額度）

```bash
sed -i "s/^LINE_ALLOWED_USERS=.*/LINE_ALLOWED_USERS=U<貼你的 32-hex user id>/" ~/.hermes/.env
sed -i 's/^LINE_ALLOW_ALL_USERS=.*/LINE_ALLOW_ALL_USERS=false/' ~/.hermes/.env
grep -E '^LINE_(ALLOWED_USERS|ALLOW_ALL_USERS)' ~/.hermes/.env
```

預期看到 `LINE_ALLOWED_USERS=U...`、`LINE_ALLOW_ALL_USERS=false`。

7. **重啟 gateway 驗證收緊有效**

Window C 按 `Ctrl+C` 殺掉 → 重跑 `hermes gateway` → 手機再送一句 → 仍收到回應（自己 OK）

> 若想額外驗證「名單外被擋」：拿另一個 LINE 帳號加 bot 送訊息，gateway log 應該不會 dispatch（學員選做、本課不必）。

---

## Step 7 · 完成 + LINE quirks + 加碼預告

### 你做到了

✅ Lesson 4 完成。學員手上現在有：
- 一個跑著的 LINE bot（透過 ngrok tunnel 接 LINE → 接 hermes → 接 OpenRouter）
- 自己 LINE User ID 已寫進 allowlist（別人不能用）
- 知道 redacted verify 命令模式，避免 secret 外洩

### ⚠️ LINE quirks 必須知道（避免之後誤判 bot 壞了）

| Quirk | 觀察 | 為什麼 |
|---|---|---|
| **Markdown 不會 render** | 你叫 hermes 用 `**bold**` 回應，手機看到的是純文字（沒粗體） | LINE plugin 把 markdown strip 掉，因為 LINE 本身不支援 markdown |
| **第一則訊息可能雙 send** | 你送一句，bot 回兩條（先短後長） | hermes 用 LINE bubble 分訊息回應；正常行為，不是 bug |
| **慢 LLM 會出 postback 按鈕** | 若用免費 deepseek 之類較慢 model，可能看到「請按這個按鈕拿答案」 | LINE reply token 60 秒就過期，hermes 為了不浪費付費 Push API，先回 button 等學員按下載入完整答案 |
| **ngrok URL 重啟會換** | 隔天醒來 bot 不回 → 通常是 ngrok agent process 死了 / 重連，URL 換了 | 要重啟 ngrok → 抓新 URL → 改 `~/.hermes/.env` → 改 LINE Console webhook URL → 重啟 `hermes gateway` |

### 🎁 加碼預告（不在本課範圍但你之後可選）

下面這些**不必修**；如果你想讓 LINE bot 24/7 在背景自動跑、就算機器重開也自動拉起，可以後續看：

- **systemd --user service 守護 hermes gateway + ngrok agent**：開機自動跑、failure 自動 restart、log 進 journal
- **ngrok URL 自動同步 watcher**：ngrok agent 重連換 URL 時，watcher 自動 patch `~/.hermes/.env` + 重啟 hermes gateway（LINE Console webhook URL 仍需手動改 — LINE 沒開 API）
- **進階文件**：`docs/advanced/lesson-4-systemd.md`（待寫，模板對應本 spec 同檔案夾下）

### 下次預告

下次 Lesson 5（暫定 / 未排）可能會 cover：
- LINE Rich Menu 客製化按鈕
- 多 platform 同時跑（Telegram + LINE 同個 hermes）
- 或者你想學什麼下次告訴我

---

## 課程驗收（spec 用，學員端不公開）

學員完成 Lesson 4 視為達標，當且僅當：

1. ✅ `~/.hermes/.env` 含完整 LINE block，redacted verify 4 個 LINE_* 變數長度合理
2. ✅ `ngrok http 8646` 在 Window B 跑著，panel 顯示 forwarding to localhost:8646
3. ✅ LINE Console webhook URL 設為 `<ngrok>/line/webhook`，Verify Success
4. ✅ `hermes gateway` 在 Window C 跑著，log 含 `✓ line connected`
5. ✅ 手機 LINE 送一句訊息，bot 回應收到
6. ✅ `LINE_ALLOWED_USERS` 已收緊為單一 U-ID，`LINE_ALLOW_ALL_USERS=false`
7. ✅ 知道 4 大 LINE quirks（Markdown / 雙 send / postback / ngrok URL 變動）

---

## Implementation hints（給未來寫 lesson-4.html 的人）

- 沿用 `lesson-2.html` 的精靈架構（`<body data-total-steps="7" data-storage-key="lesson-4-step">`）
- 沿用 `wizard.js` 不變
- 沿用 `style.css` 不變
- Step 2 外連教學的部分用 `<details>` 收一份 fallback 文案，以防 lewsi.ddns.net 失聯
- Step 4 / Step 6 的 redacted verify 命令用 `<pre data-copy>` 包讓學員一鍵複製
- Step 7 加碼預告用 `<details>` 摺疊，預設關著
- README.md 結構區補列 `lesson-4.html`
- `pre-class-checklist.md` 加 Lesson 4 必檢項
- `ai-runbook.md` 加 Lesson 4 stages（編號接 Lesson 2 stages 17 之後）

## 開課前驗證 SOP（給維運者）

1. hermes 升級到最新 release —`npm update -g @nousresearch/hermes && hermes --version`，確認 npm 權限 / 網路通；學員 Step 1 也會做一次，這裡是維運者先排除自己環境障礙
2. 外部教學 URL 仍可達且內容對齊：https://lewsi.ddns.net/apply-tutorials/bots/line/line_bot_tutorial_zh.html
3. ngrok apt repo 仍有效（curl test）
4. 自己跑一遍 Step 2-6（不必走 Step 7 加碼）— 完課可用為止
