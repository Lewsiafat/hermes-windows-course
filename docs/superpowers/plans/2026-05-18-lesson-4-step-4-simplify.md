# Lesson 4 Step 4 Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `lesson-4.html` Step 4 從 nano + sed 補救改成 bash heredoc 互動腳本主流程，砍掉手動編輯路徑，同步更新 Step 1/2/6 內部 cross-ref 與 `ai-runbook.md` Stage 21。

**Architecture:** 純靜態 HTML 教學頁、無 build step、無框架；用 Edit / Bash 工具直接改 HTML、Markdown 即可。沒有單元測試，verification 走 grep + 瀏覽器目視 + 互動腳本 dogfood（已備好 `temp/lesson-4-step-4-test.sh`）。

**Tech Stack:** Plain HTML + Pico CSS + `wizard.js`（vanilla JS）；改動透過 git commit + push 觸發 GitHub Pages 自動部署。

**Reference spec:** `docs/superpowers/specs/2026-05-18-lesson-4-step-4-simplify-design.md`

---

## File Structure

| File | Action | Lines |
|---|---|---|
| `lesson-4.html` | Modify | 232–349 (Step 4 整段) + 100, 135 (Step 1/2 details) + 456, 471 (Step 6 troubleshoot) |
| `ai-runbook.md` | Modify | 575–594 (Stage 21) |
| `pre-class-checklist.md` | No change | (verified Lesson 4 checks don't reference Step 4 internals) |
| `temp/lesson-4-step-4-test.sh` | No change | (已備好，Task 4 拿來用) |

---

## Task 1: Rewrite `lesson-4.html` Step 4 section (lines 232–349)

**Files:**
- Modify: `lesson-4.html:232-349`

- [ ] **Step 1: Locate current Step 4 boundaries**

Run: `grep -n 'data-step="[345]"' lesson-4.html`

Expected output:
```
166:    <section class="step" data-step="3" hidden>
232:    <section class="step" data-step="4" hidden>
351:    <section class="step" data-step="5" hidden>
```

So Step 4 spans lines 232 through to line 350 (the `</section>` before line 351). Confirm this before proceeding.

- [ ] **Step 2: Replace entire Step 4 section with new 3 sub-step structure**

Use the Edit tool. The `old_string` is the full current Step 4 section (lines 232–350 inclusive — start at `    <section class="step" data-step="4" hidden>`, end at the `    </section>` line immediately before `    <section class="step" data-step="5" hidden>`).

Replace with this new content (HTML entities pre-escaped for `<pre><code>` blocks):

```html
    <section class="step" data-step="4" hidden>
      <header>
        <hgroup>
          <h2>Step 4 / 7 · 開 ngrok tunnel + 一鍵寫 <code>.env</code> LINE block</h2>
          <p>~10 分鐘</p>
        </hgroup>
      </header>

      <p>兩件事：(1) 第二個 shell 跑 <code>ngrok</code> 抓 public URL、(2) 跑一段互動腳本，它會問你三個 secret 並自動寫進 <code>~/.hermes/.env</code>，最後用 <strong>redacted verify</strong> 確認長度都對（不直接 <code>cat .env</code>，避免 secret 暴露）。</p>

      <h3>1. 第二個 shell（Window B）跑 ngrok</h3>

      <p>開新的 Windows Terminal 分頁（<kbd>Ctrl+Shift+T</kbd>）進 WSL，跑：</p>

      <pre data-copy><code>ngrok http 8646</code></pre>

      <p>ngrok 終端機 panel 出現後，看 <strong>Forwarding</strong> 那行的 URL（類似 <code>https://abcd-12-34-56-78.ngrok-free.app</code>），<strong>完整含 <code>https://</code> 一起抄</strong>，下一步要用。</p>

      <div class="notice">
        ⚠️ <strong>Window B 不要關</strong>。關了 ngrok agent process 就死、tunnel 斷、LINE 收不到訊息。整堂課保留到 Step 7。
      </div>

      <details>
        <summary>看不懂 ngrok panel？</summary>
        <p>panel 大概長這樣：</p>
        <pre><code>Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        Asia Pacific (ap)
Forwarding                    https://abcd-12-34-56-78.ngrok-free.app -&gt; http://localhost:8646
Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00</code></pre>
        <p>抄 <strong>Forwarding</strong> 那行 <code>-&gt;</code> 左邊的 URL。<strong>不是</strong> <code>http://localhost:8646</code>（那是內網位址）。</p>
      </details>

      <h3>2. 回 Window A 跑互動腳本寫 <code>.env</code></h3>

      <p>下面這段會問你三個值（token / secret / URL），自動寫進 <code>~/.hermes/.env</code>。<strong>不需要手動編輯</strong>。Token / secret 輸入時不會回顯（避免肩膀後面被看到），看不到字也是有打進去，輸完按 <kbd>Enter</kbd>。</p>

      <pre data-copy><code>bash &lt;&lt;'BASH'
set -euo pipefail
cd ~/.hermes
read -sp "Paste LINE Channel Access Token: " TOKEN &lt;/dev/tty &amp;&amp; echo
read -sp "Paste LINE Channel Secret: "        SECRET &lt;/dev/tty &amp;&amp; echo
read -p  "Paste ngrok HTTPS URL: "            PUBURL &lt;/dev/tty
grep -q '^LINE_CHANNEL_ACCESS_TOKEN=' .env || echo 'LINE_CHANNEL_ACCESS_TOKEN=' &gt;&gt; .env
grep -q '^LINE_CHANNEL_SECRET='       .env || echo 'LINE_CHANNEL_SECRET='       &gt;&gt; .env
grep -q '^LINE_PUBLIC_URL='           .env || echo 'LINE_PUBLIC_URL='           &gt;&gt; .env
grep -q '^LINE_ALLOWED_USERS='        .env || echo 'LINE_ALLOWED_USERS='        &gt;&gt; .env
grep -q '^LINE_ALLOW_ALL_USERS='      .env || echo 'LINE_ALLOW_ALL_USERS=true'  &gt;&gt; .env
sed -i "s|^LINE_CHANNEL_ACCESS_TOKEN=.*|LINE_CHANNEL_ACCESS_TOKEN=$TOKEN|" .env
sed -i "s|^LINE_CHANNEL_SECRET=.*|LINE_CHANNEL_SECRET=$SECRET|"            .env
sed -i "s|^LINE_PUBLIC_URL=.*|LINE_PUBLIC_URL=$PUBURL|"                    .env
BASH</code></pre>

      <p>跑完三個 prompt 依序輸入：(1) token (paste 後 Enter，看不到字符正常) (2) secret (同樣不回顯) (3) ngrok URL (有回顯，無妨)。腳本結束跳回提示符。</p>

      <details>
        <summary>為什麼 <code>LINE_ALLOWED_USERS=</code> 留空 + <code>LINE_ALLOW_ALL_USERS=true</code>？</summary>
        <p>我們現在還不知道學員自己的 LINE User ID（<code>U</code> 開頭 32 字元 hex），Step 6 從 gateway log 抓到後再回頭收緊。先放寬讓你能傳第一則訊息驗證鏈路。</p>
        <p>放寬期間 <strong>不要把 bot basic ID 公開到任何地方</strong>（聊天群、社群），免得別人加你 bot、用你 OpenRouter 額度。</p>
      </details>

      <details>
        <summary>為什麼用 <code>bash &lt;&lt;'BASH'</code> heredoc 包起來？</summary>
        <p>這段命令依賴 bash 的 <code>read -sp</code>（silent + prompt）。如果你 default shell 是 zsh（會看到 <code>%</code> 或 <code>❯</code> prompt 而非 <code>$</code>），zsh 的 <code>-p</code> 意思跟 bash 不同（"read from coprocess"），直接跑會壞。</p>
        <p>用 <code>bash &lt;&lt;'BASH' ... BASH</code> heredoc 強制 fork 進 bash subshell，<code>&lt;/dev/tty</code> 讓 <code>read</code> 從終端鍵盤讀（而非 heredoc 內容），不管你 default shell 是什麼都能跑。</p>
      </details>

      <h3>3. Redacted verify（不要 <code>cat .env</code>）</h3>

      <p>直接 <code>cat</code> 會把 token 噴到螢幕。改用下面這條 awk 只看「變數名 + 值的長度」：</p>

      <pre data-copy><code>awk -F= '/^LINE_/{print $1, "len="length($2)}' ~/.hermes/.env</code></pre>

      <p>預期輸出（長度可能略有出入，重點是 ratio 對得上）：</p>

      <pre><code>LINE_CHANNEL_ACCESS_TOKEN len=170
LINE_CHANNEL_SECRET len=32
LINE_PUBLIC_URL len=40
LINE_ALLOWED_USERS len=0
LINE_ALLOW_ALL_USERS len=4</code></pre>

      <p>判讀：</p>
      <ul>
        <li><code>LINE_CHANNEL_ACCESS_TOKEN len=170</code>（或 <code>~160-180</code>）→ token 對 ✓</li>
        <li><code>LINE_CHANNEL_SECRET len=32</code> → secret 對 ✓（hex 32 字元 = 16 bytes）</li>
        <li><code>LINE_PUBLIC_URL len=40</code>（前後可能差 5-10）→ ngrok URL 對 ✓</li>
        <li><code>LINE_ALLOWED_USERS len=0</code> → 空字串，Step 6 收緊 ✓</li>
        <li><code>LINE_ALLOW_ALL_USERS len=4</code> → 字面 "true" ✓</li>
      </ul>

      <div class="notice">
        🚨 <strong>token 長度 &lt; 100 或 secret 長度不是 32</strong> → 多半 paste 帶到換行 / 空白 / 漏字元。重跑上面互動腳本一次（idempotent，重跑不會壞）。
      </div>

      <details>
        <summary>🚨 awk 沒輸出 LINE_ 任何行 / 變數沒列出來</summary>
        <ul>
          <li><strong>互動腳本中途 Ctrl+C 中斷</strong> → 重跑一次即可（<code>set -e</code> 避免半寫狀態、<code>grep -q ... || echo ...</code> 是 idempotent）</li>
          <li><strong>看到 <code>/dev/tty: No such device or address</code></strong>（罕見，例如 <code>ssh user@host '...'</code> 非互動 ssh）→ 改用互動 ssh <code>ssh -t user@host</code> 重連，再跑互動腳本</li>
        </ul>
      </details>
    </section>
```

- [ ] **Step 3: Verify Step 4 changes with grep checks**

Run each command, confirm expected result:

```bash
# 3a. Step 4 內找不到 'nano' 字串
grep -n 'nano' lesson-4.html | awk -F: '$1 >= 232 && $1 <= 350'
# Expected: (no output)

# 3b. Step 4 內找不到 'Variant A' / 'Variant B'
grep -n 'Variant [AB]' lesson-4.html | awk -F: '$1 >= 232 && $1 <= 350'
# Expected: (no output)

# 3c. Step 4 含 3 個 <h3>
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -c '<h3>'
# Expected: 3

# 3d. 互動腳本含 3 個關鍵元素
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -E "bash &lt;&lt;'BASH'|set -euo pipefail|&lt;/dev/tty"
# Expected: 3+ lines (one per element, possibly multiple /dev/tty lines)

# 3e. 互動腳本是 <pre data-copy> 可一鍵複製
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -c '<pre data-copy>'
# Expected: 3 (ngrok command, interactive script, awk verify)
```

If any check fails, re-read the Step 4 section and fix.

- [ ] **Step 4: Commit Task 1**

```bash
git add lesson-4.html
git commit -m "$(cat <<'EOF'
feat(lesson-4): rewrite Step 4 — interactive bash heredoc replaces nano flow

砍掉 nano 編輯 + Variant A/B 補救三段，主流程改為一段 bash heredoc
互動腳本，用 </dev/tty 從終端讀三個 secret，set -euo pipefail 防半寫。
不依賴學員 default shell（bash / zsh / fish 均可）。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Update `lesson-4.html` cross-refs outside Step 4

**Files:**
- Modify: `lesson-4.html:100` (Step 1 details — Window A 描述)
- Modify: `lesson-4.html:135` (Step 2 details — token 安全提醒)
- Modify: `lesson-4.html:456` (Step 6 troubleshoot — Invalid SECRET length)
- Modify: `lesson-4.html:471` (Step 6 troubleshoot — Verify Timeout)

- [ ] **Step 1: Update Step 1 details — Window A 描述（line 100）**

Use Edit tool:

old_string:
```html
          <li><strong>Window A</strong>：你現在這個（給 <code>nano</code>、<code>sed</code>、查 log 用）</li>
```

new_string:
```html
          <li><strong>Window A</strong>：你現在這個（互動腳本、<code>sed</code>、查 log 用）</li>
```

- [ ] **Step 2: Update Step 2 details — token 安全提醒（line 135）**

Use Edit tool:

old_string:
```html
          <li>Step 4 填進 <code>.env</code> 時用 <code>nano</code>，<strong>不要</strong> <code>echo</code> 或命令列 paste（避免進 shell history）</li>
```

new_string:
```html
          <li>Step 4 用<strong>互動腳本</strong>把 secret 寫進 <code>.env</code>（值在 read prompt 輸入，<strong>不會進 shell history</strong>）</li>
```

- [ ] **Step 3: Update Step 6 troubleshoot — Invalid SECRET length（line 456）**

Use Edit tool:

old_string:
```html
          <li><strong>「Invalid LINE_CHANNEL_SECRET length」</strong> → secret 長度不是 32，回 Step 4 sed 補救</li>
```

new_string:
```html
          <li><strong>「Invalid LINE_CHANNEL_SECRET length」</strong> → secret 長度不是 32，回 Step 4 重跑互動腳本</li>
```

- [ ] **Step 4: Update Step 6 troubleshoot — Verify Timeout（line 471）**

Use Edit tool:

old_string:
```html
        <li><strong>"Timeout"</strong> → Window B 的 ngrok 斷了；切到 Window B 看 panel 還在不在；若已斷，<code>Ctrl+C</code> 再重跑 <code>ngrok http 8646</code>，<strong>注意新 URL 跟舊的不同</strong>，回 Step 4 用 sed 補救改 <code>LINE_PUBLIC_URL</code>，然後 LINE Console 也要把 webhook URL 改成新的</li>
```

new_string:
```html
        <li><strong>"Timeout"</strong> → Window B 的 ngrok 斷了；切到 Window B 看 panel 還在不在；若已斷，<code>Ctrl+C</code> 再重跑 <code>ngrok http 8646</code>，<strong>注意新 URL 跟舊的不同</strong>，回 Step 4 重跑互動腳本（會覆蓋舊 <code>LINE_PUBLIC_URL</code> 為新值），然後 LINE Console 也要把 webhook URL 改成新的</li>
```

- [ ] **Step 5: Verify cross-ref updates**

Run:

```bash
# 5a. 整支 lesson-4.html 找不到 'sed 補救'
grep -n 'sed 補救' lesson-4.html
# Expected: (no output)

# 5b. 整支 lesson-4.html 找不到 Step 4 引用 nano 的字串
grep -n 'Step 4.*nano\|nano.*Step 4' lesson-4.html
# Expected: (no output)

# 5c. Step 6 troubleshoot 出現「重跑互動腳本」
grep -c '重跑互動腳本' lesson-4.html
# Expected: 2

# 5d. line 517 對 Lesson 2 Variant A 的 cross-ref 仍在（spec scope iii 保留）
grep -n 'lesson-2.html#step-4' lesson-4.html
# Expected: line 517 around — `Variant A` 連結仍指向 Lesson 2
```

- [ ] **Step 6: Commit Task 2**

```bash
git add lesson-4.html
git commit -m "$(cat <<'EOF'
docs(lesson-4): update Step 1/2/6 cross-refs to match new Step 4 flow

四處更新：Window A 描述、token 安全提醒（不再用 nano）、
Step 6 troubleshoot 兩處 'sed 補救' → '重跑互動腳本'。
Lesson 2 Step 4 Variant A cross-ref 維持原狀（spec scope iii）。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Update `ai-runbook.md` Stage 21

**Files:**
- Modify: `ai-runbook.md:575-594`

- [ ] **Step 1: Verify current Stage 21 content**

Run: `sed -n '575,594p' ai-runbook.md`

Expected to see `Stage 21 · 開 ngrok tunnel + 寫 .env（Step 4）` followed by `Window B` and `Window A` command blocks (Window A 含 `nano ~/.hermes/.env`).

- [ ] **Step 2: Replace Stage 21 content**

Use Edit tool:

old_string:
````markdown
## Stage 21 · 開 ngrok tunnel + 寫 .env（Step 4）

Window B：

```
ngrok http 8646
# 抄 Forwarding 那行 URL
```

Window A：

```
nano ~/.hermes/.env
# 檔尾 append LINE block
awk -F= '/^LINE_/{print $1, "len="length($2)}' ~/.hermes/.env
```

預期 5 行 LINE_* 都列出、token len ~170、secret len=32。

截圖：`step-4-4-ngrok-panel.png`（URL redact）、`step-4-4-redacted-verify.png`
````

new_string:
````markdown
## Stage 21 · 開 ngrok tunnel + 一鍵寫 .env（Step 4）

Window B：

```
ngrok http 8646
# 抄 Forwarding 那行 URL
```

Window A（互動腳本，bash heredoc，default shell 是 bash / zsh 都可跑）：

```
bash <<'BASH'
set -euo pipefail
cd ~/.hermes
read -sp "Paste LINE Channel Access Token: " TOKEN </dev/tty && echo
read -sp "Paste LINE Channel Secret: "        SECRET </dev/tty && echo
read -p  "Paste ngrok HTTPS URL: "            PUBURL </dev/tty
grep -q '^LINE_CHANNEL_ACCESS_TOKEN=' .env || echo 'LINE_CHANNEL_ACCESS_TOKEN=' >> .env
grep -q '^LINE_CHANNEL_SECRET='       .env || echo 'LINE_CHANNEL_SECRET='       >> .env
grep -q '^LINE_PUBLIC_URL='           .env || echo 'LINE_PUBLIC_URL='           >> .env
grep -q '^LINE_ALLOWED_USERS='        .env || echo 'LINE_ALLOWED_USERS='        >> .env
grep -q '^LINE_ALLOW_ALL_USERS='      .env || echo 'LINE_ALLOW_ALL_USERS=true'  >> .env
sed -i "s|^LINE_CHANNEL_ACCESS_TOKEN=.*|LINE_CHANNEL_ACCESS_TOKEN=$TOKEN|" .env
sed -i "s|^LINE_CHANNEL_SECRET=.*|LINE_CHANNEL_SECRET=$SECRET|"            .env
sed -i "s|^LINE_PUBLIC_URL=.*|LINE_PUBLIC_URL=$PUBURL|"                    .env
BASH

awk -F= '/^LINE_/{print $1, "len="length($2)}' ~/.hermes/.env
```

預期 5 行 LINE_* 都列出、token len ~170、secret len=32。

截圖：`step-4-4-ngrok-panel.png`（URL redact）、`step-4-4-redacted-verify.png`
````

- [ ] **Step 3: Verify Stage 21 update**

Run:

```bash
# 3a. Stage 21 標題改成「一鍵寫」
grep -n '## Stage 21' ai-runbook.md
# Expected: line 575 with "一鍵寫" in title

# 3b. 找不到 nano ~/.hermes/.env
grep -n 'nano ~/.hermes' ai-runbook.md
# Expected: (no output)

# 3c. 含 bash heredoc 標記
grep -n "bash <<'BASH'" ai-runbook.md
# Expected: 1 line (Stage 21)
```

- [ ] **Step 4: Commit Task 3**

```bash
git add ai-runbook.md
git commit -m "$(cat <<'EOF'
docs(runbook): Stage 21 align with new Lesson 4 Step 4 heredoc flow

替換 'nano + 檔尾 append' 為 bash <<'BASH' ... BASH 互動腳本，
AI 工具版 runbook 跟主教材 lesson-4.html Step 4 對齊。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Local manual smoke test

**Files:** (read-only — manual verification)

- [ ] **Step 1: Open `lesson-4.html` in browser**

Run: `xdg-open lesson-4.html`

(若 xdg-open 不可用：手動雙擊或拖到瀏覽器；file:// URL 即可，wizard.js / Pico CSS 從 CDN 載入。)

- [ ] **Step 2: Navigate to Step 4 and visually inspect**

In the browser:
1. 在 URL 後加 `#step-4` 或用 wizard 「下一步」按到 Step 4
2. 確認頁面顯示 `Step 4 / 7 · 開 ngrok tunnel + 一鍵寫 .env LINE block`
3. 確認看到 3 個 `<h3>` sub-step：
   - "1. 第二個 shell（Window B）跑 ngrok"
   - "2. 回 Window A 跑互動腳本寫 .env"
   - "3. Redacted verify（不要 cat .env）"
4. 確認 3 個 `<pre data-copy>` 區塊都有「Copy」按鈕（wizard.js 自動注入）
5. 點 Sub-step 2 的 Copy 按鈕 → paste 到 text editor → 確認複製出來是 12 行 bash 腳本（含 `bash <<'BASH'` 開頭、`BASH` 結尾）

- [ ] **Step 3: Interactive smoke test in zsh / bash**

Run（在你 default shell；user 環境是 zsh）：

```bash
zsh temp/lesson-4-step-4-test.sh
```

依序輸入三個值（隨便打）：
1. Token: 任意 80+ 字元
2. Secret: 任意 32 字元
3. URL: `https://test.example.com`

確認看到輸出：
- 三個 prompt 依序出現（token / secret 不回顯、URL 回顯）
- 結尾 awk 列出 5 個 `LINE_* len=N`，長度跟你輸入對得上
- `LINE_ALLOWED_USERS len=0`
- `LINE_ALLOW_ALL_USERS len=4`

If 互動測失敗：返回 Task 1 Step 2 重檢 HTML 互動腳本內容；確認跟 `temp/lesson-4-step-4-test.sh` 裡的 `bash <<'BASH' ... BASH` 區塊邏輯一致。

- [ ] **Step 4: (Optional) Test in bash explicitly**

Run: `bash temp/lesson-4-step-4-test.sh`

預期一樣通過（heredoc wrapper 強制 fork bash，原本就是 bash 沒差）。

- [ ] **Step 5: No commit needed (manual verification only)**

若 Task 4 任何 step 失敗，回上面對應 Task 修正後再來。Task 4 本身不產生 diff。

---

## Task 5: Final acceptance check + push to deploy

**Files:** (read-only — final verification)

- [ ] **Step 1: Run all 8 spec acceptance checks**

Run each command in sequence, confirm all pass:

```bash
echo "=== 1. Step 4 只有 3 個 <h3> sub-step ==="
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -c '<h3>'
# Expected: 3

echo "=== 2. Step 4 內找不到 'nano' 字串 ==="
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -n 'nano'
# Expected: (no output)

echo "=== 3. Step 4 內找不到 'Variant A' / 'Variant B' ==="
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -nE 'Variant [AB]'
# Expected: (no output)

echo "=== 4. 互動腳本以 <pre data-copy> 標記 ==="
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -c '<pre data-copy>'
# Expected: 3 (ngrok / heredoc / awk)

echo "=== 5. 互動腳本含 'bash <<' + 'set -euo pipefail' + '</dev/tty' 三元素 ==="
awk '/data-step="4"/,/data-step="5"/' lesson-4.html | grep -E "bash &lt;&lt;'BASH'|set -euo pipefail|&lt;/dev/tty" | wc -l
# Expected: >= 5 (1 bash<<, 1 set, 3 </dev/tty lines)

echo "=== 6. Step 6 內部 cross-ref 已改 ==="
grep -c '重跑互動腳本' lesson-4.html
# Expected: 2

echo "=== 7. ai-runbook.md Stage 21 已對齊 ==="
grep -n "## Stage 21.*一鍵寫" ai-runbook.md && grep -n "bash <<'BASH'" ai-runbook.md
# Expected: Stage 21 title with 一鍵寫，且 bash <<'BASH' 出現於 ai-runbook.md
```

- [ ] **Step 2: Confirm git status is clean**

```bash
git status
```

Expected: working tree clean，no untracked files except possibly `temp/*` (預期保留)。

- [ ] **Step 3: Confirm last 3 commits**

```bash
git log --oneline -5
```

Expected: 看到三個新 commit（依序 Task 3 → Task 2 → Task 1），以及之前的 spec commit `6c60bac`。

- [ ] **Step 4: Push to deploy（user 確認後手動執行；不要 agent 自動 push）**

⚠️ 這一步要 user 明確同意。Push 後 GitHub Pages 約 30 秒到 1 分鐘自動部署到 `https://lewsiafat.github.io/hermes-windows-course/lesson-4.html`。

```bash
git push
```

- [ ] **Step 5: Post-deploy 線上驗證**

部署後在瀏覽器開：

`https://lewsiafat.github.io/hermes-windows-course/lesson-4.html#step-4`

確認：
- 頁面更新到新 Step 4 結構
- Copy 按鈕在 production 也注入了
- 之後課堂 dogfood 時跑互動腳本（spec 驗收第 8 條）— 留給課堂 live 驗證

---

## Notes for the implementing engineer / subagent

- **沒有 build step**：改完 HTML / Markdown 直接 commit，不要找 `npm install` / `npm test` / `make`，這些都不存在。
- **沒有單元測試**：verification 全部是 grep + 瀏覽器目視 + interactive smoke。每個 Task 結尾的 grep 檢查是「等同 test 的事」。
- **HTML 實體脫逸不能漏**：bash heredoc 含 `<<`、`</dev/tty`、`&&`、`>>` 都要在 `<pre><code>` 內寫 `&lt;&lt;`、`&lt;/dev/tty`、`&amp;&amp;`、`&gt;&gt;`。Task 1 Step 2 的 new_string 已預先 escape 好，**照原樣 paste 進 Edit tool 即可，不要再轉換**。
- **不要動 Lesson 1 Step 7 / Lesson 2 Step 4**：spec scope (iii) 明示，這次不一致化，留給課堂 dogfood 後決定。
- **不要動 `lesson-4.html:517` 那條 Lesson 2 cross-ref**：那是 USER_ID vs UID readonly built-in 的教育性引用，跟 Lesson 2 Variant A 原本就在用同模式；Lesson 2 不變，連結維持。
