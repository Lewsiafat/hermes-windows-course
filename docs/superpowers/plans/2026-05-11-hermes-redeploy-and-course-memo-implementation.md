# Hermes 重新部署 + 課程改進 Memo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Oracle Cloud VM (Linux aarch64) 上 dogfood 部署上游 NousResearch/hermes-agent，刻意對齊現有 Lesson 1/Lesson 2，完成端到端 LINE smoke 後產出 `docs/improvements/2026-05-11.md` 作為下一輪課程修訂依據。

**Architecture:** 純操作流程，不是寫 code 任務。10 個 Tasks 線性對應 spec §3 部署流程的每一段，加上前後 bracket（Task 0 觀察工作區 / Task 9 memo synth / Task 10 commit）。所有「過程觀察」即時寫進 `/tmp/hermes-deploy-2026-05-11/observations.md`（不入 git），部署完成後整理進正式 memo。**驗證模式：operational smoke（CLI 輸出比對、log 檢查、手機收訊息確認），不是 unit test。**

**Tech Stack:** hermes-agent（Python 3.11+，上游 main）、OpenRouter API、ngrok tunnel、LINE Messaging API、bash/zsh、git。

**Spec:** `docs/superpowers/specs/2026-05-11-hermes-redeploy-and-course-memo-design.md`

**Execution mode note:** 此計畫有大量 **interactive web/phone 步驟，必須由 user 親手執行**（OpenRouter 註冊、LINE Developers Console 操作、ngrok 註冊、手機送 LINE）。每個 step 明確標註 `**[User does this]**` 或 `**[I do this]**`。執行者（agent 或 human）對 user-interactive 步驟須 block 等待：prompt user → 等貼回 output/確認 → 才往下。

---

## File Structure

```
/tmp/hermes-deploy-2026-05-11/             # scratch — NOT committed, NOT in any repo
└── observations.md                        # 即時筆記，Task 0 建、Task 9 整理後 Task 10 刪

~/.hermes/                                  # hermes 安裝目錄（上游 install.sh 預設）
├── .env                                    # OpenRouter key、LINE creds 寫在這
├── config.yaml                             # gateway.platforms.line.enabled: true
└── plugins/platforms/line/adapter.py       # ★ Task 5 patch 目標（路徑由 Task 5 Step 1 動態找）

hermes-windows-course/                      # 課程 git repo（本任務唯一 commit 對象）
└── docs/improvements/
    └── 2026-05-11.md                        # ★ Task 9 建、Task 10 commit+push
```

**Boundaries:**
- 不修改 hermes 上游 source（除 Task 5 unblock patch）。
- 不修改 hermes-windows-course 既有教材檔（`index.html` / `lesson-2.html` / `ai-runbook.md` / `pre-class-checklist.md` / `README.md` / `CLAUDE.md` 全不動）。
- 唯一寫入 hermes-windows-course 的新檔是 `docs/improvements/2026-05-11.md`。
- scratch notes 留在 `/tmp/`，禁止用 `rm -rf /tmp/`，只 `rm -rf /tmp/hermes-deploy-2026-05-11/`。

---

## Tasks

### Task 0: Bootstrap 觀察工作區

**Files:**
- Create: `/tmp/hermes-deploy-2026-05-11/observations.md`

- [ ] **Step 1 [I do this]: 建立工作目錄與觀察檔案模板**

```bash
mkdir -p /tmp/hermes-deploy-2026-05-11
cat > /tmp/hermes-deploy-2026-05-11/observations.md <<'EOF'
# Dogfood Observations — 2026-05-11

> 即時筆記。部署完成後整理進 `docs/improvements/2026-05-11.md`。本檔不入 git。

## 環境基線
- 日期：2026-05-11
- 主機：Oracle Cloud VM, Linux aarch64
- Shell：zsh
- 既有工具：nginx, certbot/LE, rg, uv, git, docker, node
- 對照基準：Lesson 1 (install + first chat), Lesson 2 (Telegram)
- hermes-windows-course HEAD commit：(填)

## 部署步驟觀察

(每完成一個 Task 在這裡新增一段，依下列格式)

## Task N — 對應到 Lesson?-Step?
- 預期行為（依課程或上游 docs）：
- 實際行為：
- 落差 / 卡點 / 驚喜：
- 改進候選（→ 課程哪段、優先序 H/M/L）：

EOF
```

- [ ] **Step 2 [I do this]: 驗證檔案存在 + 抓 course base commit**

