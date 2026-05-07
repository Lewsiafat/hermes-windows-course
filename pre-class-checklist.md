# Pre-Class Smoke Test

每次教學前 10–15 分鐘做完。發現任何不一致就立即修教材。

## 環境準備

- [ ] 一台乾淨的 Windows 機器（或還原到乾淨快照的 VM）
- [ ] 網路通暢
- [ ] OpenRouter 帳號（測試用，可重用）

## 必檢四項（最容易壞）

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
- [ ] 左側仍有 "Credits" 入口（或 `openrouter.ai/credits` 仍可用）；儲值流程仍是「選金額 → 信用卡 → 餘額即時更新」
- [ ] 推薦付費 model 仍存在：搜 `deepseek/deepseek-v4-pro`、`minimax/minimax-m2.7` 兩個 ID 都還能找到。**任一個下架時必須改 Step 3 與 Step 7 的對應字串。**

若 UI 變了：補 Step 3 的截圖。

### 4. 補救 sed script 仍能正確改 .env

確認 hermes 安裝後 `~/.hermes/.env` 真的存在、裡面真的有 `OPENROUTER_API_KEY=` 這行：

```bash
ls ~/.hermes/.env && grep '^OPENROUTER_API_KEY=' ~/.hermes/.env
```

若 hermes 改了 config 路徑或變數名 → Step 7 補救 section 的 sed 與 Step 8 的 400 troubleshooting 都要重抓。

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
