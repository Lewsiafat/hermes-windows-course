# Lesson 3 Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重寫 `lesson-3.html` 為「對話式 cron + 對話式造 skill」的 6 個 section 教材（spec `2026-05-14-lesson-3-rework-design.md`），並同步更新 4 份 satellite 檔讓 cross-reference 不漏接。

**Architecture:** 純靜態 HTML rewrite，沒有 build / test framework。verification = 瀏覽器手動 walk-through + dogfood 5 條 (spec §9)。每個 Task 對應一個 commit。`lesson-3.html` 由 6 個 section 組成（data-step="0".."5"），data-total-steps 從 6 降為 5。Step 1 內容沿用、Step 0 / 2 / 3 / 4 / 5 重寫、原 data-step="6" 刪除。

**Tech Stack:** HTML5 + Pico CSS (CDN) + 共用 `wizard.js`（不動）。教材 zh-Hant。

---

## File Structure

| 檔案 | 動作 | 責任 |
|---|---|---|
| `lesson-3.html` | rewrite（保留 Step 1） | 主教材，6 個 `<section data-step="N">` |
| `lesson-2.html` | 1 行 patch | Step 7 預告區指向 lesson-3 的描述要對齊新內容 |
| `README.md` | 1 行 patch | 結構區的 lesson-3 描述要對齊新內容 |
| `CLAUDE.md` | section patch | 跨步驟引用區：移除 TRAP 條目、改寫 Step 0 fallback 描述、新增 Step 2 cron prompt 守護條目 |
| `pre-class-checklist.md` | section rewrite | Lesson 3 必檢項 5 條對齊新教材依賴 |
| `ai-runbook.md` | 2 section rewrite | Stage 25–31（Part 1 Lesson 3 章）+ Check 13–16（Part 2 quick smoke） |
| `wizard.js` / `style.css` | 不動 | 已參數化，從 `<body data-*>` 讀 |

---

## Task 0: Dogfood 必驗 5 條（**user-run，BLOCKS Task 1+**）

依照 spec §9 五條，**動 lesson-3.html 之前**必須驗。

**Files:** 無（runtime 行為驗證）

- [ ] **Dogfood 1：cron 對話式設定真的能跑**

在 hermes 對話內貼：

```
幫我設一個 cron job，2 分鐘後跑一次，內容：
- 台北今日天氣
- 今天台北會下雨嗎
- 昨天 SP500 收盤指數
把整理後的結果推到我的 Telegram。
```

驗證：
- `~/.hermes/cron.yaml` 真的被 hermes 寫入（`cat ~/.hermes/cron.yaml` 看內容）
- 2 分鐘後 Telegram 真的收到推送

**結果記到本檔末段「Dogfood Results」§Dogfood 1。**

- [ ] **Dogfood 2：cron 三條資訊 hermes 都拿得到**

從 Dogfood 1 的 Telegram 訊息看：
- ✓ 台北今日天氣（有溫度/天氣狀態）
- ✓ 今日降雨預報（有「下雨/不下雨」或概率）
- ✓ 昨天 SP500 收盤（有具體數字）

**結果記到末段「Dogfood Results」§Dogfood 2。若 SP500 拿不到（例：缺 API key 或 hermes 沒裝財經 skill），記下實際抓到什麼、之後 Step 2 教材的 cron prompt 要改用拿得到的範例（保持「多資訊一次組合」的精神）。**

- [ ] **Dogfood 3：對話式裝 skill-creator 真的能跑**

在 hermes 對話內貼：

```
幫我裝這個 skill：https://github.com/anthropics/skills/tree/main/skills/skill-creator
```

驗證：
- hermes 回覆「裝好了」之類
- `ls ~/.hermes/skills/` 看到 skill-creator 落地（可能在 `~/.hermes/skills/meta/skill-creator/` 或其他類別下，記下實際路徑）
- `hermes -z "/skills list --source local"` 看到 `skill-creator`

**結果記到末段「Dogfood Results」§Dogfood 3，包含實際落地路徑。**

- [ ] **Dogfood 4：skill-creator 訪談 UX**

在 hermes 對話內貼：

```
我想用 skill-creator 造一個 skill：每天早上推一條英文俚語
```

（或學員自己想的主題）

記錄：
- 訪談總共問幾個問題、問題順序、實際措辭
- 「eval / benchmarks / test cases」相關問題的實際措辭（教材要在這裡告訴學員「直接回不用」）
- 對於「不要 eval」之類的拒絕回應，skill-creator 是否真的能順利跳過

**結果記到末段「Dogfood Results」§Dogfood 4，包含實際對話樣貌。教材寫到「skill-creator 會問 4 個基本問題」之類字眼時要根據這條結果校正數字與順序。**

- [ ] **Dogfood 5：造出來的 skill 重啟後可從 `/<name>` 跑**

接續 Dogfood 4：

1. 等 skill-creator 寫完 SKILL.md（記下落地路徑 `~/.hermes/skills/<category>/<name>/SKILL.md`）
2. 重啟 gateway：`sudo $(which hermes) gateway restart --system`
3. CLI 跑 `/skills list --source local`，確認看到 `<name>`
4. CLI 跑 `/<name>`，看 skill 真的跑起來
5. （加碼）從 Telegram 跑 `/<name>`，看跨 channel 也認

**結果記到末段「Dogfood Results」§Dogfood 5。若 skill 跑起來但行為不太對，記下實際輸出 → 影響 Step 4「我卡住了」`<details>` 文案。**

- [ ] **Dogfood 6：把結果回寫本檔末段「Dogfood Results」**

打開 `docs/superpowers/plans/2026-05-14-lesson-3-rework.md`，找到末段「## Dogfood Results」section，把 1–5 條結果寫進去。**Task 1 開始前這份必須有內容。**

---

## Task 1: Rewrite `lesson-3.html`（整支重寫）

**Files:**
- Modify: `lesson-3.html`（整支）

**Background：** 原檔 504 行，data-step="0".."6" 共 7 section。新檔目標 data-step="0".."5" 共 6 section（少 1）。Step 1（context 管理）內容沿用、只改 h2 編號。其他 Step 全部重寫。

- [ ] **Step 1.1：改 `<body>` 的 `data-total-steps`**

```
舊：<body data-total-steps="6" data-storage-key="hermes-lesson3-step">
新：<body data-total-steps="5" data-storage-key="hermes-lesson3-step">
```

`data-storage-key` 不動（保持原進度 key，學員不會被退回 Step 0）。

- [ ] **Step 1.2：改 `<title>` 與 h1（無需改 h1 文字，僅確認）**

確認 `<title>Hermes Lesson 3 · 日常使用</title>` 與 `<h1>Lesson 3 · hermes 日常使用</h1>` 保留。subtitle `<p>把 hermes 變成你每天會用的助手，45–55 分鐘</p>` 也保留。

