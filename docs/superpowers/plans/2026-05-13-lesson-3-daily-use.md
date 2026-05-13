# Lesson 3 — Daily Use Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `lesson-3.html` 獨立精靈（Step 0 + 6 步），教學員 context 管理、`/` 指令、skills 概念，並親手寫一個 `daily-journal` SKILL.md 從 Telegram 觸發；附帶更新 `lesson-2.html` forward-link、`CLAUDE.md` cross-ref、README、pre-class-checklist、ai-runbook。

**Architecture:**
- 純靜態，零 build。新檔 `lesson-3.html` 與 `index.html` / `lesson-2.html` / `lesson-4.html` 並列，共用 `style.css`、`wizard.js`（已參數化）、Pico CSS CDN。
- `wizard.js` 與 `style.css` 完全不動。
- 壓軸 demo 為一個 hermes skill `daily-journal`：學員照範本寫 SKILL.md 進 `~/.hermes/skills/productivity/daily-journal/`，重啟 hermes 讓它載入，從 Telegram 觸發訪談式日記寫到 `~/journal/YYYY-MM-DD.md`。
- 加碼 D（天氣）demo `metadata.hermes.config` 機制 + wttr.in（無 API key）。
- Lesson 3 依賴 Lesson 1+2 完成，獨立於 Lesson 4。

**Tech Stack:** Vanilla HTML5 + CSS3 (Pico CSS 2.x via CDN) + 共用 `wizard.js` (ES2020)、GitHub Pages 部署。

**Spec:** `docs/superpowers/specs/2026-05-13-lesson-3-daily-use-design.md`

---

## File Structure

```
hermes-windows-course/
├── lesson-3.html               # 新建 — Lesson 3 精靈（Step 0 + 6 主步驟）
├── lesson-2.html               # Modify — Step 7「下次預告」Lesson 3 條目加上 <a href="lesson-3.html">
├── index.html                  # 不動（Lesson 1 Step 0 「Skills」forward-ref 屬可選，本 plan 不做）
├── lesson-4.html               # 不動（設計上獨立、不該回頭耦合）
├── wizard.js                   # 不動（已參數化從 <body data-*> 讀）
├── style.css                   # 不動
├── CLAUDE.md                   # Modify — §跨步驟引用區 加入 Lesson 3 條目
├── README.md                   # Modify — 結構區補列 lesson-3.html
├── pre-class-checklist.md      # Modify — 加「Lesson 3 必檢項」section
├── ai-runbook.md               # Modify — 加 Stage 25–31 + Check 13–15（接續 Lesson 4 stages 18–24 / checks 9–12）
└── docs/superpowers/plans/2026-05-13-lesson-3-daily-use.md   # 本檔
```

**Boundaries:**
- `lesson-3.html` 擁有 Lesson 3 所有教材文字與結構（含 SKILL.md 完整範本 + 加碼 A/B/C/D 全部內容）。
- `wizard.js` 完全不動。
- Cross-ref：`lesson-2.html` Step 7 末段 ↔ `lesson-3.html` 入口；`CLAUDE.md`、`README.md`、`pre-class-checklist.md`、`ai-runbook.md` 各補一塊 Lesson 3 區。

---

## Spec-to-Plan 決議（spec self-review 整理）

寫 plan 過程中對 spec 內三個輕度模糊處取定明確版本，列在這裡讓執行者照辦：

1. **`data-storage-key` 命名** — Spec §7 未指定，但 Lesson 4 plan 已建立 convention：`hermes-lesson<N>-step`（`index.html` 用 `hermes-course-step` 是 Lesson 1 例外）。**本 plan 採 `hermes-lesson3-step`。**

2. **Step 2「常用 `/` 指令」與 Lesson 2 cheatsheet 重疊問題** — Lesson 2 Step 7 已有完整 cheatsheet（`/new` `/title` `/resume` `/sessions` `/usage` `/model` `/help`）。Lesson 3 Step 2 不重複造輪，**只列 skills 相關新指令**（`/skills`、`/<skill-name>`）並 forward-link 回 Lesson 2 cheatsheet。

3. **SKILL.md 範本內 `category` 與目錄路徑** — Spec §4 已確認用 `category: productivity` 配對 `~/.hermes/skills/productivity/daily-journal/`。**本 plan 一律照此**，Task 6 與 Task 14 的 dogfood 指令也都用這條路徑。

不重啟 spec 改寫 — 上述三點是執行細節層，spec 仍可讀。

---

## Pre-task: 建立 feature branch

開工前在 main 上跑：

```bash
git checkout main && git pull && git checkout -b feat/lesson-3-daily-use
```

預期：切到 `feat/lesson-3-daily-use`，`git status` 乾淨。

> 注意：開工前若 working tree 還有 `index.html` + `CLAUDE.md`（Step 9 加碼 A 簡化的尾巴）未 commit，先處置完再切 branch，避免 mix-up。

---

## Tasks

### Task 0: Pre-implementation Dogfood Check（user-run, 不 commit）

**目的：** 確認 spec §8 風險清單裡四條 hermes-internal 行為仍如預期；任何一條失敗都會讓教材變空話，需要先處置（修教材 / 暫緩 / 改方案）才動工。

**Files:** 無修改。本任務在本機 hermes CLI 跑，結果寫進本 plan 檔最末段「Dogfood Results (YYYY-MM-DD)」。

- [ ] **Step 1: 確認 hermes CLI 仍可啟動**

Run:

```bash
hermes --version
```

Expected: 印出版本字串（例：`hermes 0.13.x`）。記下版本到 Dogfood Results 區。

若指令找不到：spec 假設不成立，回 Lesson 1 確認 install.sh 流程是否還對；停 plan 直到 Lesson 1 修好。

- [ ] **Step 2: 確認 `/skills` 指令存在且可列出 bundled skills**

Run hermes CLI、進到對話、輸入：

```
/skills
```

Expected: 印出 bundled skill 清單（至少包含 `/plan`、`/excalidraw` 等之一）。

若 `Unknown command`：spec §3 Step 3 假設 `/skills` 存在不成立。處置：
1. 若上游改名（例：`/skill list`），把 Step 2/3 cheatsheet 與 Step 3 概念段的指令字串全部對應更新
2. 若 bundled skills 為零：仍可教（學員自己寫的 skill 仍會出現），但 Step 3 例子要拿掉「看 bundled `/plan`」字眼

- [ ] **Step 3: 確認自寫 skill 重啟後可被識別為 slash command**

跑這串建立最小 test skill：

```bash
mkdir -p ~/.hermes/skills/productivity/test-hello && cat > ~/.hermes/skills/productivity/test-hello/SKILL.md <<'EOF'
---
name: test-hello
description: Temporary test skill, delete after Task 0
version: 0.0.1
metadata:
  hermes:
    tags: [test, throwaway]
    category: productivity
---

# Test Hello

## When to Use
User runs /test-hello

## Procedure
Reply with exactly "skill loaded ok" and nothing else.

## Verification
Output contains "skill loaded ok".
EOF
```

退出 hermes CLI（Ctrl+D 或 `/exit`），重開 `hermes`，輸入：

```
/skills
```

Expected: 清單裡看到 `test-hello`。

接著輸入：

```
/test-hello
```

Expected: hermes 回覆「skill loaded ok」或類似。

收尾：

```bash
rm -rf ~/.hermes/skills/productivity/test-hello
```

若重啟後 `/skills` 沒看到 `test-hello`：可能要 `pkill hermes` 或更積極的重啟方式；plan Step 4「重啟 hermes」字眼要改成實際確認可行的指令（記到 Dogfood Results）。

- [ ] **Step 4: 確認 `metadata.hermes.config` prompt 機制（加碼 D 依賴）**

建立有 config 的 test skill：

