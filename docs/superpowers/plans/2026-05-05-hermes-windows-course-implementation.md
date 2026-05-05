# Hermes Windows Course — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static 9-step wizard teaching site at `https://lewsiafat.github.io/hermes-windows-course/` that walks Windows-comfortable students through installing hermes-agent in WSL2 in 60 minutes.

**Architecture:** Single-page wizard. All 9 step contents live as `<section>` elements in one `index.html`. JS toggles visibility based on URL hash; localStorage remembers last-visited step. No framework, no build step. Pico.css via CDN for typography baseline.

**Tech Stack:** Vanilla HTML5 + CSS3 + ES2020 JS, Pico.css 2.x via CDN, GitHub Pages for hosting, `gh` CLI for deployment.

**Spec:** `docs/superpowers/specs/2026-05-05-hermes-windows-course-design.md`

---

## File Structure

```
hermes-windows-course/
├── index.html                  # Single-page wizard (9 sections)
├── style.css                   # Custom CSS + Pico variable overrides
├── wizard.js                   # ~60 lines: hash routing, prev/next, copy, localStorage
├── pre-class-checklist.md      # Instructor smoke-test doc (10-15 min)
├── README.md                   # How to update + deploy + last-verified record
└── assets/
    └── screenshots/            # ~20 PNG files captured during smoke test (deferred)
```

**Boundaries:**
- `index.html` owns content and structure (zh_TW prose lives here, never in JS strings)
- `style.css` owns presentation only
- `wizard.js` owns navigation behavior only — no content strings, no API calls
- Screenshots are deferred assets — site renders fine with broken `<img>` boxes during dev

---

## Tasks

### Task 1: Project README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# Hermes Windows Course