- [ ] **Step 1.3：重寫 `<section data-step="0">`（前言）**

整段替換為：

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
        <li><strong>Step 2</strong>：cron 排程 — 對 hermes 講一句話，叫它每天 7:00 自動推一份摘要給你</li>
        <li><strong>Step 3</strong>：探索 hermes 內建 skills + 對話式裝 skill-creator</li>
        <li><strong>Step 4</strong>：用 skill-creator 訪談式造你自己的 skill</li>
        <li><strong>Step 5</strong>：收尾 + 4 個加碼（把你的 skill 串到 cron、跨 channel、改寫、看 SKILL.md）</li>
      </ol>

      <h3>★ 現在就想好一個 daily skill 主題</h3>
      <p>Step 4 你要拿著一個主題去訪談 skill-creator。<strong>請現在就先想一個</strong>——是你每天會用、用得起來的那種。給幾個啟發例子：</p>
      <ul>
        <li>每天早上推一條英文俚語</li>
        <li>每天晚上 22:00 問我四個問題、寫成日記檔</li>
        <li>下班前提醒我喝水、未達標就唸我</li>
        <li>整理今日台北、東京、矽谷三個城市的天氣 + 重大新聞</li>
        <li>每週日早上把上週開過的 GitHub issue 整理成摘要</li>
      </ul>
      <p>不一定要照抄這幾個，看著想自己的。<strong>挑一個就好</strong>，Step 4 用得到。想不出來也沒關係——Step 4 教材會再提示一次。</p>

      <h3>4 個 checkpoints</h3>
      <ol>
        <li>會用 <code>/new</code> 切話題（Telegram 真的清掉 context）</li>
        <li>Telegram 收到 cron 推送的 ⟨台北天氣 + 降雨預報 + SP500⟩</li>
        <li><code>/skills list --source local</code> 看到 <code>skill-creator</code></li>
        <li>自己發想的 skill 從 <code>/&lt;your-skill-name&gt;</code> 真的跑起來</li>
      </ol>

      <details>
        <summary>必備：先做完 Lesson 1 + Lesson 2</summary>
        <p>還沒做過？先回 <a href="index.html">Lesson 1（安裝 hermes）</a> 或 <a href="lesson-2.html">Lesson 2（接 Telegram）</a>。Lesson 3 假設你的 Telegram bot 仍在跑、<code>hermes gateway</code> 也仍在跑、教學場景的 hermes model 是付費的（free model 對話式設定 cron / 裝 skill 可能不會主動推理出該做的動作，得 fallback 到 slash command 手動跑）。</p>
        <p>不依賴 Lesson 4（LINE）— 想學 LINE 整合可平行另開 <a href="lesson-4.html">Lesson 4</a>，先後順序隨便。</p>
      </details>
    </section>
```

**為什麼這樣寫：**
- 跨 lesson fallback link 兩條保留（`index.html` + `lesson-2.html`）——CLAUDE.md 跨步驟引用區要求
- ★ 「現在就想好一個 daily skill 主題」是新引導，spec §5 Step 0 核心
- 「教學場景假設付費 model」call out 寫在 fallback `<details>`，不擋主流程

- [ ] **Step 1.4：改 `<section data-step="1">` h2 編號**

整段 `<section data-step="1" hidden>..</section>` 保留**所有內容**（context 管理、實作步驟、`<details>` cheatsheet），只改 h2 那行：

```
舊：<h2>Step 1 / 6 · context 管理：聊太久會變慢</h2>
新：<h2>Step 1 / 5 · context 管理：聊太久會變慢</h2>
```

其餘 50 行不動。

- [ ] **Step 1.5：重寫 `<section data-step="2">`（cron 對話式）**

整段 `<section data-step="2" hidden>..</section>` 替換為：

```html
    <section class="step" data-step="2" hidden>
      <header>
        <hgroup>
          <h2>Step 2 / 5 · cron 排程：對話式 hands-on</h2>
          <p>~7–10 分鐘</p>
        </hgroup>
      </header>

      <p>cron 是 hermes 內建的排程能力，<strong>用對話講要它幾點跑什麼，hermes 自己會把設定寫到 <code>~/.hermes/cron.yaml</code></strong>。這堂用「2 分鐘後一次性測試」先驗一次，看到 Telegram 真的收到，再改成永久排程。</p>

      <h3>1. 對 hermes 講「2 分鐘後跑這個」</h3>
      <p>在你的 hermes CLI（或 Telegram bot）貼下面這段：</p>
      <pre data-copy><code>幫我設一個 cron job，2 分鐘後跑一次，內容：
- 台北今日天氣
- 今天台北會下雨嗎
- 昨天 SP500 收盤指數
把整理後的結果推到我的 Telegram。</code></pre>

      <p>hermes 應該會：</p>
      <ol>
        <li>幫你算出 2 分鐘後的 cron 表達式</li>
        <li>把設定寫進 <code>~/.hermes/cron.yaml</code></li>
        <li>重新載入 gateway（或叫你重啟）</li>
        <li>回覆「已設定，2 分鐘後會自動跑」之類</li>
      </ol>

      <h3>2. 等 2 分鐘</h3>
      <p>等下發送時，順便讀一下「cron 還能做什麼」：</p>
      <ul>
        <li>每天早上 7:00 推今日重點任務（你 Step 4 造的 skill 就可以串進來）</li>
        <li>每週日整理本週開過的 issue 變成 weekly review</li>
        <li>每月 1 號自動列上個月所有日記摘要</li>
      </ul>
      <p>每一條都是「對 hermes 講一句」就能設定，不用手寫 yaml。</p>

      <h3>3. Telegram 收到了嗎</h3>
      <p>2 分鐘到時，看你的 Telegram bot。應該會推一條訊息，內含三件事：</p>
      <ul>
        <li>台北今日天氣（溫度 / 狀態）</li>
        <li>今天會不會下雨</li>
        <li>昨天 SP500 收盤指數</li>
      </ul>

      <p>✓ Telegram 收到 ⟨天氣 + 降雨 + SP500⟩ 推送 → <strong>checkpoint 2 完成</strong>。</p>

      <h3>4. 改成永久排程：每天 7:00 自動跑</h3>
      <p>對 hermes 再講一句：</p>
      <pre data-copy><code>把剛剛那個 cron 改成每天早上 7:00 跑，永久排程。</code></pre>

      <p>hermes 會更新 <code>~/.hermes/cron.yaml</code>。明天 7:00 你的 Telegram bot 就會主動傳這份摘要過來。</p>

      <h3>5. 驗證設定真的存在</h3>
      <p>對 hermes 講：</p>
      <pre data-copy><code>列出我目前的 cron 排程。</code></pre>

      <p>應該看到剛剛設的 daily 7:00 job。也可以 WSL 直接看：</p>
      <pre data-copy><code>cat ~/.hermes/cron.yaml</code></pre>

      <details>
        <summary>🚨 我卡住了</summary>
        <h4>2 分鐘到了 Telegram 沒收到</h4>
        <p>多半是 gateway 沒拿到新 cron。處置：</p>
        <ol>
          <li><code>sudo $(which hermes) gateway restart --system</code> 重啟</li>
          <li><code>tail -n 50 ~/.hermes/logs/gateway.log</code> 看有沒有錯誤</li>
          <li>確認 <code>~/.hermes/cron.yaml</code> 真的有內容（<code>cat ~/.hermes/cron.yaml</code>）</li>
        </ol>

        <h4>hermes 沒主動寫 cron.yaml</h4>
        <p>免費 model 推理力可能不足，沒推出該寫檔。處置：對它講更明確「<strong>請編輯 <code>~/.hermes/cron.yaml</code>，加入剛才那條 cron job</strong>」，把 file path 直接點出來。</p>

        <h4>收到的內容很奇怪（缺資料、數字錯）</h4>
        <p>那是 hermes 的 web / tool use 議題、不是 cron 議題。可以接受、或對 hermes 講「再跑一次剛才那個 cron 內容，這次補上 SP500 的數字」。</p>
      </details>
    </section>