```bash
mkdir -p ~/.hermes/skills/productivity/test-config && cat > ~/.hermes/skills/productivity/test-config/SKILL.md <<'EOF'
---
name: test-config
description: Verify metadata.hermes.config prompt UX
version: 0.0.1
metadata:
  hermes:
    tags: [test, throwaway]
    category: productivity
    config:
      - key: test-config.greeting
        description: Greeting line to echo back
        default: ""
        prompt: 想用什麼問候語？（例：哈囉）
---

# Test Config

## When to Use
User runs /test-config

## Procedure
Echo the configured greeting from metadata.hermes.config.test-config.greeting.
EOF
```

重啟 hermes、跑 `/test-config`。

Expected (一種或多種視 hermes 版本而定):
- (a) hermes 在 CLI 直接跳出「想用什麼問候語？」prompt → 答完寫進 `~/.hermes/config.yaml`
- (b) hermes 跳訊息「請跑 `hermes config migrate` 設定」→ 跑 `hermes config migrate` → 互動式設好
- (c) 直接報錯 → 表示這條機制目前不可用

把實際看到的行為（a / b / c）寫到 Dogfood Results。若是 (a) → 加碼 D 直接照 spec 寫；若是 (b) → 加碼 D 要先教學員跑 `hermes config migrate`；若是 (c) → 加碼 D 整段要重新設計（fallback：把 location 寫死進 SKILL.md，移除 config 機制 demo）。

收尾：

```bash
rm -rf ~/.hermes/skills/productivity/test-config
# 若曾寫入 config.yaml，手動清除 skills.config.test-config 區塊
```

- [ ] **Step 5: 確認 wttr.in 可達（加碼 D 依賴）**

Run:

```bash
curl -sI 'https://wttr.in/Taipei?format=3' | head -1
```

Expected: `HTTP/2 200` 或 `HTTP/1.1 200 OK`。

接著看實際內容：

```bash
curl -s 'https://wttr.in/Taipei?format=3'
```

Expected: 一行類似 `Taipei: 🌧 +24°C`。

若 4xx / 5xx / 超時：加碼 D 教材保留但 Pitfalls 段要加更醒目的「wttr.in 偶爾掛、跳過天氣繼續訪談」說明，並在 Dogfood Results 記下「驗證時 wttr 不通」當已知問題。

- [ ] **Step 6: 把結果寫到 plan 末段**

打開本 plan 檔最末段「Dogfood Results」section，依下列範本填：

```markdown
## Dogfood Results (YYYY-MM-DD)

- hermes 版本：vX.Y.Z
- `/skills` 行為：✓ / ✗ + 備註
- skill 重啟識別：✓ / ✗ + 用了哪招重啟
- config prompt UX：a / b / c
- wttr.in：✓ / ✗
- 對 plan 的影響：列出任何要改的 task + step
```

---

### Task 1: 建立 `lesson-3.html` 骨架（7 個空 section）

**Files:**
- Create: `lesson-3.html`

**目的：** 建檔、設定 `<body data-*>` 參數、放 7 個 placeholder section 讓 wizard.js 跑得通。內容留空，後續 Task 2–8 填。

- [ ] **Step 1: 在 repo 根目錄建立 `lesson-3.html`**

完整內容如下（複製貼上即可）：

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hermes Lesson 3 · 日常使用</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body data-total-steps="6" data-storage-key="hermes-lesson3-step">
  <header class="container">
    <hgroup>
      <h1>Lesson 3 · hermes 日常使用</h1>
      <p>把 hermes 變成你每天會用的助手，45–55 分鐘</p>
    </hgroup>
    <nav id="progress" aria-label="進度">
      <span id="progress-text">前言</span>
    </nav>
  </header>

  <main class="container">
    <section class="step" data-step="0">
      <!-- Task 2 填 -->
    </section>

    <section class="step" data-step="1" hidden>
      <!-- Task 3 填 -->
    </section>

    <section class="step" data-step="2" hidden>
      <!-- Task 4 填 -->
    </section>

    <section class="step" data-step="3" hidden>
      <!-- Task 5 填 -->
    </section>

    <section class="step" data-step="4" hidden>
      <!-- Task 6 填 -->
    </section>

    <section class="step" data-step="5" hidden>
      <!-- Task 7 填 -->
    </section>

    <section class="step" data-step="6" hidden>
      <!-- Task 8 填 -->
    </section>

    <nav id="step-nav" class="container">
      <button id="prev-btn" type="button">← 上一步</button>
      <button id="next-btn" type="button" class="primary">下一步 →</button>
    </nav>
  </main>

  <footer class="container">
    <small>對應 hermes-agent <span id="version-tag">（待 smoke test 確認）</span> · <a href="https://github.com/Lewsiafat/hermes-windows-course">GitHub</a></small>
  </footer>

  <script src="wizard.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: 瀏覽器開 `lesson-3.html` 確認 wizard 不爆**

```bash
xdg-open lesson-3.html   # Linux
# 或手動瀏覽器拖檔
```

Expected:
- 標題「Lesson 3 · hermes 日常使用」顯示
- 進度文字「前言」顯示
- 「下一步 →」按一次 → URL 變 `#step-1` → 內容區空白但「Step 1 / 6」進度更新
- console 無錯誤（特別注意「`<body>` 缺 data-total-steps」之類的 fail-loud 訊息）

若 console 有 `data-total-steps must be a positive integer`：檢查 `<body>` 開頭那行是否照貼。

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): scaffold lesson-3.html with 7 empty step sections

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: lesson-3.html Step 0（前言）

**Files:**
- Modify: `lesson-3.html`（替換 `data-step="0"` section 內 `<!-- Task 2 填 -->` placeholder）

**目的：** 開場敘事——連接 Lesson 1+2 已完成的狀態、預告 Step 1–6 + 4 個 checkpoints、確認前提。

- [ ] **Step 1: 把 `data-step="0"` section 內的 placeholder 換成這段 HTML**

