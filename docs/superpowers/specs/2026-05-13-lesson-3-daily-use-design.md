# Lesson 3 · hermes 日常使用入門 設計（2026-05-13）

| 項目 | 值 |
|---|---|
| 主標題 | Lesson 3 · hermes 日常使用 |
| 副標題 | 把 hermes 變成你每天會用的助手，45–55 分鐘 |
| 主題 | context 管理、`/` 指令、skills、自己寫一個 skill |
| 時長 | 45–55 分鐘 |
| 步驟 | Step 0–6（7 個 `<section>`，主步驟 6 步） |
| 前提 | 已完成 Lesson 1（install）+ Lesson 2（Telegram） |
| 不依賴 | Lesson 4（LINE）— Lesson 4 可獨立完成 |
| 壓軸 demo skill | `daily-journal`（訪談式日記，寫到 `~/journal/YYYY-MM-DD.md`） |

---

## §1 目標與成功標準

**主目標**：把 hermes 從「裝好的工具」變成「每天會用的助手」。對應 5/7 Lesson 2 spec 預告——學員裝好 Telegram 之後可以開始日常使用，這堂課把缺口補完。

**成功標準（4 個 checkpoints，跟其他 lesson 一致）**

1. ✓ 看完能說出何時該 `/new`、為什麼 context 會變慢
2. ✓ `/skills` 看得到內建 skill 清單、知道 `/<skill-name>` 用法
3. ✓ 自己寫一個 `daily-journal` SKILL.md、放進 `~/.hermes/skills/productivity/daily-journal/`、重啟 hermes 後 `/skills` 列得出來
4. ✓ 從手機 Telegram 打 `/daily-journal`、答完四題、`~/journal/YYYY-MM-DD.md`（今天日期）真的有檔案

**明確不在範圍**

