# Lesson 2 — Telegram Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `lesson-2.html` 獨立精靈頁（Step 0 + 7 步），把 Lesson 1 裝好的 hermes 接到 Telegram；同步把 `wizard.js` 從硬編碼參數改為讀 `<body>` data-attributes，讓 Lesson 1 與 Lesson 2 共用同一支 JS。

**Architecture:**
- 純靜態，零 build。新檔 `lesson-2.html` 與 `index.html` 並列，共用 `style.css`、`wizard.js`、Pico CSS CDN。
- `wizard.js` 改成讀 `<body data-total-steps>` 與 `<body data-storage-key>`；不寫 fallback、attribute 漏寫直接讓 navigation 壞掉（fail loud）。
- BotFather 申請流程**外連**既有教材 `https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html`，並在 `<details>` 內備一份 inline fallback 以防主連結失聯。
- 主流程鎖在 polling + 機器開著時可用；24/7、webhook、雲端、自動啟動全部排除（spec §4.2）。

**Tech Stack:** Vanilla HTML5 + CSS3 + ES2020 JS、Pico CSS 2.x via CDN、GitHub Pages 部署。

**Spec:** `docs/superpowers/specs/2026-05-07-lesson-2-telegram-integration-design.md`

---

## File Structure

```
hermes-windows-course/
├── index.html              # Lesson 1（既有）— 加 <body data-*>、Step 9 加碼 B 末段加 lesson-2 連結
├── lesson-2.html           # 新建 — Lesson 2 精靈（Step 0 + 7 步）
├── wizard.js               # 既有 — refactor：從 <body> 讀 TOTAL_STEPS / STORAGE_KEY
├── style.css               # 不動
├── README.md               # 結構區補列 lesson-2.html
├── pre-class-checklist.md  # 加 Lesson 2 必檢項
├── ai-runbook.md           # 加 Lesson 2 stages 11–17 + smoke checks
└── CLAUDE.md               # 補上 wizard 參數化注意事項與 cross-ref 規則
```

**Boundaries:**
- HTML 兩支檔（index、lesson-2）擁有所有教材文字與結構。
- `wizard.js` 只管導覽行為（hash routing、prev/next、localStorage、copy button），不放任何教材文字、不知道有幾步。
- `style.css` 不動，避免影響 Lesson 1 的視覺。

---

## Tasks

### Task 0: Pre-implementation Smoke Check（user-run, 不 commit）

**目的：** 開工前確認 spec §10 的開放問題與 §8 的必檢項目，以避免照 spec 寫完才發現 hermes 上游或外部資源已變動。

**Files:** 無修改。本任務是 WSL/瀏覽器端確認，結果寫進本 plan 的「Smoke Check Results」區塊。

- [ ] **Step 1: 確認 BotFather 教材主連結仍可用**

```bash
curl -I https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html
```

預期：`HTTP/2 200` 或 `HTTP/1.1 200 OK`。若 4xx/5xx，仍照 plan 寫 `<details>` 備援；若 DNS 完全打不到，把 Step 2 主流程改成只用 inline 備援。

- [ ] **Step 2: 確認 hermes gateway 是否有原生 log flag**

在 WSL 跑：

```bash
hermes gateway --help
```

看輸出是否有 `--log` / `--log-file` / `--logfile` 之類 flag。

預期決策：
- **有**：Task 8（Step 5 內容）改用原生 flag 而非 `> ~/.hermes/gateway.log 2>&1`。
- **沒有**（spec 預設假設）：照 spec §6 用 redirect 寫法，無需調整。

- [ ] **Step 3: 確認 `hermes gateway setup` 互動流程仍對得上**

在 WSL 跑：

```bash
hermes gateway setup
```

依精靈走到「選 telegram」那一頁就好（**不必填完**，按 Ctrl+C 中斷即可）。確認：
- 仍可選 `telegram`
- token 與 allowed users 仍是兩個獨立欄位

若流程改了：開 issue 給自己，補在「Smoke Check Results」，照新流程改 Task 7。

- [ ] **Step 4: 確認 .env 變數名仍是 TELEGRAM_BOT_TOKEN / TELEGRAM_ALLOWED_USERS**

跑完一次 setup 後（或挑前一次跑過的環境）：

```bash
grep -E '^(export )?TELEGRAM_(BOT_TOKEN|ALLOWED_USERS)=' ~/.hermes/.env
```

預期：兩行都在。若變數名變了，Task 7 的 sed 補救與 Task 13 的 pre-class-checklist 一起改。

- [ ] **Step 5: 確認 @userinfobot 仍可用**

手機 Telegram 開 `https://t.me/userinfobot` → `/start`，預期回一段含純數字 user_id 的訊息。

- [ ] **Step 6: 把以上 5 條結果寫進 plan 的「Smoke Check Results」區塊**

在本檔最末段（Task 15 之後）新增 / 更新一個 `## Smoke Check Results (YYYY-MM-DD)` section，記下日期、5 條結果（含 hermes version `hermes --version`）。本 step **不 commit**——這是任務追蹤，不是版本歷程。

---

### Task 1: wizard.js Refactor + index.html 補 data-attributes

**目的：** 把 `wizard.js` 從硬編碼 `TOTAL_STEPS = 9` / `STORAGE_KEY = 'hermes-course-step'` 改成讀 `<body>` dataset。同時改 `index.html` 補上對應 attributes，確保 Lesson 1 行為不變。一筆 commit 收兩支檔——它們必須一起改才不會壞。

**Files:**
- Modify: `wizard.js:1-2` (兩個 const 宣告)
- Modify: `index.html:10` (`<body>` 標籤)

- [ ] **Step 1: 修改 `wizard.js` 第 1–2 行**

把：

```js
const TOTAL_STEPS = 9;
const STORAGE_KEY = 'hermes-course-step';
```

改為：

```js
const TOTAL_STEPS = parseInt(document.body.dataset.totalSteps, 10);
const STORAGE_KEY = document.body.dataset.storageKey;
```

**注意：** 不寫 fallback。若 `<body>` 沒設 attributes，`TOTAL_STEPS` 會是 `NaN`、`STORAGE_KEY` 會是 `undefined`，wizard 會在 console 噴錯且導覽壞掉。這是 spec §6.2 明示要求的 fail-loud 行為。

由於 `wizard.js` 有 `defer` 載入，DOMContentLoaded 之前 body 已被 parser 看到，`document.body` 在 module 頂層即可用——這個假設要在 Step 4 驗證。

- [ ] **Step 2: 修改 `index.html` 第 10 行**

把：

```html
<body>
```

改為：

```html
<body data-total-steps="9" data-storage-key="hermes-course-step">
```

- [ ] **Step 3: 瀏覽器驗證 Lesson 1 行為不變**

```bash
xdg-open /home/lewsi/Documents/workspaceAgent/hermes-windows-course/index.html
```

依序確認：

1. 開啟後預設停在 Step 0（前言頁），進度文字顯示「前言」。
2. 點「下一步 →」→ 進入 Step 1，進度文字「Step 1 / 9」。
3. 連點到 Step 9，進度文字「Step 9 / 9」，「下一步 →」按鈕 disabled。
4. 重整頁面（F5）→ 仍停在 Step 9（localStorage 還在）。
5. 開 DevTools Console → 不應有 error / warning。
6. 改 URL 到 `#step-3` → 跳到 Step 3。

任何一條 fail → 回 Step 1/2 修正再重驗。

- [ ] **Step 4: 確認 fail-loud 行為（負面測試，看完恢復）**