```

**為什麼這樣寫：**
- cron prompt（台北天氣 + 降雨 + SP500）是 CLAUDE.md 守護條目，不要簡化
- 「等 2 分鐘」section 是 Lesson 1 「等下載」教學節奏的延續
- 三個卡住處置都對應 spec §5 Step 2 末段

- [ ] **Step 1.6：重寫 `<section data-step="3">`（探索 hermes + 裝 skill-creator）**

整段 `<section data-step="3" hidden>..</section>` 替換為：

```html
    <section class="step" data-step="3" hidden>
      <header>
        <hgroup>
          <h2>Step 3 / 5 · 探索 hermes + 裝 skill-creator</h2>
          <p>~5–8 分鐘</p>
        </hgroup>
      </header>

      <h3>1. 看 hermes 內建了什麼 skill</h3>
      <p>每個 skill 是 hermes 的一塊「能力包」——剛才 Step 2 cron 拿到天氣、降雨、SP500，背後就是 hermes 用某些 skill / tool 抓的。</p>

      <p>在 hermes CLI 或 Telegram bot 跑：</p>
      <pre data-copy><code>/skills list</code></pre>

      <p>你會看到一大堆 bundled skill，分成幾個類別（productivity / research / creative / autonomous-ai-agents...）。輸出多會分頁，按 <code>continue</code> 或 <code>n</code> 看下一頁。</p>

      <p>挑一個試玩：</p>
      <pre data-copy><code>/plan 寫一份本週讀書計畫</code></pre>

      <p>bot 應該套用內建的 <code>plan</code> skill 幫你寫出結構化計畫。</p>

      <h3>2. 但內建的可能不夠你想要的</h3>
      <p>hermes 內建的 skill 是「通用」設計。<strong>你 Step 0 想的那個主題，內建一定沒有</strong>——因為那是你的個人 daily 需求。</p>

      <p>解法：用 <a href="https://github.com/anthropics/skills/tree/main/skills/skill-creator" target="_blank" rel="noopener">skill-creator</a>（Anthropic 官方的 meta-skill：一個專門幫你造 skill 的 skill）訪談式幫你生 SKILL.md。</p>

      <h3>3. 對話式裝 skill-creator</h3>
      <p>對 hermes 講：</p>
      <pre data-copy><code>幫我裝這個 skill：https://github.com/anthropics/skills/tree/main/skills/skill-creator</code></pre>

      <p>hermes 應該會：</p>
      <ol>
        <li>抓 URL、拉 SKILL.md 跟附帶資產</li>
        <li>放到 <code>~/.hermes/skills/</code> 對應目錄（會自動歸類，例：<code>~/.hermes/skills/meta/skill-creator/</code>）</li>
        <li>回覆「裝好了」</li>
      </ol>

      <h3>4. 確認裝好了</h3>
      <pre data-copy><code>/skills list --source local</code></pre>

      <p>清單應該看到 <code>skill-creator</code>。</p>

      <p>✓ <code>/skills list --source local</code> 列出 <code>skill-creator</code> → <strong>checkpoint 3 完成</strong>。下一步用它造你的 skill。</p>

      <details>
        <summary>🚨 我卡住了</summary>
        <h4>hermes 講「幫我裝」之後沒主動動作</h4>
        <p>免費 model 可能推理不出該執行什麼。fallback 直接給 slash command：</p>
        <pre data-copy><code>/skills install https://github.com/anthropics/skills/tree/main/skills/skill-creator</code></pre>

        <h4><code>/skills list --source local</code> 還是沒看到</h4>
        <p>可能 gateway / CLI 還沒重載入 skill 清單：</p>
        <ol>
          <li>離開 hermes CLI（<code>/exit</code>），重新 <code>hermes</code> 進來</li>
          <li>或 <code>sudo $(which hermes) gateway restart --system</code> 重啟</li>
          <li>再跑一次 <code>/skills list --source local</code></li>
        </ol>

        <h4>抓 URL 失敗（網路 / 上游下架）</h4>
        <p>用 git 直接 clone：</p>
        <pre data-copy><code>mkdir -p ~/.hermes/skills/meta &amp;&amp; cd ~/.hermes/skills/meta &amp;&amp; git clone https://github.com/anthropics/skills.git tmp-skills &amp;&amp; cp -r tmp-skills/skills/skill-creator . &amp;&amp; rm -rf tmp-skills</code></pre>
        <p>然後重啟 CLI / gateway 即可。</p>
      </details>
    </section>
