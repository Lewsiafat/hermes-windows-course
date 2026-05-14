# Pre-Class Smoke Test

每次教學前 10–15 分鐘做完。發現任何不一致就立即修教材。

## 環境準備

- [ ] 一台乾淨的 Windows 機器（或還原到乾淨快照的 VM）
- [ ] 網路通暢
- [ ] OpenRouter 帳號（測試用，可重用）

## 必檢四項（最容易壞）

### 1. install.sh URL 還活著

```bash
curl -I https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh
```

預期：`HTTP/2 200`。  
若 404：Nous Research 可能改了 repo 結構 → 找新 URL，更新 Step 6 的指令。

### 2. `hermes setup` 提示順序與選項

跑一次完整安裝（Task 8 → Task 10）：

- [ ] `hermes setup` 出現 5 個提示（provider / model / API key / tools / terminal）順序一致
- [ ] OpenRouter 仍在 provider 選單裡
- [ ] 至少有一個 deepseek 系列 model 標 `:free`

若提示順序變了：對應更新 Step 7 的表格、補新截圖。

### 3. OpenRouter UI

- [ ] Dashboard 左側仍有 "Keys" 入口
- [ ] Create Key 仍是「點按鈕 → 顯示一次 → 不再顯示」流程
- [ ] 左側仍有 "Credits" 入口（或 `openrouter.ai/credits` 仍可用）；儲值流程仍是「選金額 → 信用卡 → 餘額即時更新」
- [ ] 推薦付費 model 仍存在：搜 `deepseek/deepseek-v4-pro`、`minimax/minimax-m2.7` 兩個 ID 都還能找到。**任一個下架時必須改 Step 3 與 Step 7 的對應字串。**

若 UI 變了：補 Step 3 的截圖。

### 4. 補救 sed script 仍能正確改 .env

確認 hermes 安裝後 `~/.hermes/.env` 真的存在、裡面真的有 `OPENROUTER_API_KEY=` 這行：

```bash
ls ~/.hermes/.env && grep '^OPENROUTER_API_KEY=' ~/.hermes/.env
```

若 hermes 改了 config 路徑或變數名 → Step 7 補救 section 的 sed 與 Step 8 的 400 troubleshooting 都要重抓。

## Lesson 2 必檢項（Telegram 整合）

每次教學前若會教到 Lesson 2，這幾條一起跑：

### 1. BotFather 主教材連結還活著

```bash
curl -I https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html
```

預期：`HTTP/2 200` 或 `HTTP/1.1 200 OK`。
若 4xx/5xx：lesson-2.html Step 2 的 `<details>` 備援文案就是 fallback；告訴學員直接看那個。
若主機完全打不到（`Could not resolve host`）：考慮是否要把 Step 2 主流程改用 inline 備援。

### 2. @userinfobot 仍可用

手機 Telegram 開 https://t.me/userinfobot → `/start`。
預期：回一段含 `Id: 數字` 的訊息。
若 bot 不在了：找替代品（如 @username_to_id_bot）並更新 lesson-2.html Step 3。

### 3. `hermes gateway setup` 互動精靈順序

```bash
hermes gateway setup
```

走到「選 telegram」那一頁就好（**不必填完**，按 Ctrl+C 中斷）。確認：
- [ ] 仍可選 `telegram`
- [ ] 提示順序仍是：選 gateway → 貼 token → 貼 allowed users
- [ ] 無多出/少了欄位

若改了：lesson-2.html Step 4 的「3 個提示怎麼答」表格要對應改。

### 4. .env 變數名仍是 TELEGRAM_BOT_TOKEN / TELEGRAM_ALLOWED_USERS

跑完一次 setup 後：

```bash
grep -E '^(export )?TELEGRAM_(BOT_TOKEN|ALLOWED_USERS)=' ~/.hermes/.env
```

預期：兩行都在。
若變數名變了：lesson-2.html Step 4 的兩段 sed 補救（Variant A / B）一起改。

### 5. `hermes gateway` 原生 lifecycle 仍在、polling 預設沒變

```bash
hermes gateway --help | grep -E '\b(run|status|stop|restart)\b'
```

預期：四個 subcommand 都列出。

實際跑一次：

```bash
nohup hermes gateway run > /dev/null 2>&1 &
sleep 3
hermes gateway status
tail -n 30 ~/.hermes/logs/gateway.log
hermes gateway stop
```

預期：
- [ ] `status` 報 `✓ Gateway is running (PID: ...)`、註明 `(Running manually, not as a system service)`
- [ ] log 在 `~/.hermes/logs/gateway.log` 有新行、無 401 / 409 / fatal
- [ ] log 顯示在 polling 模式（而非 webhook 之類）
- [ ] `hermes gateway stop` 後再 `hermes gateway status` 應該報 stopped

## Lesson 3 必檢項（日常使用）

每次教學前若會教 Lesson 3，這幾條一起跑：

### 1. hermes CLI 仍可啟動

```bash
hermes --version
```

預期：印出版本字串。若 command not found：Lesson 1 安裝環節需先修。

### 2. `/skills list` 與 `/skills list --source local` 仍有效

進 `hermes` CLI、傳 `/skills list`（看 bundled 清單）、再傳 `/skills list --source local`（看本地清單，可能空，但不該報錯）。

預期：兩個指令都印出表格（local 可能 0 項）、沒 Unknown command。

