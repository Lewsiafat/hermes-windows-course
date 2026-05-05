# Hermes Agent Windows 安裝課程 — 設計文件

> 日期：2026-05-05
> 對應 hermes-agent：依教學前 smoke test 抓到的版本（teach-day pre-class）
> 教學形式：1-on-1 線上、零預備、60 分鐘

---

## 1. 摘要

設計一堂 60 分鐘 1-on-1 線上教學課程，幫一位 Windows-comfortable 但對 WSL/Linux 終端機陌生的學員，從零安裝好 hermes-agent，並在 WSL2 裡跑出第一次與 LLM 的對話。配套產出物為 GitHub Pages 上一個極簡 9 步精靈式教學網頁，學員上課時邊看邊做，課後可保留書籤自行回顧；教材設計為可重複使用，未來可教給其他學員。

---

## 2. 目標與終點

### 2.1 課程終點（學員結束時擁有）
1. WSL2 + Ubuntu 已安裝、可從 Windows 啟動
2. OpenRouter 帳號已註冊、API key 在手
3. hermes-agent 已安裝、`hermes` 指令可用
4. 已用 `hermes setup` 完成 provider/model/API key 配置
5. 至少完成一次與 hermes 的 streaming 對話
6. （加碼）若時間允許，已申請 LINE Messaging API channel 或 Telegram bot token，留給下堂課接通

### 2.2 教材成果（教師端）
- 一個 GitHub Pages 公開網址：`https://lewsiafat.github.io/hermes-windows-course/`
- 含 9 步教學精靈、約 20 張步驟截圖、課前 smoke test checklist
- 純靜態 HTML/CSS/JS，無 build、無 framework

---

## 3. 對象與預設

| 維度 | 設定 |
|---|---|
| 程度 | Windows-comfortable，能裝程式、會點選單。**對 WSL/Linux 終端機陌生** |
| Pre-work | **零**。WSL2 安裝在課堂時間內進行 |
| 形式 | **1-on-1 線上**。學員在自家螢幕、教師可看 Zoom 畫面但不直接操作 |
| 教材重用 | 是。教材以「可重複教給下一個學員」為設計目標（非公開版） |
| 語言 | 繁體中文 (zh_TW) |
| LLM Provider | 主：**OpenRouter** + 一個免費模型（不刷卡，預期是 deepseek 系列；具體 model id 課前 smoke test 時確認）。備：OpenAI/Anthropic（學員自願刷卡時用）|

---

## 4. 範圍

### 4.1 In Scope
- WSL2 + Ubuntu 安裝
- OpenRouter 帳號註冊 + API key 申請
- hermes-agent 經 `curl ... install.sh | bash` 安裝
- `hermes setup` 完整設定精靈走完
- `hermes` CLI 至少一次 streaming 對話

### 4.2 Optional Bonus（時間夠才做）
- LINE Messaging API channel 申請（拿到 channel access token）
- 或 Telegram @BotFather 開 bot（拿到 bot token）
- 兩者皆只到「拿到 token 並暫存」為止，**不接通到 hermes gateway**（留下堂課做）

### 4.3 Out of Scope
- Native Windows 支援（hermes 官方不支援）
- Hermes messaging gateway 配置（下次課程）
- Skills、cron、subagents 等進階功能
- 多語版本（只做 zh_TW）
- 多人班、線下班
- 學員錯誤自動回報

---

## 5. 課程時間表（60 分鐘）

「併行教學」原則：WSL 下載/重啟那段死時間，在 Zoom 對學員講概念 + 帶他在瀏覽器把 OpenRouter API key 申請好。