```

**為什麼這樣寫：**
- spec §5 Step 3 把「探索 hermes」+「裝 skill-creator」合進一個 step（Structure B）
- fallback `/skills install <url>` 為 free model 安全網
- git clone fallback 為網路 / 上游不可達場景

- [ ] **Step 1.7：重寫 `<section data-step="4">`（用 skill-creator 造 skill）**

整段 `<section data-step="4" hidden>..</section>` 替換為：

```html
    <section class="step" data-step="4" hidden>
      <header>
        <hgroup>
          <h2>Step 4 / 5 · 用 skill-creator 對話造你的 skill</h2>
          <p>~15–20 分鐘（★ 核心 hands-on）</p>
        </hgroup>
      </header>

      <p>skill-creator 是訪談式的——你講主題、它問你細節、它幫你寫 <code>SKILL.md</code>。你 Step 0 想的那個主題，現在拿出來用。</p>

      <h3>1. 開始造</h3>
      <p>對 hermes 講（或直接 <code>/skill-creator</code>）：</p>
      <pre data-copy><code>我想用 skill-creator 造一個 skill：⟨你的主題⟩</code></pre>

      <p>⟨你的主題⟩ 替換成你 Step 0 想的那個。例：</p>
      <ul>
        <li><em>每天早上推一條英文俚語</em></li>
        <li><em>每天 22:00 問我四個問題寫成日記</em></li>
        <li><em>下班前提醒我喝水</em></li>
      </ul>

      <p>若 Step 0 還沒想好，現在挑一個用——例如「每天早上推一條英文俚語」是最快上手的，因為不用接你個人資料。</p>

      <h3>2. 回答 skill-creator 的訪談問題</h3>
      <p>skill-creator 會問幾個基本問題（例：是什麼 / 何時觸發 / 輸出格式 / 要不要 evaluation）。<strong>用你自己的話回答即可</strong>，沒有標準答案。</p>

      <h3>3. ★ 看到「evaluation / benchmarks / test cases」就講「不用」</h3>
      <p>skill-creator 中途會問：</p>
      <ul>
        <li>「要不要設定 evaluation？」</li>
        <li>「要不要跑 benchmarks 看 skill 表現？」</li>
        <li>「要不要寫 test cases？」</li>
      </ul>

      <p>直接回答：</p>
      <pre data-copy><code>不用 eval，只 vibe 就好。</code></pre>

      <p>或英文：</p>
      <pre data-copy><code>skip evaluation</code></pre>

      <p>這幾件事是給工程師寫 production skill 用的，你日常用不到。skill-creator 會跳過繼續訪談。</p>

      <h3>4. skill-creator 寫完 SKILL.md</h3>
      <p>它會告訴你 SKILL.md 寫到哪了，例如：</p>
      <pre><code>✓ Skill written to ~/.hermes/skills/productivity/⟨your-skill-name⟩/SKILL.md
Restart hermes to use it.</code></pre>

      <h3>5. 重啟 gateway 讓新 skill 生效</h3>
      <p>對 hermes 講：</p>
      <pre data-copy><code>重啟 gateway 讓新 skill 生效。</code></pre>

      <p>或直接 WSL 跑：</p>
      <pre data-copy><code>sudo $(which hermes) gateway restart --system</code></pre>

      <h3>6. 用你造的 skill</h3>
      <p>在 hermes CLI 或 Telegram bot 跑：</p>
      <pre data-copy><code>/&lt;your-skill-name&gt;</code></pre>

      <p>例如剛才造「每天早上推一條英文俚語」，名字可能是 <code>/daily-slang</code> 或 <code>/morning-slang</code>（看 skill-creator 取了什麼）。打 <code>/skills list --source local</code> 可以看到實際名字。</p>

      <p>✓ 自己造的 skill 跑起來、輸出符合預期 → <strong>checkpoint 4 完成</strong>。<strong>Lesson 3 全部 4 checkpoints 達標。</strong></p>

      <details>
        <summary>🚨 我卡住了</summary>
        <h4>skill-creator 問太多細節，我不知道怎麼回</h4>
        <p>直接講：</p>
        <pre data-copy><code>就用簡單版本，細節幫我預設。</code></pre>
        <p>skill-creator 會自己補 reasonable defaults，你可以之後（Step 5 加碼 C）再改。</p>

        <h4>造完 <code>/&lt;your-skill-name&gt;</code> 認不出來</h4>
        <ol>
          <li>確認 gateway 重啟成功（<code>sudo $(which hermes) gateway status --system</code> 看 running）</li>
          <li><code>/skills list --source local</code> 看實際名字（可能跟你想的不一樣）</li>
          <li>若清單也沒有：<code>ls ~/.hermes/skills/*/</code> 直接看資料夾是否落地</li>
        </ol>

        <h4>跑起來但行為不對</h4>
        <p>對 hermes 講：</p>
        <pre data-copy><code>用 skill-creator 改寫剛才那個 skill，補上 ⟨缺失行為⟩。</code></pre>
        <p>這就是 Step 5 加碼 C 的玩法——你可以反覆迭代到順手為止。</p>
      </details>
    </section>
```

**為什麼這樣寫：**
- spec §5 Step 4 核心 hands-on 完整覆蓋
- ★ 「不要 eval」逃生口是這 step 的關鍵教學點
- 加碼 C 伏筆放在「我卡住了」最後一段（學員會自然連到）

- [ ] **Step 1.8：重寫 `<section data-step="5">`（完成 + 加碼）**

整段 `<section data-step="5" hidden>..</section>` 替換為：

```html
    <section class="step" data-step="5" hidden>
      <header>
        <hgroup>
          <h2>Step 5 / 5 · 完成 + 加碼</h2>
          <p>~3 分鐘</p>
        </hgroup>
      </header>

      <p>恭喜，4 個 checkpoints 都完成：</p>
      <ol>
        <li>✓ 會用 <code>/new</code> 切話題（Telegram 真的清掉 context）</li>
        <li>✓ Telegram 收到 cron 推送的 ⟨台北天氣 + 降雨預報 + SP500⟩</li>
        <li>✓ <code>/skills list --source local</code> 看到 <code>skill-creator</code></li>
        <li>✓ 自己發想的 skill 從 <code>/&lt;your-skill-name&gt;</code> 真的跑起來</li>
      </ol>

      <h3>建議下一步</h3>
      <ul>
        <li>把這頁加書籤</li>
        <li>真的把你造的 skill 用一週、看哪裡要改</li>
        <li>從加碼 A 開始：把它串到 cron 變成每天自動跑（Step 2 + Step 4 兩個能力組合）</li>
      </ul>

      <details>
        <summary>加碼 A · 用 cron 跑你的 skill（串起 Step 2 + Step 4）</summary>
        <p>Step 2 設了「每天 7:00 推 ⟨天氣+降雨+SP500⟩」，Step 4 造了 <code>/&lt;your-skill&gt;</code>。現在把它們串起來：</p>

        <p>對 hermes 講：</p>
        <pre data-copy><code>把剛才造的 ⟨your-skill-name⟩ 串到 cron，每天早上 7:00 自動跑、結果推到 Telegram。</code></pre>

        <p>hermes 會更新 <code>~/.hermes/cron.yaml</code> 加新 job。明天 7:00 看 Telegram 應該主動推 skill 輸出。</p>
      </details>

      <details>
        <summary>加碼 B · Telegram 觸發你造的 skill</summary>
        <p>Step 4 你已經重啟過 gateway，所以從手機 Telegram bot 直接打：</p>
        <pre data-copy><code>/&lt;your-skill-name&gt;</code></pre>
        <p>應該跟 CLI 端一樣會跑起來。確認 skill 真的跨 channel 共用——CLI 寫一次、Telegram 就有、Lesson 4 接的 LINE 也會有。</p>
      </details>

      <details>
        <summary>加碼 C · 用 skill-creator 改寫已造的 skill</summary>
        <p>skill 用一週之後你大概知道哪裡卡。對 hermes 講：</p>
        <pre data-copy><code>用 skill-creator 改寫 ⟨your-skill-name⟩，加上 ⟨新行為⟩。</code></pre>

        <p>例：</p>
        <ul>
          <li>「加上 ⟨輸出時順便存到 <code>~/notes/</code> 對應檔案⟩」</li>
          <li>「加上 ⟨先檢查今天有沒有跑過，重複不再推⟩」</li>
          <li>「加上 ⟨輸出格式改成更短 / 更詳細⟩」</li>
        </ul>

        <p>skill-creator 會訪談一次（比第一次短）、改寫 SKILL.md、提示重啟。<strong>對話式迭代開發</strong>就是這個流程。</p>
      </details>

      <details>
        <summary>加碼 D · 看你的 SKILL.md 長怎樣</summary>
        <p>skill 其實是一份純文字檔。對好奇心強的學員——打開來看一眼：</p>
        <pre data-copy><code>cat ~/.hermes/skills/*/⟨your-skill-name⟩/SKILL.md</code></pre>

        <p>你會看到開頭是一段 YAML frontmatter（<code>---</code> 包起來、含 <code>name</code> / <code>description</code> 等欄位），下面是 markdown 寫的 <code>## When to Use</code> / <code>## Procedure</code> / <code>## Pitfalls</code>。</p>

        <p><strong>不需要會寫，只是讓你看一眼「原來只是文字檔」</strong>。未來想自己手寫 skill（或想學進階 skill 寫法、Python helper），這就是 entry point——可去 <a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a> 看別人寫的當範本，或等 Lesson 5（待開）。</p>
      </details>

      <h3>下次預告</h3>
      <ul>
        <li><strong><a href="lesson-4.html">Lesson 4 · LINE gateway 設定</a></strong>：把同一支 hermes 也接到 LINE，跟 Telegram 平行（已上線）。你 Step 4 造的 skill 直接在 LINE 也有，不用再寫一份。</li>
        <li>Lesson 5（待開）：進階 skill 寫法、分享 skill 到 <a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a>、用 <code>scripts/</code> 在 skill 裡放 Python helper</li>
      </ul>

      <p><em>到這邊就是 Lesson 3 全部內容。下次見。</em></p>
    </section>