教 Windows 使用者在 60 分鐘內裝好 [hermes-agent](https://github.com/NousResearch/hermes-agent) 並完成第一次對話。配套教學頁部署於 GitHub Pages。

🔗 **教學頁**：https://lewsiafat.github.io/hermes-windows-course/

## 結構

- `index.html` — 9 步教學精靈
- `style.css` / `wizard.js` — 樣式與導覽邏輯
- `assets/screenshots/` — 各步截圖（每次驗證後可能更新）
- `pre-class-checklist.md` — **每次教學前必跑**的 smoke test 流程
- `docs/superpowers/specs/` — 課程設計文件
- `docs/superpowers/plans/` — 實作計畫

## 上次驗證

- 日期：（待 smoke test 後填入）
- hermes 版本：（待填）
- Windows 版本：（待填）

## 更新內容

直接編輯 `index.html` 對應 `<section data-step="N">`。零 build step。  
本地預覽：直接雙擊 `index.html`。

## 部署

```bash
git push    # GitHub Pages 自動發佈，10-30 秒生效
```

## License

MIT
```

- [ ] **Step 2: Verify**

```bash
cat README.md | head -5
```

Expected: file shows the title and intro paragraph.

- [ ] **Step 3: Commit**

```bash
cd /home/lewsi/Documents/workspaceAgent/hermes-windows-course
git add README.md
git commit -m "docs: project README with structure and deploy notes"
```

---

### Task 2: HTML Skeleton + Pico CDN

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write index.html skeleton**

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hermes Windows 安裝課程</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="container">
    <hgroup>
      <h1>Hermes 安裝課程</h1>
      <p>60 分鐘從零裝好你的第一個 AI agent</p>
    </hgroup>
    <nav id="progress" aria-label="進度">
      <span id="progress-text">Step 1 / 9</span>
    </nav>
  </header>

  <main class="container">
    <!-- 9 step sections will go here -->
  </main>

  <footer class="container">
    <small>對應 hermes-agent <span id="version-tag">（待 smoke test 確認）</span> · <a href="https://github.com/Lewsiafat/hermes-windows-course">GitHub</a></small>
  </footer>

  <script src="wizard.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Verify HTML loads**

Open `index.html` in browser. Expected: header text visible, no JS errors in console (wizard.js missing 404 is OK at this stage if not yet created).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: HTML skeleton with Pico CDN and header/footer"
```

---

### Task 3: Step 1 — Welcome

**Files:**
- Modify: `index.html` (insert into `<main>`)

- [ ] **Step 1: Insert Step 1 section**

Add inside `<main class="container">`:

```html
<section class="step" data-step="1">
  <header>
    <hgroup>
      <h2>Step 1 / 9 · 開始之前</h2>
      <p>大約 60 分鐘，零預備</p>
    </hgroup>
  </header>

  <p>這份教材會帶你從零安裝好 <strong>hermes-agent</strong>——一個可以在你筆電裡跟你聊天、執行任務、甚至自己學東西的 AI agent。Hermes 不支援原生 Windows，所以我們會先在 Windows 裡裝一個 Linux 子系統 (WSL2)，再把 hermes 裝進那個 Linux 裡。</p>

  <h3>今天要走完 4 個 checkpoints</h3>
  <ol>
    <li>☐ 安裝 WSL2 + Ubuntu</li>
    <li>☐ 申請 OpenRouter（免費 LLM API 入口，不需要刷卡）</li>
    <li>☐ 安裝 hermes-agent</li>
    <li>☐ 完成第一次對話</li>
  </ol>

  <h3>準備物</h3>
  <ul>
    <li>Windows 10（1903 以上）或 Windows 11</li>
    <li>有管理員權限的帳號</li>
    <li>能收得到 email</li>
    <li>連續 60 分鐘不被打斷</li>
  </ul>

  <h3>加碼預告（時間夠才會講）</h3>
  <p>如果安裝順利、有時間剩，會帶你看 <strong>LINE Messaging API</strong> 或 <strong>Telegram bot</strong> 的申請流程，這樣下一堂課就能直接接通讓你從手機跟 hermes 講話。</p>

  <p><em>右下角「下一步」按鈕在頁面底部，本頁不需要做任何事，準備好就往下走。</em></p>
</section>
```

- [ ] **Step 2: Verify in browser**

Reload `index.html`. Expected: Step 1 content visible. Heading shows "Step 1 / 9 · 開始之前". No layout breakage.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-1): welcome page with 4 checkpoints preview"
```

---

### Task 4: Step 2 — WSL2 Install

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 2 section after Step 1**

```html
<section class="step" data-step="2" hidden>
  <header>
    <hgroup>
      <h2>Step 2 / 9 · 啟動 WSL2 安裝</h2>
      <p>~4 分鐘觸發、之後 5–10 分鐘背景下載</p>
    </hgroup>
  </header>

  <p>WSL = Windows Subsystem for Linux，微軟官方的 Linux 子系統。安裝這條指令會自動下載 WSL 核心 + Ubuntu。</p>

  <h3>動作</h3>
  <ol>
    <li>開始功能表搜尋「<strong>PowerShell</strong>」</li>
    <li>右鍵 → 「<strong>以系統管理員身分執行</strong>」（藍底白標題會出現）</li>
    <li>把下面這行貼進去，按 Enter</li>
    <li>看到下載進度條後，<strong>不要關掉視窗</strong>，繼續往下讀</li>
  </ol>

  <h3>指令</h3>
  <pre data-copy><code>wsl --install</code></pre>

  <details>
    <summary>等下載時可以順便讀：殼層 / 終端機 / WSL 是什麼</summary>
    <p><strong>殼層 (shell)</strong> 是讓你打字命令給作業系統的程式。Windows 的 PowerShell、cmd 都是殼層；Linux 上常見的是 bash、zsh。</p>
    <p><strong>終端機 (terminal)</strong> 是顯示殼層的視窗。你看到的黑底白字就是終端機。</p>
    <p><strong>WSL</strong> 把一個完整 Linux 跑在你 Windows 裡（不是虛擬機，效能接近原生）。Hermes 在 Linux 跑，所以我們要它。</p>
  </details>

  <details>
    <summary>等下載時可以順便做：把下一步要的 OpenRouter 開起來</summary>
    <p>下載 5–10 分鐘是死時間，可以順手開另一個瀏覽器分頁跑下一步：<a href="#step-3">Step 3 · 申請 OpenRouter API Key</a></p>
  </details>

  <details>
    <summary>🚨 我卡住了</summary>
    <ul>
      <li><strong>Windows 太舊</strong>（1903 以下）→ 先跑 Windows Update 再回來</li>
      <li><strong>跳「WSL not enabled」</strong>→ 跑 <code>wsl --install --no-distribution</code> 重啟、再跑 <code>wsl --install -d Ubuntu</code></li>
      <li><strong>沒有管理員權限</strong>（公司電腦常見）→ 這台機器無法繼續，請改個人電腦</li>
    </ul>
  </details>
</section>
```

- [ ] **Step 2: Verify**

Reload. Expected: Step 2 has `hidden` attribute so it's invisible right now (will be unhidden by wizard.js later). Inspect via browser DevTools that the section element exists.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-2): WSL2 install instructions with concept cards"
```

---

### Task 5: Step 3 — OpenRouter Signup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 3 section**

```html
<section class="step" data-step="3" hidden>
  <header>
    <hgroup>
      <h2>Step 3 / 9 · 申請 OpenRouter API Key</h2>
      <p>~5 分鐘，純瀏覽器操作</p>
    </hgroup>
  </header>

  <p>OpenRouter 是一個 LLM API 的整合入口：一支 API key 可以呼叫 200+ 模型，包含好幾個免費模型。我們會用免費的 <em>deepseek 系列</em>，學員不用刷卡。</p>

  <h3>動作</h3>
  <ol>
    <li>新分頁開啟 <a href="https://openrouter.ai" target="_blank" rel="noopener">https://openrouter.ai</a></li>
    <li>右上角「Sign In」→ 用 email 註冊（Google 登入也可以）</li>
    <li>登入後進入 <strong>Dashboard</strong> → 左側 <strong>Keys</strong></li>
    <li>點「<strong>Create Key</strong>」→ 名稱隨便（例：<code>hermes-course</code>）→ 建立</li>
    <li>⚠️ Key 只會顯示一次，<strong>立刻複製</strong>，貼到 Windows 的「記事本」暫存</li>
  </ol>

  <details>
    <summary>為什麼需要 API key</summary>
    <p>API key 等於 hermes 對 OpenRouter 講話的密碼。每次發一句話，OpenRouter 用這把 key 認得是你、扣你帳號的額度。Key 外洩等於別人可以拿來用、花你的錢（雖然這次是免費 model，但養成好習慣不要外流）。</p>
  </details>

  <details>
    <summary>免費 model 是什麼意思</summary>
    <p>OpenRouter 上一些 model（例如 deepseek/deepseek-chat、qwen 系列等）標註 <code>:free</code>，背後由提供方贊助、對使用者免費。可能有速率限制（例如每分鐘 N 次），但用來學夠了。</p>
  </details>

  <details>
    <summary>🚨 我卡住了</summary>
    <ul>
      <li><strong>驗證信沒收到</strong> → 等 2–3 分鐘、檢查垃圾信。還是沒有 → 改用 OpenAI 或 Anthropic（要刷卡）</li>
      <li><strong>不小心關掉 Create Key 視窗，key 沒抄到</strong> → 沒救，回 Keys 頁面砍掉重建一支</li>
    </ul>
  </details>
</section>
```

