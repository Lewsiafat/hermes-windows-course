# Hermes 重新部署 + 課程改進 Memo 設計（2026-05-11）

| 項目 | 值 |
|---|---|
| 主要目標 | 產出 `docs/improvements/2026-05-11.md`，作為 hermes-windows-course 下一輪修訂依據 |
| 手段 | 以「新使用者第一次裝」視角，跑一次完整 hermes 部署（install → OpenRouter → free model → LINE gateway → 手機端到端），刻意對齊現有 Lesson 1 / Lesson 2 步驟蒐集落差 |
| 上游 | https://github.com/NousResearch/hermes-agent |
| 安裝位置 | `~/.hermes`（上游一鍵 install.sh 預設） |
| Channel 重點 | LINE（上游 plugin 才剛 merge，且 main 上有 blocker 待 patch） |
| Memo 輸出 | `hermes-windows-course/docs/improvements/2026-05-11.md` |

---

## §1 目標與成功標準

主要目標：產出 memo 作為課程下一輪修訂依據。  
手段：dogfood 一次完整部署，過程中以新學員視角觀察。

**成功標準（缺一不可）**

1. `hermes` CLI 可啟動並完成一次 streaming chat（驗 LLM 路徑）
2. 從手機 LINE 帳號送一句訊息到 bot，收到 hermes 的回應（驗 LINE gateway 端到端）
3. `docs/improvements/2026-05-11.md` commit 進 hermes-windows-course，內容包含：本次驗證脈絡、上游 vs 課程的 gap 清單、按優先序排好的改進候選

**明確不在範圍**

- 不直接修改 `index.html`、`lesson-2.html`、`ai-runbook.md`、`pre-class-checklist.md` 等課程內容檔（memo 是輸入，下次修訂才是輸出）
- 不寫 Lesson 3（LINE）內容（memo 可建議是否開）
- 不重啟舊的 `lineWebhookService/hermes_plugin/`（已被上游 `plugins/platforms/line/` 取代）
- 不向上游 hermes-agent 送 PR

---

## §2 觀察方法

部署開始前，先在工作目錄開 scratch notes（不進 git）：

```
/tmp/hermes-deploy-2026-05-11/observations.md
```

**每完成一步立刻記**（不要事後補），格式：

```
## Step N — 對應到 Lesson?-Step?
- 預期行為（依課程或上游 docs）：
- 實際行為：
- 落差 / 卡點 / 驚喜：
- 改進候選（→ 課程哪段、優先序 H/M/L）：
```

部署完成後，把 scratch notes 整理、去蕪存菁、分類後寫成正式 memo。scratch notes 是工作底稿，memo 是給未來自己看的決策依據。

**對齊原則**

- 上游已有但課程沒講 → 「課程內容缺口」
- 課程有講但上游已變動 → 「課程過時點」
- 流程順但摩擦點 → 「課程體驗改善」

---

## §3 部署流程（dogfood 順序）

| 階段 | 命令 / 動作 | 對應 Lesson | 觀察重點 |
|---|---|---|---|
| 3.1 | `curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh \| bash` | Lesson 1 Step 5 | install.sh 行為是否仍如課程描述？版本字串、互動 prompt 有變嗎？ |
| 3.2 | `hermes setup`（或 `hermes config set` + `hermes model`） | Lesson 1 Step 6 | wizard 步驟順序、OpenRouter 互動畫面 |
| 3.3 | 設 OpenRouter API key、挑 `:free` model | Lesson 1 Step 6–7 | wizard 列出的 free models 清單；deepseek 系列是否還在；Lesson 1 提到的具體 model id 是否還能 resolve |
| 3.4 | 第一次 streaming chat（CLI） | Lesson 1 Step 8 | TUI 體驗、token 速度、有沒有新功能（如 inline diff） |
| 3.5 | `ngrok http 8646` 起 tunnel（備：cloudflared / nginx+LE） | 課程未涵蓋 | 學員入門可行性；ngrok 註冊 / authtoken 流程是否需教學 |
| **3.5b** | **Cherry-pick PR #23569：編輯 `~/.hermes/.../plugins/platforms/line/adapter.py`，把 `create_source` 改成 `build_source`**（兩個字改名，最簡 patch） | 課程未涵蓋；**本身即高價值 memo 條目** | patch 路徑是否易找、是否需 fork 維護、上游何時 merge |
| 3.6 | `hermes gateway setup` → 選 line plugin → 填 `LINE_CHANNEL_ACCESS_TOKEN`、`LINE_CHANNEL_SECRET`、`LINE_PUBLIC_URL`（=ngrok URL）、`LINE_ALLOWED_USERS`（至少一個） | 課程未涵蓋 | wizard 提示是否清楚？預設 path `/line/webhook`、預設 port 8646 是否合理？ |
| 3.7 | LINE Developers Console 設 webhook URL → Verify | 課程未涵蓋 | LINE 端 verify 是否一次通過（注意 Verify 只測 reachability，不會觸發 message handler，#23569 blocker 不會在這步顯現） |
| 3.8 | `hermes gateway` 啟動，手機送 LINE → 收回應 | 課程未涵蓋 | 端到端延遲、reply token 行為、log 訊息品質、quota silent fallback 是否觸發 |