```html
    <section class="step" data-step="0">
      <header>
        <hgroup>
          <h2>前言 · 為什麼學「日常使用」</h2>
          <p>~2 分鐘</p>
        </hgroup>
      </header>

      <p>Lesson 1 你已經裝好 hermes、做過第一次對話。Lesson 2 你已經把它接到 Telegram，從手機就能聊。<strong>但你還沒真的「日常使用」它</strong>——這堂課要把它變成你每天會打開的工具。</p>

      <h3>今天會學什麼</h3>
      <ol>
        <li><strong>Step 1</strong>：context 管理 — 為什麼聊太久會變慢，怎麼救</li>
        <li><strong>Step 2</strong>：常用 <code>/</code> 指令（skills 相關）</li>
        <li><strong>Step 3</strong>：skills 是什麼 — hermes 的「自學能力」其實是這個</li>
        <li><strong>Step 4</strong>：寫你的第一個 skill — <code>daily-journal</code>（訪談式日記）</li>
        <li><strong>Step 5</strong>：★ 壓軸 — 從手機 Telegram 打 <code>/daily-journal</code>，bot 跟你訪談</li>
        <li><strong>Step 6</strong>：收尾 + 加碼（cron 排程、自動帶天氣）</li>
      </ol>

      <h3>4 個 checkpoints</h3>
      <ol>
        <li>會用 <code>/new</code> 切話題</li>
        <li><code>/skills</code> 看得到內建 skill 清單</li>
        <li>自己寫的 <code>daily-journal</code> 重啟後 <code>/skills</code> 列得出來</li>
        <li>從 Telegram 觸發完一次訪談、<code>~/journal/YYYY-MM-DD.md</code> 真的有檔案</li>
      </ol>

      <details>
        <summary>必備：先做完 Lesson 1 + Lesson 2</summary>
        <p>還沒做過？先回 <a href="index.html">Lesson 1（安裝 hermes）</a> 或 <a href="lesson-2.html">Lesson 2（接 Telegram）</a>。Lesson 3 假設你的 Telegram bot 仍在跑、`hermes gateway` 也仍在跑。</p>
        <p>不依賴 Lesson 4（LINE）— 想學 LINE 整合可平行另開 <a href="lesson-4.html">Lesson 4</a>，先後順序隨便。</p>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器重整 `lesson-3.html`、確認 Step 0 渲染**

預期：標題、副時長、3 個列表、`<details>` 收起來、所有連結（index.html / lesson-2.html / lesson-4.html）可點。

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): Step 0 (intro) — narrative + checkpoints + prerequisites

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: lesson-3.html Step 1（context 管理）

**Files:**
- Modify: `lesson-3.html`（`data-step="1"` section）

**目的：** 教 context window 概念 + `/new` 用法 + 「切話題就 /new」規則。實作是學員在已跑著的 Telegram bot 試一次 `/new`。

- [ ] **Step 1: 替換 `data-step="1"` 內容**

```html
    <section class="step" data-step="1" hidden>
      <header>
        <hgroup>
          <h2>Step 1 / 6 · context 管理：聊太久會變慢</h2>
          <p>~7 分鐘</p>
        </hgroup>
      </header>

      <h3>為什麼會變慢</h3>
      <p>跟 hermes 講話，它會把目前對話的<strong>所有訊息</strong>都送進 LLM。對話越長 → context 越大 → LLM 處理越慢、回答越貴、注意力越分散。這叫 <em>context window 飽和</em>。</p>

      <p>具體症狀：</p>
      <ul>
        <li>同一個 bot 越聊越慢回</li>
        <li>有時 bot 忘記你前面講過的事</li>
        <li>OpenRouter free 模型直接 rate limit 或丟錯</li>
      </ul>

      <h3>解法：切話題就 <code>/new</code></h3>
      <p>規則就一句：<strong>你要問的東西跟前面沒關係 → <code>/new</code></strong>。</p>

      <h3>實作：試一次 <code>/new</code></h3>
      <ol>
        <li>打開手機 Telegram，找你 Lesson 2 接好的 bot</li>
        <li>傳：<code>幫我算 12345 * 6789</code></li>
        <li>bot 回答後，傳 <code>/new</code></li>
        <li>看到 bot 回確認訊息（類似「✓ 開新對話」、「session reset」等字眼）</li>
        <li>傳 <code>what was my last question?</code> → bot 應該說「沒看到上一題」或類似（因為 context 已清）</li>
      </ol>

      <p>✓ 知道何時 <code>/new</code> + 確認 bot 清空 context → checkpoint 1 完成。</p>

      <details>
        <summary>還有 <code>/title</code> <code>/resume</code> <code>/sessions</code> 配合 <code>/new</code> 用</summary>
        <p>Lesson 2 Step 7 已有完整 cheatsheet。簡單講：</p>
        <ul>
          <li><code>/title 中翻英練習</code> — 在 <code>/new</code> 開新對話<strong>之前</strong>幫目前 session 取名，這樣之後可找回</li>
          <li><code>/sessions</code> — 列所有取過名的 session</li>
          <li><code>/resume 中翻英練習</code> — 跳回那個 session 繼續聊</li>
        </ul>
        <p>實務節奏：寫一個專案 → <code>/title 專案名</code> → 聊完 → <code>/new</code>。下次想接著做 → <code>/resume 專案名</code>。</p>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器確認渲染**

預期：標題、症狀列表、實作 5 步、checkpoint 標記、`<details>` 收起來。

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): Step 1 — context management with /new + session tools

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: lesson-3.html Step 2（常用 `/` 指令：skills 相關）

**Files:**
- Modify: `lesson-3.html`（`data-step="2"` section）

**目的：** 把 skills 相關的兩個 `/` 指令（`/skills`、`/<skill-name>`）介紹進來。其他常用指令 forward-link 回 Lesson 2 完整 cheatsheet 避免重複造輪。

- [ ] **Step 1: 替換 `data-step="2"` 內容**

```html
    <section class="step" data-step="2" hidden>
      <header>
        <hgroup>
          <h2>Step 2 / 6 · 常用 <code>/</code> 指令（skills 相關）</h2>
          <p>~5 分鐘</p>
        </hgroup>
      </header>

      <p>Lesson 2 Step 7 的 cheatsheet 已經涵蓋 <code>/new</code> <code>/model</code> <code>/help</code> 這些。Lesson 3 新增兩個 skills 專用指令：</p>

      <table>
        <thead><tr><th>指令</th><th>說明</th></tr></thead>
        <tbody>
          <tr><td><code>/skills</code></td><td>列出目前所有可用 skills（bundled 內建 + 你自己寫的）</td></tr>
          <tr><td><code>/&lt;skill-name&gt;</code></td><td>直接呼叫某個 skill。例如 <code>/plan</code> 呼叫內建的 plan skill；之後 Step 4 寫完 <code>daily-journal</code> 就能打 <code>/daily-journal</code></td></tr>
          <tr><td><code>/&lt;skill-name&gt; 額外參數</code></td><td>傳參數給 skill。例：<code>/plan 設計一個 cron 排程器</code> → 把後面字串當輸入</td></tr>
        </tbody>
      </table>

      <h3>實作：跑一次 <code>/skills</code></h3>
      <ol>
        <li>在你的 hermes CLI 或 Telegram bot 傳 <code>/skills</code></li>
        <li>看到清單（至少有 <code>plan</code>、<code>excalidraw</code> 之類 bundled skills；具體列哪些跟你的 hermes 版本有關）</li>
        <li>傳 <code>/plan 寫一份本週讀書計畫</code> → bot 套用 <code>plan</code> skill 的指令幫你寫出 markdown 計畫</li>
      </ol>

      <p>✓ 看到 <code>/skills</code> 列出清單 → checkpoint 2 完成。</p>

      <details>
        <summary>📚 為什麼 skill 自動變成 slash command</summary>
        <p>每個 skill 在 <code>~/.hermes/skills/&lt;category&gt;/&lt;name&gt;/SKILL.md</code> 的 frontmatter 都有 <code>name:</code> 欄位。hermes 啟動時掃描整個 skills 目錄、為每個 <code>name</code> 註冊一個對應的 slash command。所以你 Step 4 寫完 <code>name: daily-journal</code> 的 SKILL.md，重啟後就會自動有 <code>/daily-journal</code> 可用——CLI 跟 Telegram 都認得。</p>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器確認渲染**

預期：表格 3 列、3 步實作、`<details>` 收起來、forward-link 到 Lesson 2 字眼存在。

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): Step 2 — /skills and /<skill-name> commands

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: lesson-3.html Step 3（skills 是什麼）

**Files:**
- Modify: `lesson-3.html`（`data-step="3"` section）

**目的：** 講 skills 的概念（on-demand knowledge documents）、`~/.hermes/skills/` 目錄結構、為 Step 4 動手寫 SKILL.md 鋪墊。

- [ ] **Step 1: 替換 `data-step="3"` 內容**

```html
    <section class="step" data-step="3" hidden>
      <header>
        <hgroup>
          <h2>Step 3 / 6 · skills 是什麼</h2>
          <p>~5 分鐘</p>
        </hgroup>
      </header>

      <p>還記得 Lesson 1 Step 0 講的 hermes 賣點「<strong>會自我學習與成長</strong>……完成複雜任務後自動學會新的『技能』（Skills）」嗎？這就是 skills。</p>

      <h3>一句話定義</h3>
      <p>Skill = 一份 markdown 檔，告訴 hermes「<strong>什麼情境</strong>用我」「<strong>怎麼做</strong>」「<strong>失敗怎麼救</strong>」。檔名統一叫 <code>SKILL.md</code>。</p>

      <h3>它住在哪</h3>
      <pre><code>~/.hermes/skills/