```

**為什麼這樣寫：**
- 4 個加碼順序：A（串 cron） → B（Telegram） → C（改寫） → D（看 SKILL.md）—— spec §5 Step 5 順序
- 加碼 D 已沒有 TRAP `<details>`（原 daily-journal config trap 砍光）
- 「下次預告」第一條連 lesson-4（已上線），第二條提 Lesson 5（待開）
- 加碼 C 「對話式迭代開發」字眼故意保留

- [ ] **Step 1.9：刪除原 `<section data-step="6">`**

整段 `<section class="step" data-step="6" hidden>..</section>` 完整移除（含 `<header>` 到 `</section>` 全部，到目前舊版本約 140 行）。

刪除後 `<main>` 內部從 `<section data-step="5">` 直接接 `<nav id="step-nav">`。

- [ ] **Step 1.10：本地預覽驗證**

```bash
xdg-open lesson-3.html
```

在瀏覽器：
- [ ] 開啟時顯示「前言」進度文字、Step 0 內容
- [ ] 5 個下一步 →，最後一頁顯示「Step 5 / 5」
- [ ] 任何 `<pre data-copy>` 都有 Copy 按鈕
- [ ] devtools console 無紅錯（特別是 `data-total-steps` 讀對沒）
- [ ] 4 個 checkpoints 在 Step 0 與 Step 5 文字一致

若進度文字錯（例如最後一頁顯示「Step 5 / 6」）→ 檢查 `<body data-total-steps="5">` 是否真的改到、檢查每個 `<section>` 的 h2 編號是否都改成「/ 5」。

- [ ] **Step 1.11：Commit lesson-3.html rewrite**

```bash
git add lesson-3.html
git commit -m "$(cat <<'EOF'
feat(lesson-3): rewrite as conversational cron + skill-creator (6 sections)

完整重寫 Lesson 3：
- 砍掉 daily-journal SKILL.md 手寫範例 + 加碼 D yaml 改寫教學
- cron 升級為正課 Step 2（對話式設定）
- Step 3 改為探索 hermes + 對話式裝 skill-creator
- Step 4 改為用 skill-creator 訪談式造 skill（學員自選主題）
- Step 5 收尾 + 4 個加碼（A 串 cron、B 跨 channel、C 對話改寫、D 看 SKILL.md）
- data-total-steps 6 → 5

對應 spec docs/superpowers/specs/2026-05-14-lesson-3-rework-design.md

EOF
)"
```

---

## Task 2: Update `lesson-2.html` Step 7 forecast description

**Files:**
- Modify: `lesson-2.html:461`

- [ ] **Step 2.1：改 Lesson 3 預告描述**

```
舊：<li><a href="lesson-3.html"><strong>Lesson 3 · hermes 日常使用入門</strong></a>：context 管理、skills（寫一個訪談式日記 skill）、cron 與 background sessions 加碼</li>
新：<li><a href="lesson-3.html"><strong>Lesson 3 · hermes 日常使用入門</strong></a>：context 管理、對話式 cron 排程、用 skill-creator 訪談式造你自己的 daily skill</li>
```

- [ ] **Step 2.2：Commit**

```bash
git add lesson-2.html
git commit -m "$(cat <<'EOF'
docs(lesson-2): update Lesson 3 preview to match rework

Lesson 3 已從「寫 daily-journal skill」改為「對話式 cron + skill-creator
訪談造 skill」，預告連結文字對齊。

EOF
)"
```

---

## Task 3: Update `README.md` structure description

**Files:**
- Modify: `README.md:11`

- [ ] **Step 3.1：改 lesson-3 描述**

```
舊：- `lesson-3.html` — **Lesson 3**：hermes 日常使用入門（Step 0 + 6 步，45–55 分鐘，含寫一個 daily-journal skill）
新：- `lesson-3.html` — **Lesson 3**：hermes 日常使用入門（Step 0 + 5 步，45–55 分鐘，對話式 cron + 用 skill-creator 造你自己的 skill）
```

- [ ] **Step 3.2：Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs(readme): update Lesson 3 structure description for rework

Step 0 + 6 步 → Step 0 + 5 步；daily-journal skill → 對話式 cron +
skill-creator。

EOF
)"
```

