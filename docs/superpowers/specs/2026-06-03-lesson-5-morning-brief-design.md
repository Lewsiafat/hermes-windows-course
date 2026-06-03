# Lesson 5 · 進階使用 — 每日晨報自動化（設計）

> 狀態：設計核可（2026-06-03），待產出實作計畫。
> 由 `/brainstorming` 流程逐題釐清而成。

## 1. 一句話

教學員用「**cron 觸發一個自製 skill**」的進階模式，把 hermes 變成每天早上自動推一則晨報到 Telegram 的助理——這是 Lesson 3（日常使用：cron + skill-creator）之上的第一個「真實自動化 workflow」。

## 2. 範圍鎖定（brainstorming 決策）

| 維度 | 決策 | 理由 |
|------|------|------|
| 核心主軸 | 進階自動化 workflow（cron + 多 source + 推 channel） | 接在 L3 之後最自然的「使用層」進階 |
| 招牌場景 | 每日晨報（morning brief） | 最經典、最有感、天然多 source |
| 持續運行 | **假設 gateway 常駐**，只聚焦 workflow | 24/7 常駐維運（`hermes gateway install`）留給未來 Lesson 6（CLAUDE.md 既有伏筆） |
| 投遞 channel | **只用 Telegram** | 前置簡單明確（L1+2+3）；LINE 學員需自行轉換 |
| 晨報 source | 天氣+降雨 / 新聞頭條3條 / 今日提醒語 | 砍掉財經 source，閃過 L3 已知的 SP500 dogfood 雷 |
| 實作粒度 | **單一 channel-agnostic skill + cron 觸發** | skill 不重造內建抓取，專責「編排＋格式」；多 skill 互 call 在 hermes 上未驗證、價值低 |
| skill 養大方式 | **重跑 `/skill-creator` 修訂既有 skill** | 全課一路踩 skill-creator、學員不碰 YAML，強化 L3 工具 |
| 結構取徑 | **A 漸進堆疊**，前言吸收「概念先行」精華 | 每疊一層都有手機通知成果；把「管線通不通」與「source 抓不抓得到」兩個風險解耦 |

## 3. 前置與終局

- **前置課程**：Lesson 1（裝好）+ 2（Telegram 通）+ 3（玩過 cron、會用 skill-creator）
- **終局 end state**：Telegram 每天 07:00 收到一則 ⟨天氣+降雨 / 新聞頭條3條 / 今日提醒語⟩ 晨報，由 `/morning-brief` skill 經 cron 觸發產生

## 4. 關鍵架構決定

**skill 保持 channel-agnostic，投遞交給 cron prompt。** skill 只負責 gather + compose（產出晨報文字），「推到 Telegram」寫在 cron prompt 裡。好處：skill 可重用（改推 LINE 不用動 skill），且沿用 L3 已驗證的「cron 講『推 Telegram』」模式。

心智模型對應：**trigger = cron、gather + compose = skill、deliver = cron 的 Telegram 目標**。

### 資料流（cron 觸發後）

```
[cron jobs.json] ──07:00 觸發──▶ [hermes 載入 morning-brief skill]
   skill 指示:  gather 台北天氣+降雨 ┐
                gather 3 條新聞頭條   ├─▶ compose 晨報格式
                append 今日提醒語     ┘
            ──▶ deliver 推 Telegram（cron prompt 指定）──▶ 📱 手機跳通知
```

cron 設定寫到 `~/.hermes/cron/jobs.json`（與 L3 一致）。

## 5. Step 切分（Step 0 前言 + 5 編號步驟，`data-total-steps="5"`、`data-storage-key="hermes-lesson5-step"`）

- **Step 0 · 前言** — 為什麼學「自動化 workflow」＋心智模型 trigger→gather→compose→deliver（一小段，不開專節）＋前置 fallback 連結（L1/L2/L3）＋「假設 gateway 常駐」call out
- **Step 1 / 5 · 開始之前** — 確認 hermes 在跑、Telegram 通、L3 cron 玩過
- **Step 2 / 5 · 造 `morning-brief` skill（v1：只抓天氣）** — TUI 跑 `/skill-creator`，種子 prompt 見下；訪談 →「不要 eval、只 vibe」→ reload-skills → 手動跑一次驗證有產出 ⇒ **skill 本體打通**
- **Step 3 / 5 · 用 cron 觸發這個 skill** — 「5 分鐘後跑 morning-brief、推 Telegram」→ 看手機收到 ⇒ **cron→skill→Telegram 管線打通**；再教 cron 管理（list / 改成每天 07:00 / 刪）
- **Step 4 / 5 · 把 skill 養大** — **重跑 `/skill-creator`** 修訂同一個 skill，加「新聞頭條3條」「今日提醒語」（順序：天氣→新聞→提醒）→ reload → 重跑 cron 觸發 → 看完整晨報（含新聞抓不到 fallback）
- **Step 5 / 5 · 完成 + 你做到了 + 加碼預告** — 回顧串接鏈、checkpoint 清單、加碼（換 source／多城市／換時間）、**預告下一課：gateway install 24/7 常駐**