暫時把 `index.html:10` 改回 `<body>`（拿掉 attributes），重整。預期：DevTools Console 噴 NaN / undefined 相關錯，按鈕亂跳或卡 Step 0。確認後**改回**正確版本：`<body data-total-steps="9" data-storage-key="hermes-course-step">`。

- [ ] **Step 5: Commit**

```bash
git add wizard.js index.html
git commit -m "refactor(wizard): read TOTAL_STEPS and STORAGE_KEY from <body> data-attrs

Hardcoded constants prevented wizard.js reuse across lessons. Move them
to <body data-total-steps> / <body data-storage-key> so a second lesson
page can drive the same script with its own values.

No fallback by design — missing attributes fail loud in the console
rather than silently misbehaving."
```

---

### Task 2: 建立 lesson-2.html 骨架

**目的：** 先把 8 個 `<section data-step>`（Step 0 + 1–7）框架立起來，內容用簡短 placeholder 文字填，確認 wizard.js 對 7 步的精靈也跑得起來。內容會在 Task 3–10 一個 Step 一個 Step 寫進去。

**Files:**
- Create: `lesson-2.html`

- [ ] **Step 1: 建立 `lesson-2.html`**

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hermes Lesson 2 · Telegram 整合</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body data-total-steps="7" data-storage-key="hermes-lesson2-step">
  <header class="container">
    <hgroup>
      <h1>Lesson 2 · Telegram 整合</h1>
      <p>把 hermes 接到手機，30–45 分鐘</p>
    </hgroup>
    <nav id="progress" aria-label="進度">
      <span id="progress-text">前言</span>
    </nav>
  </header>

  <main class="container">
    <section class="step" data-step="0">
      <header><hgroup><h2>前言（placeholder，Task 3 補內容）</h2></hgroup></header>
      <p>placeholder</p>
    </section>

    <section class="step" data-step="1" hidden>
      <header><hgroup><h2>Step 1 / 7 · 開始之前（placeholder，Task 4 補內容）</h2><p>~2 分鐘</p></hgroup></header>
      <p>placeholder</p>
    </section>

    <section class="step" data-step="2" hidden>
      <header><hgroup><h2>Step 2 / 7 · 申請 Telegram bot（placeholder，Task 5 補內容）</h2><p>~5 分鐘</p></hgroup></header>
      <p>placeholder</p>
    </section>

    <section class="step" data-step="3" hidden>
      <header><hgroup><h2>Step 3 / 7 · 拿你的 Telegram user_id（placeholder，Task 6 補內容）</h2><p>~2 分鐘</p></hgroup></header>
      <p>placeholder</p>
    </section>

    <section class="step" data-step="4" hidden>
      <header><hgroup><h2>Step 4 / 7 · <code>hermes gateway setup</code>（placeholder，Task 7 補內容）</h2><p>~8 分鐘</p></hgroup></header>
      <p>placeholder</p>
    </section>

    <section class="step" data-step="5" hidden>
      <header><hgroup><h2>Step 5 / 7 · 啟動 hermes gateway（背景）（placeholder，Task 8 補內容）</h2><p>~5 分鐘</p></hgroup></header>
      <p>placeholder</p>
    </section>

    <section class="step" data-step="6" hidden>
      <header><hgroup><h2>Step 6 / 7 · 第一次手機 ↔ hermes（placeholder，Task 9 補內容）</h2><p>~5 分鐘</p></hgroup></header>
      <p>placeholder</p>
    </section>

    <section class="step" data-step="7" hidden>
      <header><hgroup><h2>Step 7 / 7 · 完成 + 加碼 + 下一步（placeholder，Task 10 補內容）</h2><p>~5 分鐘</p></hgroup></header>
      <p>placeholder</p>
    </section>

    <nav id="step-nav" class="container">
      <button id="prev-btn" type="button">← 上一步</button>
      <button id="next-btn" type="button" class="primary">下一步 →</button>
    </nav>
  </main>

  <footer class="container">
    <small>對應 hermes-agent <span id="version-tag">（待 smoke test 確認）</span> · <a href="https://github.com/Lewsiafat/hermes-windows-course">GitHub</a> · <a href="index.html">← 回 Lesson 1</a></small>
  </footer>

  <script src="wizard.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: 瀏覽器驗證 7 步精靈跑得起來**

```bash
xdg-open /home/lewsi/Documents/workspaceAgent/hermes-windows-course/lesson-2.html
```

確認：

1. 預設停在 Step 0，進度文字「前言」。
2. 點「下一步 →」→ Step 1，進度「Step 1 / 7」。
3. 連按到 Step 7，進度「Step 7 / 7」，「下一步 →」disabled。
4. 重整頁面 → 停在 Step 7。
5. 改 URL 到 `#step-4` → 跳到 Step 4。
6. 開另一分頁載 `index.html` → Lesson 1 仍停在自己的進度（兩支用不同 storageKey 互不干擾）。
7. DevTools Console 無 error。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): scaffold lesson-2.html with 7-step wizard skeleton

Placeholders for Step 0 + Step 1–7 contents. wizard.js drives navigation
via <body data-total-steps='7' data-storage-key='hermes-lesson2-step'>,
keeping Lesson 1 progress isolated."
```

---

### Task 3: lesson-2.html Step 0（前言）內容

**目的：** 寫 Step 0 前言頁——說明這一堂要做什麼、4 個 checkpoints 是什麼、polling 限制（spec §2.1、§5）。

**Files:**
- Modify: `lesson-2.html`（Step 0 section）

- [ ] **Step 1: 替換 Step 0 placeholder**

把 `lesson-2.html` 裡的：

```html
    <section class="step" data-step="0">
      <header><hgroup><h2>前言（placeholder，Task 3 補內容）</h2></hgroup></header>
      <p>placeholder</p>
    </section>
```

改為：

```html
    <section class="step" data-step="0">
      <header>
        <hgroup>
          <h2>前言 · 為什麼把 hermes 接到 Telegram</h2>
          <p>1 分鐘</p>
        </hgroup>
      </header>

      <p>Lesson 1 你已經在 WSL 裡裝好 hermes、做過第一次對話。但你只能坐在電腦前面跟它講話——這堂 30–45 分鐘的延伸課要把這個限制拿掉：<strong>把 hermes 接到 Telegram，從手機就能跟它對話</strong>。</p>

      <h3>結束時你會有</h3>
      <ol>
        <li>✓ 一支自己的 Telegram bot（透過 BotFather 申請）</li>
        <li>✓ 你自己的 Telegram user_id（讓 bot 只回你一個人）</li>
        <li>✓ <code>hermes gateway</code> 在 WSL 背景跑著</li>
        <li>✓ 至少一次「手機傳訊 → bot → hermes 回覆」的完整來回</li>
      </ol>

      <h3>限制：機器要開著</h3>
      <p>本堂用的是 <strong>polling 模式</strong>（hermes 每隔幾秒主動問 Telegram「有新訊息嗎」），所以你的 Windows + WSL 必須開著、gateway 必須跑著，bot 才有回應。Windows 重啟後 gateway 會掛掉、要手動重跑。<strong>「24/7 不間斷服務 / 自動啟動 / 雲端部署」不在本堂範圍</strong>，留給後續課程。</p>

      <details>
        <summary>已經在 Lesson 1 Step 9 加碼 B 申請過 token？</summary>
        <p>很好——Step 2 你可以直接跳到「貼到 Notes 暫存」那段，不必重做 BotFather 流程。沒做過也沒關係，Step 2 會帶你完整走一次。</p>
      </details>

      <details>
        <summary>沒做過 Lesson 1？</summary>
        <p>本堂預設你已完成 Lesson 1（hermes 在 WSL 裝好、可對話）。沒做過請先去 <a href="index.html">Lesson 1</a>，再回來。</p>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器驗證**