├── productivity/              ← 類別目錄
│   ├── maps/                  ← 內建：地圖查詢
│   │   └── SKILL.md
│   ├── ocr-and-documents/     ← 內建：OCR
│   │   └── SKILL.md
│   └── daily-journal/         ← 你 Step 4 會建這個
│       └── SKILL.md
├── research/
│   └── arxiv/                 ← 內建：arxiv 搜尋
│       └── SKILL.md
├── creative/
│   └── p5js/                  ← 內建：p5.js 視覺化
│       └── SKILL.md
└── ...                        ← 還有十幾個類別
</code></pre>

      <p>每個 skill 一個資料夾，最少必須有 <code>SKILL.md</code>。可選擇性附帶 <code>scripts/</code>（python / shell）、<code>references/</code>（額外文件）、<code>templates/</code>（輸出範本）。Step 4 的 <code>daily-journal</code> 只要 <code>SKILL.md</code>，零 scripts。</p>

      <h3>為什麼這個設計很聰明</h3>
      <ul>
        <li><strong>純 markdown，零程式</strong>：寫 prompt 就行，不用學 Python 寫 plugin</li>
        <li><strong>自動變 slash command</strong>：<code>name:</code> 欄位是什麼，<code>/&lt;那個 name&gt;</code> 就能呼叫</li>
        <li><strong>所有 channel 共用</strong>：CLI 寫一次，Telegram 也有，Lesson 4 那邊接的 LINE 也有</li>
        <li><strong>progressive disclosure</strong>：不用全部內容塞 prompt，hermes 只在判斷需要時才載入</li>
      </ul>

      <details>
        <summary>🌐 還有 Skills Hub 可以「裝 skill」（暫不教）</summary>
        <p>上游有 <a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a> 這個社群 Hub。指令 <code>hermes skill install &lt;name&gt;</code> 可以拉現成的 skill 進來，跟 npm install 概念類似。本堂為了專注，先教自己寫——Hub 安裝留給之後玩。</p>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器確認渲染**

預期：4 個層級的目錄樹、4 個賣點 bullet、`<details>` 收起來。

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): Step 3 — skills concept + directory layout

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: lesson-3.html Step 4（寫第一個 skill：daily-journal）

**Files:**
- Modify: `lesson-3.html`（`data-step="4"` section）

**目的：** 學員照著建目錄、貼 SKILL.md、重啟 hermes 讓它載入。本 Step 是 Lesson 3 的核心 hands-on（~15 min）。

- [ ] **Step 1: 替換 `data-step="4"` 內容**

```html
    <section class="step" data-step="4" hidden>
      <header>
        <hgroup>
          <h2>Step 4 / 6 · 寫你的第一個 skill：<code>daily-journal</code></h2>
          <p>~15 分鐘</p>
        </hgroup>
      </header>

      <p>要寫的 skill：訪談式日記。學員打 <code>/daily-journal</code> → bot 一題一題問今日心得 → 答完整理成 markdown 存到 <code>~/journal/YYYY-MM-DD.md</code>。</p>

      <h3>1. 建立 skill 目錄</h3>
      <pre data-copy><code>mkdir -p ~/.hermes/skills/productivity/daily-journal</code></pre>

      <h3>2. 寫 SKILL.md</h3>
      <p>在你的 WSL Ubuntu 終端開 <code>nano</code>（或你慣用的編輯器）：</p>
      <pre data-copy><code>nano ~/.hermes/skills/productivity/daily-journal/SKILL.md</code></pre>

      <p>把下面整段貼進去：</p>

      <pre data-copy><code>---
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
</code></pre>

      <p>存檔離開（nano: <kbd>Ctrl</kbd>+<kbd>O</kbd> → <kbd>Enter</kbd> → <kbd>Ctrl</kbd>+<kbd>X</kbd>）。</p>

      <h3>3. 重啟 hermes 讓它載入</h3>
      <p>若你目前在 hermes CLI 裡，先離開（<code>/exit</code> 或 <kbd>Ctrl</kbd>+<kbd>D</kbd>）。然後重新進：</p>
      <pre data-copy><code>hermes</code></pre>

      <h3>4. 確認 skill 載入成功</h3>
      <p>進到 hermes 對話、輸入：</p>
      <pre data-copy><code>/skills</code></pre>

      <p>清單裡應該看到 <code>daily-journal</code>。看不到的話翻 Step 6「我卡住了」。</p>

      <p>✓ <code>/skills</code> 列出 <code>daily-journal</code> → checkpoint 3 完成。下 Step 從 Telegram 觸發看完整體驗。</p>

      <details>
        <summary>🤔 為什麼 <code>requires_toolsets: [terminal]</code>？</summary>
        <p>因為 skill 要 <code>mkdir -p ~/journal</code>、<code>date +%Y-%m-%d</code>、寫檔——這些都靠 <code>terminal</code> toolset。寫進 frontmatter 讓 hermes 自動處理依賴，沒這個 toolset 就會跳訊息提示。</p>
      </details>

      <details>
        <summary>🤔 為什麼放在 <code>productivity/</code> 目錄？</summary>
        <p>對齊 frontmatter 寫的 <code>category: productivity</code>。上游 bundled skill 也是這種對齊方式（<code>skills/productivity/maps/</code>、<code>skills/research/arxiv/</code> 等）。理論上目錄與 category 不一致也能跑，但對齊比較好維護。</p>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器確認渲染 + 確認 Copy 按鈕**

預期：
- 3 個指令區塊都有「Copy」按鈕（`<pre data-copy>` 屬性會被 wizard.js 自動注入）
- SKILL.md 內容區塊 markdown 可讀
- 兩個 `<details>` 收起來
- checkpoint 標記顯示

特別檢查：SKILL.md 範本內含 markdown code fence（```），HTML 渲染時 `<pre><code>` 內 ``` 字串應該原樣顯示（不被瀏覽器當作另一段 code fence 解析）。

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): Step 4 — daily-journal SKILL.md template + reload

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: lesson-3.html Step 5（★ 壓軸：從 Telegram 觸發）

**Files:**
- Modify: `lesson-3.html`（`data-step="5"` section）

**目的：** 把學員寫的 skill 從手機 Telegram 觸發，完成訪談、看 `~/journal/YYYY-MM-DD.md` 生成。本 Step 是 Lesson 3 整堂的 wow moment。

- [ ] **Step 1: 替換 `data-step="5"` 內容**

```html
    <section class="step" data-step="5" hidden>
      <header>
        <hgroup>
          <h2>Step 5 / 6 · ★ 壓軸：從 Telegram 跑 <code>/daily-journal</code></h2>
          <p>~8 分鐘</p>
        </hgroup>
      </header>

      <p>記得 Lesson 2 Step 5 你裝的 <code>hermes gateway</code> 嗎？它在背景持續跑，把 Telegram bot 的訊息轉給 hermes。你 Step 4 剛剛 <strong>重啟 CLI</strong> 載入新 skill，但 gateway 還在跑舊版的 skill 清單——所以要先重啟 gateway。</p>

      <h3>1. 重啟 gateway 讓它載入新 skill</h3>
      <pre data-copy><code>sudo $(which hermes) gateway restart --system</code></pre>

      <p>等 ~3 秒看到「gateway started」字眼即可。</p>

      <h3>2. 從手機 Telegram 跑訪談</h3>
      <ol>
        <li>打開手機 Telegram，找到你 Lesson 2 接好的 bot</li>
        <li>先傳一句 <code>/new</code>（避免之前對話的 context 干擾）</li>
        <li>傳：<code>/daily-journal</code></li>
        <li>bot 開始問第一題（「今天最有成就感的一件事是什麼？」）</li>
        <li>回答完 → bot 問第二題（「今天遇到最卡的事？」）</li>
        <li>繼續回答到第四題</li>
        <li>四題答完，bot 整理 markdown、寫檔、回覆「日記已存到 ~/journal/YYYY-MM-DD.md」之類</li>
      </ol>

      <h3>3. 在 WSL 終端確認檔案真的有寫</h3>
      <pre data-copy><code>cat ~/journal/$(date +%Y-%m-%d).md</code></pre>

      <p>預期看到四個 markdown section（成就 / 卡點 / 明日重點 / 一句話心情），每段都是你剛剛答的內容。</p>

      <p>✓ Telegram 端到端訪談完成 + 檔案存在 → checkpoint 4 完成。<strong>Lesson 3 全部 4 checkpoints 達標。</strong></p>

      <details>
        <summary>🚨 我卡住了</summary>
        <h4>Telegram 端打 <code>/daily-journal</code> bot 回「unknown command」</h4>
        <p>Gateway 沒重啟成功 / 沒拿到新 skill。處置：</p>
        <ol>
          <li><code>sudo $(which hermes) gateway status --system</code> 確認 gateway 在跑</li>
          <li>看 log：<code>tail -n 50 ~/.hermes/logs/gateway.log</code> 找有沒有 skill scan 錯誤</li>
          <li>再跑一次 <code>sudo $(which hermes) gateway restart --system</code></li>
        </ol>

        <h4>bot 收到 <code>/daily-journal</code> 但只回一段普通回應、沒進訪談</h4>
        <p>SKILL.md 的 Procedure 描述 hermes 沒抓到「一次一題」的意圖。處置：回 Step 4 確認你貼的 Procedure 是否有「<strong>一次只問一題</strong>」字眼。</p>

        <h4>四題答完 bot 沒寫檔</h4>
        <p>可能是 hermes 沒拿到 <code>terminal</code> toolset 權限。處置：</p>
        <ol>
          <li>確認 SKILL.md frontmatter 內有 <code>requires_toolsets: [terminal]</code></li>
          <li>跑 <code>hermes config show</code> 確認 terminal toolset 已啟用</li>
          <li>若仍無 → 從 CLI 直接跑 <code>/daily-journal</code> 看是否同樣不寫檔；若 CLI 跑得通但 Telegram 不行 → gateway 端的 toolset 設定問題</li>
        </ol>
      </details>
    </section>