- [ ] **Step 2: Verify**

Reload. Inspect DOM: `data-step="3"` section exists with hidden attribute.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-3): OpenRouter signup walkthrough"
```

---

### Task 6: Step 4 — Restart

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 4 section**

```html
<section class="step" data-step="4" hidden>
  <header>
    <hgroup>
      <h2>Step 4 / 9 · 重啟 Windows</h2>
      <p>~5 分鐘</p>
    </hgroup>
  </header>

  <p>WSL 安裝完成後 Windows 會要求重新啟動。重啟後 Linux 子系統才會正式可用。</p>

  <h3>動作</h3>
  <ol>
    <li>回到 PowerShell 視窗，確認看到 <strong>「The requested operation is successful. Changes will not be effective until the system is rebooted.」</strong> 或類似訊息</li>
    <li>儲存所有開著的工作（重啟後不會自動回來）</li>
    <li>Windows 開始功能表 → 電源 → <strong>重新啟動</strong></li>
  </ol>

  <details>
    <summary>離開頁面也沒關係</summary>
    <p>這個教學頁會自動記得你看到第幾步。重啟完回來、重新打開這個網址，會自動跳回 Step 4，按下一步繼續。</p>
  </details>
</section>
```

- [ ] **Step 2: Verify**

Reload. DOM has 4 step sections.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-4): Windows restart instructions"
```

---

### Task 7: Step 5 — Ubuntu First Run

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 5 section**

```html
<section class="step" data-step="5" hidden>
  <header>
    <hgroup>
      <h2>Step 5 / 9 · Ubuntu 首次啟動</h2>
      <p>~7 分鐘</p>
    </hgroup>
  </header>

  <p>重啟後第一次啟動 Ubuntu 會做幾項初始化：建立你的 Linux 帳號、設密碼。這個帳號跟 Windows 帳號完全分開。</p>

  <h3>動作</h3>
  <ol>
    <li>開始功能表搜尋「<strong>Ubuntu</strong>」→ 開啟它</li>
    <li>等待「<code>Installing, this may take a few minutes</code>」訊息消失</li>
    <li>看到 <code>Enter new UNIX username:</code> → 打一個小寫、無空白的名字（例：<code>lewsi</code>）按 Enter</li>
    <li>看到 <code>New password:</code> → 打密碼。<strong>螢幕不會顯示任何字元（連點點都沒有），這是正常的</strong>。打完按 Enter</li>
    <li>再打一次密碼確認 → 看到 <code>$</code> 提示符就完成了</li>
    <li>試打三個指令熟悉一下</li>
  </ol>

  <h3>練習指令</h3>
  <pre data-copy><code>pwd
ls
cd ~</code></pre>

  <details>
    <summary>Linux 終端機三招</summary>
    <ul>
      <li><code>pwd</code> = print working directory，告訴你現在在哪個資料夾</li>
      <li><code>ls</code> = list，列出當前資料夾內容</li>
      <li><code>cd ~</code> = change directory，<code>~</code> 是你的家目錄（home）</li>
    </ul>
  </details>

  <details>
    <summary>Linux 密碼為什麼不顯示</summary>
    <p>Unix 傳統。打字時不顯示任何字元（不像 Windows 顯示星號），是為了讓旁邊的人連密碼長度都看不到。新手第一次都以為鍵盤壞了。</p>
  </details>

  <details>
    <summary>🚨 我卡住了</summary>
    <ul>
      <li><strong>Username 顯示 invalid</strong> → 不能有大寫、空白、底線開頭。改成全小寫純字母</li>
      <li><strong>兩次密碼不一樣</strong> → 它會要你重來，沒事</li>
      <li><strong>Ubuntu app 一直顯示 Installing</strong> → 等到 5 分鐘以上沒動 → 關掉重開（資料不會丟）</li>
    </ul>
  </details>
</section>
```

- [ ] **Step 2: Verify**

