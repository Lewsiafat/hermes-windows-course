# Lesson 4 Step 4 簡化 — Design Spec (2026-05-18)

> Delta spec：不重寫 2026-05-12 lesson-4-line-integration spec，只記錄 Step 4 主流程從「nano 編輯 + sed 補救」改為「互動腳本一鍵寫入」的 UX 修補。

## 背景

Lesson 4 上線後 review 發現 Step 4 對零技術背景學員 cognitive load 過高：

- 主流程要 nano 編輯 + 替換 3 個占位符 + `Ctrl+O` / `Ctrl+X`
- 後接 awk redacted verify
- 後接「補救」兩個 variant（A 互動 sed / B 手動範本）
- 學員看到 **4 條路徑 + 3 個工具（nano / awk / sed）**，主流程與補救方向難分辨

問題本質：原 Step 4 把最不友善的 nano 流程當主流程，反而把最友善的互動腳本（Variant A）藏在「補救」標籤下。

## 範圍

### In scope
- `lesson-4.html` Step 4 section 重排（3 sub-step）
- 主流程改為**互動腳本一鍵寫入**（取代 nano 編輯）
- 砍掉 Variant B（手動範本替換）整段
- 重寫 Step 4 内「變數沒列出來」`<details>` troubleshoot 文字（移除 nano reference）
- 同步更新 `lesson-4.html` Step 6 對「sed 補救」的內部引用
- 同步更新 `ai-runbook.md` Stage 21 命令模式

### Out of scope
- Lesson 1 Step 7（hermes setup paste 雷補救）— 維持「nano 主 + sed 補救」模式
- Lesson 2 Step 4（Telegram setup）— 同上維持原狀
- `CLAUDE.md` 跨步驟模式條款重寫 — 留待 Lesson 4 課堂 dogfood 後決定是否一致化
- 改原 `2026-05-12-lesson-4-line-integration-design.md` spec 本體（本文件作為 delta spec 補充）

### Deferred
- 若 Lesson 4 課堂實測 UX 確實改善，後續任務一致化 Lesson 1/2 + 更新 CLAUDE.md

## 新 Step 4 結構（3 sub-step）

從原本 5 個 section（intro / Window B ngrok / nano 編輯 / awk verify / 補救 Variant A / 補救 Variant B）縮為 3：

### Sub-step 1 — 第二個 shell（Window B）跑 ngrok
完全不變。`ngrok http 8646`、抓 Forwarding URL、Window B 保留到課程結束。

### Sub-step 2 — 回 Window A 跑互動腳本（新主流程）

文案：「下面這段會問你三個值（token / secret / URL），自動寫進 `~/.hermes/.env`。Token / secret 輸入時不會回顯，看不到字也是有打進去。」

互動腳本（**用 `bash <<'BASH' ... BASH` heredoc 強制 fork 進 bash subshell**，read 後加 `</dev/tty` 從終端讀，不管學員 default shell 是 bash / zsh / fish 都能跑）：

```bash
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
```

已實測（2026-05-18，zsh default shell VPS 互動測過）：三個 prompt 依序出現、token / secret 不回顯、URL 回顯、awk redacted verify 長度全對。

保留：「為什麼 `LINE_ALLOWED_USERS=` 留空 + `LINE_ALLOW_ALL_USERS=true`」`<details>` 教育性區塊。

### Sub-step 3 — Redacted verify
完全不變（awk 命令 + 預期長度解讀 + 「長度不對怎麼辦」notice）。

## 砍掉的內容

| 原 element | 處置 |
|---|---|
| `<h3>` 2. 回 Window A 編輯 `.env`（整段 nano 流程） | 整段移除 |
| 「捲到檔尾 / Ctrl+O / Ctrl+X」操作教學 | 移除 |
| `<h3>` 補救：用 sed 直接改 .env（章節標題） | 移除（內容升為主流程）|
| `<h4>` Variant A · 互動腳本 | 內容升為 Sub-step 2 |
| `<h4>` Variant B · 手動範本 | 整段移除 |
| `<details>` 「變數完全沒列出來」troubleshoot | 重寫：移除 nano reference；改成兩條：(1) 若腳本中途 Ctrl+C 中斷 → 重跑一次即可（idempotent，`set -e` 已避免半寫狀態）；(2) 若看到 `/dev/tty: No such device or address`（罕見，例如 `ssh user@host '...'` 非互動執行）→ 改用互動 ssh `ssh -t user@host` 重連 |