---

## Task 4: Update `CLAUDE.md` cross-reference section

**Files:**
- Modify: `CLAUDE.md:76-87`

- [ ] **Step 4.1：移除原 TRAP 條目**

刪除這行：

```
- **Lesson 3 Step 6 加碼 D 內「⚠️ TRAP」`<details>`** → 警告學員 `hermes config set <skill-key>` 寫錯 yaml 位置，必須用 `hermes config migrate`。這是 hermes 上游 misleading message 的繞行教學，**寫法原樣引用、不可擅自簡化**（不要拿掉 TRAP 警告、不要把 trap 跟 recovery 兩個 `<details>` 合併成一塊）。
```

**Why:** 新 Lesson 3 已砍掉 daily-journal SKILL.md 手寫 + 加碼 D yaml 教學，沒有 TRAP `<details>` 了。

- [ ] **Step 4.2：改寫 Step 0 fallback 描述**

```
舊：- **Lesson 3 `lesson-3.html` Step 0 「必備」`<details>`** → fallback 連到 `index.html` + `lesson-2.html`。改 Step 0 文案時保留這兩個 fallback 連結，因為 Lesson 3 假設 Lesson 1+2 已完成。
新：- **Lesson 3 `lesson-3.html` Step 0 「必備：先做完 Lesson 1 + Lesson 2」`<details>`** → fallback 連到 `index.html` + `lesson-2.html`、並 call out 教學場景假設付費 model。改 Step 0 文案時保留這兩個 fallback 連結（Lesson 3 假設 Lesson 1+2 已完成）+ 付費 model call out（spec 2026-05-14 §1 audience 假設）。
```

- [ ] **Step 4.3：新增 Step 2 cron prompt 守護條目**

在 Step 0 fallback 條目下方（移除 TRAP 那行原位置）新增：

```
- **Lesson 3 Step 2「2 分鐘後跑 ⟨天氣+降雨+SP500⟩」cron prompt** 是學員第一次接觸 cron + tool-use 組合的範本。**不可任意換成簡單範例**（換掉就失去「cron + 多 tool 一次 demo」的 hands-on 價值）。若 dogfood 階段發現 hermes 拿不到 SP500（缺財經 skill），可改其他「多 source 一次」組合（例如 SP500 → 鴻海昨日收盤、或加一條台北空氣品質），但不可降級成單一資訊。
```

- [ ] **Step 4.4：Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(claude-md): update Lesson 3 cross-refs for rework

- 移除原「Step 6 加碼 D TRAP」條目（daily-journal yaml 教學已砍）
- 改寫 Step 0 fallback 條目加上「付費 model call out」
- 新增 Step 2 cron prompt（天氣+降雨+SP500）守護條目

EOF
)"
```

---

## Task 5: Update `pre-class-checklist.md` Lesson 3 section

**Files:**
- Modify: `pre-class-checklist.md:119-216`（整個 Lesson 3 section）

- [ ] **Step 5.1：找到並替換 Lesson 3 section**

把第 119 行 `## Lesson 3 必檢項（日常使用）` 開始到第 216 行（含「### 5. wttr.in 可達（加碼 D）」整段）為止，全段替換為：

```markdown
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
- 學員場景免費 model 也可能不會 —— lesson-3.html Step 2 「我卡住了」`<details>` 已給 fallback（更明確要求編輯 file path）。教學場景假設付費 model，此 fallback 仍要保留。
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
```

- [ ] **Step 5.2：Commit**

```bash
git add pre-class-checklist.md
git commit -m "$(cat <<'EOF'
docs(checklist): rewrite Lesson 3 checks for rework

5 條改成對齊新教材依賴：
1. hermes CLI alive
2. /skills list + /skills list --source local 還活著
3. cron 對話式設定（Step 2）
4. 對話式裝 skill-creator（Step 3）
5. skill-creator 訪談 UX（Step 4）

砍掉舊版「自寫 skill 重啟」「hermes config migrate」「wttr.in」三條
（對應的 daily-journal / 加碼 D yaml 教學已砍）。

EOF
)"
```

---

## Task 6: Update `ai-runbook.md` Stage 25–31 + Check 13–16

**Files:**
- Modify: `ai-runbook.md:638-717`（Stage 25–31 整段）
- Modify: `ai-runbook.md:900-988`（Check 13–16 整段）

- [ ] **Step 6.1：替換 Stage 25–31**

把第 638 行 `# Lesson 3 · Stage 25–31（日常使用）` 開始到 716 行（末段 「⚠️ **不要教 `hermes config set`**...」） + 717 行 `---` 為止，全段替換為：

```markdown
# Lesson 3 · Stage 25–29（日常使用）

接續 Lesson 4 的 Stage 24。本批 stage 假設學員已完成 Lesson 1+2，hermes 已裝、Telegram bot 已接。**注意：原 Stage 25–31 已重寫為 Stage 25–29（少 2 stage），對應 lesson-3.html 從 7 sections（Step 0–6）改為 6 sections（Step 0–5）。**

## Stage 25 · 開啟 lesson-3.html、走 Step 0–1

1. 在已開的瀏覽器 tab 開 `https://lewsiafat.github.io/hermes-windows-course/lesson-3.html`
2. 確認進度顯示「前言」、標題「Lesson 3 · hermes 日常使用」
3. 讀完 Step 0 4 個 checkpoints + 「★ 現在就想好一個 daily skill 主題」、心裡選定一個主題（例：「每天早上推一條英文俚語」）
4. 點「下一步 →」進 Step 1
5. Step 1 「實作：試一次 `/new`」步驟在 Telegram bot 跑：先傳算術題、再傳 `/new`、確認 context 清空

預期：bot 回 `/new` 後再問 "what was my last question" 回答無法回憶。Step 0 確認進度顯示「Step 1 / 5」（不是 / 6）。

## Stage 26 · 進 Step 2 跑 cron 對話式設定

1. 點「下一步 →」進 Step 2
2. Copy 「2 分鐘後跑 ⟨天氣+降雨+SP500⟩」prompt block、貼到 hermes CLI / Telegram
3. hermes 應主動把 cron job 寫進 `~/.hermes/cron.yaml`，回覆「已設定，2 分鐘後會自動跑」
4. 在 WSL terminal 看：`cat ~/.hermes/cron.yaml` 確認 job 在
5. 等 2 分鐘，Telegram 收到 ⟨天氣+降雨預報+SP500⟩ 三件事
6. Copy「把剛剛那個改成每天早上 7:00 跑」prompt、貼，hermes 更新 cron.yaml
7. Copy「列出我目前的 cron 排程」prompt、確認 daily 7:00 job 在