**3.5 路徑選擇順序：** ngrok（dogfood，最低門檻）→ cloudflared named tunnel（上游官方建議）→ nginx + LE（需 public domain，本機已具備但需另指定）。三選一視當下 ngrok 是否可註冊/使用。

---

## §4 Memo 結構

最終產出：`hermes-windows-course/docs/improvements/2026-05-11.md`

```markdown
# 課程改進備忘（2026-05-11 驗證）

## 驗證脈絡
- 日期 / 環境（Oracle Cloud VM, Linux aarch64, WSL 等等視情況）
- 上游版本：commit SHA + 對應 release 號（從 `hermes --version` 或 git log 取）
- 走過的路徑：install → OpenRouter → free model → first chat → LINE gateway → 手機端到端
- 對照基準：Lesson 1（install + first chat）、Lesson 2（Telegram）

## A. 課程過時點（既有 Lesson 已寫但上游已變）
依 Lesson → Step 排，逐條：
- A1. [Lesson1 Step X] 課程寫 _____，實際 _____，建議 _____。優先序：H/M/L
- A2. …

## B. 課程內容缺口（上游有但 Lesson 沒涵蓋）
- B1. PowerShell installer（Windows native 已 early beta）— 是否需更新 Lesson 1 第 1 步？
- B2. 新 providers（Nous Portal / NVIDIA NIM / MiMo / GLM / Kimi / MiniMax …）— 課程目前只講 OpenRouter，是否需加 provider 切換章節？
- B3. 新 channels（Discord / Slack / WhatsApp / Signal / Email / Home Assistant）— Lesson 2 只講 Telegram，是否要橫向擴張？
- B4. **LINE gateway**：端到端流程可行，但**目前不建議開 Lesson 3 LINE**（理由見 §F）。建議課程加 Roadmap 註記避免學員以為被遺忘。

## C. 體驗摩擦點
- C1. ngrok 註冊 / authtoken 流程 — 若進 Lesson 3 需教學
- C2. LINE Developers Console 介面變動 — verify webhook 那一步常踩雷
- C3. hermes wizard 提示語某些地方對新手不友善（具體哪段）

## D. 跨課程結構性建議
- D1. 是否要加「驗證 SOP」section（上游每月可能小變動，課程要有 refresh 流程）
- D2. ai-runbook.md 是否要新增 LINE smoke 區塊
- D3. 把上游 release notes 訂閱機制納入「課程維運」流程

## F. 上游現況快照（snapshot at 2026-05-11）
- LINE plugin PR #23197 於 2026-05-10 merge（位於 `plugins/platforms/line/`，非 core）
- main 上 PR #23569 **未** merge → 入站文字訊息 100% crash（`create_source` typo），本次部署自行 patch
- PR #23360 開放中：quota silent fallback（reply token 過期時悄悄燒 Push API 額度）
- PR #23357 開放中：HTTP sessions 不尊重 `HTTPS_PROXY` 等 proxy env
- LINE-specific quirks（必須在教 Lesson 3 前納入課程設計）：
  - reply token TTL ~60 秒；慢 LLM 必須開 postback button（`LINE_SLOW_RESPONSE_THRESHOLD`）或必走 Push（收費）
  - 媒體必須走 HTTPS URL（`LINE_PUBLIC_URL`），LINE API 不收 binary upload
  - 無 Markdown 渲染（`**bold**`、code fence 會 strip；`[label](url)` → `label (url)`）
  - 單 bubble 5000 字、每次 Reply/Push 最多 5 bubbles
  - Loading indicator 只在 1:1 DM 可用
  - 單一 channel access token 不可跨 profile 共用

## E. 優先序總表
| 改進項 | 影響範圍 | 工作量 | 優先序 | 建議下次修訂處理 |
|---|---|---|---|---|
| A1 …  | Lesson1 | S | H | ✓ |
| B4 LINE Lesson | 新章節 | L | 暫緩 | 等 #23569+#23360 stable |
| …  | … | … | … | … |
```