重整 `lesson-2.html` 在 Step 0，確認：
- 標題「前言 · 為什麼把 hermes 接到 Telegram」顯示。
- 4 個 checkpoints ol 顯示。
- 兩個 `<details>` 可展開、收合。
- 「Lesson 1」連結點下去跳到 `index.html`。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 0 intro page (前言 · 為什麼)"
```

---

### Task 4: lesson-2.html Step 1（開始之前）內容

**目的：** 前置確認、4 個 checkpoints checklist、加碼預告（spec §5）。

**Files:**
- Modify: `lesson-2.html`（Step 1 section）

- [ ] **Step 1: 替換 Step 1 placeholder**

```html
    <section class="step" data-step="1" hidden>
      <header>
        <hgroup>
          <h2>Step 1 / 7 · 開始之前</h2>
          <p>~2 分鐘</p>
        </hgroup>
      </header>

      <p>動工前先確認 3 件事都到位：</p>

      <h3>前置 checklist</h3>
      <ul>
        <li>✓ <strong>Lesson 1 已完成</strong>。打開 Ubuntu 終端機，跑 <code>hermes</code> 應該會進到 hermes TUI（按 <code>/exit</code> 退出）。沒做過？先去 <a href="index.html">Lesson 1</a>。</li>
        <li>✓ <strong>手機 / 電腦上有 Telegram 帳號</strong>。沒裝？App Store / Google Play / <a href="https://telegram.org/apps" target="_blank" rel="noopener">桌面版</a> 隨便挑一個。</li>
        <li>✓ <strong>記事本開著</strong>（任何純文字編輯器都行）。等下要暫存 token 跟 user_id 兩個東西。</li>
      </ul>

      <h3>這 7 步在做什麼</h3>
      <ol>
        <li><strong>Step 2</strong>：跟 Telegram 申請一支 bot，拿到 token</li>
        <li><strong>Step 3</strong>：拿你自己的 Telegram user_id（讓 bot 只回你）</li>
        <li><strong>Step 4</strong>：跑 <code>hermes gateway setup</code>，把 token 跟 user_id 寫進設定檔</li>
        <li><strong>Step 5</strong>：把 gateway 跑成背景程式</li>
        <li><strong>Step 6</strong>：從手機傳訊息給 bot，確認 hermes 有回</li>
        <li><strong>Step 7</strong>：收尾、加碼玩法、下一堂預告</li>
      </ol>

      <details>
        <summary>加碼預告</summary>
        <ul>
          <li><strong>群組使用</strong>（把 bot 加到 Telegram 群組）</li>
          <li><strong>語音訊息</strong>（直接傳語音，hermes 會自動轉字）</li>
          <li><code>/topic</code>（多開幾個對話 thread）、<code>/model</code>（中途切模型）</li>
        </ul>
        <p>都會在 Step 7 用 <code>&lt;details&gt;</code> 展開介紹。</p>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器驗證**

從 Step 0 點「下一步 →」進到 Step 1，確認標題「Step 1 / 7 · 開始之前」、3 條 checklist、7 步 overview、加碼預告 details 都顯示正常。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 1 (開始之前) — prerequisites checklist"
```

---

### Task 5: lesson-2.html Step 2（申請 Telegram bot）內容

**目的：** 主流程外連既有教材（spec §6.3），這頁只放 2–3 句速覽 + 暫存 token 提醒；`<details>` 內放 inline fallback 文案以防主連結失聯（spec §10）。

**Files:**
- Modify: `lesson-2.html`（Step 2 section）

- [ ] **Step 1: 替換 Step 2 placeholder**

```html
    <section class="step" data-step="2" hidden>
      <header>
        <hgroup>
          <h2>Step 2 / 7 · 申請 Telegram bot</h2>
          <p>~5 分鐘</p>
        </hgroup>
      </header>

      <p>Telegram 的 bot 申請流程超簡單，2 分鐘搞定：跟 <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a> 講話、回答幾個問題、拿到一段 token。</p>

      <h3>跟著走</h3>
      <p>已經有一份完整的中文教材，<strong>照著做就好</strong>：</p>

      <p><a href="https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html" target="_blank" rel="noopener"><strong>→ 開啟 Telegram Bot 申請教材</strong></a></p>

      <p>跟完到「拿到 HTTP API token」那一步即可，<strong>token 暫存到記事本</strong>，等下 Step 4 要貼進去。</p>

      <details>
        <summary>token 長什麼樣？</summary>
        <p>BotFather 回的 token 大概長這樣：</p>
        <pre><code>1234567890:ABCdefGHIjklMNOpqrsTUVwxyz0123456789</code></pre>
        <p>冒號前是 bot 的數字 ID，冒號後是 secret。<strong>整段都要</strong>。</p>
      </details>

      <details>
        <summary>🚨 主連結打不開（lewsi.ddns.net 失聯）</summary>
        <p>備援精簡版，5 句搞定：</p>
        <ol>
          <li>手機/電腦 Telegram 開 <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a></li>
          <li>送 <code>/newbot</code></li>
          <li>填 bot 顯示名稱（任意，例：<code>my-hermes</code>）</li>
          <li>填 bot username（必須以 <code>_bot</code> 或 <code>bot</code> 結尾，且全網唯一，例：<code>my_hermes_xyz_bot</code>）</li>
          <li>BotFather 回的訊息裡會有一段 <strong>HTTP API token</strong>，整段複製到記事本</li>
        </ol>
        <p>username 取太常見的會撞名，加亂數或日期通常就過了。</p>
      </details>

      <details>
        <summary>BotFather 還能做什麼？（之後想玩再回來）</summary>
        <ul>
          <li><code>/setname</code>：改顯示名稱</li>
          <li><code>/setdescription</code>：改 bot 自我介紹</li>
          <li><code>/setuserpic</code>：換頭像</li>
          <li><code>/mybots</code>：列出你所有 bot</li>
        </ul>
      </details>

      <p>✓ token 在手了？接著 Step 3。</p>
    </section>
```

- [ ] **Step 2: 瀏覽器驗證**

進到 Step 2，確認：
- 主連結 `lewsi.ddns.net` 開新分頁。
- 三個 `<details>` 都能展開。
- 「`/newbot`」code、token sample 顯示正確。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 2 (申請 Telegram bot) — external tutorial + inline fallback"
```

---

### Task 6: lesson-2.html Step 3（拿 Telegram user_id）內容

**目的：** @userinfobot → /start → 抄純數字。`<details>` 解釋 user_id 是什麼、為什麼 hermes 要這個（allowlist），spec §5 列為「新內容，舊教材沒涵蓋」。

**Files:**
- Modify: `lesson-2.html`（Step 3 section）

- [ ] **Step 1: 替換 Step 3 placeholder**