```bash
ls -la /tmp/hermes-deploy-2026-05-11/observations.md && \
  wc -l /tmp/hermes-deploy-2026-05-11/observations.md && \
  echo "---" && \
  git -C /home/lewsi/Documents/workspaceAgent/hermes-windows-course log --oneline -1
```

Expected: 檔案存在約 20 行；輸出最新 commit SHA。

- [ ] **Step 3 [I do this]: 用 Edit 工具把上面 git log -1 的 commit SHA 填進 observations.md 「對照基準」段**

把 `hermes-windows-course HEAD commit：(填)` 改成 `hermes-windows-course HEAD commit：<SHA> <subject>`。

---

### Task 1: 上游 install.sh 部署 hermes（對應 Lesson 1 Step 5）

**Files:**
- Side-effect: `~/.hermes/` directory created
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`

對應 spec §3.1。

- [ ] **Step 1 [User does this]: 確認尚未有 hermes（避免覆寫舊版）**

```bash
which hermes 2>&1 ; hermes --version 2>&1
```

把完整輸出貼給我。預期：找不到（`zsh: command not found: hermes` 或 `which: no hermes`）。  
若已存在：先停下，告訴我目前裝的版本與位置；我們需要先 backup `~/.hermes/` 或 uninstall。

- [ ] **Step 2 [User does this]: 跑上游 install.sh（注意：會下載並執行遠端 script）**

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

把完整 stdout/stderr 貼回給我。觀察重點（我會記進 observations.md）：
- 互動 prompt 有哪些（是否要求輸入 path / yes-no）
- 下載階段所用工具（curl / git / uv / pip）
- 出現的版本字串 / commit SHA
- 安裝時間（粗略，分鐘）
- 任何 warning 或 non-zero exit
- 與課程 Lesson 1 Step 5 對照差異

- [ ] **Step 3 [User does this]: 確認 hermes CLI 已 PATH 可用**

可能需要先 `source ~/.zshrc` 或新開 shell。

```bash
which hermes && hermes --version && hermes --help | head -30
```

把完整輸出貼給我。

- [ ] **Step 4 [I do this]: 在 observations.md 新增 Task 1 段落**

依模板填：預期 vs 實際、落差、改進候選。版本字串完整記下（後續 memo §A 用到）。

---

### Task 2: 配置 OpenRouter Provider + API Key（對應 Lesson 1 Step 6）

**Files:**
- Modify: `~/.hermes/.env`（hermes setup 寫入）
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`

對應 spec §3.2。

- [ ] **Step 1 [User does this]: 取得 OpenRouter API key**

開瀏覽器 → https://openrouter.ai/ → 註冊或登入 → Keys → Create Key。**不要把 key 貼進 chat**。

事後告訴我（不含 key 本身）：
- 註冊流程是否仍如 Lesson 1 Step 6 描述？(email-only? OAuth Google?)
- 仍免信用卡？
- Keys 頁面是否變了 UI？

- [ ] **Step 2 [User does this]: 跑 `hermes setup` 互動式 wizard**

```bash
hermes setup
```

逐題截圖或抄錄 wizard 出現的 prompt 貼給我（**API key 那行只貼問題、不貼 key**）。觀察重點：
- prompt 順序（provider → key → model？或先 model？）
- 中文 / 英文？
- 預設選 OpenRouter？
- 有 free model 提示？
- 任何看不懂的選項？

填答：
- Provider：**OpenRouter**
- API Key：(paste 你的 key)
- Model：選 wizard 預設或跳過（Task 3 處理）

- [ ] **Step 3 [User does this]: 驗證 config 寫入**

```bash
ls -la ~/.hermes/.env ~/.hermes/config.yaml 2>&1
hermes config show 2>&1 | head -30
```

（若命令不同：先跑 `hermes config --help` 找）

把輸出貼給我，**API key 那行手動把值改成 `***`**。

- [ ] **Step 4 [I do this]: observations.md 新增 Task 2 段落**

---

### Task 3: 挑 Free Model + First Streaming Chat（對應 Lesson 1 Step 7-8）