| 區段 | 時間 | 內容 | 平行做的事 |
|---|---|---|---|
| **0. Welcome + Agenda** | 0:00–0:05 (5 min) | 自我介紹、hermes 是什麼、為何 Windows 要 WSL、4 個 checkpoints (☐ WSL2 / ☐ OpenRouter / ☐ hermes / ☐ 第一次對話)、終點、加碼預告 | — |
| **1. 啟動 WSL2 安裝** | 0:05–0:09 (4 min) | 開 PowerShell（系統管理員）→ `wsl --install` → 開始下載 | — |
| **2. 概念 + OpenRouter 註冊** | 0:09–0:18 (9 min) | 講殼層 / 終端機 / 為何需要 API key | 瀏覽器另開分頁，**帶學員註冊 OpenRouter**（email-only） |
| **3. 重啟 + Ubuntu 初始化** | 0:18–0:25 (7 min) | 重開機 → Ubuntu 首次啟動 → 設 username/password → `pwd` / `ls` / `cd ~` | 學員把 OpenRouter API key 複製到記事本 |
| **4. 裝 hermes** | 0:25–0:40 (15 min) | `curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh \| bash` → 等待 | (1) 預告 `hermes setup` 等下會問哪些問題 (2) 解釋 quick-install 在背後裝了什麼（uv、Python venv、~/.local/bin/hermes）(3) Q&A buffer |
| **5. 設定精靈 + 第一次對話** | 0:40–0:53 (13 min) | `source ~/.bashrc` → `hermes setup`（full wizard：provider → model → API key → tools/terminal）→ provider 選 OpenRouter、model 選一個 free 標籤的（預期 deepseek 系列）、貼 API key、其餘預設 → `hermes` → 打第一句 → streaming → `/exit` | — |
| **6. 收尾 + 加碼** | 0:53–1:00 (7 min) | 必做：Q&A、`hermes doctor`、教學頁加書籤、下次自學指引。加碼（時間夠才做）：帶看 LINE Messaging API channel 或 Telegram @BotFather 申請流程 | — |

### 5.1 Buffer 策略
Block 4（hermes 下載）伸縮性最大。網速慢 → 把 Q&A 移到那段；網速快 → 多餘時間轉到 Block 5 玩耍時間。

### 5.2 已知風險點
- Windows 太舊（< 1903）沒裝 wsl → 改先 `wsl --update` 或 Windows Update
- Ubuntu first-run 偶爾 stuck → 備案 `wsl --install -d Ubuntu`
- OpenRouter 信箱驗證信慢 → 改 backup（OpenAI/Anthropic 即時 key）
- 公司電腦無管理員權限 → 課程取消或改個人電腦

---

## 6. 教學網頁設計（Wizard）

### 6.1 形態
- **精靈式分頁**（Wizard B 路線，已選定）
- 一次只顯示一步，prev/next 鈕
- localStorage 只記「上次看到第幾步」，重開瀏覽器會回到那一步
- **學員可自由前後翻**，沒有「必須完成才能下一步」鎖
- **沒有完成 / 未完成狀態**，不勾不打勾

### 6.2 每步版面（單一樣板）

```
─────────────────────────────────
 Step 2 / 9 · 啟動 WSL2 安裝
─────────────────────────────────

[一段話說明這步要幹嘛、為什麼]

▸ 動作
  1. 開始功能表搜尋「PowerShell」
  2. 右鍵「以系統管理員身分執行」
  3. 貼上下面指令、Enter
  4. 看到下載進度後，先放著繼續往下讀

▸ 指令／資料（如有）
  ┌─────────────────────────┐
  │ wsl --install     [Copy]│
  └─────────────────────────┘

▸ 等下載時可以順便讀
  - 殼層 / 終端機 / WSL 是什麼
  - 順手把 OpenRouter 開起來（→ Step 3）

[← 上一步]              [下一步 →]
```

### 6.3 9 個步驟

> 注：「4 checkpoints」（Block 0 提到的 ☐ WSL2 / ☐ OpenRouter / ☐ hermes / ☐ 第一次對話）是課程概念上的 4 個里程碑，**只在 Step 1 與 Step 9 出現作為旅程預覽與回顧**；它們不對應 wizard 的 9 個步驟，wizard 也不會做勾選互動（見 §6.5）。