Reload. 5 step sections in DOM.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-5): Ubuntu first-run + terminal cheatsheet"
```

---

### Task 8: Step 6 — Install Hermes

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 6 section**

```html
<section class="step" data-step="6" hidden>
  <header>
    <hgroup>
      <h2>Step 6 / 9 · 安裝 hermes</h2>
      <p>~15 分鐘（多半在等下載）</p>
    </hgroup>
  </header>

  <p>這是整堂課最久的一段。一行 curl 指令會下載官方安裝腳本並立刻執行：裝 uv、建 Python 虛擬環境、把 hermes 裝進去、把 <code>hermes</code> 指令連結到你的 PATH。</p>

  <h3>動作</h3>
  <ol>
    <li>確認你還在 Ubuntu 視窗、看到 <code>$</code> 提示符</li>
    <li>把下面整行貼進去（在 Ubuntu 終端機是 <strong>Ctrl+Shift+V</strong> 貼上）</li>
    <li>按 Enter，看著它跑</li>
    <li>看到 <strong><code>Hermes installed!</code></strong> 訊息就完成（5–10 分鐘）</li>
  </ol>

  <h3>指令</h3>
  <pre data-copy><code>curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash</code></pre>

  <details>
    <summary><code>curl | bash</code> 在做什麼？這安全嗎？</summary>
    <p><code>curl</code> 是「從網路抓檔」的指令；<code>| bash</code> 是「把抓到的內容直接餵給 bash 執行」。</p>
    <p>等於：<strong>下載一個腳本立刻跑它</strong>。一般情況下這有風險（中間人攻擊或來源不可信），這次因為來源是 hermes 官方 GitHub repo、走 HTTPS、是業界廣泛使用的 quick-install 模式，所以可接受。</p>
  </details>

  <details>
    <summary>等下載時可以順便讀：下一步 hermes setup 會問你 4 件事</summary>
    <ol>
      <li><strong>Provider</strong>（供應商）→ 選 OpenRouter</li>
      <li><strong>Model</strong>（模型）→ 選一個有「<code>:free</code>」標籤的 deepseek 模型</li>
      <li><strong>API Key</strong> → 貼你 Step 3 拿到的 key</li>
      <li><strong>Tools / Terminal</strong>（工具與終端後端）→ 全部用預設按 Enter 跳過</li>
    </ol>
    <p>先看一遍，下一步會比較不慌。</p>
  </details>

  <details>
    <summary>🚨 我卡住了</summary>
    <ul>
      <li><strong>下載卡 5 分鐘以上沒動</strong> → 正常，繼續等。網速差可能要 10 分鐘</li>
      <li><strong>SSL certificate problem</strong>（極少）→ 跑 <code>sudo apt update &amp;&amp; sudo apt install -y ca-certificates</code> 後重試</li>
      <li><strong>結束後跑 <code>hermes</code> 顯示 command not found</strong> → 跑 <code>source ~/.bashrc</code></li>
    </ul>
  </details>
</section>
```

- [ ] **Step 2: Verify**

Reload. 6 step sections.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-6): hermes install via quick-install script"
```

---

### Task 9: Step 7 — hermes setup wizard

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 7 section**

```html
<section class="step" data-step="7" hidden>
  <header>
    <hgroup>
      <h2>Step 7 / 9 · <code>hermes setup</code> 設定精靈</h2>
      <p>~8 分鐘</p>
    </hgroup>
  </header>

  <p><code>hermes setup</code> 是 hermes 官方的設定精靈，會依序問你 provider、model、API key、tools、terminal。我們會選 OpenRouter + 免費 deepseek 模型，其他全部預設。</p>

  <h3>動作</h3>
  <ol>
    <li>先 reload bash 環境，讓系統認得新的 <code>hermes</code> 指令</li>
  </ol>

  <pre data-copy><code>source ~/.bashrc</code></pre>

  <ol start="2">
    <li>啟動精靈</li>
  </ol>

  <pre data-copy><code>hermes setup</code></pre>

  <ol start="3">
    <li>依下面 5 個提示一個一個填</li>
  </ol>

  <h3>5 個提示怎麼答</h3>
  <table>
    <thead>
      <tr><th>提示</th><th>選 / 填</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Choose your provider</strong></td><td>用方向鍵選 <code>openrouter</code>，Enter</td></tr>
      <tr><td><strong>Choose a model</strong></td><td>挑一個名稱含 <code>deepseek</code> 且標 <code>:free</code> 的，Enter</td></tr>
      <tr><td><strong>Enter your API key</strong></td><td>貼 Step 3 暫存的 key（Ctrl+Shift+V），Enter</td></tr>
      <tr><td><strong>Configure tools?</strong></td><td>直接 Enter（預設）</td></tr>
      <tr><td><strong>Configure terminal backend?</strong></td><td>直接 Enter（預設 = local）</td></tr>
    </tbody>
  </table>

  <p>看到 <strong><code>Setup complete!</code></strong> 就成功。</p>

  <details>
    <summary>每個提示在做什麼</summary>
    <ul>
      <li><strong>Provider</strong> = 你要呼叫哪家 LLM API（OpenAI、Anthropic、OpenRouter 等）</li>
      <li><strong>Model</strong> = 那家底下的哪個模型</li>
      <li><strong>API key</strong> = 拿來證明「這個請求是我發的」的密碼</li>
      <li><strong>Tools</strong> = hermes 可以用哪些工具（讀檔、寫檔、執行指令等），先用預設安全</li>
      <li><strong>Terminal backend</strong> = hermes 開新終端的方式（local = 直接在你 Ubuntu 跑）</li>
    </ul>
  </details>

  <details>
    <summary>🚨 我卡住了</summary>
    <ul>
      <li><strong>不小心 Ctrl+C 中斷</strong> → 重跑 <code>hermes setup</code></li>
      <li><strong>API key 貼進去變空白</strong> → 把 key 重新從記事本複製、再 Ctrl+Shift+V（Ubuntu 終端機要 Shift）</li>
      <li><strong>看不到 <code>:free</code> 模型</strong> → OpenRouter 偶爾會調整 free 列表，挑名字最像的，下一步試了就知道</li>
    </ul>
  </details>
</section>
```