實際內容依部署當下觀察填，這只是骨架。優先序定義：

- **H** = 既有 Lesson 已過時、新學員會卡 → 必修
- **M** = 內容缺口、新功能、體驗改善 → 下一輪規劃
- **L** = 結構性建議、長期項目
- **暫緩** = 上游或外部 dependency 未穩，列入但不安排

---

## §5 風險與變數

- **#23569 patch drift**：若 #23569 後續 merge 邏輯與單純 typo 不同，自行 patch 的版本會 drift。緩解：patch 後在 scratch notes 留下 patch 內容與時間戳；memo §F 註記「patch 來源為 PR #23569 @ <commit>」。
- **quota silent fallback (#23360)**：dogfood 中若 reply token 過期會悄悄燒 OpenRouter + LINE Push API 額度，這個現象**本身要當 memo 證據觀察**，不是 bug。緩解：dogfood 期間限制送收 < 5 則訊息。
- **LINE webhook smoke test 失敗**：可能原因為 signature 驗證、reply token 過期、ngrok URL 變動。處理：把失敗本身寫進 memo（C 類痛點），不阻塞 memo 產出 — 只要記下「卡在哪、為什麼」。
- **OpenRouter free model 全掛 / 沒有適用**：fallback `hermes model` wizard 列出當下可選的，挑一個能 ping 通的，把實際選用的型號記進 memo 與 scratch notes。
- **上游 hermes 不支援 aarch64 / Termux dep 對 VM 環境不適用**：若 install.sh 直接失敗，這本身就是高優先級 memo 條目（課程預設環境假設可能要調整）。
- **#23569 在部署中途突然 merge**：可能性低但非零。緩解：cherry-pick 前先 `git log -1 plugins/platforms/line/adapter.py` 記下 base commit；若 merge 了就 pull 取代手 patch，並在 memo 註記。

---

## §6 完成定義（Definition of Done）

本任務視為完成當且僅當以下全部成立：

- [ ] hermes 安裝完成、`hermes --version` 有輸出、commit SHA 已記錄
- [ ] OpenRouter API key 已配置、`hermes model` 已挑定可用 free model、實際 model id 已記錄
- [ ] CLI 完成一次 streaming chat smoke test
- [ ] LINE plugin 已 cherry-pick #23569 patch、patch 後檔案路徑與行號已記錄
- [ ] ngrok（或 fallback）tunnel 已建立、`LINE_PUBLIC_URL` 已設
- [ ] LINE Developers Console webhook URL verify 通過
- [ ] 手機 LINE 端送一句訊息、bot 回覆收到，截圖或 log 留證
- [ ] `docs/improvements/2026-05-11.md` 已寫、§A/§B/§C/§D/§E/§F 都有內容、commit 進 hermes-windows-course main branch
- [ ] scratch notes (`/tmp/hermes-deploy-2026-05-11/`) 可丟棄

---

## §7 後續（不在本任務範圍）

依 memo §E 優先序，後續可能任務（不在本 spec 範圍，需另開 spec/plan）：

- 課程修訂 sprint：處理所有 H 優先序條目
- Lesson 3 LINE 開課評估：等 #23569 + #23360 merge 且 stable ≥ 1 週
- 課程維運機制：上游 release notes 訂閱 + 季度 refresh sprint