| # | 標題 | 對應課程區段 |
|---|---|---|
| 1 | 開始之前（預期目標 + 4 checkpoints） | Block 0 |
| 2 | 啟動 WSL2 安裝 | Block 1 |
| 3 | 申請 OpenRouter API Key | Block 2 |
| 4 | 重啟 Windows | Block 3a |
| 5 | Ubuntu 首次啟動 | Block 3b |
| 6 | 安裝 hermes | Block 4 |
| 7 | `hermes setup` 設定精靈 | Block 5 前半 |
| 8 | 第一次對話 | Block 5 後半 |
| 9 | 完成 + 加碼（LINE/TG 引導） | Block 6 |

### 6.4 路由
- `index.html#step-3` → 直接打開 step 3（**可分享單步連結**：學員問「我卡 step 6」教師直接丟連結）
- 沒有 hash → 讀 localStorage 跳到上次那步
- prev/next 鈕只是改 hash 並觸發 hashchange

### 6.5 自由度（明確定義）
- 沒有強制順序
- 沒有「我做完了」按鈕（學員自己決定何時跳）
- 沒有花俏動畫、沒有勾選圖示、沒有催促
- 進度條為**純顯示**（Step X / 9），無互動

---

## 7. 技術選型與檔案結構

### 7.1 技術棧

| 層 | 選擇 | 理由 |
|---|---|---|
| HTML/CSS/JS | **Vanilla 三件式**，無框架 | 9 步切換 + localStorage + prev/next ≈ 50 行 JS |
| Markdown 處理 | **不用** | 直接寫 HTML `<section>`，省 build step |
| CSS 打底 | **Pico.css** via CDN（~10KB） | 給 typography 基礎，剩下調幾個變數 |
| Icon | 不引 library，用 emoji 即可 | YAGNI |
| 語言 | zh_TW only | YAGNI |
| RWD | 一個 `@media` 查詢 + max-width | 學員 WSL 重啟時可能改用手機看 |

### 7.2 檔案結構

```
hermes-windows-course/
├── index.html              # 全部在這裡（含 9 個 <section class="step">）
├── style.css               # 自訂變數 + RWD（Pico 用 CDN）
├── wizard.js               # ~50 行：show/hide step、prev/next、localStorage、hash 路由
├── assets/
│   └── screenshots/        # PowerShell、Ubuntu 首啟、hermes setup 各提示截圖（~20 張）
├── pre-class-checklist.md  # 教師課前 smoke test 流程
├── README.md               # 給未來自己看：怎麼改內容、怎麼部署、上次驗證日期
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-05-hermes-windows-course-design.md  # 本檔
```

### 7.3 部署

**GitHub Pages**（決定）：
- Repo: `Lewsiafat/hermes-windows-course`，必須 **public**
- 部署 = `git push`，10–30 秒生效
- URL: `https://lewsiafat.github.io/hermes-windows-course/`（username 自動小寫）
- 不需要 GitHub Actions / workflow（純靜態）
- 在地預覽 = 直接雙擊 `index.html`

**初次部署 4 步**（已預先寫好，實作階段才執行）：

```bash
cd hermes-windows-course && git init && git add . && git commit -m "init"
gh repo create Lewsiafat/hermes-windows-course --public --source=. --remote=origin --push
gh api -X POST /repos/Lewsiafat/hermes-windows-course/pages \
  -f source.branch=main -f source.path=/
# 等 1-2 分鐘 → 開 https://lewsiafat.github.io/hermes-windows-course/
```

---

## 8. 內容資產清單

### 8.1 截圖總覽（~20 張，1280×720 PNG，命名 `assets/screenshots/step-N-XXX.png`）

| Step | 截圖 |
|---|---|
| 1 | — |
| 2 | PowerShell 系統管理員 banner、`wsl --install` 下載中（2 張） |
| 3 | OpenRouter 註冊頁、Dashboard、Keys 頁、Create Key 對話框（4 張） |
| 4 | — |
| 5 | Ubuntu 設 username 畫面、設 password 畫面（2 張） |
| 6 | install.sh 執行中、結尾 `Hermes installed!`（2 張） |
| 7 | hermes setup 五個提示：provider 選單、model 選單、API key 輸入、tools 預設、terminal 預設（5 張） |
| 8 | hermes TUI 啟動、streaming 中、`/exit` 後（3 張） |
| 9 | hermes doctor 輸出（1 張） |