A 漸進堆疊三里程碑：Step 2（skill 本體）→ Step 3（管線）→ Step 4（堆疊）。

### copy-paste prompts（`<pre data-copy>`）

- Step 2 種子 prompt：`幫我造一個叫 morning-brief 的 skill。工作是：抓台北今天的天氣和降雨機率，整理成一則簡短的早安晨報訊息。`
- Step 3 測試 / 永久：`5 分鐘後跑一次 morning-brief，把結果推到 Telegram` → `改成每天早上 7:00 跑 morning-brief，推到 Telegram`
- Step 3 cron 管理三式：`列出我現在所有 cron 排程` / `把 morning-brief 改成 7:30` / `刪掉 morning-brief 排程`
- Step 4 修訂 prompt（在 `/skill-creator` 內指向既有 morning-brief）：`幫我把 morning-brief 加兩件事：(1) 今天 3 條重點新聞頭條 (2) 結尾加一句今日提醒語。順序：天氣 → 新聞 → 提醒。`

## 6. 錯誤處理 / dogfood 風險（每點配一個「🚨 我卡住了」`<details>`）

| 風險 | 處理 / fallback |
|------|----------------|
| **新聞頭條抓不到/品質差**（主風險，同 L3 SP500） | 沿用 L3 寫法：「那是 web/tool-use 議題、非 cron 議題」；晨報仍以**天氣+提醒成立**；可對 hermes 說「再跑一次，補上 3 條新聞」 |
| **skill-creator 修訂既有 skill 改壞** | fallback：刪掉重造 / 退回只有天氣的 v1 |
| **07:00 沒收到（gateway 沒在跑）** | call out 本課假設常駐；先 `hermes gateway status`（L2 教過）；真正 24/7 是下一課 |
| **skill 改完沒生效** | reload-skills / 重啟（L3 載入方法表） |
| **Telegram 沒收到** | cross-ref Lesson 2 troubleshoot，確認 bot 還活著、channel 連通 |

**dogfood 驗證點**：① 新聞 web-fetch 當天抓得到嗎（主風險）② skill-creator 在 hermes 上能否乾淨修訂既有 skill。

## 7. 跨課引用合約（CLAUDE.md 要同步維護）

- **新增入口**：`lesson-3.html` Step 5 加碼/預告區新增一條 → `lesson-5.html`（L5 接「日常使用」之後）。CLAUDE.md 跨步驟引用要加此條，標「改 L3 Step 5 預告區時保留 → L5 出口」。
- **Step 0 fallback** → `lesson-1/2/3.html`。
- **Step 5 預告下一課** → gateway install 24/7 常駐；目前無 `lesson-6.html`，純文字預告（可連 hermes gateway 官方文件 URL，不連內部頁）。
- **L5 守護條目**：晨報的多 source 組合（天氣+新聞+提醒）**不可降級成單一資訊**——呼應 L3 cron prompt 守護條目，寫進 CLAUDE.md。
- cron 路徑 `~/.hermes/cron/jobs.json` 與 L3 一致；L3 改路徑則 L5 同步。

## 8. 驗收 checkpoint

1. ✓ `/morning-brief` skill 造得出來、手動跑有產出（天氣）
2. ✓ cron 5 分鐘測試 → Telegram 收到天氣晨報
3. ✓ 改成每天 07:00、`cron list` 看得到該 job
4. ✓ skill 養大後 → Telegram 收到 ⟨天氣 + 新聞3條 + 提醒⟩ 完整晨報

## 9. 待改／新增檔案（實作 scope）

| 檔案 | 動作 |
|------|------|
| `lesson-5.html` | **新增**：`data-total-steps="5"`、`data-storage-key="hermes-lesson5-step"`、Step 0 + 5 步、`<pre data-copy>` prompts、每步 `<details>` troubleshoot |
| `index.html` | 新增 Lesson 5 卡片 |
| `lesson-3.html` | Step 5 加碼/預告區新增 → `lesson-5.html` 出口 |
| `CLAUDE.md` | Lesson 地圖加 `lesson-5` 行＋跨步驟引用加「L3→L5 出口」＋L5 多 source 守護條目 |
| `pre-class-checklist.md` | 新增 L5 smoke 條目（3 易壞點：skill-creator 可用 / cron 推 Telegram 通 / 新聞當天抓得到） |
| `ai-runbook.md` | 新增 L5 stage（Part 1 full capture + Part 2 quick smoke） |
| `README.md` / `CHANGELOG.md` | release 時 **minor bump**（新 lesson，依 CLAUDE.md semver） |
| `assets/screenshots/` | 待補 `lesson-5` 的 `step-N-*.png`（依 ai-runbook 命名規範，dogfood 時截） |

## 10. 明確 out of scope

- `hermes gateway install`（systemd 24/7 常駐服務）→ 留給未來 Lesson 6
- LINE 投遞 → 學員自行類推
- 財經 source（匯率/指數）→ 避開 dogfood 雷
- 多 skill 互 call 編排 → 價值低、未驗證