## 配套更新

### `lesson-4.html` Step 6 內部 cross-ref
- 「啟動就 crash」troubleshoot 提到「回 Step 4 sed 補救」→ 改為「回 Step 4 重跑互動腳本」
- Verify 失敗的「Timeout」對策提到「回 Step 4 用 sed 補救改 `LINE_PUBLIC_URL`」→ 同上改寫

### `ai-runbook.md` Stage 21
原命令是 `nano ~/.hermes/.env` + awk verify；改為對應的互動腳本 + awk verify，確保 AI 工具版 runbook 跟主教材一致。

### `pre-class-checklist.md`
盤點 Lesson 4 必檢項是否引用 Step 4 nano 流程；若有則更新（目前看似只引用 Step 2、Step 3 外部依賴，不引用 Step 4 內部）。

## 設計決策：為什麼用 `bash <<'BASH' ... BASH` heredoc 包裝

| 元素 | 為什麼 |
|---|---|
| `bash <<'BASH'` heredoc + single-quoted `'BASH'` delimiter | 強制 fork 進 bash subshell；single quote 阻止外層 shell 展開 `$TOKEN` / `$SECRET` / `$PUBURL`，由 bash 而非 zsh 解釋。zsh 的 `read -p` 是 "read from coprocess" 不是 prompt，原版直接 paste 會壞（已重現 `read: -p: no coprocess`）。 |
| `</dev/tty` 在每個 read 後面 | heredoc 用掉 stdin，read 不指定來源會把 heredoc 內容當輸入消耗。`</dev/tty` 把 read 改成從終端鍵盤讀。 |
| `set -euo pipefail` 在 heredoc 開頭 | read 被 Ctrl+C 中斷時整段中止；避免空 `$TOKEN` 跑進後續 sed 把 .env 既有值清掉。 |
| 拿掉原版的 `unset TOKEN SECRET PUBURL` | 變數在 subshell 結束時自動消失，不需要顯式 unset。 |
| 拿掉行間 `&&` chaining | `set -e` 已提供同等保護，視覺更乾淨。 |

**為什麼選 heredoc 包裝而非「教學員先打 `bash` 切過去」**：
- 透明（一段命令解決，學員不用記「我現在在哪個 shell」）
- 不依賴學員 default shell 設定
- 跟 lesson 假設「學員照 Lesson 1+2 走過來」一致：Lesson 1+2 是 bash，Lesson 4 的這段也用 bash，但用 heredoc 包起來就**不需要假設**，更穩

## 不違反的 CLAUDE.md 條款

- CLAUDE.md「不可擅自簡化」條款只限 Lesson 1 Step 7 / Lesson 2 Step 4，Lesson 4 Step 4 不在保護範圍
- 互動腳本的 secret 變數名是 `TOKEN` / `SECRET` / `PUBURL`，跟 bash readonly built-in（如 `UID`）不衝突
- Step 6 的 `USER_ID` 變數名（避 `UID` 雷）不在本次修改範圍，維持原狀
- 跨步驟 cross-ref 已在「配套更新」段點名同步改

## 驗收

1. `lesson-4.html` Step 4 只有 3 個 `<h3>` sub-step
2. Step 4 內找不到 `nano` 字串（troubleshoot 提到「以前需要 nano」不算）
3. Step 4 內找不到 `Variant A` / `Variant B` 文字
4. 互動腳本以 `<pre data-copy>` 標記，可一鍵複製
5. 互動腳本內含 `bash <<'BASH'` 開頭、`set -euo pipefail`、`</dev/tty` 三個關鍵元素（不管 default shell 為何都能跑）
6. Step 6 內部 cross-ref 已改為指向「重跑互動腳本」，不再說「sed 補救」
7. `ai-runbook.md` Stage 21 命令與主教材對齊
8. 線上版 deploy 後手動測一次：在 zsh + bash 兩種 default shell 下分別 paste → 三個 prompt 正常 → awk verify 長度正確 → Step 5 webhook Verify 通過（課堂 dogfood）