```html
    <section class="step" data-step="3" hidden>
      <header>
        <hgroup>
          <h2>Step 3 / 7 · 拿你的 Telegram user_id</h2>
          <p>~2 分鐘</p>
        </hgroup>
      </header>

      <p>hermes gateway 設定時會問你「哪些 Telegram 使用者可以跟這支 bot 講話」——這個白名單填的是 <strong>數字 user_id</strong>，不是 @username。下面 30 秒拿到。</p>

      <h3>動作</h3>
      <ol>
        <li>手機/電腦 Telegram 開 <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a></li>
        <li>按下方「Start」（或送 <code>/start</code>）</li>
        <li>它會立刻回一段話，裡面有 <strong>Id: 123456789</strong>（純數字，9–10 位數）</li>
        <li>把那串純數字複製到記事本，跟 Step 2 的 token 放一起</li>
      </ol>

      <details>
        <summary>user_id 是什麼？為什麼要它？</summary>
        <p>每個 Telegram 帳號都有一個唯一的數字 ID，跟 @username 不同——username 你可以隨時改、刪，但 user_id 跟著帳號一輩子。</p>
        <p>hermes gateway 啟動後，每收到一則訊息會檢查 <strong>這個 user_id 在不在 allowlist 裡</strong>，不在就拒絕回覆。所以這個欄位填的是「哪個 Telegram 人類帳號允許用這支 bot」，**不是** bot 自己的 ID。</p>
      </details>

      <details>
        <summary>Id 跟 Bot ID 怎麼分？</summary>
        <p>@userinfobot 回的訊息有時會列好幾項（Id、First Name、Last Name、Username、Language）。<strong>取最上面那個 <code>Id</code></strong>，那是你（人類）的 ID。Bot 自己的 ID 不會出現在這裡。</p>
      </details>

      <p>✓ user_id 抄好了？接著 Step 4 把 token 跟 user_id 一起餵給 hermes。</p>
    </section>
```

- [ ] **Step 2: 瀏覽器驗證**

進到 Step 3，確認標題「Step 3 / 7 · 拿你的 Telegram user_id」、4 步 ol、兩個 `<details>` 都正常。`@userinfobot` 連結點下去開 Telegram。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 3 (拿你的 Telegram user_id) — @userinfobot flow"
```

---

### Task 7: lesson-2.html Step 4（hermes gateway setup）內容

**目的：** 跑 `hermes gateway setup` 互動精靈、貼 token + user_id；paste 失敗有雷（同 Lesson 1 Step 7），補救方案 sed 改 `~/.hermes/.env`，**Variant A 互動 + Variant B 手動範本**兩個版本，跟 Lesson 1 Step 7 同模式（spec §5 / §6.3）。

**Files:**
- Modify: `lesson-2.html`（Step 4 section）

- [ ] **Step 1: 替換 Step 4 placeholder**

```html
    <section class="step" data-step="4" hidden>
      <header>
        <hgroup>
          <h2>Step 4 / 7 · <code>hermes gateway setup</code></h2>
          <p>~8 分鐘</p>
        </hgroup>
      </header>

      <p><code>hermes gateway setup</code> 是 hermes 把外部聊天平台接進來的設定精靈。我們要選 <code>telegram</code>、貼 Step 2 的 token、貼 Step 3 的 user_id。</p>

      <h3>動作</h3>
      <ol>
        <li>打開 Ubuntu 終端機，啟動精靈</li>
      </ol>

      <pre data-copy><code>hermes gateway setup</code></pre>

      <ol start="2">
        <li>依下面 3 個提示一個一個填</li>
      </ol>

      <h3>3 個提示怎麼答</h3>
      <table>
        <thead>
          <tr><th>提示</th><th>選 / 填</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Choose gateway</strong></td><td>用方向鍵選 <code>telegram</code>，Enter</td></tr>
          <tr><td><strong>Telegram bot token</strong></td><td>⚠️ <strong>建議手動 key in</strong>（同 Lesson 1 Step 7 的 paste 雷），或先看下面「補救」section 用 sed 寫進 .env。若還是要 paste：Ctrl+Shift+V，Enter</td></tr>
          <tr><td><strong>Allowed users</strong></td><td>貼 Step 3 的純數字 user_id，多人用逗號分隔（本教材只填你自己）。Enter</td></tr>
        </tbody>
      </table>

      <p>看到 <strong><code>Setup complete!</code></strong> 就成功，<code>~/.hermes/.env</code> 裡會多兩行 <code>TELEGRAM_BOT_TOKEN=</code> 與 <code>TELEGRAM_ALLOWED_USERS=</code>。</p>

      <details>
        <summary>Allowed users 是什麼？為什麼要填？</summary>
        <p>沒這個欄位的話，bot 是公開的——任何陌生人 Telegram 搜到你 bot 就能丟訊息進來，你的 OpenRouter 帳號就會被陌生人花錢。Allowed users 只放你自己（或團隊夥伴）的 user_id，其他訊息會被 gateway 直接 ignore。</p>
      </details>

      <details>
        <summary>🚨 我卡住了</summary>
        <ul>
          <li><strong>Ctrl+C 中斷</strong> → 重跑 <code>hermes gateway setup</code></li>
          <li><strong>token 貼進去變空白 / Step 5 跑 gateway 立刻 401</strong> → 用下面的補救 sed 直接改 <code>~/.hermes/.env</code></li>
          <li><strong>user_id 貼進去多了空白</strong> → 同上，用 sed 補救改 <code>TELEGRAM_ALLOWED_USERS=</code></li>
        </ul>
      </details>

      <h3>補救：直接改 hermes 的 .env</h3>
      <p>跟 <a href="index.html#step-7">Lesson 1 Step 7</a> 同根因（hermes 上游 paste 雷）、同模式。下面兩個版本擇一用：</p>

      <h4>Variant A · 互動腳本（推薦）</h4>
      <p>輸入時 token 不會回顯（避免肩膀後面被看到）、user_id 會回顯（純數字無妨）：</p>
      <pre data-copy><code>cd ~/.hermes &amp;&amp; read -sp "Paste your Telegram bot token: " TOKEN &amp;&amp; echo &amp;&amp; read -p "Paste your Telegram user_id: " UID &amp;&amp; sed -i "s/^TELEGRAM_BOT_TOKEN=.*/export TELEGRAM_BOT_TOKEN=$TOKEN/" .env &amp;&amp; sed -i "s/^TELEGRAM_ALLOWED_USERS=.*/export TELEGRAM_ALLOWED_USERS=$UID/" .env &amp;&amp; unset TOKEN UID</code></pre>

      <h4>Variant B · 手動範本</h4>
      <p>把 <code>YOUR_BOT_TOKEN</code> 與 <code>YOUR_USER_ID</code> 替換成實際值再貼進終端機：</p>
      <pre data-copy><code>cd ~/.hermes &amp;&amp; sed -i 's/^TELEGRAM_BOT_TOKEN=.*/export TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN/' .env &amp;&amp; sed -i 's/^TELEGRAM_ALLOWED_USERS=.*/export TELEGRAM_ALLOWED_USERS=YOUR_USER_ID/' .env</code></pre>

      <p>跑完任一個之後，下一步直接進 Step 5 啟動 gateway。</p>
    </section>
```

- [ ] **Step 2: 瀏覽器驗證**

進到 Step 4，確認：
- 三個 `<pre data-copy>` 都有 Copy 按鈕（wizard.js 自動注入）。
- 點 Copy 按鈕後變「✓ Copied」。
- `<a href="index.html#step-7">Lesson 1 Step 7</a>` 點下去跳到 Lesson 1 的 Step 7。
- Variant A / B 兩個 sed code 字面正確（不要被 markdown smart-quote 替換）。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 4 (hermes gateway setup) with paste-fallback sed"
```

---

### Task 8: lesson-2.html Step 5（啟動 hermes gateway · 背景）內容

**目的：** Task 0 smoke check 確認 hermes 有完整原生 lifecycle（`run` / `status` / `stop` / `restart` / `install`）且自己寫 log 到 `~/.hermes/logs/gateway.log`。本 Task 教學以原生指令為主、`pkill` 為 fallback。先前景試跑、再背景啟動、用 `hermes gateway status` 確認、`hermes gateway stop` 結束；誠實揭露 Windows 重啟後會掛、要重跑；`<details>` 提及 `hermes gateway install` 但留給後續課程（spec §5、§6.3、§7）。

**Files:**
- Modify: `lesson-2.html`（Step 5 section）

- [ ] **Step 1: 替換 Step 5 placeholder**