若 `/skills list` 報錯：hermes 版本可能改了指令命名。對照 plan §Dogfood Results 結果，更新 `lesson-3.html` Step 3 / Step 4 內所有 `/skills` 字串。

### 3. cron 對話式設定仍可用（Step 2 主要依賴）

進 hermes CLI 或 Telegram bot，貼：

```
幫我設一個 cron job，2 分鐘後跑一次，內容：台北今日天氣，把結果推到我的 Telegram。
```

預期：hermes 主動寫入 `~/.hermes/cron.yaml`（`cat ~/.hermes/cron.yaml` 確認）+ 2 分鐘後 Telegram 真的收到推送。

若 hermes 沒主動寫 cron.yaml：
- 學員場景免費 model 也可能不會 —— lesson-3.html Step 2「我卡住了」`<details>` 已給 fallback（更明確要求編輯 file path）。教學場景假設付費 model，此 fallback 仍要保留。
- 若付費 model 也不寫：hermes 上游可能改了 cron 介面 —— 整段 Step 2 要重新驗證教材。

收尾：對 hermes 講「刪掉剛才那個 2 分鐘 cron」或直接編輯 `~/.hermes/cron.yaml` 移除。

### 4. 對話式裝 skill-creator 仍可用（Step 3 主要依賴）

進 hermes CLI，貼：

```
幫我裝這個 skill：https://github.com/anthropics/skills/tree/main/skills/skill-creator
```

預期：hermes 主動抓 URL、放到 `~/.hermes/skills/` 底下；`/skills list --source local` 看得到 `skill-creator`。

若沒主動裝 → fallback：

```
/skills install https://github.com/anthropics/skills/tree/main/skills/skill-creator
```

若仍裝不起來（404 / repo 變動）：對照 plan §Dogfood Results 確認 skill-creator URL 是否還有效；若上游搬家：更新 lesson-3.html Step 3 與本 checklist 的 URL。

收尾：保留 skill-creator（學員用得到）；或 `rm -r ~/.hermes/skills/meta/skill-creator/`（看實際落地路徑）。

### 5. skill-creator 訪談 UX 沒變

接續上一條（skill-creator 已裝），跑：

```
/skill-creator
```

或對 hermes 講「用 skill-creator 造一個 skill：每天早上推一條英文俚語」。

預期：
- skill-creator 開始訪談、問基本問題（是什麼 / 何時觸發 / 輸出格式）
- 會在某個時點問「要不要 evaluation / benchmarks / test cases」（用對應措辭）
- 對「不用 eval、只 vibe 就好」這類回應能跳過繼續

若訪談流程跟教材描述差很多（例如沒問 evaluation 那題、或基本問題順序大不同）：對照 plan §Dogfood Results 4 → 更新 lesson-3.html Step 4 訪談描述字眼。

**不必跑到底**：看到「evaluation」那題的措辭就 Ctrl+C 退出，這條目的只是驗教材描述還對得上。

## Lesson 4 必檢項（LINE 整合）

每次教學前若會教 Lesson 4，這幾條一起跑：

### 1. LINE Bot 外部教材連結還活著

```bash
curl -I https://lewsi.ddns.net/apply-tutorials/bots/line/line_bot_tutorial_zh.html
```

預期：`HTTP/2 200` 或 `HTTP/1.1 200 OK`。  
若 4xx / 5xx：lesson-4.html Step 2 的 `<details>` 備援文案就是 fallback。  
若主機完全打不到：考慮把備援升到主文。

### 2. ngrok apt repo 仍可達

```bash
curl -I https://ngrok-agent.s3.amazonaws.com/ngrok.asc
```

預期：`HTTP/2 200` 或 `HTTP/1.1 200 OK`。  
若失敗：ngrok 改了 distribution → 查 `https://ngrok.com/download` 看新指令，更新 lesson-4.html Step 3 的 apt 區塊。

### 3. hermes 升級到最新 release

```bash
npm update -g @nousresearch/hermes && hermes --version
```

預期：升級成功、版本號顯示。  
若 `npm` 權限 / 網路問題：排除後再開課。LINE plugin 必要 fix 已隨較新 release 收錄；學員 Step 1 也會做一次。

### 4. hermes gateway 認得 `line` 平台

```bash
hermes gateway --help 2>&1 | grep -i line || hermes gateway list-platforms 2>&1
```

預期：任一行輸出含 `line`。  
若沒有：升級 hermes：

```bash
npm update -g @nousresearch/hermes && hermes --version
```

升級後仍沒有 → 暫緩開課。

## 截圖檢查

依 spec §8.1 走過 `assets/screenshots/`：

- [ ] step-2-*.png（PowerShell admin、wsl --install 下載中）
- [ ] step-3-*.png（OpenRouter 註冊頁、Dashboard、Keys、Create Key）
- [ ] step-5-*.png（Ubuntu 設 username、設 password）
- [ ] step-6-*.png（install.sh 跑中、`Hermes installed!`）
- [ ] step-7-*.png（hermes setup 五個提示）
- [ ] step-8-*.png（hermes TUI 啟動、streaming、/exit）
- [ ] step-9-*.png（hermes doctor 輸出）

任何一張看起來跟現實 UI 對不上 → 補新圖、commit、push。

## 驗證紀錄

完成後更新 `README.md` 的「上次驗證」區塊：

- 日期（YYYY-MM-DD）
- hermes 版本：`hermes --version` 的輸出
- Windows 版本：「設定 → 系統 → 關於」 的版本號