### 8.2 每步「已知卡點」（直接寫在該步說明區）

| Step | 卡點 |
|---|---|
| 2 | Win 太舊（<1903）→ Windows Update / 跳「WSL not enabled」→ `wsl --install --no-distribution` 後再裝 Ubuntu / 公司電腦無管理員權限 → 課程取消 |
| 3 | 驗證信延遲 → 改 backup OpenAI / Key 一旦離開頁面就看不到 → 強調「現在馬上貼記事本」 |
| 5 | Ubuntu app 還在下載 → 等到 `Installing, this may take a few minutes` / Username 不能用大寫或空白 |
| 6 | `command not found: hermes` → `source ~/.bashrc` / SSL 憑證錯誤（極少）/ 網速慢卡 5 分鐘為正常 |
| 7 | 不小心 Ctrl+C → 重跑 `hermes setup` / API key 貼成空白 → wizard 會驗證 |
| 8 | 一直沒回應 → free model 流量上限，換另一個 free model / TUI 顯示亂碼 → Windows Terminal 字型 |

---

## 9. 維護計畫

### 9.1 三個最容易壞的地方
1. **`hermes setup` wizard 提示順序與選項**（跨版本最易變）
2. **OpenRouter UI**（第三方 SaaS，UI 改版機率高）
3. **install.sh URL**（若 Nous Research 改 repo 結構就斷）

### 9.2 課前 smoke test（每次教學前 10–15 分鐘）

寫在 `pre-class-checklist.md`，項目：
- [ ] 在乾淨 WSL 跑一次 step 6→8，確認 wizard 提示與截圖一致；不一致就立刻補截圖
- [ ] 開 OpenRouter dashboard，比對 step 3 截圖；UI 變了補截圖
- [ ] `curl -I https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh` 確認 200 OK
- [ ] 紀錄今日 hermes 版本（`hermes --version`）到 `README.md` 的「上次驗證」欄

### 9.3 版本標註

`index.html` footer 加一行：
> 此教材對應 hermes-agent vX.Y.Z（測試於 YYYY-MM-DD），OpenRouter UI 可能已更新。

`README.md` 維護：
- 上次驗證日期
- 當時 hermes 版本
- 當時 Windows 版本

---

## 10. 風險與備案

| 風險 | 機率 | 影響 | 備案 |
|---|---|---|---|
| WSL2 安裝失敗（Win10 太舊） | 中 | 課程作廢 | 課前先請學員確認 Win 版本 ≥ 1903 |
| 公司電腦無管理員權限 | 低 | 課程作廢 | 課前確認；改用個人電腦 |
| OpenRouter 驗證信延遲 | 中 | 拖延 5–10 min | 改 backup（OpenAI/Anthropic 即時 key） |
| `hermes setup` wizard 跨版本變動 | 中 | 截圖過時、學員困惑 | 課前 smoke test |
| 網速太慢 hermes install 卡 20+ min | 低 | 課程超時 | 跳過第一次對話 demo，留學員回家做 |
| Free deepseek 模型暫時不可用 | 低 | 第一次對話失敗 | 切換到另一個 OpenRouter free model |

---

## 11. 開放問題

- 第一次教完後，記錄各區段實際耗時，回看調整 timeline
- 是否需要在 `index.html` 加上 Google Analytics 或類似工具觀察學員實際停留時間？（暫不做）
- 加碼段（LINE / TG bot）是否該各自寫成獨立 step（非主流程）放在 step 9 後？（傾向不做，保留為純文字連結即可）

---

## 12. 後續

設計確認後 → 進入 writing-plans skill，產出實作計畫（建立 `index.html` / `style.css` / `wizard.js` / 截圖收集流程 / 部署步驟）。
