# Lesson 3 重寫設計（2026-05-14）

> 取代 [`2026-05-13-lesson-3-daily-use-design.md`](./2026-05-13-lesson-3-daily-use-design.md)。原設計 +
> 已實作的 `lesson-3.html` 在執行階段被判定「方向錯了」：零程式背景的學員碰 `SKILL.md`
> yaml frontmatter + markdown Procedure 心理門檻過不去。本文件記新方向。原 spec 與
> 原 lesson-3.html 保留在 git 歷史與 main，供未來對照與回顧。

## 1. 為什麼重寫

**痛點（執行階段才發現的）**：
- 原 spec §3 Step 4「學員親手寫 daily-journal SKILL.md」要學員 nano 編 yaml + markdown，等同要他們做極輕度 programming
- 原 spec §5 加碼 D 又一次叫學員改 SKILL.md frontmatter
- Lesson 1+2 的 audience profile 是「零程式、剛從手機 chat 開始用 hermes」——這層門檻擋住主要 wow moment

**新方向**：
- 把「造 skill」這件事從「學員手寫」改成「對 hermes 講想要什麼、它幫你造」，跳過 yaml/markdown 接觸層
- 工具：[`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator)（Anthropic 官方 skill，已驗證可裝、可用）
- 順帶把 cron 排程從「加碼」升級成「正課」獨立單元（hermes 內建排程能力對日常使用很重要、跟 skill 無關但同樣是日常使用核心）
- 學員要做什麼 skill **由學員自己發想**，教材只給 3–5 個啟發例子（晨間摘要、英文單字、寫日記、提醒喝水…）

**audience 假設不變**：零程式背景、Lesson 1+2 已完成、Telegram bot 已接、有手機可用。教學場景假設**付費 model**（讓對話式安裝 / 對話式 cron 設定的 LLM 推理夠強，不會誤判使用者意圖）。

## 2. 學員定位與時間預算

| | 值 |
|---|---|
| 目標族群 | 零程式背景、做完 Lesson 1+2、想把 hermes 變成每天打開的工具 |
| 預設 model | 付費（教學場景）；學員家裡仍可用 Lesson 1 設的 free model，但體驗會打折 |
| 預期總時長 | 45–55 分鐘 |
| 結構 | 6 個 section（Step 0 前言 + Step 1–5 內容） |
| 語言 | 繁體中文（zh-Hant） |

## 3. 課程結構（6 個 section）

| Step | 名稱 | 時長 | hands-on 內容（一句話）|
|------|------|-----|---|
| 0 | 前言 + 自選主題 | ~2 min | 看完 3–5 個啟發例子、心裡想好一個自己的 skill 主題 |
| 1 | context 管理 | ~5–7 min | Telegram 試一次 `/new`（reuse 現有 lesson-3.html Step 1） |
| 2 | cron 排程（對話式） | ~7–10 min | 對 hermes 講「2 分鐘後跑 ⟨天氣+下雨+SP500⟩、推 Telegram」→ 改成 7:00 |
| 3 | 探索 hermes + 裝 skill-creator | ~5–8 min | `/skills list` 看內建 → 對話一句話裝 skill-creator |
| 4 | 用 skill-creator 對話造 skill | ~15–20 min | `/skill-creator` → 訪談 → 「不要 eval、只 vibe」→ 重啟 → 用 |
| 5 | 完成 + 加碼 | ~3 min | 4 checkpoints + 4 個加碼 |

## 4. 4 個 checkpoints

1. ✓ 會用 `/new` 切話題（Telegram 真的清掉 context）
2. ✓ Telegram 收到 cron 推送的 ⟨台北天氣 + 今日降雨預報 + 昨日 SP500⟩
3. ✓ `/skills list --source local` 看到 skill-creator
4. ✓ 自己發想的 skill 從 `/<your-skill-name>` 真的跑起來

第 2 條 checkpoint 同時驗證 cron + hermes tool-use（web fetch 天氣 / 財經數據）—— 一個 hands-on demo 兩個能力。

## 5. 各 Step 細節

### Step 0 · 前言 + 自選主題

- 連回 Lesson 1+2 已完成的狀態
- 講 Lesson 3 是「日常使用」入門
- **核心引導**：請學員**現在就想好**一個自己想要的 daily skill。給 3–5 啟發例子：
  - 「每天早上推一條英文俚語」
  - 「每天晚上 22:00 問我四個問題、寫成日記檔」
  - 「下班前提醒我喝水/喝水量未達標」
  - 「整理今日台北、東京、矽谷 3 個城市的天氣 + 重大新聞」
  - 「每週日早上把上週開過的 GitHub issue 整理成摘要」
- 預告 4 個 checkpoints + 必備條件（Lesson 1+2 已完成、Telegram bot 已接）
- `<details>` 必備：fallback link 回 `index.html` + `lesson-2.html`

### Step 1 · context 管理（保留）

- 直接 reuse 現有 lesson-3.html Step 1 整段內容（`<section data-step="1">`）
- 概念：context 越大 → 越慢、越貴、越分散 → 切話題就 `/new`
- hands-on：Telegram 跑算術題 → `/new` → 確認 bot 不記得前題
- `<details>`：`/title` `/resume` `/sessions` 延伸（reuse 現有）
- Checkpoint 1

### Step 2 · cron 排程（對話式 hands-on）

**概念區（~1 行）**：cron 是 hermes 內建的排程能力，用對話講要它幾點跑什麼，hermes 自己會把設定寫到 `~/.hermes/cron.yaml`。

**hands-on 流程**：

1. 複製貼上對 hermes 講：
   ```
   幫我設一個 cron job，2 分鐘後跑一次，內容：
   - 台北今日天氣
   - 今天台北會下雨嗎
   - 昨天 SP500 收盤指數
   把整理後的結果推到我的 Telegram。
   ```
2. hermes 自動：
   - 計算 2 分鐘後的 cron 表達式
   - 寫進 `~/.hermes/cron.yaml`
   - 重啟（或重新載入）gateway
   - 回覆「已設定，2 分鐘後會自動跑」
3. **等 2 分鐘**，期間講「等下載時可以順便讀：cron 也可以做到 X / Y / Z」（教學節奏 filler，類似 Lesson 1 的「等下載」段）
4. 看 Telegram **真的收到** ⟨天氣 + 降雨預報 + SP500⟩ → **Checkpoint 2 ✓**
5. 改成永久排程：對 hermes 講「把剛剛那個改成每天早上 7:00」
6. 驗證：對 hermes 講「列出我目前的 cron」確認設定存在

**🚨 我卡住了** `<details>`：
- 2 分鐘到了 Telegram 沒收到 → 重啟 gateway（`sudo $(which hermes) gateway restart --system`）+ 看 gateway log（`tail -n 50 ~/.hermes/logs/gateway.log`）
- hermes 沒主動寫 cron.yaml → 對它講更明確「請編輯 `~/.hermes/cron.yaml`」
- 收到的內容很奇怪（缺資料、數字錯）→ 那是 hermes 的 web/tool use 議題，不是 cron 議題；可以直接接受、或要 hermes 再跑一次

### Step 3 · 探索 hermes + 裝 skill-creator

**前半（~2–3 min）**：

- 跑 `/skills list` → 看 hermes 已內建的一堆 skills（autonomous-ai-agents / creative / productivity 等類別）
- 告訴學員：每個 skill 都是 hermes 的一塊「能力包」。例如剛剛 cron 收到的天氣資訊，其實背後可能也用到了某些 skill。
- 「但 hermes 內建的可能還不夠你想要的，所以你可以加裝外面寫的、甚至自己造一個」

**後半（~3–5 min）**：

1. 介紹 [`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator) —— 一個專門幫你造 skill 的 skill（meta）
2. 複製貼上對 hermes 講：
   ```
   幫我裝這個 skill：https://github.com/anthropics/skills/tree/main/skills/skill-creator
   ```