```html
    <section class="step" data-step="5" hidden>
      <header>
        <hgroup>
          <h2>Step 5 / 7 · 啟動 hermes gateway（背景）</h2>
          <p>~5 分鐘</p>
        </hgroup>
      </header>

      <p>Token 跟 user_id 都進 .env 了，現在把 gateway 跑起來——要跑成<strong>背景程式</strong>，這樣你關掉 Ubuntu 視窗也不會把它砍掉。</p>

      <h3>先試前景版（看它長什麼樣）</h3>
      <pre data-copy><code>hermes gateway run</code></pre>
      <p>會看到一段啟動 banner（含「Press Ctrl+C to stop」）。確認沒有 401 / fatal 錯誤後，按 <kbd>Ctrl+C</kbd> 停掉。<code>run</code> 是 hermes 官方對 WSL/Docker/Termux 推薦的子命令。</p>

      <h3>背景啟動（關 Ubuntu 視窗也不死）</h3>
      <pre data-copy><code>nohup hermes gateway run &gt; /dev/null 2&gt;&amp;1 &amp;</code></pre>
      <p>跑完按一次 Enter 把 prompt 推到下一行。沒看到任何錯誤訊息就成功。</p>

      <details>
        <summary>這行指令在做什麼？</summary>
        <ul>
          <li><code>nohup</code>：no-hangup，告訴 OS「這個程序在我關 terminal 後也別殺掉」</li>
          <li><code>hermes gateway run</code>：實際要跑的東西</li>
          <li><code>&gt; /dev/null</code>：把標準輸出（stdout）丟掉——hermes 已經把詳細 log 寫到 <code>~/.hermes/logs/gateway.log</code>，不必重複留</li>
          <li><code>2&gt;&amp;1</code>：把錯誤輸出（stderr）也導到同個地方（也丟掉）</li>
          <li><code>&amp;</code>（最末）：丟到背景跑，terminal 馬上把控制權還給你</li>
        </ul>
      </details>

      <h3>確認跑著</h3>
      <pre data-copy><code>hermes gateway status</code></pre>
      <p>預期看到類似：</p>
      <pre><code>✓ Gateway is running (PID: 12345)
  (Running manually, not as a system service)</code></pre>
      <p>沒看到「running」→ 看 log：</p>
      <pre data-copy><code>tail -n 50 ~/.hermes/logs/gateway.log</code></pre>

      <h3>看 log（即時）</h3>
      <p>想盯著 gateway 的活動（debug、看訊息進來）：</p>
      <pre data-copy><code>tail -f ~/.hermes/logs/gateway.log</code></pre>
      <p>離開 <code>tail -f</code> 用 <kbd>Ctrl+C</kbd>（這只是退出觀察，不會停掉 gateway 本身）。</p>

      <h3>停掉 gateway</h3>
      <pre data-copy><code>hermes gateway stop</code></pre>
      <p>萬一 stop 沒反應（極少見），fallback：</p>
      <pre data-copy><code>pkill -f "hermes gateway"</code></pre>

      <details>
        <summary>🚨 Windows 重啟後 bot 沒回應了？</summary>
        <p>正常。背景程序在 WSL 重啟後會被砍掉。<strong>重新登入 Ubuntu 後再跑一次同一行 <code>nohup hermes gateway run &gt; /dev/null 2&gt;&amp;1 &amp;</code> 即可</strong>。</p>
        <p>「開機自動啟動」hermes 內建有指令——<code>hermes gateway install</code>（user 級）或 <code>sudo hermes gateway install --system</code>（系統級、重開機自動）——但 systemd 服務的資源、安全、啟動順序 trade-off 值得整堂課展開，<strong>本堂不教</strong>，留給後續課程。</p>
      </details>

      <details>
        <summary>🚨 我卡住了</summary>
        <ul>
          <li><strong>跑 nohup 後 log 出 401 / Unauthorized</strong> → token 寫錯。<code>hermes gateway stop</code> 砍掉，回 Step 4 用 sed 補救改 <code>TELEGRAM_BOT_TOKEN=</code>，再背景跑一次。</li>
          <li><strong>看到 <code>Gateway already running (PID ...)</code></strong> → 之前跑過沒清，<code>hermes gateway restart</code> 直接重啟，或 <code>hermes gateway stop</code> 後再背景跑一次。</li>
          <li><strong>log 出現 network error</strong> → WSL 網路問題，<code>ping 8.8.8.8</code> 確認連得到外網。</li>
        </ul>
      </details>

      <p>✓ <code>hermes gateway status</code> 報 running 就成功，下一步進 Step 6 用手機測。</p>
    </section>
```

- [ ] **Step 2: 瀏覽器驗證**

進到 Step 5，確認：
- 6 個 `<pre data-copy>` 各有 Copy 按鈕（不含展示 status 輸出那一塊純 `<pre>`）。
- HTML entity (`&gt;` `&amp;`) 都正確 render 成 `>` `&`。
- 兩個 `<details>` 內的 `hermes gateway stop` / `restart` / fallback `pkill` 字面正確。
- 「Press Ctrl+C to stop」`<kbd>` 元素 render 成鍵帽樣式（Pico CSS 預設有支援）。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 5 (背景啟動 hermes gateway) with native lifecycle

Uses 'hermes gateway run' as the foreground demo and
'nohup hermes gateway run > /dev/null 2>&1 &' for background.
Status / log / stop all use native subcommands; pkill is fallback only.
Native log path '~/.hermes/logs/gateway.log' replaces the old redirect."
```

---

### Task 9: lesson-2.html Step 6（第一次手機 ↔ hermes）內容

**目的：** Telegram 搜 bot username → /start → 傳訊；多輪對話確認 context；「我卡住了」三類常見問題（spec §5、§7）。

**Files:**
- Modify: `lesson-2.html`（Step 6 section）

- [ ] **Step 1: 替換 Step 6 placeholder**

```html
    <section class="step" data-step="6" hidden>
      <header>
        <hgroup>
          <h2>Step 6 / 7 · 第一次手機 ↔ hermes</h2>
          <p>~5 分鐘</p>
        </hgroup>
      </header>

      <p>Gateway 跑著、token 跟 user_id 都對，現在用手機驗證整條鏈路通了。</p>

      <h3>動作</h3>
      <ol>
        <li>打開手機 Telegram，<strong>搜尋你 Step 2 設的 bot username</strong>（一般是 <code>@xxx_bot</code>）</li>
        <li>進到對話畫面，按下方「Start」（或送 <code>/start</code>）</li>
        <li>傳第一句話，例如：<code>hello, you there?</code></li>
        <li>等 1–5 秒（看模型 response 速度），bot 應該會回</li>
        <li>再傳一句相關的，例如：<code>what was my first message?</code>，確認 context 連動（hermes 應該記得你問過什麼）</li>
      </ol>

      <details>
        <summary>看 gateway log 確認訊息有進來</summary>
        <p>另開一個 Ubuntu 終端機分頁、跑：</p>
        <pre data-copy><code>tail -f ~/.hermes/gateway.log</code></pre>
        <p>傳訊時 log 應該會即時跑出新行，類似「Received message from user 12345」之類。</p>
      </details>

      <details>
        <summary>🚨 傳了訊息但 bot 沒回</summary>
        <p>看 <code>~/.hermes/gateway.log</code>，三類最常見：</p>
        <ul>
          <li><strong>log 顯示 unauthorized user</strong> → user_id 寫錯。回 <a href="#step-4">Step 4</a> 用 sed 補救改 <code>TELEGRAM_ALLOWED_USERS=</code>，<code>pkill -f "hermes gateway"</code> + 重啟 gateway。</li>
          <li><strong>log 完全沒新訊息</strong> → bot username 找錯了（你連到的是別人的 bot）。回 BotFather 用 <code>/mybots</code> 確認你 bot 的 username 跟你 Telegram 對話畫面的 @ 一致。</li>
          <li><strong>log 有訊息進來、但回應 timeout / API error</strong> → OpenRouter 那邊的問題，看 log 有沒有 401（key 過期 / 額度不足）或 5xx（暫時故障）。</li>
        </ul>
      </details>

      <details>
        <summary>🚨 Telegram 完全找不到我的 bot</summary>
        <ul>
          <li>確認 bot username 沒打錯（含 <code>@</code>）</li>
          <li>用瀏覽器開 <code>https://t.me/&lt;your_bot_username&gt;</code> 直接連</li>
          <li>還不行 → 回 BotFather <code>/mybots</code>，看你 bot 是不是被 BotFather 自動 disable 了（極少見）</li>
        </ul>
      </details>

      <p>✓ 傳訊有回 + context 對得上 → 4 個 checkpoints 完成，進 Step 7 收尾。</p>
    </section>