```

- [ ] **Step 2: 瀏覽器確認渲染**

預期：
- 3 個指令區塊都有 Copy 按鈕
- 訪談步驟 7 個 ordered list 完整
- 「🚨 我卡住了」`<details>` 三個子標題收起來

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): Step 5 — Telegram /daily-journal end-to-end + stuck

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: lesson-3.html Step 6（完成 + 加碼 A/B/C/D）

**Files:**
- Modify: `lesson-3.html`（`data-step="6"` section）

**目的：** 4 checkpoints 收尾 + 4 個加碼 `<details>`（cron / background / 改寫題目 / 天氣）+ 下次預告。

- [ ] **Step 1: 替換 `data-step="6"` 內容**

```html
    <section class="step" data-step="6" hidden>
      <header>
        <hgroup>
          <h2>Step 6 / 6 · 完成 + 加碼</h2>
          <p>~3 分鐘</p>
        </hgroup>
      </header>

      <p>恭喜，4 個 checkpoints 都完成：</p>
      <ol>
        <li>✓ 會用 <code>/new</code> 切話題</li>
        <li>✓ <code>/skills</code> 看得到清單</li>
        <li>✓ 自己寫的 <code>daily-journal</code> 重啟後 <code>/skills</code> 列得出來</li>
        <li>✓ 從 Telegram 觸發完一次訪談 + 檔案有存</li>
      </ol>

      <h3>建議下一步</h3>
      <ul>
        <li>把這個頁面加書籤，未來想複習可隨時回來</li>
        <li>連續寫七天日記，看看自己一週的「成就」「卡點」pattern</li>
        <li>從加碼 D 開始玩，把天氣自動帶進日記，每天一打開就看到「Taipei: 🌧 +24°C」</li>
      </ul>

      <details>
        <summary>加碼 A · 用 cron 每天 22:00 自動 ping 你寫日記</summary>
        <p>hermes 內建 cron 子系統（不用裝任何東西），開機就跑。設定一條排程，每天 22:00 從 Telegram 自動傳「該寫日記了」給你、然後直接觸發 <code>/daily-journal</code>。</p>

        <p>建檔：</p>
        <pre data-copy><code>nano ~/.hermes/cron.yaml</code></pre>

        <p>內容：</p>
        <pre data-copy><code>jobs:
  - name: daily-journal-reminder
    cron: "0 22 * * *"
    channel: telegram
    message: |
      該寫日記了 📝
      /daily-journal</code></pre>

        <p>存檔後 <code>sudo $(which hermes) gateway restart --system</code> 重啟。明天 22:00 你的 Telegram bot 就會主動傳訊息來。</p>
      </details>

      <details>
        <summary>加碼 B · 讓 hermes 在背景持續跑（不用每次開 CLI）</summary>
        <p>Lesson 2 教的 <code>hermes gateway</code> 已經在背景跑了，這就是 background session 的一種。延伸玩法：</p>
        <ul>
          <li><code>sudo $(which hermes) gateway status --system</code> — 看狀態</li>
          <li><code>sudo $(which hermes) gateway logs --system --follow</code> — 即時看 log</li>
          <li>關掉 SSH session、關掉電腦 → gateway 仍在跑（因為 systemd 接管，這是 Lesson 2 Step 5 設好的）</li>
        </ul>
        <p>所以你的 Telegram bot + 所有 skill 都是 24/7 可用，hermes 已經是個「在背景的個人助理」。</p>
      </details>

      <details>
        <summary>加碼 C · 改寫日記題目讓它更貼你</summary>
        <p>SKILL.md 的 Procedure 段就是純 markdown，怎麼寫怎麼跑。常見改法：</p>
        <ul>
          <li><strong>加 mood 評分</strong>：問完四題加一題「今天心情 1–10 分？」，bot 把分數寫進日記檔開頭 <code>## 心情指數</code></li>
          <li><strong>改題目</strong>：把預設四題換成你自己的問題（學到的事 / 感謝的人 / 想道歉的事 / 明天 top 3）</li>
          <li><strong>每週彙總</strong>：加一個 <code>/weekly-review</code> skill，週日跑時 cat 本週七檔日記、整理成 weekly summary</li>
        </ul>
        <p>改完存檔、<code>sudo $(which hermes) gateway restart --system</code>，從 Telegram 就能看到新題目。</p>
      </details>

      <details>
        <summary>加碼 D · 帶入今日天氣（demo skill config 機制）</summary>
        <p>讓 <code>daily-journal</code> 每天日記開頭自動帶當地天氣，第一次跑會問你住哪、之後永不再問。</p>

        <h4>1. 編輯 SKILL.md frontmatter</h4>
        <p>把 <code>metadata.hermes</code> 區塊整個換成：</p>
        <pre data-copy><code>metadata:
  hermes:
    tags: [journal, daily, interview, personal, weather]
    category: productivity
    requires_toolsets: [terminal]
    config:
      - key: daily-journal.location
        description: 你住的城市（查天氣用）
        default: ""
        prompt: 你住哪個城市？（例：Taipei / Hsinchu / Tokyo）</code></pre>

        <h4>2. 在 Procedure 第 1 題之前加一段</h4>
        <p>在「**一次只問一題**」那行之前插入：</p>
        <pre data-copy><code>四題之前先 `curl -s wttr.in/{location}?format=3` 取今日天氣（`{location}` 由 hermes 從 config 注入），