3. hermes 自動：
   - 抓 URL、拉 SKILL.md 跟資產
   - 放到 `~/.hermes/skills/...` 對應目錄
   - 回覆「裝好了」
4. 確認：跑 `/skills list --source local`（或對 hermes 講「列出我裝的 local skill」）→ 看到 `skill-creator` → **Checkpoint 3 ✓**

**🚨 我卡住了** `<details>`：
- hermes 沒主動安裝（free model 可能不會推理出該裝） → 提示學員講更明確「請執行 `/skills install <url>`」（fallback 直接給 slash command）
- `/skills list --source local` 沒看到 → 重啟 hermes CLI / gateway

### Step 4 · 用 skill-creator 對話造你的 skill（**核心 hands-on**）

**概念區（~1 行）**：skill-creator 會用訪談式幫你造 skill。你 Step 0 想的那個主題，現在拿出來用。

**hands-on 流程**：

1. 開始造：對 hermes 講（或 `/skill-creator`）：
   ```
   我想用 skill-creator 造一個 skill：⟨學員的主題⟩
   ```
   （如果學員 Step 0 還沒想好，教材這裡再列 3 個 example 主題重新提示）

2. skill-creator 會問訪談問題（4 個基本問題：是什麼 / 何時觸發 / 輸出格式 / 要 eval 嗎）。學員照自己想法回答。