```

- [ ] **Step 2: 瀏覽器驗證**

進到 Step 6，確認標題、5 步 ol、3 個 `<details>` 顯示正常。`<a href="#step-4">Step 4</a>` 的內部 anchor 點下去能跳到 Step 4（注意：這個 hash link 是同頁跳轉，依賴 `wizard.js` 的 hashchange handler；驗證實際跳得過去）。

- [ ] **Step 3: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 6 (第一次手機 ↔ hermes) with troubleshooting"
```

---

### Task 10: lesson-2.html Step 7（完成 + 加碼 + 下一步）內容

**目的：** ✓ 4 checkpoints 收尾；`<details>` 加碼：群組、語音、`/topic`、`/model`；下次預告 Lesson 3 + Lesson 4（spec §5）。

**Files:**
- Modify: `lesson-2.html`（Step 7 section）

- [ ] **Step 1: 驗證 `/topic` 與 `/model` 實際語法**

下面 Step 2 的範本對 `/topic` / `/model` 用了**推測語法**（`/topic 旅遊`、`/topic switch xxx`、`/model <id>`）。在 WSL 跑：

```bash
hermes --help 2>&1 | grep -iE "topic|model"
hermes 2>/dev/null  # 進 TUI 試 /topic 跟 /model 看真實語法（看完 /exit）
```

若實際語法跟範本不同：Step 2 寫 HTML 時對應改加碼 3 / 加碼 4 的 `<code>` 範例。**寧可留模糊描述也不要寫錯指令**——學員照貼跑不通會直接卡住。

- [ ] **Step 2: 替換 Step 7 placeholder**

```html
    <section class="step" data-step="7" hidden>
      <header>
        <hgroup>
          <h2>Step 7 / 7 · 完成 + 加碼 + 下一步</h2>
          <p>~5 分鐘</p>
        </hgroup>
      </header>

      <p>恭喜，4 個 checkpoints 都完成：</p>
      <ol>
        <li>✓ Telegram bot 已申請、token 在手</li>
        <li>✓ user_id 已寫進 hermes allowlist</li>
        <li>✓ <code>hermes gateway</code> 在背景跑著</li>
        <li>✓ 至少一次「手機 → bot → hermes 回覆」完成</li>
      </ol>

      <h3>建議下一步</h3>
      <ul>
        <li>把 <code>nohup hermes gateway &gt; ~/.hermes/gateway.log 2&gt;&amp;1 &amp;</code> 這行也存到記事本——Windows 重啟後要重跑</li>
        <li>把這個頁面加書籤，下次想複習隨時回來</li>
      </ul>

      <details>
        <summary>加碼 1：把 bot 加到 Telegram 群組</summary>
        <p>讓多人都能跟同一支 hermes 講話：</p>
        <ol>
          <li>Telegram 開群組 → 加成員 → 搜你 bot 的 username → 加入</li>
          <li>BotFather <code>/mybots</code> → 選你的 bot → <code>Bot Settings</code> → <code>Group Privacy</code> → <code>Disable</code>（這樣 bot 才看得到群組裡所有訊息，而不是只 @ 它的）</li>
          <li>群組裡每個要用 bot 的人都要把自己 user_id 加進 <code>TELEGRAM_ALLOWED_USERS=</code>，逗號分隔。改完 <code>pkill -f "hermes gateway"</code> + 重新背景跑。</li>
        </ol>
      </details>

      <details>
        <summary>加碼 2：傳語音訊息</summary>
        <p>hermes gateway 預設會把語音訊息自動轉文字再丟給模型——直接按 Telegram 對話框右下角的麥克風講就好，不用 <code>/voice</code> 之類指令。</p>
        <p>轉字準確度看你 OpenRouter 帳號用什麼底層 ASR 模型。中文識別偶爾會不準，講慢一點會比較穩。</p>
      </details>

      <details>
        <summary>加碼 3：<code>/topic</code> 多開對話 thread</summary>
        <p>傳 <code>/topic 旅遊</code> → 開一條新的 thread；傳 <code>/topic</code>（不帶參數）→ 列出目前 threads；傳 <code>/topic switch 旅遊</code> → 切回那條。每條 thread 的 context 獨立，互不污染。</p>
      </details>

      <details>
        <summary>加碼 4：<code>/model</code> 中途切模型</summary>
        <p>傳 <code>/model</code>（不帶參數）→ 看目前模型；傳 <code>/model deepseek/deepseek-v4-pro</code> → 切到那個模型。費用上敏感的話，預設用免費 deepseek、特定問題切貴的。</p>
      </details>

      <details>
        <summary>加碼 5：把 gateway 變成 24/7 服務（hermes 內建）</summary>
        <p>不想每次 Windows 重啟都重跑 nohup？hermes 自己有：</p>
        <pre data-copy><code>hermes gateway install</code></pre>
        <p>會在你的 user 帳號下裝 systemd 服務（前提是 WSL2 啟用了 systemd）。裝完用 <code>hermes gateway start</code> / <code>stop</code> / <code>restart</code> 管理。</p>
        <p>但 systemd 在 WSL 上要先啟用（編輯 <code>/etc/wsl.conf</code> 加 <code>[boot]\nsystemd=true</code> 後 PowerShell 跑 <code>wsl --shutdown</code>），且 24/7 跑著有資源、安全、啟動順序的 trade-off。<strong>本堂不展開</strong>，留給後續「hermes 24/7 部署」專題。</p>
      </details>

      <h3>下次預告</h3>
      <ul>
        <li><strong>Lesson 3 · hermes 日常使用入門</strong>：<code>/topic</code>、<code>/model</code>、context、skills、cron 完整介紹</li>
        <li><strong>Lesson 4 · LINE gateway 設定</strong>：把同一支 hermes 也接到 LINE，讓 LINE 朋友也能用</li>
      </ul>

      <p><em>到這邊就是 Lesson 2 的全部內容。下次見。</em></p>
    </section>
```

- [ ] **Step 3: 瀏覽器驗證**

進到 Step 7，確認：
- 4 條 ✓ checkpoints。
- 5 個加碼 `<details>` 全部能展開（含「加碼 5：把 gateway 變成 24/7 服務」）。
- 「下次預告」兩條 li。
- 「下一步 →」按鈕 disabled（已到最後）。

- [ ] **Step 4: Commit**

```bash
git add lesson-2.html
git commit -m "feat(lesson-2): add Step 7 (完成 + 加碼 + 下一步) wrap-up"
```

---

### Task 11: index.html Step 9 加碼 B 末段加 lesson-2 連結