**Files:**
- Modify: `~/.hermes/.env` 或 config（hermes model 寫入）
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`

對應 spec §3.3-3.4。

- [ ] **Step 1 [User does this]: 跑 `hermes model` wizard，列出可用 models**

```bash
hermes model
```

把 wizard 列出的 model 清單**全部**貼給我（特別 `:free` 標記的）。觀察重點：
- 課程 Lesson 1 提的 `deepseek/deepseek-v4-flash` 還在嗎？是否仍 `:free`？
- DeepSeek 系列 free model 有幾個？
- wizard 可 filter `:free` 嗎？或要自己 grep？

- [ ] **Step 2 [User + I together]: 選一個 free model**

選擇優先序：
1. DeepSeek 系列 `:free`（與課程 Lesson 1 對齊）
2. 任何 `:free` 標記且非實驗版（避免 `*-experimental`）
3. 任何 `:free` 標記（保底）

User 把候選清單貼回，我在 chat 中建議哪個，user 在 wizard 中選定。

- [ ] **Step 3 [User does this]: 第一次 streaming chat smoke test**

```bash
hermes chat
```

送一句：`請用一句話介紹你自己`

觀察重點：
- TUI 是否正常開啟？streaming token 速度感如何？
- 有錯誤嗎（auth fail / model unavailable / rate limit）？
- 課程 Lesson 1 Step 8 沒提到的新 TUI 功能（inline diff / agent skills 啟動字樣）？
- model id 跟你選的一致？

把 chat session 截圖或抄 1-2 行 response 貼給我，含 model id。

- [ ] **Step 4 [I do this]: observations.md 新增 Task 3 段落，含實際選定的 model id（memo §F 用）**

✅ Spec §1 成功標準 #1（CLI streaming chat）達成 — checkpoint。

---

### Task 4: ngrok Tunnel 起設（對應 spec §3.5，課程未涵蓋）

**Files:**
- Side-effect: `~/.config/ngrok/ngrok.yml`（或 `~/.ngrok2/`）
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`

本 task 全部都是 memo 高價值素材（課程未涵蓋）。

- [ ] **Step 1 [User does this]: 確認 ngrok 是否已安裝**

```bash
which ngrok 2>&1 ; ngrok version 2>&1
```

把輸出貼給我。已裝跳 Step 3，未裝走 Step 2。

- [ ] **Step 2 [User does this]: 安裝 ngrok aarch64 binary**

```bash
cd /tmp
curl -L -o ngrok-arm64.tgz https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar xzf ngrok-arm64.tgz
sudo mv ngrok /usr/local/bin/ngrok
ngrok version
```

觀察重點：
- aarch64 binary 官方是否仍提供？
- 學員入門角度，這個安裝路徑（手動 curl）對比 snap install 哪個比較好教？

- [ ] **Step 3 [User does this]: 註冊 ngrok 帳號 + 設 authtoken**

開 https://dashboard.ngrok.com/signup → 註冊（Google OAuth 或 email）→ Your Authtoken → Copy。

**不要把 authtoken 貼進 chat**：

```bash
ngrok config add-authtoken <YOUR_AUTHTOKEN>
```

把 add-authtoken 命令的輸出貼給我（會說 `Authtoken saved to ...`，無 token 內容）。

觀察重點：
- 註冊多少步？需要 email 驗證嗎？
- Free tier 仍提供 random subdomain？
- 對新學員入門門檻評估（H/M/L）

- [ ] **Step 4 [User does this]: 在第二個 shell window / tmux pane 啟動 tunnel**

**重點：這 process 要持續開著直到 Task 10 結束。**

```bash
ngrok http 8646
```

ngrok 啟動後印類似：
```
Forwarding   https://abcd-1234.ngrok-free.app -> http://localhost:8646
```

把 `https://<...>.ngrok-free.app` URL 完整貼給我，記為 `<NGROK_URL>`。Task 6 / 7 都會用。  
**這 URL 在 ngrok 重啟後會變**，整個流程跑完前不要關。

- [ ] **Step 5 [I do this]: observations.md 新增 Task 4 段落（含 ngrok URL）**

---

### Task 5: Cherry-pick PR #23569 — LINE Adapter Blocker Patch（對應 spec §3.5b）