把輸出放進日記檔開頭 `## 天氣` 區塊。若 curl 失敗（無網路 / wttr 掛了），跳過天氣繼續訪談。</code></pre>

        <h4>3. 重啟 + 第一次跑會問你住哪</h4>
        <pre data-copy><code>sudo $(which hermes) gateway restart --system</code></pre>
        <p>從 CLI 或 Telegram 跑一次 <code>/daily-journal</code>。第一次會跳「你住哪個城市？」prompt，輸入後存進 <code>~/.hermes/config.yaml</code>。<strong>之後永不再問</strong>。</p>

        <h4>4. 之後的日記檔長這樣</h4>
        <pre><code># 2026-05-13

## 天氣
Taipei: 🌧 +24°C

## 成就
...</code></pre>

        <details>
          <summary>🚨 第一次跑沒跳 location prompt</summary>
          <p>某些 hermes 版本 messaging 介面不會主動 prompt secrets/config。處置：在 CLI（不是 Telegram）跑 <code>/daily-journal</code>，prompt 應該會跳在 CLI 端。或手動跑 <code>hermes config migrate</code> 互動式設定。</p>
        </details>
      </details>

      <h3>下次預告</h3>
      <p>下次（Lesson 5 暫定 / 未排）可能會涵蓋：</p>
      <ul>
        <li>分享你的 skill 上 <a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a></li>
        <li>進階：用 <code>scripts/</code> 在 skill 裡放 Python helper</li>
        <li>或你想學什麼下次告訴我</li>
      </ul>

      <p><em>到這邊就是 Lesson 3 全部內容。下次見。</em></p>
    </section>
```

- [ ] **Step 2: 瀏覽器確認渲染**

預期：
- 4 個 ✓ checkmark 列表
- 4 個加碼 `<details>` 全部收起來
- 加碼 D 內巢狀的「🚨 第一次跑沒跳 location prompt」`<details>` 也存在
- 所有 `<pre data-copy>` 區塊都有 Copy 按鈕（含加碼 D 的 4 個）

- [ ] **Step 3: Commit**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): Step 6 — completion + bonus A/B/C/D

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: `lesson-2.html` Step 7「下次預告」啟用 Lesson 3 連結

**Files:**
- Modify: `lesson-2.html:461`

**目的：** 把現有「下次預告：Lesson 3 · hermes 日常使用入門……」字眼包進 `<a href="lesson-3.html">`，讓學員真的點得進去。

- [ ] **Step 1: 找到 461 行附近**

Run:

```bash
grep -n "Lesson 3 · hermes 日常使用入門" lesson-2.html
```

Expected: 列出第 461 行的字串。

- [ ] **Step 2: 改 461 行內容**

把：

```html
        <li><strong>Lesson 3 · hermes 日常使用入門</strong>：context 管理、skills、cron、background sessions 完整介紹</li>
```

改成：

```html
        <li><a href="lesson-3.html"><strong>Lesson 3 · hermes 日常使用入門</strong></a>：context 管理、skills（寫一個訪談式日記 skill）、cron 與 background sessions 加碼</li>
```

差異說明：
- 加 `<a href="lesson-3.html">` 包住標題
- 描述微調對齊 Lesson 3 實際內容（spec §6）

- [ ] **Step 3: 瀏覽器開 `lesson-2.html`、走到 Step 7 確認連結可點**

預期：「Lesson 3 · hermes 日常使用入門」變藍色（或 Pico 主題對應的連結色）、可點、點下去跳到 `lesson-3.html`。

- [ ] **Step 4: Commit**

```bash
git add lesson-2.html
git commit -m "$(cat <<'EOF'
feat(lesson-2): activate forward link to lesson-3.html

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: `CLAUDE.md` §跨步驟引用 加入 Lesson 3 條目

**Files:**
- Modify: `CLAUDE.md`（§跨步驟引用 區塊）

**目的：** 把新建立的 cross-ref（Lesson 2 → Lesson 3、Lesson 3 → Lesson 1/2）寫進 CLAUDE.md「不可任意刪除」清單，避免未來改寫時被砍掉。

- [ ] **Step 1: 找到要改的標題**

Run:

```bash
grep -n "^### Lesson 之間" CLAUDE.md
```

Expected: 列出該區塊的標題行（目前是「Lesson 之間（index.html ↔ lesson-2.html / lesson-4.html）」，已含上一次加的加碼 A → Lesson 4 條目）。

- [ ] **Step 2: 改標題 + 加新條目**

把標題：

```
### Lesson 之間（index.html ↔ lesson-2.html / lesson-4.html）
```

改成：

```
### Lesson 之間（index.html ↔ lesson-2.html / lesson-3.html / lesson-4.html）
```

然後在「**Lesson 1 `index.html` Step 9 加碼 B 末段** → 連到 `lesson-2.html`」條目<strong>之後</strong>，插入兩條新規則：

```markdown
- **Lesson 2 `lesson-2.html` Step 7「下次預告」第一條** → 連到 `lesson-3.html`。改寫 Step 7 預告區時必須保留這個出口（與 Lesson 1 加碼 B → Lesson 2 對稱）。
- **Lesson 3 `lesson-3.html` Step 0 「必備」`<details>`** → fallback 連到 `index.html` + `lesson-2.html`。改 Step 0 文案時保留這兩個 fallback 連結，因為 Lesson 3 假設 Lesson 1+2 已完成。
```

- [ ] **Step 3: 確認改完內容**

Run:

```bash
grep -A 2 "Lesson 2 .lesson-2.html. Step 7" CLAUDE.md
grep -A 2 "Lesson 3 .lesson-3.html. Step 0" CLAUDE.md
```

Expected: 兩條 grep 都找到新加的條目。

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(claude): add lesson-3 cross-ref rules

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: `README.md` 結構區補列 `lesson-3.html`

**Files:**
- Modify: `README.md`（結構區）

**目的：** README 結構圖內加入 `lesson-3.html` 條目，跟 `lesson-2.html`、`lesson-4.html` 並列。

- [ ] **Step 1: 找到結構區**

Run:

```bash
grep -n "lesson-2.html\|lesson-4.html" README.md | head -5
```

Expected: 列出 `lesson-2.html`、`lesson-4.html` 在 README 結構區的位置。

- [ ] **Step 2: 在 `lesson-2.html` 條目之後（`lesson-4.html` 之前）插入新條目**

仿照 Lesson 2 / Lesson 4 的格式插入：

```markdown
- `lesson-3.html` — Lesson 3 精靈：hermes 日常使用（context 管理 + skills + 寫一個 daily-journal skill）
```

具體插入位置依現有 README 排版判斷（若是 list 排在 `lesson-2.html` 下、`lesson-4.html` 上）。

- [ ] **Step 3: 確認**

Run:

```bash
grep -n "lesson-3.html" README.md
```

Expected: 有一行命中。

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs(readme): list lesson-3.html in structure section

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: `pre-class-checklist.md` 加「Lesson 3 必檢項」section

**Files:**
- Modify: `pre-class-checklist.md`（新增 Lesson 3 區塊）

**目的：** 教學前的 smoke test 條目，對齊 Lesson 3 教材實際要跑的依賴。

- [ ] **Step 1: 開檔、找到 Lesson 2 「必檢項」section**

Run:

```bash
grep -n "^## Lesson" pre-class-checklist.md
```

Expected: 列出 Lesson 1 / 2 / 4 各個 section 標題的行號。

- [ ] **Step 2: 在 Lesson 2 之後、Lesson 4 之前插入 Lesson 3 section**

具體位置：找到 Lesson 2 區塊結束處（下個 `^## Lesson 4` 之前），插入：