**目的：** Lesson 1 收尾的「加碼 B：申請 Telegram bot」結束後，引導學員無縫銜接 Lesson 2（spec §6.4）。

**Files:**
- Modify: `index.html:495-505`（加碼 B 的 `<details>` block）

- [ ] **Step 1: 修改 `index.html` 加碼 B**

把：

```html
      <details>
        <summary>加碼 B：申請 Telegram bot</summary>
        <p>比 LINE 更快，2 分鐘。</p>
        <ol>
          <li>在你手機/電腦的 Telegram 開 <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a></li>
          <li>送 <code>/newbot</code></li>
          <li>依提示填 bot 顯示名稱、username（必須 <code>_bot</code> 結尾）</li>
          <li>BotFather 會回一段話，裡面有 <strong>HTTP API token</strong>（一串長字元）</li>
          <li>複製到記事本</li>
        </ol>
      </details>
```

改為：

```html
      <details>
        <summary>加碼 B：申請 Telegram bot</summary>
        <p>比 LINE 更快，2 分鐘。</p>
        <ol>
          <li>在你手機/電腦的 Telegram 開 <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a></li>
          <li>送 <code>/newbot</code></li>
          <li>依提示填 bot 顯示名稱、username（必須 <code>_bot</code> 結尾）</li>
          <li>BotFather 會回一段話，裡面有 <strong>HTTP API token</strong>（一串長字元）</li>
          <li>複製到記事本</li>
        </ol>
        <p>✓ 拿到 token 了？接著進 <a href="lesson-2.html"><strong>Lesson 2 · Telegram 整合</strong></a>，把這支 bot 接通到 hermes。</p>
      </details>
```

- [ ] **Step 2: 瀏覽器驗證**

開 `index.html`、跳到 Step 9、展開「加碼 B」，確認末段「✓ 拿到 token 了？接著進 Lesson 2 · Telegram 整合」連結存在、點下去開 `lesson-2.html` Step 0。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(lesson-1): link Step 9 加碼 B to Lesson 2 for seamless handoff"
```

---

### Task 12: README.md 結構區更新

**目的：** 結構區補列 `lesson-2.html`（spec §6.1）。

**Files:**
- Modify: `README.md:7-15`（結構區）

- [ ] **Step 1: 修改 `README.md` 結構區**

把：

```markdown
## 結構

- `index.html` — 前言頁（為什麼選 hermes）+ 9 步教學精靈
- `style.css` / `wizard.js` — 樣式與導覽邏輯
- `assets/screenshots/` — 各步截圖（每次驗證後可能更新）
- `pre-class-checklist.md` — **每次教學前必跑**的 smoke test 流程（人類版，簡潔）
- `ai-runbook.md` — AI 工具版的 runbook（含 Full Capture Run + Quick Smoke Test，明確檔名與構圖要求）
- `docs/superpowers/specs/` — 課程設計文件
- `docs/superpowers/plans/` — 實作計畫
```

改為：

```markdown
## 結構

- `index.html` — **Lesson 1**：前言頁（為什麼選 hermes）+ 9 步安裝精靈
- `lesson-2.html` — **Lesson 2**：把 hermes 接到 Telegram（Step 0 + 7 步，30–45 分鐘）
- `style.css` / `wizard.js` — 共用樣式與導覽邏輯（`wizard.js` 從 `<body data-*>` 讀步數與 storage key）
- `assets/screenshots/` — 各步截圖（每次驗證後可能更新）
- `pre-class-checklist.md` — **每次教學前必跑**的 smoke test 流程（人類版，簡潔）
- `ai-runbook.md` — AI 工具版的 runbook（含 Full Capture Run + Quick Smoke Test，明確檔名與構圖要求）
- `docs/superpowers/specs/` — 課程設計文件
- `docs/superpowers/plans/` — 實作計畫
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(readme): list lesson-2.html in 結構 section"
```

---

### Task 13: pre-class-checklist.md 加 Lesson 2 必檢項

**目的：** 依 spec §8 加 Lesson 2 必檢項：BotFather 仍在、@userinfobot 仍可用、`hermes gateway setup` 順序、env var 名稱、polling default。

**Files:**
- Modify: `pre-class-checklist.md`（在「必檢四項」後新增「Lesson 2 必檢」section）

- [ ] **Step 1: 在 pre-class-checklist.md 的「必檢四項（最容易壞）」section 後、「截圖檢查」section 前，插入新 section**

定位：在 `### 4. 補救 sed script 仍能正確改 .env` 那一段結束（約第 49 行 `若 hermes 改了 config 路徑或變數名 → Step 7 補救 section 的 sed 與 Step 8 的 400 troubleshooting 都要重抓。`）的下一個空行後、`## 截圖檢查` 之前，插入：

```markdown
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

```

- [ ] **Step 2: Commit**

```bash
git add pre-class-checklist.md
git commit -m "docs(checklist): add Lesson 2 (Telegram) smoke test items"
```

---

### Task 14: ai-runbook.md 加 Lesson 2 stages

**目的：** 對應 spec §8、§5，補上 Lesson 2 的 AI 版 runbook。截圖留給下次 Full Capture Run，本次只把 Stage 結構與動作打完整。

**Files:**
- Modify: `ai-runbook.md`（在 Stage 10 後新增 Lesson 2 stages；Quick Smoke Test 區也加 Lesson 2 checks）

- [ ] **Step 1: 找定位錨點**

```bash
grep -n "Stage 10\|^## Part 1 預期截圖列表\|^## Check 4" /home/lewsi/Documents/workspaceAgent/hermes-windows-course/ai-runbook.md
```

確認 Stage 10 結尾、`## Part 1 預期截圖列表（共 19 張）` 開頭、`## Check 4` 開頭三個位置。

- [ ] **Step 2: 在 Stage 10 結尾、`## 上次驗證` section 前，插入 Lesson 2 stages**

新內容：

```markdown
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
6. 在另一個 WSL 分頁 `tail -f ~/.hermes/gateway.log`，確認傳訊時 log 即時跑出 `Received message from user <id>`

### 失敗處理
- log 出 unauthorized → user_id 寫錯，回 Stage 14 sed 改 `TELEGRAM_ALLOWED_USERS=` + 重啟 gateway。
- log 完全沒新訊息 → bot username 找錯。
- bot 找不到 → BotFather `/mybots` 對 username。

## Stage 17 · 收尾（Step 7）

### Action Block
1. lesson-2.html 點「下一步 →」進 Step 7
2. 確認 4 個 ✓ checkpoints 都對得上實際完成項
3. 展開 4 個加碼 `<details>` 至少瀏覽一次（不必實作）
4. 跑 `pkill -f "hermes gateway"` 結束本次驗證

### 失敗處理
- 任何一條 ✓ 對不上 → 回對應 Stage 重做。

```

- [ ] **Step 3: 在 `## Part 2 完成後` 之前的 Quick Smoke Test 區（Check 1–4 後），新增 Lesson 2 smoke checks**

把 `## Check 4 · 補救 sed script 仍能正確改 .env` section 後（約 545 行附近）、`## Part 2 完成後` 之前，插入：

```markdown
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

```

- [ ] **Step 4: Commit**

```bash
git add ai-runbook.md
git commit -m "docs(runbook): add Lesson 2 stages 11-17 + smoke checks 5-8

Screenshots deferred to next Full Capture Run; this commit only adds
action blocks and failure-handling for Lesson 2 (Telegram integration)."
```

---

### Task 15: CLAUDE.md 補上 wizard 參數化注意事項與 cross-ref 規則

**目的：** 既有 CLAUDE.md 寫「`TOTAL_STEPS = 9` 在 `wizard.js` 是硬編碼」這條已過時，要改；另外要補上 lesson 之間 cross-ref 不可任意刪的規則（spec §6.4）。