- [ ] **Step 2: Verify**

Reload. 7 step sections; the table renders.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-7): hermes setup wizard with 5-prompt walkthrough"
```

---

### Task 10: Step 8 — First Conversation

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 8 section**

```html
<section class="step" data-step="8" hidden>
  <header>
    <hgroup>
      <h2>Step 8 / 9 · 第一次對話</h2>
      <p>~5 分鐘</p>
    </hgroup>
  </header>

  <p>所有設定完成。打 <code>hermes</code> 啟動 TUI（文字介面），然後跟它講話。</p>

  <h3>動作</h3>
  <ol>
    <li>啟動 hermes</li>
  </ol>

  <pre data-copy><code>hermes</code></pre>

  <ol start="2">
    <li>看到 hermes 的 ASCII art 標題 + 輸入框</li>
    <li>打第一句話試試看，例如：</li>
  </ol>

  <pre data-copy><code>介紹一下你自己</code></pre>

  <ol start="4">
    <li>按 Enter，你會看到回應 <strong>一個字一個字浮出來</strong>（streaming）</li>
    <li>多聊幾句也行</li>
    <li>結束對話 → 打 <code>/exit</code> 按 Enter，或按 Ctrl+D</li>
  </ol>

  <details>
    <summary>什麼是 streaming</summary>
    <p>LLM 一次產生一個 token（大約一個字或半個詞），生一個吐一個給你看，不用等整段話算完。這就是你看到的「打字機效果」。技術上這是 Server-Sent Events 的 chunked response。</p>
  </details>

  <details>
    <summary>常用 hermes 指令</summary>
    <ul>
      <li><code>/new</code> 或 <code>/reset</code> — 開新對話（清空當前 context）</li>
      <li><code>/model</code> — 切換 model</li>
      <li><code>/exit</code> — 結束</li>
      <li><code>Ctrl+C</code> — 中斷當前回應（不離開 hermes）</li>
    </ul>
  </details>

  <details>
    <summary>🚨 我卡住了</summary>
    <ul>
      <li><strong>送出後沒回應、卡很久</strong> → 免費模型的速率限制。Ctrl+C 中斷，跑 <code>/model</code> 換另一個 free model</li>
      <li><strong>顯示亂碼或方框</strong> → Windows Terminal 字型問題。設定 → Profile → Ubuntu → 字型改 <code>Cascadia Code</code> 或 <code>Consolas</code></li>
      <li><strong>所有設定看起來都對但跑 hermes 出 error</strong> → 跑 <code>hermes doctor</code>，它會告訴你哪邊配置有問題</li>
    </ul>
  </details>
</section>
```

- [ ] **Step 2: Verify**

Reload. 8 step sections.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-8): first conversation walkthrough"
```

---

### Task 11: Step 9 — Wrap-up + Bonus

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Append Step 9 section**

```html
<section class="step" data-step="9" hidden>
  <header>
    <hgroup>
      <h2>Step 9 / 9 · 你做到了 + 下一步</h2>
      <p>~5 分鐘</p>
    </hgroup>
  </header>

  <p>恭喜，4 個 checkpoints 都完成：</p>
  <ol>
    <li>✓ WSL2 + Ubuntu 安裝</li>
    <li>✓ OpenRouter API key</li>
    <li>✓ hermes-agent 安裝</li>
    <li>✓ 第一次對話</li>
  </ol>

  <h3>建議下一步</h3>
  <ul>
    <li>把這個頁面 <strong>加書籤</strong>，未來想複習可以隨時回來</li>
    <li>跑 <code>hermes doctor</code> 做一次體檢，確認所有元件都健康</li>
    <li>下次課程：把 hermes 接到 LINE 或 Telegram，這樣可以從手機跟它講話</li>
  </ul>

  <details>
    <summary>加碼 A：申請 LINE Messaging API channel</summary>
    <p>下一堂課要用，現在拿 token 之後可以直接接通。</p>
    <ol>
      <li>開 <a href="https://developers.line.biz/console/" target="_blank" rel="noopener">https://developers.line.biz/console/</a></li>
      <li>用你的 LINE 帳號登入</li>
      <li>「Create new provider」→ 隨便取名（例：<code>my-hermes</code>）</li>
      <li>進入 provider → 「Create a Messaging API channel」→ 填 channel 名稱、icon、類別</li>
      <li>建立後進入 channel → 「Messaging API」分頁</li>
      <li>找到 <strong>Channel access token (long-lived)</strong> → Issue → 複製到記事本</li>
    </ol>
  </details>

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

  <p><em>到這邊就是今天的全部內容。下次見。</em></p>
</section>
```

