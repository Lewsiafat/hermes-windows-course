# Smoke Test — Lesson 2 群組/DM/Mention/Pairing 功能

對應課程：`lesson-2.html` 加碼 1–4

---

## 前置條件

- [ ] Lesson 2 主線全部完成（gateway 跑著、DM 測試通過）
- [ ] 至少有一個 Telegram 群組可以測試
- [ ] 有第二個 Telegram 帳號（或找到朋友協助測 pairing）

---

## Test 1 · DM 基本確認

| # | 動作 | 預期結果 |
|---|------|---------|
| 1.1 | 手機開 bot，傳 `hello` | bot 正常回覆 |
| 1.2 | 傳 `what was my first message?` | hermes 記得 context，回覆你剛才說的 `hello` |
| 1.3 | 傳 `/new` | hermes 回覆 session 已清除 |
| 1.4 | 傳 `what was my first message?` | hermes 不記得了（context 清空） |

**預期全部通過才繼續。**

---

## Test 2 · 群組加入與基本回應

| # | 動作 | 預期結果 |
|---|------|---------|
| 2.1 | BotFather → `/mybots` → Bot Settings → Group Privacy | 顯示 `Privacy mode is disabled` |
| 2.2 | 把 bot 加入你的測試群組 | 群組成員列表出現 bot |
| 2.3 | 群組裡傳 `/start` | bot 回覆（表示你的 user_id 已在 allowlist） |
| 2.4 | 群組裡傳一般訊息（例如：`今天天氣如何？`） | bot 正常回覆 |

**如果 2.3 或 2.4 沒有回應：** 先執行 Test 4（allowlist 確認）。

---

## Test 3 · @ Mention 觸發

**先開啟 Mention-only 模式：**

```bash
echo "export TELEGRAM_REQUIRE_MENTION=true" >> ~/.hermes/.env
sudo $(which hermes) gateway restart --system
```

| # | 動作 | 預期結果 |
|---|------|---------|
| 3.1 | 群組傳一般訊息（不含 @）：`今天天氣如何？` | bot **不回應** |
| 3.2 | 群組傳 `@your_bot_username 今天天氣如何？` | bot **正常回應** |
| 3.3 | 群組傳 `今天天氣如何？ @your_bot_username` | bot **正常回應**（@ 放後面也可以）|
| 3.4 | 直接 Reply bot 之前的訊息（不含 @） | bot **正常回應**（Reply 不受 mention-only 限制）|

**測試完後，依需求決定是否保留 Mention-only 或還原：**

```bash
# 還原預設（拿掉 TELEGRAM_REQUIRE_MENTION）
sed -i '/TELEGRAM_REQUIRE_MENTION/d' ~/.hermes/.env
sudo $(which hermes) gateway restart --system
```

---

## Test 4 · 多人 Pairing（allowlist 管理）

| # | 動作 | 預期結果 |
|---|------|---------|
| 4.1 | 執行 `grep TELEGRAM_ALLOWED_USERS ~/.hermes/.env` | 輸出你目前的 allowlist，至少有你自己的 user_id |
| 4.2 | 用第二個帳號（不在名單）傳訊給 bot | bot **不回應**（靜默忽略） |
| 4.3 | 把第二個帳號的 user_id 加入名單（見下方），重啟 gateway | — |
| 4.4 | 第二個帳號再傳一次訊息 | bot **正常回應** |
| 4.5 | 把第二個帳號從名單移除，重啟 gateway | — |
| 4.6 | 第二個帳號再傳訊 | bot **再次不回應** |

```bash
# 4.3 加入第二個帳號（把 NEW_USER_ID 換成實際數字）
sed -i "s/export TELEGRAM_ALLOWED_USERS=\(.*\)/export TELEGRAM_ALLOWED_USERS=\1,NEW_USER_ID/" ~/.hermes/.env
sudo $(which hermes) gateway restart --system

# 4.5 移除第二個帳號（重設整個名單，只保留自己）
sed -i "s/^export TELEGRAM_ALLOWED_USERS=.*/export TELEGRAM_ALLOWED_USERS=YOUR_OWN_USER_ID/" ~/.hermes/.env
sudo $(which hermes) gateway restart --system
```

---

## Test 5 · Log 確認

| # | 動作 | 預期結果 |
|---|------|---------|
| 5.1 | 執行 `tail -f ~/.hermes/logs/gateway.log`，同時在群組傳訊 | log 即時出現新行，顯示訊息收到 |
| 5.2 | 用不在名單的帳號傳訊 | log 出現 `unauthorized` 或 `rejected` 字樣 |

---

## 結果紀錄

| Test | 結果 | 備註 |
|------|------|------|
| Test 1 · DM | ⬜ Pass / ⬜ Fail | |
| Test 2 · 群組加入 | ⬜ Pass / ⬜ Fail | |
| Test 3 · @ Mention | ⬜ Pass / ⬜ Fail | |
| Test 4 · Pairing | ⬜ Pass / ⬜ Fail | |
| Test 5 · Log | ⬜ Pass / ⬜ Fail | |

---

## 常見失敗排查

| 症狀 | 排查指令 |
|------|---------|
| 群組裡 bot 完全沒回 | `grep TELEGRAM_ALLOWED_USERS ~/.hermes/.env` → 確認你的 user_id 在裡面 |
| Group Privacy 關不掉 | BotFather → `/mybots` → 選 bot → Bot Settings → Group Privacy → Turn off |
| Mention-only 開了但還是每則都回 | `grep TELEGRAM_REQUIRE_MENTION ~/.hermes/.env` → 確認設定寫進去；重啟 gateway |
| Log 沒有新訊息 | `hermes gateway status` 確認 gateway 在跑 |
| gateway restart 指令無效 | `pkill -f "hermes gateway"` 後 `sudo $(which hermes) gateway start --system` |