```markdown
## Lesson 3 必檢項（日常使用）

### 1. hermes CLI 仍可啟動

```bash
hermes --version
```

預期：印出版本字串。若 command not found：Lesson 1 安裝環節需先修。

### 2. `/skills` 指令仍有效

進 `hermes` CLI、傳 `/skills`。預期看到 bundled skill 清單（至少有 `/plan`）。

若 Unknown command：hermes 版本可能改了指令命名。對照 Task 0 結果，更新 lesson-3.html Step 2 / Step 3 / Step 4 內所有 `/skills` 字串。

### 3. 自寫 skill 重啟後可被 `/skills` 列出

建臨時 skill：

```bash
mkdir -p ~/.hermes/skills/productivity/smoke-test && cat > ~/.hermes/skills/productivity/smoke-test/SKILL.md <<'EOF'
---
name: smoke-test
description: Throwaway
version: 0.0.1
metadata:
  hermes:
    tags: [test]
    category: productivity
---
# Smoke Test
## When to Use
User runs /smoke-test
## Procedure
Reply "ok".
EOF
```

退出重進 hermes、跑 `/skills`。預期清單出現 `smoke-test`。

收尾：`rm -rf ~/.hermes/skills/productivity/smoke-test`

若沒出現：跑 `sudo $(which hermes) gateway restart --system` 再試；仍無 → lesson-3.html Step 4 Step 3「重啟 hermes」字眼要改更積極的指令。

### 4. wttr.in 可達（加碼 D）

```bash
curl -sI 'https://wttr.in/Taipei?format=3' | head -1
```

預期：`HTTP/2 200` 或 `HTTP/1.1 200 OK`。

若 4xx/5xx：lesson-3.html Step 6 加碼 D 仍可教，但提醒學員若 curl 失敗就跳過天氣。
```

- [ ] **Step 3: 確認**

Run:

```bash
grep -A 2 "^## Lesson 3 必檢項" pre-class-checklist.md
```

Expected: 找到新加的 section 標題與內容開頭。

- [ ] **Step 4: Commit**

```bash
git add pre-class-checklist.md
git commit -m "$(cat <<'EOF'
docs(checklist): add Lesson 3 (daily use) smoke test items

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: `ai-runbook.md` 加 Lesson 3 Stage 25–31 + Check 13–15

**Files:**
- Modify: `ai-runbook.md`

**目的：** AI 工具版（Computer Use / Skyvern 等）跑教材時的螢幕控制 runbook，對應 Lesson 3 各步驟。Stage 編號接續 Lesson 4 的 24，所以從 25 開始。

- [ ] **Step 1: 找到 Lesson 4 Stage 24 結尾、Check 12 結尾的位置**

Run:

```bash
grep -n "^## Stage \|^## Check " ai-runbook.md | tail -10
```

Expected: 找到 Lesson 4 最後一個 Stage（24）+ 最後一個 Check（12）的行號。

- [ ] **Step 2: 在 Stage 24 之後插入 Stage 25–31**

具體位置：找到「## Stage 25」應該出現的位置（Lesson 4 Stage 24 之後、第一個「## Check」之前），插入：

````markdown
## Lesson 3 · Stage 25–31（日常使用）

接續 Lesson 4 的 Stage 24。本批 stage 假設學員已完成 Lesson 1+2，hermes 已裝、Telegram bot 已接。

## Stage 25 · 開啟 lesson-3.html、走 Step 0–1

1. 在已開的瀏覽器 tab 開 `https://lewsiafat.github.io/hermes-windows-course/lesson-3.html`
2. 確認進度顯示「前言」、標題「Lesson 3 · hermes 日常使用」
3. 讀完 Step 0 4 個 checkpoints、點「下一步 →」進 Step 1
4. Step 1 「實作：試一次 `/new`」步驟在 Telegram bot 跑：先傳算術題、再傳 `/new`、確認 context 清空

預期：bot 回 `/new` 後再問 "what was my last question" 回答無法回憶。

## Stage 26 · 進 Step 2 試 /skills

1. 點「下一步 →」進 Step 2
2. 在 hermes CLI（或 Telegram bot）傳 `/skills`，記下清單長相
3. 傳 `/plan 寫一份本週讀書計畫`，確認 plan skill 生成 markdown

預期：`/skills` 至少列 5 個以上 bundled skills；`/plan` 產出結構化計畫。

## Stage 27 · 進 Step 3、讀 skills 概念

1. 點「下一步 →」進 Step 3
2. 讀完目錄結構樹
3. 跑 `ls ~/.hermes/skills/` 對照課程裡的目錄樹

預期：實際目錄至少包含 productivity/, research/ 等 category 子目錄。

## Stage 28 · 進 Step 4 寫 daily-journal SKILL.md

1. 點「下一步 →」進 Step 4
2. 用 Copy 按鈕複製第一塊 `mkdir -p` 指令、貼到 WSL terminal 跑
3. Copy `nano` 指令、貼到 terminal 跑
4. Copy SKILL.md 整段、貼進 nano、存檔
5. Copy `hermes` 指令、退出 CLI 再重進
6. Copy `/skills` 指令、貼到 hermes 對話、確認列表出現 `daily-journal`

預期：`/skills` 輸出含 `daily-journal`。

## Stage 29 · 進 Step 5 從 Telegram 端到端訪談

1. 點「下一步 →」進 Step 5
2. Copy `sudo $(which hermes) gateway restart --system`、跑、等 gateway restart
3. 手機 Telegram bot 傳 `/new` 再傳 `/daily-journal`
4. 依序回答四題（隨意填，每題答案 5–10 字即可）
5. bot 回覆寫檔確認
6. 在 WSL terminal 跑 `cat ~/journal/$(date +%Y-%m-%d).md`

預期：檔案存在、四個 markdown section 都有內容。

## Stage 30 · 進 Step 6 完成 + 加碼預告

1. 點「下一步 →」進 Step 6
2. 確認 4 個 ✓ checkmark 都顯示
3. 點開加碼 A/B/C/D 四個 `<details>`，每個收起再展開一次
4. 加碼 D 內巢狀的「🚨 第一次跑沒跳 location prompt」`<details>` 也展開確認

預期：所有 `<details>` 可開可收。

## Stage 31 · 加碼 D 完整跑通（選做）

1. 照加碼 D 的 4 步改 SKILL.md frontmatter、Procedure
2. `sudo $(which hermes) gateway restart --system`
3. CLI 或 Telegram 跑 `/daily-journal`，第一次應該跳 location prompt（如 Dogfood Step 4 結果是 a）
4. 答完輸入「Taipei」
5. 再跑一次，確認不再問
6. 看 `~/journal/$(date +%Y-%m-%d).md` 開頭應該有「## 天氣」區塊含 wttr.in 輸出

預期：第二次跑不再問 location；日記檔含天氣行。

若 Dogfood Step 4 結果是 b（要 `hermes config migrate`）：先手動跑 migrate、再進 Stage 31 Step 3。
若是 c（config 機制不可用）：跳過 Stage 31。
````

- [ ] **Step 3: 在 Check 12 之後插入 Check 13–15**

具體位置：找到 Lesson 4 最後一個 Check（12）的結尾，插入：

````markdown
## Check 13 · hermes CLI / `/skills` 仍可用

```bash
hermes --version
```

預期：印出版本字串。

```bash
echo "/skills" | hermes chat
```

預期：印出 bundled skill 清單。

## Check 14 · 自寫 skill 重啟識別仍 work