- [ ] **Step 2: Verify**

Reload. 9 step sections.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(step-9): wrap-up with LINE/Telegram bonus"
```

---

### Task 12: Prev/Next Navigation Markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add nav block at end of `<main>`, after Step 9 section**

```html
<nav id="step-nav" class="container">
  <button id="prev-btn" type="button">← 上一步</button>
  <button id="next-btn" type="button" class="primary">下一步 →</button>
</nav>
```

- [ ] **Step 2: Verify**

Reload. Two buttons visible at bottom of page.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: prev/next navigation buttons"
```

---

### Task 13: Wizard JS — Step Visibility + Hash Routing

**Files:**
- Create: `wizard.js`

- [ ] **Step 1: Write wizard.js**

```javascript
const TOTAL_STEPS = 9;
const STORAGE_KEY = 'hermes-course-step';

function getCurrentStep() {
  const hashMatch = window.location.hash.match(/^#step-(\d+)$/);
  if (hashMatch) {
    const n = parseInt(hashMatch[1], 10);
    if (n >= 1 && n <= TOTAL_STEPS) return n;
  }
  const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '1', 10);
  return (saved >= 1 && saved <= TOTAL_STEPS) ? saved : 1;
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(el => {
    const stepNum = parseInt(el.dataset.step, 10);
    el.hidden = (stepNum !== n);
  });
  document.getElementById('progress-text').textContent = `Step ${n} / ${TOTAL_STEPS}`;
  document.getElementById('prev-btn').disabled = (n === 1);
  document.getElementById('next-btn').disabled = (n === TOTAL_STEPS);
  localStorage.setItem(STORAGE_KEY, String(n));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function navigate(n) {
  if (n < 1 || n > TOTAL_STEPS) return;
  window.location.hash = `step-${n}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const initial = getCurrentStep();
  if (!window.location.hash) {
    history.replaceState(null, '', `#step-${initial}`);
  }
  showStep(initial);

  document.getElementById('prev-btn').addEventListener('click', () => {
    navigate(getCurrentStep() - 1);
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    navigate(getCurrentStep() + 1);
  });

  window.addEventListener('hashchange', () => {
    showStep(getCurrentStep());
  });
});
```

- [ ] **Step 2: Verify in browser**

1. Reload `index.html`. Expected: only Step 1 visible. Progress shows "Step 1 / 9". Prev button disabled, Next enabled.
2. Click Next. Expected: Step 2 visible, URL now has `#step-2`, progress updates.
3. Click Prev. Expected: back to Step 1.
4. Type `#step-7` directly in URL. Expected: jumps to Step 7.
5. Click Next from Step 9. Expected: nothing happens (button disabled).
6. Reload page. Expected: stays at Step 7 (last visited; localStorage works).
7. Open in fresh incognito. Expected: opens at Step 1.

- [ ] **Step 3: Commit**

```bash
git add wizard.js
git commit -m "feat(js): step visibility, hash routing, localStorage persistence"
```

---

### Task 14: Copy-to-Clipboard for Command Boxes

**Files:**
- Modify: `wizard.js`

- [ ] **Step 1: Append copy-button logic to wizard.js**

Inside the `DOMContentLoaded` handler (after the existing button bindings, before the closing `});`), add:

```javascript
  document.querySelectorAll('pre[data-copy]').forEach(pre => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const text = pre.querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      } catch (err) {
        btn.textContent = 'Copy failed';
      }
    });
    pre.appendChild(btn);
  });
```

- [ ] **Step 2: Verify**

1. Reload. Navigate to Step 2.
2. Expected: a "Copy" button appears in/near the `wsl --install` code block.
3. Click it. Expected: button shows "✓ Copied" briefly.
4. Paste somewhere. Expected: `wsl --install` text appears.

- [ ] **Step 3: Commit**

```bash
git add wizard.js
git commit -m "feat(js): copy-to-clipboard for command blocks"
```

---

### Task 15: Stylesheet

**Files:**
- Create: `style.css`

- [ ] **Step 1: Write style.css**

```css
:root {
  --pico-spacing: 1rem;
  --pico-typography-spacing-vertical: 1.25rem;
}

body > header,
body > main,
body > footer {
  max-width: 760px;
}

body > header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1rem;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

body > header hgroup {
  margin-bottom: 0;
}

#progress {
  font-size: 0.9rem;
  color: var(--pico-muted-color);
  font-variant-numeric: tabular-nums;
}

.step {
  padding-block: 1rem;
}

.step header h2 {
  margin-bottom: 0.25rem;
}

.step pre {
  position: relative;
  padding-right: 4.5rem;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  margin: 0;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  width: auto;
  background: var(--pico-secondary);
  border: none;
  cursor: pointer;
}

.step details {
  margin-block: 1rem;
  padding: 0.75rem 1rem;
  background: var(--pico-card-background-color);
  border-radius: var(--pico-border-radius);
  border: 1px solid var(--pico-muted-border-color);
}

.step details summary {
  cursor: pointer;
  font-weight: 600;
}

.step details > *:not(summary) {
  margin-top: 0.75rem;
}

#step-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1.5rem;
  border-top: 1px solid var(--pico-muted-border-color);
}

#step-nav button {
  flex: 1;
  max-width: 200px;
}

body > footer {
  padding-block: 1rem;
  border-top: 1px solid var(--pico-muted-border-color);
  color: var(--pico-muted-color);
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  body > header {
    flex-direction: column;
    align-items: flex-start;
  }
  #step-nav button {
    max-width: none;
  }
}
```