- 不教 hermes plugin 開發（Python tools）
- 不教自己 host Skills Hub、不教 publish 上 [agentskills.io](https://agentskills.io)
- 不教跨 channel 同步（Telegram 已接，LINE 在 Lesson 4 才接）
- 不教 hermes 的 OpenClaw migration、honcho user modeling 等進階機制

---

## §2 敘事弧線

```
context 管理（解痛點：聊太久變遲鈍）
  ↓
/ 指令熟悉（解探索：原來這些都已內建）
  ↓
skills 概念（解 wow：原來這就是 hermes 自學的東西）
  ↓
寫第一個 skill（解動手：~30 行 markdown）
  ↓
★ Telegram 直接打 /daily-journal（壓軸：跟 Lesson 2 連起來形成完整迴圈）
```

**為什麼壓軸是 Telegram 觸發、不是 CLI 觸發**：學員寫的 skill 自動變成 slash command，並且**所有 messaging 介面共用同一份 skill**——CLI 跑得通就代表 Telegram 也跑得通。從手機觸發比從 CLI 觸發更有 reward，且呼應 Lesson 2 設計的「把 hermes 接到手機」初衷。

---

## §3 步驟切分

| Step | 主題 | 時長 | 重點 / 動作 |
|---|---|---|---|
| **0** | 前言：為什麼學「日常使用」 | 2 min | Lesson 1 裝好 + Lesson 2 接 Telegram，現在學怎麼真的每天用。預告 4 checkpoints。 |
| **1** | context 管理：聊太久會變慢 | 7 min | 為什麼變慢（context window 有限）、`/new` 開新對話、規則「切話題就 `/new`」。實作：在 CLI 試 `/new`。 |
| **2** | 常用 `/` 指令 cheatsheet | 5 min | 表格列 `/help`、`/model`、`/skills`、`/<skill-name>`，每個給一句話用途。 |
| **3** | skills 是什麼 | 5 min | on-demand knowledge documents 概念、`~/.hermes/skills/` 目錄結構、`/skills` 看現有清單、bundled `/plan` `/excalidraw` 範例。 |
| **4** | 寫你的第一個 skill：`daily-journal` | 15 min | `mkdir -p ~/.hermes/skills/productivity/daily-journal && nano SKILL.md`，照 §4 範本貼上，重啟 hermes（`hermes` 重新進 CLI）讓它載入。 |
| **5** | **★ 壓軸**：從 Telegram 打 `/daily-journal` | 8 min | 手機 Telegram bot 打 `/daily-journal` → bot 一題一題訪談 → 答完看 `~/journal/<今日日期>.md`。 |
| **6** | 完成 + 加碼 | 3 min | 4 checkpoints ✓ + 加碼 A/B/C/D（`<details>`）+ 下次預告 |

**進度條規格**：`<body data-total-steps="6" data-storage-key="hermes-course-lesson-3-step">`。Step 0 = 「前言」字樣；Step 1–6 = 「Step N / 6」。對應 `wizard.js` 的 fail-loud 設計（CLAUDE.md §架構重點 3）。

---

## §4 Demo skill 完整內容（學員照抄 + 微調）

`~/.hermes/skills/productivity/daily-journal/SKILL.md`（路徑對齊 frontmatter `category: productivity`）：

````markdown
---
name: daily-journal
description: 用訪談形式引導使用者寫今日日記，存到 ~/journal/YYYY-MM-DD.md
version: 0.1.0
metadata:
  hermes:
    tags: [journal, daily, interview, personal]
    category: productivity
    requires_toolsets: [terminal]
---

# Daily Journal Skill

## When to Use
使用者打 `/daily-journal` 或在對話中提到「想寫日記」「記錄今天」。
通常是一天結束時觸發。

## Procedure
**一次只問一題**，等使用者回答完才問下一題。順序：

1. 「今天最有成就感的一件事是什麼？」
2. 「今天遇到最卡的事？怎麼處理的？」
3. 「明天最想優先做什麼？」
4. 「一句話總結今天的心情？」

四題都答完後，整理成這個格式的 markdown：

```
# YYYY-MM-DD

## 成就
{答案 1}

## 卡點
{答案 2}

## 明日重點
{答案 3}

## 一句話心情
{答案 4}
```

用 terminal toolset 把日期換成今天（`date +%Y-%m-%d`），
寫入 `~/journal/YYYY-MM-DD.md`。資料夾不存在就 `mkdir -p`。
若檔案已存在，append 一個 `## 補記` section 在後面。

## Pitfalls
- 不要一次把四題丟出來，學員會壓力大、答案會草率
- 使用者中途想跳題就跳，不要強迫
- 從 Telegram 觸發時更要強調一題一問（手機螢幕窄）

## Verification
- `~/journal/YYYY-MM-DD.md` 真的存在
- 內容包含四題答案
````

**範本設計考量**

- **`requires_toolsets: [terminal]`**：因為要 `mkdir -p` 跟 `date +%Y-%m-%d` 跟寫檔，沒 terminal toolset 跑不起來。寫進 frontmatter 讓 hermes 自動處理依賴。
- **不用 `scripts/`**：純 markdown 指令就夠，避免引入 Python 增加學員理解成本。
- **`category: productivity`**：對齊上游慣例（`skills/productivity/maps/` 也是這個 category）。
- **存 `~/journal/`** 而非 `~/.hermes/journal/`：學員的個人資料應該獨立於 hermes 安裝目錄，未來換 hermes 版本也不影響。

---

## §5 加碼設計（`<details>`）

| 加碼 | 內容 | 用到的 hermes feature |
|---|---|---|
| **A · cron 排程** | 每天 22:00 自動從 Telegram ping「該寫日記了 → `/daily-journal`」 | 內建 `Cron ticker`（5/11 memo 確認預設 60s 一跑）|
| **B · background sessions** | 把 hermes 跑成背景 process，隨時手機呼叫 | hermes process lifecycle（呼應 Lesson 2 Step 5 的 `hermes gateway` 概念）|
| **C · 改寫題目** | 改 4 題內容、加 mood 1–10 評分、加每週彙總 | SKILL.md Procedure 是純 markdown，怎麼寫怎麼跑 |
| **D · 帶入今日天氣** | skill 第一次跑會問你住哪、之後記住，每天日記自動加 `## 天氣` 區塊 | `metadata.hermes.config` + wttr.in（無 API key） |

### 加碼 D 實作細節

加碼 D **改寫同一個 `daily-journal` SKILL.md**（不是另創 skill），學員照下面 diff 編輯既有檔案。frontmatter 改成：

```yaml
metadata:
  hermes:
    config:
      - key: daily-journal.location
        description: 你住的城市（查天氣用）
        default: ""
        prompt: 你住哪個城市？（例：Taipei / Hsinchu / Tokyo）
    requires_toolsets: [terminal]
    tags: [journal, daily, interview, personal, weather]
    category: productivity
```

**Procedure 原 4 題流程不變**，前面加一段：「四題之前先 `curl -s wttr.in/{location}?format=3` 取天氣，把輸出放進日記檔開頭 `## 天氣` 區塊；若 curl 失敗（無網路 / wttr 掛了），跳過天氣繼續訪談。」`{location}` 由 hermes 從 `metadata.hermes.config` 注入。

**第一次** `/daily-journal` → hermes 跳出 location 設定 prompt → 答完存進 `~/.hermes/config.yaml` 的 `skills.config.daily-journal.location` → **之後永不再問**。

**為什麼選 wttr.in**：無 API key、curl 一行、輸出已格式化（emoji + 溫度），對 Lesson 3 的「最低門檻」原則最合。fallback 不教 open-meteo（需要 lat/lon，門檻高）。

---

## §6 跨 lesson 引用（待 plan 階段落實）

### 必改項

1. **`lesson-2.html:461`** —— 預告連結啟用
   - 現狀：`<li><strong>Lesson 3 · hermes 日常使用入門</strong>：context 管理、skills、cron、background sessions 完整介紹</li>` *(無連結)*
   - 改成：`<li><a href="lesson-3.html"><strong>Lesson 3 · hermes 日常使用入門</strong></a>：context 管理、skills（寫一個訪談式日記 skill）、cron 與 background sessions 加碼</li>`

2. **`CLAUDE.md` §跨步驟引用** —— 新增 Lesson 3 ↔ Lesson 2 的對稱規則
   - 新增條目：「`lesson-3.html` Step 0 / Step 1」→ 提到沒做過 Lesson 1/2 請先做（fallback 連結到 `index.html` + `lesson-2.html`）
   - 新增條目：Lesson 2 → Lesson 3 forward link 不可刪
   - 標題改為「Lesson 之間（index.html ↔ lesson-2.html / lesson-3.html / lesson-4.html）」

3. **`README.md`** —— 結構區加入 `lesson-3.html`

### 可選項（plan 階段視情況決定）

- **`index.html` Step 0**：第 34 行「自動學會新的「技能」（Skills），下次會做得更好」可加一句「（Lesson 3 教你怎麼寫一個自己的 skill）」。低優先，不做也不壞。
- **`lesson-4.html:588`「Lesson 5 暫定」**：暫不動。Lesson 4 設計上不依賴 Lesson 3，預告語留 placeholder 沒問題。

### 不動的

- `lesson-4.html` 本體：Lesson 4 在 Lesson 3 之前就上線、設計上獨立，不該回頭加強耦合。
- 既有 specs/plans 裡關於「Lesson 3 暫時沒列」「Lesson 3 LINE」等過時引用：屬歷史記錄，不改。

---

## §7 wizard / HTML 規格

延續 Lesson 1/2/4 的 pattern（CLAUDE.md §架構重點 1–5）：

- `<body data-total-steps="6" data-storage-key="hermes-course-lesson-3-step">`
- `<section class="step" data-step="0">` 到 `data-step="6"`（共 7 個 section）
- 預設首頁 Step 0（前言），URL hash `#step-0`
- 進度文字：Step 0 = 「前言」、Step 1–6 = 「Step N / 6」
- 所有可複製指令用 `<pre data-copy>` 包起來，由 `wizard.js` 自動注入 Copy 按鈕
- 使用 Pico CSS（jsdelivr CDN）+ `style.css` 既有覆寫
- 不引入新 JS / CSS 檔，**保持零 build**

---

## §8 風險與變數

- **`/topic`、`/compact` 指令是否真的存在**：5/7 spec 預告字眼提過但沒驗證。Plan 階段第一件事是用 hermes CLI `/help` 或 `/skills` 自查當下版本實際支援的 `/` 指令清單；只把真的有的寫進 Step 2 cheatsheet。
- **skill 重啟生效機制**：上游 doc 寫「重啟 hermes 載入」，但實際是 `hermes` re-exec 還是 `pkill && hermes`？plan 第一階段要 dogfood 確認。
- **訪談 skill 在 Telegram 的多輪互動**：Lesson 2 已驗證 Telegram bot 多輪 context 可以連動，這裡無新風險。
- **wttr.in 偶爾掛掉**：加碼 D 的 SKILL.md Pitfalls 段已寫「失敗時跳過天氣繼續訪談」，學員手動加進去就好。
- **`metadata.hermes.config` prompt 行為**：上游 doc 寫「Messaging surfaces never ask for secrets in chat — they tell you to use `hermes setup` or `~/.hermes/.env` locally instead.」location 不是 secret 但 config 的 prompt UX 還是需 plan 階段驗證——可能要先從 CLI 跑一次 `/daily-journal` 把 location 設好，之後 Telegram 才不會卡。如果這條成立，加碼 D 要加一段「第一次 setup 從 CLI 跑」的提示。
- **學員 hermes 版本飄移**：spec 寫的 frontmatter 欄位（`requires_toolsets`、`config`）是 2026-05 看到的格式，上游可能改。Plan 階段要記下 dogfood 時的 hermes 版本，README 「上次驗證」區塊更新。

---

## §9 完成定義（Definition of Done）

本 spec 認為 Lesson 3 完整交付 = 以下全部成立：

- [ ] `lesson-3.html` 建立、Step 0–6 內容完成、Pico CSS 套用正常
- [ ] `<body data-total-steps="6" data-storage-key="hermes-course-lesson-3-step">` 設定
- [ ] §4 SKILL.md 範本完整可複製貼上（`<pre data-copy>`）
- [ ] 加碼 A/B/C/D 都用 `<details>` 寫
- [ ] `lesson-2.html:461` 改成 `<a href="lesson-3.html">` 啟用連結
- [ ] `CLAUDE.md` §跨步驟引用區新增 Lesson 3 條目
- [ ] `README.md` 結構區列 `lesson-3.html`
- [ ] `ai-runbook.md` 加 Lesson 3 stages（plan 階段決定 stage 編號）
- [ ] `pre-class-checklist.md` 加 Lesson 3 smoke 條目（plan 階段決定條目數）
- [ ] dogfood 跑過一次：CLI `/daily-journal` 跑通 + Telegram 觸發跑通 + 加碼 D（天氣）跑通
- [ ] `README.md`「上次驗證」更新 hermes 版本 + 日期

---

## §10 後續（不在本 spec 範圍）

依 brainstorming → writing-plans → executing-plans 流程，本 spec approve 後接：

1. **`docs/superpowers/plans/2026-05-13-lesson-3-daily-use.md`**：把上述 §3–§7 拆成可執行 stage（含 dogfood、HTML 撰寫、cross-ref 修改、smoke 條目）
2. 實作（feature branch `feat/lesson-3-daily-use`，沿用 Lesson 2/4 慣例）
3. Smoke 與 PR / merge
4. README 上次驗證更新