預期：Telegram 收到推送、cron.yaml 確實被更新兩次。**Checkpoint 2 在此 stage 達成。**

若 hermes 沒主動寫 cron.yaml：執行 lesson-3.html Step 2「我卡住了」`<details>` 的 fallback（更明確要求編輯 file path）。

## Stage 27 · 進 Step 3 探索 hermes + 對話式裝 skill-creator

1. 點「下一步 →」進 Step 3
2. Copy `/skills list`、貼 → 看到 bundled skill 清單分頁（至少含 plan / excalidraw / 其他類別）
3. Copy `/plan 寫一份本週讀書計畫`、貼 → 看到 plan skill 輸出 markdown
4. Copy「幫我裝這個 skill: https://github.com/anthropics/skills/tree/main/skills/skill-creator」prompt、貼
5. hermes 應主動裝、回覆「裝好了」之類
6. Copy `/skills list --source local`、確認看到 `skill-creator`

預期：`/skills list --source local` 含 `skill-creator`。**Checkpoint 3 在此 stage 達成。**

若 hermes 沒主動裝：fallback 用 `/skills install <url>` 或 git clone（lesson-3.html Step 3「我卡住了」內第三段）。

## Stage 28 · 進 Step 4 用 skill-creator 對話造 skill

1. 點「下一步 →」進 Step 4
2. Copy「我想用 skill-creator 造一個 skill: ⟨主題⟩」prompt、把 ⟨主題⟩ 換成 Stage 25 選的主題（例：「每天早上推一條英文俚語」），貼到 hermes
3. skill-creator 開始訪談、依序回答（用簡單版本即可）
4. **看到「evaluation / benchmarks / test cases」相關問題時**，回「不用 eval、只 vibe 就好」或「skip evaluation」
5. skill-creator 寫完 SKILL.md，提示重啟。記下落地路徑（例：`~/.hermes/skills/productivity/morning-slang/SKILL.md`）
6. Copy `sudo $(which hermes) gateway restart --system`、跑、等 gateway restart
7. Copy `/skills list --source local`、確認看到剛造的 skill 名字
8. CLI 跑 `/<your-skill-name>`、看 skill 輸出
9. （可選）手機 Telegram bot 跑 `/<your-skill-name>`、看跨 channel 也認

預期：CLI 端 skill 輸出符合預期。**Checkpoint 4 在此 stage 達成 → Lesson 3 全 4 checkpoints 達標。**

若訪談卡住 / 跑不起來：lesson-3.html Step 4「我卡住了」`<details>` 三段（「不知道怎麼回」/「認不出來」/「行為不對」）為 fallback。

## Stage 29 · 進 Step 5 完成 + 加碼預告

1. 點「下一步 →」進 Step 5
2. 確認 4 個 ✓ checkmark 都顯示、文字跟 Stage 25 看到的 Step 0 一致
3. 點開加碼 A/B/C/D 四個 `<details>`，每個收起再展開一次（**新版加碼 D 沒有巢狀 `<details>`**）
4. （選做）加碼 A：對 hermes 講「把 ⟨skill-name⟩ 串到 cron 每天 7:00」→ 看 `~/.hermes/cron.yaml` 是否多一條 job
5. （選做）加碼 D：`cat ~/.hermes/skills/*/⟨your-skill-name⟩/SKILL.md` → 看 frontmatter + markdown 結構

預期：所有 `<details>` 可開可收。

---
```

**為什麼這樣寫：**
- Stage 編號從 25–31 → 25–29（少 2 stage 對應 lesson HTML 少 2 section）
- 完全移除原 Stage 31「加碼 D 完整跑通」（daily-journal config migrate 已砍）
- 完全移除「⚠️ 不要教 hermes config set」末段（trap 教學已砍）

- [ ] **Step 6.2：替換 Check 13–16**

把第 900 行 `## Check 13 · hermes CLI / /skills list 仍可用` 開始到第 988 行（含「預期：`HTTP/2 200` 或 `HTTP/1.1 200 OK`。」）為止，全段替換為：

```markdown
## Check 13 · hermes CLI / `/skills list` 仍可用

```bash
hermes --version
```

預期：印出版本字串（例：`Hermes Agent v0.13.x`）。

```bash
hermes -z "/skills list" 2>&1 | head -20
```

預期：印出 bundled skill 清單（一行行類別 + 各類底下的 skill 名）。

```bash
hermes -z "/skills list --source local" 2>&1 | head -10
```

預期：印出本地 skill 清單表格（可能 0 項，但不該報錯）。

若 `/skills list` 或 `--source local` 報錯 / Unknown：hermes 可能改了指令命名，對照 plan §Dogfood Results 更新教材所有 `/skills list` 字串。

---

## Check 14 · cron 對話式設定仍可用（Step 2 核心依賴）

進 hermes CLI 或對 Telegram bot 講：

```
幫我設一個 cron job，2 分鐘後跑一次，內容：台北今日天氣，把結果推到我的 Telegram。
```

預期：
- hermes 主動寫入 `~/.hermes/cron.yaml`
- `cat ~/.hermes/cron.yaml` 看到剛才那條 job
- 2 分鐘後 Telegram 收到推送

若 hermes 沒主動寫 cron.yaml：教學場景免費 model 也可能會這樣，但 lesson-3.html Step 2「我卡住了」`<details>` 已給 fallback（更明確指 file path）。

若付費 model 也不寫：hermes 上游可能改了 cron 介面 → 整段 Step 2 重新驗證教材後再教學。

收尾：對 hermes 講「刪掉剛才那個 2 分鐘 cron」或編輯 `~/.hermes/cron.yaml` 移除。

---

## Check 15 · 對話式裝 skill-creator 仍可用（Step 3 核心依賴）

```bash
curl -fsI https://raw.githubusercontent.com/anthropics/skills/main/skills/skill-creator/SKILL.md
```

預期：第一行 `HTTP/2 200`、URL 仍有效。

接著對 hermes 講：

```
幫我裝這個 skill：https://github.com/anthropics/skills/tree/main/skills/skill-creator
```

預期：hermes 主動抓 URL、放到 `~/.hermes/skills/...`；`hermes -z "/skills list --source local"` 看到 `skill-creator`。

若 URL 失效（404）：去 https://github.com/anthropics/skills 找新位置，更新 lesson-3.html Step 3 + 本 check 的 URL。

收尾：保留 skill-creator（學員會用到）。

---

## Check 16 · skill-creator 訪談 UX 沒變（Step 4 核心依賴）

接 Check 15（skill-creator 已裝），跑：

```bash
hermes -z "/skill-creator 造一個 skill：每天推一句英文俚語" 2>&1 | head -50
```

或互動模式 `hermes` 進 CLI 後貼：

```
我想用 skill-creator 造一個 skill：每天推一句英文俚語
```

預期：skill-creator 開始訪談、會在某個問題問「evaluation / benchmarks / test cases」相關。**看到那個問題就 Ctrl+C 結束本驗證**（不必真造一個 skill）。

若訪談順序大改 / 沒有 evaluation 那題：對照 plan §Dogfood Results 4 更新 lesson-3.html Step 4 訪談描述。

---
```