3. **重要：skill-creator 會問「要不要設定 eval / 跑 test cases」**。教材告訴學員：
   > 你看到「要不要設定 eval」「要不要跑 benchmarks」「要不要設定 test cases」之類的問題時，直接回「不用 eval、只 vibe 就好」或「skip evaluation」。你不需要懂這個。

4. skill-creator 寫出 SKILL.md → 存到 `~/.hermes/skills/<category>/<name>/SKILL.md`（hermes 自動分類）→ 回覆「造好了，重啟我就能用」

5. **重啟 gateway 載入**：對 hermes 講「重啟 gateway 讓新 skill 生效」（或直接 `sudo $(which hermes) gateway restart --system`）

6. **驗證跑**：CLI 或 Telegram 跑 `/<your-skill-name>` → 看到 skill 真的跑、輸出符合預期 → **Checkpoint 4 ✓**

**🚨 我卡住了** `<details>`：
- skill-creator 問太多細節學員不知怎麼回 → 教學員主動講「就用簡單版本、細節幫我預設」
- 造完 `/<your-skill-name>` 認不出 → 確認 gateway 重啟、`/skills list --source local` 看名字
- 跑起來但行為不對 → 對 hermes 講「用 skill-creator 改寫剛剛那個 skill、補上 ⟨缺失行為⟩」（這就是 Step 5 加碼 C 的伏筆）

### Step 5 · 完成 + 加碼

**4 個 checkpoint 收尾**（顯示 ✓）。

**建議下一步**：
- 把這頁加書籤
- 真的把你造的 skill 用一週、看哪裡要改
- 從加碼 A 開始：把它串到 cron 變成每天自動跑

**加碼 A · 用 cron 跑你的 skill**：對 hermes 講「把剛剛 ⟨skill-name⟩ 串到 cron、每天 7:00 自動跑」→ 看明天 7:00 真的被 trigger。串起 Step 2 + Step 4 兩個能力。

**加碼 B · Telegram 觸發**：Step 4 重啟 gateway 後，從手機 Telegram 直接打 `/<your-skill>`。確認多 channel 共用。

**加碼 C · 用 skill-creator 改寫已造的 skill**：對 hermes 講「用 skill-creator 改寫 ⟨skill-name⟩、加上 ⟨新行為⟩」。展示迭代式對話開發。

**加碼 D · 看你的 SKILL.md 長怎樣**：
```bash
cat ~/.hermes/skills/*/⟨your-skill-name⟩/SKILL.md
```
揭開「skill 其實是純 markdown + yaml 標頭」。**不需要學員會寫**，只是讓他們看一眼「原來只是文字檔」，建立後續想學程式時的 entry point。

**下次預告**：Lesson 4（LINE 整合）已平行存在；Lesson 5 暫定（進階 skill 撰寫、分享 skill 到 agentskills.io）。

## 6. 跨 lesson 連結

### Lesson 2 → Lesson 3
- `lesson-2.html` Step 7 預告區 → `lesson-3.html`（已存在，重寫後保留）

### Lesson 3 內 fallback
- `lesson-3.html` Step 0 「必備」`<details>` → `index.html` + `lesson-2.html`

### Lesson 3 → 進階學習（未來 Lesson 5）
- Step 5 加碼 D 「看 SKILL.md 長怎樣」末段提一句「想學寫 skill → Lesson 5（待開）或 agentskills.io 直接挑現成的」

