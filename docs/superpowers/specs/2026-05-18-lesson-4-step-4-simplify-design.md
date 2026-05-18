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

互動腳本（語義同原 Variant A，僅用 `\` 斷行成 10 行可讀）：

```bash
cd ~/.hermes && \
  read -sp "Paste LINE Channel Access Token: " TOKEN && echo && \
  read -sp "Paste LINE Channel Secret: "        SECRET && echo && \
  read -p  "Paste ngrok HTTPS URL: "            PUBURL && \
  { grep -q '^LINE_CHANNEL_ACCESS_TOKEN=' .env || echo 'LINE_CHANNEL_ACCESS_TOKEN=' >> .env;
    grep -q '^LINE_CHANNEL_SECRET='       .env || echo 'LINE_CHANNEL_SECRET='       >> .env;
    grep -q '^LINE_PUBLIC_URL='           .env || echo 'LINE_PUBLIC_URL='           >> .env;
    grep -q '^LINE_ALLOWED_USERS='        .env || echo 'LINE_ALLOWED_USERS='        >> .env;
    grep -q '^LINE_ALLOW_ALL_USERS='      .env || echo 'LINE_ALLOW_ALL_USERS=true'  >> .env; } && \
  sed -i "s|^LINE_CHANNEL_ACCESS_TOKEN=.*|LINE_CHANNEL_ACCESS_TOKEN=$TOKEN|" .env && \
  sed -i "s|^LINE_CHANNEL_SECRET=.*|LINE_CHANNEL_SECRET=$SECRET|"            .env && \
  sed -i "s|^LINE_PUBLIC_URL=.*|LINE_PUBLIC_URL=$PUBURL|"                    .env && \
  unset TOKEN SECRET PUBURL
```

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
| `<details>` 「變數完全沒列出來」troubleshoot | 重寫：移除 nano reference、改成「若腳本中途 Ctrl+C 或網路斷，重跑一次即可」|

## 配套更新

### `lesson-4.html` Step 6 內部 cross-ref
- 「啟動就 crash」troubleshoot 提到「回 Step 4 sed 補救」→ 改為「回 Step 4 重跑互動腳本」
- Verify 失敗的「Timeout」對策提到「回 Step 4 用 sed 補救改 `LINE_PUBLIC_URL`」→ 同上改寫

### `ai-runbook.md` Stage 21
原命令是 `nano ~/.hermes/.env` + awk verify；改為對應的互動腳本 + awk verify，確保 AI 工具版 runbook 跟主教材一致。

### `pre-class-checklist.md`
盤點 Lesson 4 必檢項是否引用 Step 4 nano 流程；若有則更新（目前看似只引用 Step 2、Step 3 外部依賴，不引用 Step 4 內部）。

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
5. Step 6 內部 cross-ref 已改為指向「重跑互動腳本」，不再說「sed 補救」
6. `ai-runbook.md` Stage 21 命令與主教材對齊
7. 線上版 deploy 後手動測一次：互動腳本三個 paste → awk verify 長度正確 → Step 5 webhook Verify 通過（課堂 dogfood）