- [ ] **Step 2: Verify**

Reload. Expected: typography looks clean, copy button sits in top-right of code blocks, prev/next buttons spread across bottom, mobile-narrow viewport (DevTools responsive mode at 375px) shows header stacking.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat(css): layout, copy button placement, RWD"
```

---

### Task 16: Pre-Class Checklist

**Files:**
- Create: `pre-class-checklist.md`

- [ ] **Step 1: Write pre-class-checklist.md**

```markdown
# Pre-Class Smoke Test

每次教學前 10–15 分鐘做完。發現任何不一致就立即修教材。

## 環境準備

- [ ] 一台乾淨的 Windows 機器（或還原到乾淨快照的 VM）
- [ ] 網路通暢
- [ ] OpenRouter 帳號（測試用，可重用）

## 必檢三項（最容易壞）

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

若 UI 變了：補 Step 3 的 4 張截圖。

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
```

- [ ] **Step 2: Verify**

```bash
ls -la pre-class-checklist.md
head -10 pre-class-checklist.md
```

Expected: file exists, ~80 lines.

- [ ] **Step 3: Commit**

```bash
git add pre-class-checklist.md
git commit -m "docs: pre-class smoke test checklist"
```

---

### Task 17: Local Browser Sanity Pass

**Files:** _(no edits — verification only)_

- [ ] **Step 1: Open `index.html` in a browser**

```bash
xdg-open /home/lewsi/Documents/workspaceAgent/hermes-windows-course/index.html
# or just double-click in file manager
```

- [ ] **Step 2: Walk all 9 steps**

For each step 1 → 9:
- Click "下一步 →"
- Verify URL hash updates to `#step-N`
- Verify content visible matches the step
- Verify progress text "Step N / 9" updates
- Open at least one `<details>` (concept card) — verify expands

- [ ] **Step 3: Test deep link**

In address bar replace hash with `#step-5`. Reload. Expected: lands on Step 5.

- [ ] **Step 4: Test localStorage persistence**

Navigate to Step 7. Close tab. Reopen `index.html` (no hash). Expected: lands on Step 7.

- [ ] **Step 5: Test copy buttons**

Step 2: click Copy on `wsl --install` block. Paste in another text field. Expected: text matches.

- [ ] **Step 6: Mobile breakpoint**

DevTools → responsive mode → 375px. Expected: header stacks vertically, content readable, no horizontal scroll.

- [ ] **Step 7: If any issue: fix inline, re-verify, commit fix**

If everything passes → no commit needed (this is verification, not new code).

---

### Task 18: Smoke Test + Screenshot Capture (Instructor / User Action)

**Files:**
- Create: `assets/screenshots/*.png` (~20 files)

> **This task requires running through the actual install on a real Windows machine.** Cannot be done from this Linux dev environment. Hand off to the instructor / user.

- [ ] **Step 1: On a clean Windows machine, run the full course flow**

Follow `pre-class-checklist.md`. Capture screenshots at the points listed in spec §8.1.

- [ ] **Step 2: Save screenshots**

Save as PNG, ~1280×720 (or native if higher), under `assets/screenshots/` with naming `step-N-description.png`. Examples:
- `step-2-powershell-admin.png`
- `step-2-wsl-install-running.png`
- `step-3-openrouter-signup.png`
- `step-3-openrouter-dashboard.png`
- `step-3-openrouter-keys.png`
- `step-3-openrouter-create-key.png`
- `step-5-ubuntu-username.png`
- `step-5-ubuntu-password.png`
- `step-6-install-running.png`
- `step-6-install-complete.png`
- `step-7-setup-provider.png`
- `step-7-setup-model.png`
- `step-7-setup-apikey.png`
- `step-7-setup-tools.png`
- `step-7-setup-terminal.png`
- `step-8-hermes-tui.png`
- `step-8-streaming.png`
- `step-8-exit.png`
- `step-9-doctor.png`

- [ ] **Step 3: Reference screenshots in `index.html`**

For each step section, add `<img>` tags after the action steps. Example for Step 2:

```html
<figure>
  <img src="assets/screenshots/step-2-powershell-admin.png" alt="PowerShell 系統管理員視窗">
  <figcaption>PowerShell 視窗左上角應該寫「系統管理員：Windows PowerShell」</figcaption>
</figure>
```

Add similar for Step 3, 5, 6, 7, 8, 9 per the screenshot list above. (Steps 1 and 4 have no screenshots.)

- [ ] **Step 4: Update README.md "Last Verified"**

Edit the placeholder lines:

```markdown
## 上次驗證

- 日期：2026-MM-DD
- hermes 版本：vX.Y.Z
- Windows 版本：XX 22HX
```