**為什麼這樣寫：**
- Check 13 加上 `--source local` 子驗證（Step 3 / 4 都依賴）
- Check 14 / 15 / 16 對應新 Lesson 3 三個核心依賴（cron 對話式 / skill-creator 安裝 / skill-creator 訪談）
- 完全移除原 Check 14（自寫 skill 重啟）、原 Check 15（hermes config migrate）、原 Check 16（wttr.in）—— 對應教學砍掉的部分

- [ ] **Step 6.3：Commit**

```bash
git add ai-runbook.md
git commit -m "$(cat <<'EOF'
docs(runbook): rewrite Lesson 3 stages + smoke checks for rework

- Stage 25–31 → Stage 25–29（少 2 stage 對應 lesson HTML 少 2 section）
- 移除原 Stage 31「加碼 D 完整跑通」（daily-journal config migrate 已砍）
- Check 13–16 整段重寫：對應新 Lesson 3 三大依賴
  - Check 13: /skills list + --source local
  - Check 14: cron 對話式設定（取代舊「自寫 skill」）
  - Check 15: 對話式裝 skill-creator（取代舊「config migrate」）
  - Check 16: skill-creator 訪談 UX（取代舊「wttr.in」）

EOF
)"
```

---

## Task 7: End-to-end smoke walk（user-run）

**Files:** 無（runtime 行為驗證）

- [ ] **Step 7.1：開瀏覽器走 lesson-3.html Step 0 → Step 5**

```bash
xdg-open lesson-3.html
```

確認：
- [ ] Step 0：標題「前言」、「★ 現在就想好一個 daily skill 主題」section 存在、5 個 step list 對齊 Step 5 的 4 checkpoints 措辭、`<details>`「必備」含 index.html + lesson-2.html 連結、提到付費 model
- [ ] Step 1：h2 顯示「Step 1 / 5」、context 管理內容沿用（hands-on `/new` + cheatsheet `<details>`）
- [ ] Step 2：h2「Step 2 / 5」、cron prompt 是「2 分鐘後+天氣+降雨+SP500」、4 個 hands-on 段落、「🚨 我卡住了」3 個小標題
- [ ] Step 3：h2「Step 3 / 5」、`/skills list` + `/plan` 試玩、對話式裝 skill-creator + URL、fallback 3 段（slash command / 重啟 / git clone）
- [ ] Step 4：h2「Step 4 / 5」、★ 5 個 hands-on 段落、「不要 eval / skip evaluation」逃生口 prompt、卡住 3 段
- [ ] Step 5：h2「Step 5 / 5」、4 個 ✓ checkpoints、4 個加碼 A/B/C/D、下次預告連 lesson-4 + Lesson 5 待開
- [ ] Devtools console：無紅錯
- [ ] localStorage：`hermes-lesson3-step` key 存在、值為 0–5
- [ ] 全部 `<pre data-copy>` 有 Copy 按鈕、點下去複製成功

- [ ] **Step 7.2：dogfood 整個流程（選做、推薦）**

把 Task 0 的 dogfood 結果與 Task 1–6 寫的教材對照走一次：
1. Step 2：實際在 hermes 對話貼教材的 prompt（不是 dogfood 的）→ 看跟 dogfood 結果一致
2. Step 3：實際裝 skill-creator → 路徑對得上教材描述
3. Step 4：實際造一個 skill → 訪談順序對得上教材描述（特別是 evaluation 那段）
4. Step 5 加碼 A：實際串到 cron → 確認 cron.yaml 更新

若任何一條跟教材描述差很多 → 該段教材回去改、commit 修正。

- [ ] **Step 7.3：（user 授權後）push**

⚠️ **不要主動 push**。等 user 明確說「可以 push 了」才執行：

```bash
git push origin feat/lesson-3-rework
```

GitHub Pages 10–30s 後生效。

---

## Self-Review（plan 寫完做的 checklist）

寫完上面所有 task 後，跑一次：

**1. Spec coverage：**
- ✅ spec §3 課程結構 6 section → Task 1 全覆蓋
- ✅ spec §4 4 checkpoints → Step 0 + Step 5 文字對齊
- ✅ spec §5 各 Step 細節 → Task 1.3–1.8 每個 section HTML 完整
- ✅ spec §6 跨 lesson 連結 → Task 2 + Task 4 處理
- ✅ spec §7 wizard.js 規格 → Task 1.1 改 `data-total-steps`
- ✅ spec §9 dogfood → Task 0 對齊 5 條
- ✅ spec §10 DoD → Task 7.1 checklist 對齊

**2. Placeholder scan：**
- ⟨your-skill-name⟩、⟨主題⟩、⟨skill-name⟩、⟨缺失行為⟩ 在教材 HTML 內都是「給學員填」的中文佔位符（用 ⟨⟩ 包，不是 TODO），non-issue。
- 教材文字無 TBD / TODO / 待補。
- 每個 task 都有 commit step。

**3. Type consistency：**
- 「skill-creator」全文一致（不會混用 skill_creator / skillcreator）
- 「`<your-skill-name>`」HTML escape 用 `&lt;` `&gt;` 一致
- 4 checkpoints 文字 Step 0 寫法 vs Step 5 寫法字串完全一致

**Self-review pass。**

---

## Dogfood Results

**Status: SKIPPED by user (2026-05-14)**

User decision：跳過 pre-deploy dogfood、現場教學時應對差異。教材寫法以 spec §5 + 我對 hermes 行為的假設為準，未經實機驗證。

**Known risks（若現場教學遇到要記下 → 之後 fixup commit）：**
- Step 2 cron prompt：hermes 不一定真的會把 cron job 寫到 `~/.hermes/cron.yaml`（特別是 free model）；SP500 不保證拿得到
- Step 3 對話式裝 skill-creator：`幫我裝這個 skill: <url>` 不確定 hermes 會不會主動執行 install 流程
- Step 4 skill-creator 訪談順序與「evaluation」那題的實際措辭可能跟教材描述不同
- skill 落地路徑（教材寫的 `~/.hermes/skills/meta/skill-creator/` 是假設，實際可能在別的 category）

教材已在每個 Step 末段放 `<details>` 「🚨 我卡住了」 fallback 覆蓋上述風險的常見失敗模式。