**Files:**
- Modify: `<ADAPTER_PATH>`（Step 1 動態找）— 大概是 `~/.hermes/.../plugins/platforms/line/adapter.py`
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`

**背景：** PR #23569（https://github.com/NousResearch/hermes-agent/pull/23569）修一個 typo — `create_source` → `build_source`。整支 patch 只改兩個字。**不 patch 則 Task 8 必 crash**。

- [ ] **Step 1 [User does this]: 定位 LINE adapter.py 實際路徑**

```bash
find ~/.hermes -name 'adapter.py' -path '*line*' 2>/dev/null
# fallback A：
python3 -c "import importlib.util; print(importlib.util.find_spec('hermes_agent').origin)" 2>&1
# fallback B：
pip show hermes-agent 2>/dev/null | grep -i location
uv pip show hermes-agent 2>/dev/null | grep -i location
```

把找到的路徑貼給我，記為 `<ADAPTER_PATH>`。

- [ ] **Step 2 [User does this]: 確認 broken 字串還在（patch 還沒被上游 merge）**

```bash
grep -n 'create_source\|build_source' <ADAPTER_PATH>
```

把完整輸出貼給我。

- 看到含 `create_source(` 的行（function call，非 `def create_source(`）→ patch 未 merge，**繼續 Step 3**。
- 已看到 `build_source(` 而沒有 `create_source(` → **PR #23569 已 merge** → **跳過 Step 3、直接 Step 5 並把這事寫進 observations.md（重要 memo 條目！上游版本資訊已過時）**。

- [ ] **Step 3 [I do this]: 套上 patch（兩個字改名，最小 surface）**

用 Edit 工具開 `<ADAPTER_PATH>`：
- 找到 `_handle_message_event`（或附近）內呼叫 `create_source(...)` 的那行
- 改成 `build_source(...)`
- 不動其他任何字

PR #23569 diff 對照：https://github.com/NousResearch/hermes-agent/pull/23569/files

- [ ] **Step 4 [User does this]: 驗證 patch 已套用且 module import 不爆**

```bash
grep -n 'create_source\|build_source' <ADAPTER_PATH>
python3 -c "import importlib.util, sys; spec=importlib.util.spec_from_file_location('a','<ADAPTER_PATH>'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m); print('module import OK')"
```

預期：grep 看不到 `create_source(` function call；python import 印 `module import OK` 不 traceback。

把輸出貼給我。

- [ ] **Step 5 [I do this]: observations.md 新增 Task 5 段落（含 patch 路徑、行號、PR 連結、base commit；memo §F snapshot 用）**

---

### Task 6: 設定 LINE Plugin（hermes gateway setup，對應 spec §3.6）

**Files:**
- Modify: `~/.hermes/.env`（加 `LINE_*` 環境變數）
- Modify: `~/.hermes/config.yaml`（加 `gateway.platforms.line.enabled: true`）
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`

**前置條件：** User 手上已有 LINE Channel access token + Channel secret（spec 已確認）。Task 4 已拿到 `<NGROK_URL>`。

- [ ] **Step 1 [I do this]: 確認 hermes gateway 命令存在 + LINE plugin 被偵測**

```bash
hermes gateway --help 2>&1 | head -20
echo "---plugins list---"
hermes plugins list 2>&1 | grep -i line
```

把輸出貼出來。預期：`hermes gateway` 子命令存在；plugins list 含 `line` 或 `line-platform`。

若 LINE plugin 不在 list：plugin discovery 路徑問題；先檢查 `<ADAPTER_PATH>` 所在目錄是否在 hermes plugins search path。

- [ ] **Step 2 [User does this]: 跑 `hermes gateway setup`，選 line plugin**

```bash
hermes gateway setup
```

逐題截圖或抄錄 prompt（**access token / secret 不直接貼**），告訴我 prompt 與 fill。填值對照（依 plugin.yaml）：

| 欄位 | 填什麼 |
|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | (你的 long-lived token) |
| `LINE_CHANNEL_SECRET` | (你的 channel secret) |
| `LINE_PUBLIC_URL` | Task 4 Step 4 的 `<NGROK_URL>`（完整含 `https://`） |
| `LINE_ALLOWED_USERS` | **暫填 `Uplaceholder1234567890123456789012`** — Task 8 抓到真實 userID 後再改 |
| `LINE_PORT` | 預設 `8646`（保留） |
| `LINE_HOST` | 預設 `127.0.0.1`（保留） |
| 其他 optional | 全部 default |

觀察重點：
- wizard 提示對新學員清不清楚？
- `LINE_ALLOWED_USERS` 欄位解釋是否提到「U 開頭 33 字元，不是 display name 或 LINE@ ID」？(Lesson 2 Telegram 也踩過類似雷)
- 是否區分 password 與一般 input（access token / secret 應該 password mask）？

- [ ] **Step 3 [User does this]: 驗證 .env 寫入**

```bash
ls -la ~/.hermes/.env
grep -c '^LINE_' ~/.hermes/.env
```

預期：檔案存在，`LINE_` 開頭至少 4 行（token / secret / public_url / allowed_users）。把計數貼給我。

- [ ] **Step 4 [User does this]: 驗證 config.yaml 已 enable line**

```bash
grep -B 1 -A 3 'line:' ~/.hermes/config.yaml 2>&1
echo "---full---"
cat ~/.hermes/config.yaml | head -40
```

預期：`line: enabled: true`（或類似結構）存在。把相關行貼給我。

- [ ] **Step 5 [I do this]: observations.md 新增 Task 6 段落**

---

### Task 7: LINE Developers Console — 設 Webhook URL + 必要 Toggles（對應 spec §3.7 前半）

**Files:**
- External: LINE Developers Console channel settings（**非檔案，外部 state**）
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`

**全程 User-only**（無法自動化）。**這 task 不按 Verify** — Task 8 才按。

- [ ] **Step 1 [User does this]: 開 LINE Developers Console**

URL: https://developers.line.biz/console/  
進入：你的 provider → channel（Messaging API 類型）→ Messaging API 分頁。

- [ ] **Step 2 [User does this]: 設 Webhook URL**

在 「Webhook settings」section：
- **Webhook URL** 欄：`<NGROK_URL>/line/webhook`（**注意 path 是 `/line/webhook`** — LINE plugin 預設；完整 URL 例：`https://abcd-1234.ngrok-free.app/line/webhook`）
- 按 **Update** / **更新**

**還不要按 Verify** — Task 8 才按。

- [ ] **Step 3 [User does this]: 開啟必要 toggles**

同分頁：
- **Use webhook**：ON ✅
- **Auto-reply messages**：OFF ❌（spec §F：避免 LINE 自動回客服訊息蓋掉 hermes 回應）
- **Greeting messages**：OFF ❌（同上）

把三項開關狀態截圖或抄錄貼給我。

觀察重點：
- LINE Console 介面 vs Lesson 2 Telegram 教學的 BotFather 介面，學員門檻落差有多大？
- 三個 toggle 預設值是什麼？學員若不關掉 auto-reply 會發生什麼？
- 是否需要在 Lesson 3 加詳細螢幕截圖（Lesson 2 ai-runbook.md 那種 step-by-step 等級）？

- [ ] **Step 4 [I do this]: observations.md 新增 Task 7 段落**

---

### Task 8: Gateway Start + Verify + Phone End-to-End Smoke（對應 spec §3.7 後半 + §3.8）

**Files:**
- Modify: `/tmp/hermes-deploy-2026-05-11/observations.md`
- Modify: `~/.hermes/.env`（Step 5 更新 `LINE_ALLOWED_USERS`）
- Side-effect: hermes gateway process（持續執行）

本 task = spec §1 成功標準 #2（手機 LINE 端到端）。

- [ ] **Step 1 [User does this]: 在第三個 shell window / tmux pane 啟動 gateway**

```bash
hermes gateway
```

預期看到：
- 啟動 log 提到載入 `line` plugin
- aiohttp / hypercorn / uvicorn 之類 listen on `127.0.0.1:8646`
- 沒有 traceback

把開頭 ~20 行 log 貼給我。

若 traceback：
- 多半是環境變數沒讀到（檢查 Task 6 Step 3 的 .env 內容）
- 或 port 衝突（其他服務佔 8646）→ `sudo lsof -i :8646` 查
- 或 patch 沒套到（檢查 Task 5 Step 4 grep 結果）

- [ ] **Step 2 [User does this]: 回 LINE Console 按 Verify**

LINE Developers Console → Messaging API 分頁 → Webhook settings → **Verify** 按鈕。

預期：✅ **Success**。

若失敗：
- "Status Code 4xx" → hermes gateway URL routing 不對（路徑不是 `/line/webhook`？）
- "Signature mismatch" → `LINE_CHANNEL_SECRET` 打錯，回 Task 6 重設
- "Timeout" / "Could not connect" → ngrok tunnel 沒活（檢查 Task 4 Step 4 視窗）

把 Verify 結果（成功 / 完整錯誤訊息）貼給我。**Verify 只測 reachability + signature，不會觸發 message handler**，所以 PR #23569 blocker 不會在這步顯現。

- [ ] **Step 3 [User does this]: 從手機 LINE 加 bot 為好友 + 送第一個訊息**

User：
1. 開 LINE app（手機）
2. 加 bot 為好友（用 LINE Console > Messaging API 分頁的 QR code 或 Bot basic ID 搜尋）
3. 開啟與 bot 的對話
4. 送一句訊息：`hi` 或 `測試`

觀察 Task 8 Step 1 的 `hermes gateway` 視窗 log。預期：
- 收到 webhook POST
- 訊息被 dispatch 到 LLM（OpenRouter）
- LLM stream 完成
- **回到 LINE 的訊息送出成功**

**若 Task 5 patch 沒套到** → 100% 在這步 traceback `create_source not found` → **這正好是 memo 高價值條目（直接證明 PR #23569 是真實 blocker，不是 paper bug）**。

把 gateway 視窗中那一輪互動的 log 完整貼給我（特別注意 `userId: U...` 33 字元那行）。

- [ ] **Step 4 [User does this]: 確認手機端收到回應**

User 看手機 LINE：bot 是否回了訊息？

判斷：
- ✅ 有回 → spec §1 成功標準 #2 達成 ✅
- ❌ 沒回 + gateway log 顯示 send 成功 → 很可能 `LINE_ALLOWED_USERS` 把你檔掉了（Step 5 修正）
- ❌ 沒回 + log 顯示 error → 完整 log 貼給我

觀察重點：
- 第一次回應延遲幾秒？
- 回應內容是否被 strip Markdown（spec §F；試送 `**bold**` 看效果）？
- 有沒有 「loading...」indicator？
- reply token 是否首次就 fallback to Push（gateway log 有沒有 `push` 字樣 vs `reply`）？

- [ ] **Step 5 [User + I together]: 把 `LINE_ALLOWED_USERS` placeholder 換成真實 userID**

從 Step 3 log 抓你自己的 `U...` 33 字元 ID（記為 `<MY_LINE_USER_ID>`）。

User runs：
```bash
sed -i "s/^LINE_ALLOWED_USERS=.*/LINE_ALLOWED_USERS=<MY_LINE_USER_ID>/" ~/.hermes/.env
grep '^LINE_ALLOWED_USERS' ~/.hermes/.env
```

把 grep 結果貼給我（**真實 userID 也可以貼，不算機密**）。

重啟 gateway（Step 1 視窗 Ctrl+C → 重跑 `hermes gateway`），手機再發一次訊息驗證仍能收到回應。

- [ ] **Step 6 [I do this]: observations.md 新增 Task 8 段落 — 含成功標準 check + 實測 LINE quirks**

特別記：
- 端到端延遲秒數
- reply token 行為（是否首次就 push fallback）
- Markdown strip 實測（送 `**bold**` 看回應如何）
- `LINE_ALLOWED_USERS` 是否有清楚的「U 開頭」提示

✅ Spec §1 成功標準 #2（LINE 端到端）達成 — checkpoint。

---

### Task 9: Synthesize observations.md → Memo（對應 spec §4）

這是本任務的主要產出。

**Files:**
- Create: `/home/lewsi/Documents/workspaceAgent/hermes-windows-course/docs/improvements/2026-05-11.md`
- Read: `/tmp/hermes-deploy-2026-05-11/observations.md`
- Read: `/home/lewsi/Documents/workspaceAgent/hermes-windows-course/docs/superpowers/specs/2026-05-11-hermes-redeploy-and-course-memo-design.md`
- Read: `/home/lewsi/Documents/workspaceAgent/hermes-windows-course/index.html`
- Read: `/home/lewsi/Documents/workspaceAgent/hermes-windows-course/lesson-2.html`
- Read: `/home/lewsi/Documents/workspaceAgent/hermes-windows-course/ai-runbook.md`

- [ ] **Step 1 [I do this]: 確保 improvements/ 目錄存在**

```bash
mkdir -p /home/lewsi/Documents/workspaceAgent/hermes-windows-course/docs/improvements/
ls -la /home/lewsi/Documents/workspaceAgent/hermes-windows-course/docs/improvements/
```

- [ ] **Step 2 [I do this]: 完整讀過 observations.md + 課程三個檔案，做分類腦圖（in chat）**

我會把每條觀察分類進四桶：
- 課程已寫但實際變了 → **§A 過時點**（要含 Lesson + Step 引用、具體文案差異）
- 上游有但課程沒講 → **§B 內容缺口**
- 流程能走但摩擦 → **§C 體驗摩擦**
- 跨課程結構性 → **§D 結構性建議**

並對每條標：影響範圍 / 工作量 (S/M/L) / 優先序 (H/M/L/暫緩)。

- [ ] **Step 3 [I do this]: 寫 §F 上游現況快照**

從 spec §F 列表 + Task 5 / Task 8 觀察填：
- LINE plugin merge 日期、PR #23197
- main 上 blocker PR 編號（#23569）、本次 patch 內容（`create_source` → `build_source`）、patch 套用時的 base commit SHA
- 開放中其他相關 PRs（#23360 quota、#23357 proxy）
- 實測 LINE quirks（spec §F 列表 + Task 8 Step 4/Step 6 補充：延遲秒數、reply token 行為、Markdown strip 結果）

- [ ] **Step 4 [I do this]: 寫 §E 優先序總表**

Markdown 表格：

```
| 改進項 | 影響範圍 | 工作量 | 優先序 | 建議下次修訂處理 |
|---|---|---|---|---|
| A1 ... | Lesson 1 | S | H | ✓ |
| ...
```

優先序定義同 spec §4：H / M / L / 暫緩。

- [ ] **Step 5 [I do this]: 用 Write 工具建 `docs/improvements/2026-05-11.md`**

完整 markdown 檔，跟 spec §4 骨架走（§A / §B / §C / §D / §E / §F + 驗證脈絡 header），所有 `_____` 都填實內容。

- [ ] **Step 6 [User reviews]: 請 user 看一眼 memo 確認**

我把檔案路徑告訴 user，請 user 開來看一遍。若要修：
- 措辭 → 告訴我具體哪句
- 增刪條目 → 我用 Edit
- 優先序爭議 → 討論後修正

User 確認 OK 才進 Task 10。

✅ Spec §1 成功標準 #3（memo 寫好）達成 — checkpoint。

---

### Task 10: Commit + Push Memo + Cleanup

**Files:**
- Commit: `hermes-windows-course/docs/improvements/2026-05-11.md`
- Delete: `/tmp/hermes-deploy-2026-05-11/`（scratch notes）
- Optional cleanup: ngrok + hermes gateway processes

- [ ] **Step 1 [I do this]: 預檢 commit — 確認只有 memo 新檔，沒誤動其他**

```bash
cd /home/lewsi/Documents/workspaceAgent/hermes-windows-course
git status -s
echo "---"
git diff --stat
```

預期：只看到 `docs/improvements/2026-05-11.md` 一個新檔（`??` prefix）。其他無變動。

若有意外變動：先停下調查，不 commit。

- [ ] **Step 2 [I do this]: Commit memo**

```bash
cd /home/lewsi/Documents/workspaceAgent/hermes-windows-course
git add docs/improvements/2026-05-11.md
git commit -m "$(cat <<'EOF'
docs(improvements): add 2026-05-11 dogfood memo

Captured from end-to-end re-deploy of upstream NousResearch/hermes-agent
(install + OpenRouter + free model + LINE gateway + phone smoke).

Highlights:
- Sections A/B/C/D/F populated per spec
- §F snapshot: PR #23569 (LINE inbound crash) patched locally;
  upstream merge status as of this commit
- §E priority table: H = must-fix in next course revision,
  暫緩 = LINE Lesson 3 (gated on #23569 + #23360)

Spec: docs/superpowers/specs/2026-05-11-hermes-redeploy-and-course-memo-design.md
Plan: docs/superpowers/plans/2026-05-11-hermes-redeploy-and-course-memo-implementation.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git log --oneline -1
```

- [ ] **Step 3 [User confirms]: 是否 push？**

Push 是 publish 動作。問 user：「memo 已 commit，要 push 到 GitHub 嗎？」

若 yes：

```bash
cd /home/lewsi/Documents/workspaceAgent/hermes-windows-course
git push 2>&1
```

若 push 被 reject（remote 有新 commits）：

```bash
cd /home/lewsi/Documents/workspaceAgent/hermes-windows-course
git fetch origin
git log --oneline HEAD..origin/main
# 確認遠端 commits 無衝突，然後：
git rebase origin/main
git push
```

**不 force push**。

若 no：跳到 Step 4，留待之後 push。

- [ ] **Step 4 [I do this]: 清理 scratch notes**

```bash
ls -la /tmp/hermes-deploy-2026-05-11/
rm -rf /tmp/hermes-deploy-2026-05-11/
ls -la /tmp/hermes-deploy-2026-05-11/ 2>&1
```

預期：第三條輸出 `No such file or directory`。

⚠️ **嚴禁** `rm -rf /tmp/` 或 `rm -rf /tmp/*`。只刪這個特定子目錄。

- [ ] **Step 5 [User decides]: 停 ngrok + hermes gateway processes（或保留）**

- 想保留 hermes daily use → 不動兩個 process
- 純 dogfood、用完即丟 → Ctrl+C ngrok 視窗 + Ctrl+C `hermes gateway` 視窗
- 想包成 systemd service 24/7 跑 → 不在本 plan 範圍（spec §7 後續任務）

- [ ] **Step 6 [I do this]: 確認 spec §6 DoD 全綠 + 結案**

對照 spec §6 DoD 9 條：
- [ ] hermes 安裝完成、`hermes --version` 有輸出、commit SHA 已記錄
- [ ] OpenRouter API key 已配置、`hermes model` 已挑定可用 free model、實際 model id 已記錄
- [ ] CLI 完成一次 streaming chat smoke test
- [ ] LINE plugin 已 cherry-pick #23569 patch、patch 後檔案路徑與行號已記錄
- [ ] ngrok（或 fallback）tunnel 已建立、`LINE_PUBLIC_URL` 已設
- [ ] LINE Developers Console webhook URL verify 通過
- [ ] 手機 LINE 端送一句訊息、bot 回覆收到，截圖或 log 留證
- [ ] `docs/improvements/2026-05-11.md` 已寫、§A/§B/§C/§D/§E/§F 都有內容、commit 進 hermes-windows-course main
- [ ] scratch notes (`/tmp/hermes-deploy-2026-05-11/`) 已丟棄

在 chat 中告訴 user：
- memo URL（若 push）：`https://github.com/Lewsiafat/hermes-windows-course/blob/main/docs/improvements/2026-05-11.md`
- DoD 全綠 / 哪幾條未過（理由）
- 後續可能任務（spec §7）：
  - 課程修訂 sprint（處理 H 優先序條目）
  - Lesson 3 LINE 開課評估（待 #23569 + #23360 merge 且 stable ≥ 1 週）
  - 課程維運機制（上游 release notes 訂閱 + 季度 refresh）

---

## Risk Reminders（執行時隨手對照 spec §5）

| 風險 | 觸發點 | 緩解 |
|---|---|---|
| #23569 patch drift | Task 5 後若上游 merge 邏輯不同 | observations.md 記 patch 內容 + base commit；memo §F 註明 patch 來源 |
| Quota silent fallback (#23360) | Task 8 reply token 過期 | dogfood 期間訊息 < 5 則；gateway log 有 `push` 字樣即觀察證據 |
| LINE webhook smoke fail | Task 8 Step 2-4 | 失敗本身是 memo §C 證據，不阻塞 — 記下卡點繼續 |
| Free model 全掛 | Task 3 Step 1 | wizard 列當下可選的，挑能 ping 通的；實際選用記進 memo |
| install.sh aarch64 不支援 | Task 1 Step 2 | 高優先級 memo 條目（課程預設環境假設要調整） |
| #23569 部署中突然 merge | Task 5 Step 2 | grep 已看到 `build_source` 就跳 Step 3；observations.md 記下「上游剛 merge」 |

---

## Spec Coverage Map（self-review）

| Spec section | Plan task(s) |
|---|---|
| §1 目標 + 成功標準 | Plan goal、Task 3 ✅#1、Task 8 ✅#2、Task 9 ✅#3 |
| §2 觀察方法 | Task 0 + 每個 Task 結尾 Step（observations.md 寫入） |
| §3.1 install | Task 1 |
| §3.2-3 OpenRouter + free model | Task 2 + Task 3 |
| §3.4 first chat | Task 3 |
| §3.5 ngrok | Task 4 |
| §3.5b patch #23569 | Task 5 |
| §3.6 LINE gateway setup | Task 6 |
| §3.7 LINE Console webhook + verify | Task 7（前半 URL/toggles）+ Task 8 Step 2（verify） |
| §3.8 phone end-to-end | Task 8 Steps 3-5 |
| §4 memo structure | Task 9 |
| §5 risks | Risk Reminders 表 + 各 Task 內 fallback 條 |
| §6 DoD | Task 10 Step 6 全綠 check |
| §7 後續 | 不在 plan 範圍（已在 Task 10 Step 6 結案訊息提及） |