- [ ] **Step 5: Commit screenshots and references**

```bash
git add assets/ index.html README.md
git commit -m "feat: screenshots from smoke test + last-verified record"
```

---

### Task 19: Create Public GitHub Repo

**Files:** _(none — uses `gh` CLI)_

- [ ] **Step 1: Verify `gh` is authenticated**

```bash
gh auth status
```

Expected: shows "Logged in to github.com as Lewsiafat". If not, run `gh auth login` first.

- [ ] **Step 2: Create repo and push**

```bash
cd /home/lewsi/Documents/workspaceAgent/hermes-windows-course
gh repo create Lewsiafat/hermes-windows-course \
  --public \
  --description "60-min Windows install course for hermes-agent — interactive 9-step wizard" \
  --source=. \
  --remote=origin \
  --push
```

Expected: output ends with `https://github.com/Lewsiafat/hermes-windows-course`.

- [ ] **Step 3: Verify repo on GitHub**

```bash
gh repo view Lewsiafat/hermes-windows-course --web
```

Expected: browser opens to repo page showing all files.

---

### Task 20: Enable GitHub Pages

**Files:** _(none — uses `gh` CLI)_

- [ ] **Step 1: Enable Pages from main branch root**

```bash
gh api -X POST /repos/Lewsiafat/hermes-windows-course/pages \
  -f 'source[branch]=main' \
  -f 'source[path]=/'
```

Expected: returns JSON with `"status": null` or `"building"` and `"html_url": "https://lewsiafat.github.io/hermes-windows-course/"`.

- [ ] **Step 2: Wait for first build**

```bash
sleep 60
gh api /repos/Lewsiafat/hermes-windows-course/pages | grep -E 'status|html_url'
```

Expected: `"status": "built"` after 1–2 minutes.

- [ ] **Step 3: Open the URL**

```bash
xdg-open https://lewsiafat.github.io/hermes-windows-course/
```

Expected: site loads, Step 1 visible. If 404, wait 30 more seconds and retry (DNS / cache propagation).

---

### Task 21: End-to-End Verification on GitHub Pages

**Files:** _(none — verification)_

- [ ] **Step 1: Walk all 9 steps on the live URL**

Same as Task 17 but on `https://lewsiafat.github.io/hermes-windows-course/`.

- [ ] **Step 2: Test from a different device / network**

Open the URL from phone or another network. Expected: same behavior, all assets (Pico CDN, screenshots) load.

- [ ] **Step 3: Test deep link from outside**

In a fresh incognito window, paste `https://lewsiafat.github.io/hermes-windows-course/#step-6`. Expected: lands directly on Step 6.

- [ ] **Step 4: If any issue found**

Fix locally → commit → `git push` → wait 30 seconds → retest.

---

## Self-Review

This section is for the plan author (me, before handoff). Document this is done in the conversation reply.

**Spec coverage check:**
- §1 Summary → covered by Tasks 1, 2 (project skeleton)
- §2 Goals → covered by all step tasks (3–11)
- §3 Audience/defaults → embedded in step prose (Tasks 3–11)
- §4 Scope → in scope: Tasks 3–11; out of scope: not implemented (correct)
- §5 Course timeline → not implemented as a file; lives only in spec for instructor reference (correct, no instructor-side artifact needed beyond spec itself)
- §6 Wizard design → Tasks 12, 13, 14, 15 (markup, JS, CSS)
- §7 Tech stack / file structure → Tasks 1, 2, 13, 15 collectively
- §8 Content assets → Tasks 3–11 (prose + cards), Task 18 (screenshots)
- §9 Maintenance → Task 16 (pre-class-checklist.md)
- §10 Risks → embedded as 🚨 sections in Tasks 4, 5, 7, 8, 9, 10 (per-step troubleshooting)
- §11 Open questions → not implemented (intentional — these stay open until first teach)
- §12 Deployment → Tasks 19, 20, 21

**Placeholder scan:** No "TBD"/"TODO" in code or commands. README.md has explicit "（待 smoke test 後填入）" markers — these are intentional and updated in Task 18 step 4.

**Type/identifier consistency:** `STORAGE_KEY = 'hermes-course-step'` used consistently. `data-step="N"` selector matches `dataset.step` access. Class names `.step`, `.copy-btn` consistent between HTML, CSS, JS.

**Order dependencies:** Tasks 3–11 add sections to `<main>`; Task 12 adds nav AFTER Step 9 (must come after Task 11). Task 13 (wizard.js) depends on `data-step` markup from Tasks 3–11 and `prev-btn`/`next-btn` IDs from Task 12. Task 14 depends on `pre[data-copy]` markup from Tasks 4, 6, 7, 8, 10 (already present). Task 15 (CSS) depends on classes added across all earlier tasks but is otherwise standalone. Task 18 logically must come AFTER all dev tasks (1–17). Tasks 19–21 must come last.

---

## Execution Choice

After this plan is saved, decide between:

1. **Subagent-Driven (recommended)** — fresh subagent per task, two-stage review between tasks
2. **Inline Execution** — execute tasks in current session, batch with checkpoints

Tell user, get pick, then invoke matching sub-skill.