```bash
mkdir -p ~/.hermes/skills/productivity/check-skill && cat > ~/.hermes/skills/productivity/check-skill/SKILL.md <<'EOF'
---
name: check-skill
description: Smoke check
version: 0.0.1
metadata:
  hermes:
    tags: [test]
    category: productivity
---
# Check
## When to Use
User runs /check-skill
## Procedure
Reply "ok".
EOF
hermes chat -q "/skills" | grep -q check-skill
echo "result: $?"   # 0 = found
rm -rf ~/.hermes/skills/productivity/check-skill
```

預期：`result: 0`。

## Check 15 · wttr.in 可達

```bash
curl -sI 'https://wttr.in/Taipei?format=3' | head -1
```

預期：`HTTP/2 200` 或 `HTTP/1.1 200 OK`。
````

- [ ] **Step 4: 確認**

Run:

```bash
grep -n "^## Stage 25\|^## Stage 31\|^## Check 13\|^## Check 15" ai-runbook.md
```

Expected: 4 條 grep 都各命中一行。

- [ ] **Step 5: Commit**

```bash
git add ai-runbook.md
git commit -m "$(cat <<'EOF'
docs(runbook): add Lesson 3 stages 25-31 + smoke checks 13-15

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: 整合 smoke test（user-run, 不 commit）

**目的：** 把整堂 Lesson 3 從 Step 0 到 Step 6 + 加碼 D 完整跑一遍，當作 Definition of Done 的最後一道閘門。

**Files:** 無修改。本任務只是執行 + 觀察。

- [ ] **Step 1: 把當前 branch 推到遠端、用 GitHub Pages preview 跑**

```bash
git push -u origin feat/lesson-3-daily-use
```

開瀏覽器 `https://github.com/Lewsiafat/hermes-windows-course/pull/new/feat/lesson-3-daily-use` 建立 draft PR（暫時不 merge）。GitHub Pages 仍從 main 跑，所以這一步只是把 branch 推上去方便 review。

或者就在本機跑：`xdg-open lesson-3.html`。

- [ ] **Step 2: 從 Step 0 一路走到 Step 6**

依 lesson-3.html 內容操作：
- Step 0：讀內容、確認 4 個 checkpoints 看得到
- Step 1：在 Telegram bot 試 `/new`、確認 context 清空
- Step 2：跑 `/skills` 看清單、跑 `/plan` 看 plan skill 動作
- Step 3：在 WSL `ls ~/.hermes/skills/` 對照課程目錄樹
- Step 4：複製 mkdir + nano + SKILL.md、重啟 hermes、`/skills` 確認 `daily-journal` 出現
- Step 5：重啟 gateway、Telegram 跑 `/daily-journal` 完整訪談、`cat ~/journal/$(date +%Y-%m-%d).md` 確認檔案

- [ ] **Step 3: 跑加碼 D**

- 照 Step 6 加碼 D 的 4 步改 SKILL.md
- 重啟 gateway
- 跑 `/daily-journal` → 看是否跳 location prompt（依 Task 0 Step 4 dogfood 結果）
- 答完城市、再跑一次確認不再問
- 看日記檔開頭是否有 `## 天氣` 區塊

- [ ] **Step 4: 收尾清理**

把 smoke test 過程中產生的測試檔清掉：

```bash
rm -rf ~/.hermes/skills/productivity/daily-journal   # 若要保留就跳過
rm -rf ~/journal/$(date +%Y-%m-%d).md                 # 若要保留就跳過
# config.yaml 內的 daily-journal.location 區段視情況留或刪
```

- [ ] **Step 5: 把結果寫到 plan 末段「Integration Smoke Results」section**

依下列範本：

```markdown
## Integration Smoke Results (YYYY-MM-DD)

- Step 0–6 一路走通：✓ / ✗
- 加碼 D 完整跑通：✓ / ✗
- 任何卡點：（列出）
- README 「上次驗證」更新需求：（hermes 版本字串、Telegram 行為、wttr.in 狀態）
```

- [ ] **Step 6: 更新 README 「上次驗證」區塊**

把 hermes 版本、上次驗證日期更新。

```bash
grep -n "上次驗證" README.md
```

依現有格式更新對應條目。

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs(readme): update last verified date after lesson-3 smoke

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: 合併 feature branch 到 main + push

**Files:** 無變更。本任務只 git 操作。

**目的：** 確認所有 task commit 完成、push 後 GitHub Pages 自動部署，使用者可從 `https://lewsiafat.github.io/hermes-windows-course/lesson-3.html` 看到。

- [ ] **Step 1: 確認 branch 內所有 commit**

Run:

```bash
git log --oneline main..feat/lesson-3-daily-use
```

預期：看到約 9–12 個 commit（Task 1–8 各一個 lesson-3.html commit + Task 9–14 各一個 cross-ref / smoke 相關 commit）。

- [ ] **Step 2: 切到 main、merge**

```bash
git checkout main && git pull
git merge --no-ff feat/lesson-3-daily-use -m "$(cat <<'EOF'
Merge feat/lesson-3-daily-use: Lesson 3 daily use integration

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: merge commit 成功、`git status` 乾淨、`git log --oneline -1` 顯示 merge commit。

- [ ] **Step 3: Push main 到遠端**

```bash
git push origin main
```

Expected: push 成功。GitHub Pages 10–30s 內自動發佈。

- [ ] **Step 4: 在線上確認**

開 `https://lewsiafat.github.io/hermes-windows-course/lesson-3.html`，跑一遍 Step 0 → Step 6（這次純線上 sanity check，不需要再跑指令）。

預期：所有內容正常、所有 `<details>` 可開、所有 Copy 按鈕可點、Step 進度條走得對。

- [ ] **Step 5: 砍 feature branch**

```bash
git branch -d feat/lesson-3-daily-use
git push origin --delete feat/lesson-3-daily-use
```

---

## Dogfood Results (YYYY-MM-DD)

> Task 0 結果填這裡。範本：

- hermes 版本：
- `/skills` 行為：
- skill 重啟識別：
- config prompt UX：
- wttr.in：
- 對 plan 的影響：

---

## Integration Smoke Results (YYYY-MM-DD)

> Task 14 結果填這裡。範本：

- Step 0–6 一路走通：
- 加碼 D 完整跑通：
- 任何卡點：
- README 「上次驗證」更新需求：

---

## Self-Review 紀錄（plan 作者 own check）

### Spec coverage

- §1 4 個 checkpoints → Step 0/1/2/4/5 都點到（Task 2/3/4/6/7）✓
- §3 7 步切分 → Task 2–8 一對一 ✓
- §4 SKILL.md 完整範本 → Task 6 內含 ✓
- §5 加碼 A/B/C/D → Task 8 內含 4 個 `<details>` ✓
- §6 lesson-2:461 啟用 → Task 9 ✓
- §6 CLAUDE.md cross-ref → Task 10 ✓
- §6 README → Task 11 ✓
- §7 wizard 規格 → Task 1 內 `<body data-*>` ✓
- §8 風險清單 → Task 0 Step 1–5 對應驗證 ✓
- §9 Definition of Done → 11 條都對到 task（pre-class-checklist 由 Task 12、ai-runbook 由 Task 13、smoke 由 Task 14、README 上次驗證由 Task 14 Step 6）✓

### Placeholder scan

- Task 11「具體插入位置依現有 README 排版判斷」— 不算 placeholder，因為 README 結構在閱讀者眼前，判斷顯而易見
- Dogfood Results / Integration Smoke Results 兩節 — 範本，由執行階段填，符合「執行階段才能知道的真實值」原則

### Type consistency

- `daily-journal` skill name 跨 Task 4/6/7/8/12/13/14 一致 ✓
- 路徑 `~/.hermes/skills/productivity/daily-journal/` 跨所有 task 一致 ✓
- data-storage-key `hermes-lesson3-step` 在 Task 1 + spec §7 一致 ✓
- data-total-steps `6` 在 Task 1 + Step 1–6 標題 `Step N / 6` 一致 ✓