**Files:**
- Modify: `CLAUDE.md`（精靈的運作 section + 跨步驟引用 section）

- [ ] **Step 1: 修改「精靈的運作」第 3 條**

定位：CLAUDE.md 內含 `**`TOTAL_STEPS = 9` 在 `wizard.js` 是硬編碼**` 的那一條（約第 28–29 行）。

把：

```markdown
3. **`TOTAL_STEPS = 9` 在 `wizard.js` 是硬編碼**：它代表「安裝步驟數」，不含 Step 0。新增/刪除安裝步驟時必須同步改這個常數，並對應改 index.html 裡每個 step 標題的 `Step N / 9` 文字。
```

改為：

```markdown
3. **`TOTAL_STEPS` 與 `STORAGE_KEY` 從 `<body>` data-attributes 讀**：`wizard.js` 不再硬編碼，每支 lesson HTML 用 `<body data-total-steps="N" data-storage-key="...">` 自己宣告。新增 / 刪除 lesson 步驟時改 `<body>` attribute + 同步改該頁所有 `Step N / X` 文字。**不要在 wizard.js 寫 fallback**：fail loud 是設計，attribute 漏寫應該讓 console 噴錯而不是降級。
```

- [ ] **Step 2: 修改「跨步驟引用（不可任意刪除）」section，新增 lesson 之間的 cross-ref**

定位：CLAUDE.md 末段 `## 跨步驟引用（不可任意刪除）` section。

把整個 section 替換為：

```markdown
## 跨步驟引用（不可任意刪除）

某些步驟之間有 cross-reference，重構時請維持引用關係：

- **Step 7「補救：直接改 hermes 的 .env」section（Variant A / B 兩個 sed 腳本）** ← 被 Step 8「我卡住了」的 400 error 條目直接引用。改寫或搬位置時必須同步更新 Step 8 的指路文字。
- 該 sed 腳本（含 `export` 前綴的替換寫法）是 hermes 上游官方暫未修正 paste 問題的**繞行解**，**寫法原樣引用、不可擅自簡化**（例如不要拿掉 `export`、不要改 sed delimiter）。

### Lesson 之間（index.html ↔ lesson-2.html）

- **Lesson 1 `index.html` Step 9 加碼 B 末段** → 連到 `lesson-2.html`。改寫加碼 B 時必須保留這個出口。
- **Lesson 2 `lesson-2.html` Step 0 / Step 1** → 提到沒做過 Lesson 1 請先去 `index.html`。改 Step 0 / Step 1 文案時保留這個 fallback 連結。
- **Lesson 2 Step 4 補救 section** → cross-ref `index.html#step-7`，提示是同根因（hermes 上游 paste 雷）。Lesson 1 Step 7 搬位置或 anchor 改名時，Lesson 2 Step 4 的連結要對應改。
- Lesson 2 Step 4 的兩段 sed 補救（Variant A 互動 + Variant B 手動範本）跟 Lesson 1 Step 7 同模式但操作不同變數（`TELEGRAM_BOT_TOKEN` / `TELEGRAM_ALLOWED_USERS`，含 `export`）—— **寫法原樣引用、不可擅自簡化**。
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): update wizard parameterization note + add lesson cross-refs"
```

---

## Self-Review Checklist（plan 寫完跑一次）

**Spec coverage:**
- spec §2.1 課程終點 7 條 → Task 3 (Step 0) + Task 5–10 (Step 1–7) 涵蓋 ✓
- spec §5 8 步表格 → Task 3–10 一對一 ✓
- spec §6.1 檔案結構 → Task 1（wizard refactor）/ Task 2（lesson-2.html）/ Task 11（index.html link）/ Task 12（README）涵蓋 ✓
- spec §6.2 wizard 重構 → Task 1 ✓
- spec §6.3 既有資源重用 → Task 5 BotFather 外連 + Task 7 sed Variant A/B 同 Lesson 1 模式 ✓
- spec §6.4 lesson 串接 → Task 3 / Task 4（lesson-2 → lesson-1）+ Task 11（lesson-1 → lesson-2）✓
- spec §7 失敗模式 → Task 7（Step 4 paste fail）+ Task 8（Step 5 401/409）+ Task 9（Step 6 沒回應）涵蓋 ✓
- spec §8 smoke test → Task 0（pre-implementation）+ Task 13（pre-class-checklist）+ Task 14（ai-runbook）✓
- spec §10 開放問題 → Task 0 Step 1（BotFather URL）+ Task 0 Step 2（hermes gateway --log）✓

**No placeholders:** 每個 step 都有實際 HTML / sed / shell / commit message 內容。`「placeholder」` 字串只出現在 Task 2 lesson-2.html 骨架（之後 Task 3–10 會替換掉），這是中間狀態，不是 plan 漏寫。

**Type / 名稱一致性:**
- `TOTAL_STEPS` / `STORAGE_KEY` 在 Task 1、CLAUDE.md update（Task 15）一致。
- `<body data-total-steps="7" data-storage-key="hermes-lesson2-step">` 在 Task 2、Task 1（為 Lesson 1 用 9 / hermes-course-step）一致。
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_ALLOWED_USERS` 在 Task 7、Task 13、Task 14、Task 15 全用同樣大小寫。
- Variant A / Variant B 命名跟 Lesson 1 Step 7 既有模式一致。

---

## Smoke Check Results

**日期：2026-05-07** · **hermes 版本：** v0.12.0 (2026.4.30)

| # | Item | Result | Action |
|---|---|---|---|
| 1 | BotFather 主連結 (`https://lewsi.ddns.net/clawfactory/guides/telegram_bot_tutorial_zh.html`) | ✅ HTTP 200 | 主流程外連照寫；inline `<details>` 備援照寫保險。 |
| 2 | `hermes gateway --log` flag | ❌ flag 不存在，**但 hermes 自己寫 log 到 `~/.hermes/logs/gateway.log`**（原生路徑） | spec / plan Task 8 / Task 13 / Task 14 已改成原生路徑、不 redirect。 |
| 3 | `hermes gateway setup` 互動精靈 | ✅ subcommand 存在 | 使用者既有 .env 已含 TELEGRAM 兩行，setup 流程未在 smoke 階段重跑（避免覆蓋 prod 設定）；實作期間若有疑問再 dry-run。 |
| 4 | .env 變數名 | ✅ `TELEGRAM_BOT_TOKEN` / `TELEGRAM_ALLOWED_USERS`（無 `export` 前綴）| Lesson 2 Step 4 sed 補救沿用 Lesson 1 Step 7 加 `export` convention（CLAUDE.md 規定原樣引用、加上去無害）。 |
| 5 | @userinfobot | ⏸ 待手機驗證（不擋實作） | 教學日當天 smoke check 由 `pre-class-checklist.md` 的 Lesson 2 必檢項 #2 涵蓋。 |

**重大發現（觸發 spec 與 plan 修訂）：**
- hermes gateway 完整原生 lifecycle：`run` / `start` / `stop` / `restart` / `status` / `install` / `uninstall`
- 自管 PID lock：`~/.hermes/gateway.pid` + `~/.hermes/gateway.lock`
- 自管 log：`~/.hermes/logs/gateway.log`
- 重複啟動會被擋下並輸出 `Gateway already running (PID ...)`
- Spec §5 Step 5、§6.3 既有資源重用、§7 失敗模式、§8 Smoke Test 已對應更新
- Plan Task 8 / Task 13 / Task 14 已對應更新
- Plan Task 10 新增加碼 5：mention `hermes gateway install` 但留給後續課程