### CLAUDE.md 跨步驟引用區更新
- **移除**舊條目「Lesson 3 Step 6 加碼 D TRAP」（原 spec 寫 yaml 部分被砍、TRAP 警告也跟著消失）
- **保留並改寫**舊條目「Lesson 3 Step 0 fallback」(連結目標 `index.html` + `lesson-2.html` 不變，但文字描述要更新對應新 Step 0)
- **新增**條目：「Lesson 3 Step 2 cron 對話式 demo prompt（台北天氣 + 降雨 + SP500）」是學員第一次接觸 cron + tool-use 組合的範本，**不可任意換成簡單範例**（換掉就失去「cron + 多 tool 一次 demo」的 hands-on 價值）

## 7. wizard.js 規格

- `<body data-total-steps="5">`（從原來的 6 減 1）
- `<body data-storage-key="hermes-lesson3-step">`（不變）
- 進度文字邏輯：Step 0 顯示「前言」、Step 1–5 顯示 `Step N / 5`
- 各 `<section data-step="0">..<section data-step="5">` 共 6 個

**不動 wizard.js / style.css** —— 已經參數化、不需碰。

## 8. 風險清單

| # | 風險 | 觸發點 | 處置 |
|---|------|--------|------|
| 1 | hermes free model 不會自己 invoke 對話式安裝 / cron 設定 | Step 2 + Step 3 | 教學場景已假設付費 model，學員自家若用 free 看 fallback hint |
| 2 | `skill-creator` 行為跟我們預期不同（例：欄位變更、訪談順序變更） | Step 4 | 跑 dogfood 5 條（見 §9）；對齊實際 UX 寫教材 |
| 3 | cron 對話式設定行為跟我們預期不同（例：hermes 沒主動寫 cron.yaml） | Step 2 | dogfood 必驗 |
| 4 | hermes 內建 tool 不會抓 SP500 等財經數據（缺 API key） | Step 2 cron 驗證 | dogfood 確認；若不通，cron 範例改用純天氣 / wttr.in |
| 5 | gateway 重啟邏輯不一致（CLI 重啟 vs 對話式叫 hermes 重啟） | Step 4 | 教材給兩條路、優先對話式（與 Lesson 風格一致） |

## 9. 執行前 dogfood 必驗（給後續 plan 用）

以下 5 條必須在動工寫 lesson-3.html 之前驗證：

1. **cron 對話式設定真的能跑**：對 hermes 講「2 分鐘後跑 X」→ 看 ~/.hermes/cron.yaml 是否被 hermes 寫入、2 分鐘後 Telegram 是否真的收到
2. **cron 範例的三條資訊 hermes 都拿得到**（台北天氣 / 降雨 / SP500）—— 若財經數據拿不到，cron demo prompt 要簡化
3. **對話式裝 skill-creator 真的能跑**：講「幫我裝這個 URL」→ 確認檔案落在 ~/.hermes/skills/...
4. **skill-creator 的訪談 UX**（4 個基本問題、能講「不要 eval」逃生口）：跑一次，記實際對話樣貌
5. **skill-creator 造出來的 skill 重啟後可從 `/<name>` 跑**：完整端到端一次

dogfood 結果寫進 plan 末段「Dogfood Results」，作為教材寫作的 ground truth。

## 10. Definition of Done

- [ ] `lesson-3.html` 6 個 section（Step 0–5）完整、無 placeholder
- [ ] `<body data-total-steps="5">` 與 wizard.js 配合運作（瀏覽器 console 無紅錯）
- [ ] 4 個 checkpoints 文字一致跨 Step 0 預告 + Step 5 收尾
- [ ] 所有 `<pre data-copy>` 區塊在瀏覽器有 Copy 按鈕
- [ ] Step 4 至少有一個 `<details>` 卡住處置（skill-creator 訪談卡住、跑不起來、不認）
- [ ] `lesson-2.html` Step 7 連結照舊指向 `lesson-3.html`
- [ ] `CLAUDE.md` 跨步驟引用區更新
- [ ] `README.md` 結構區一行描述跟著改（從「skills（寫一個 daily-journal skill）」改成「對話式造 skill + cron」）
- [ ] `pre-class-checklist.md` Lesson 3 必檢項 5 條對齊新教材依賴（更新原版）
- [ ] `ai-runbook.md` Stage 25–31 + Check 13–16 對齊新教材依賴（更新原版）
- [ ] 整堂端到端 smoke 走通：學員可以 45–55 分鐘內完成 Step 0–5、4 checkpoints 全部達成
