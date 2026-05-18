# Hermes Windows Course

教 Windows 使用者在 60 分鐘內裝好 [hermes-agent](https://github.com/NousResearch/hermes-agent) 並完成第一次對話。配套教學頁部署於 GitHub Pages。

🔗 **教學頁**：https://lewsiafat.github.io/hermes-windows-course/  
📦 **目前版本**：[v1.0.0](CHANGELOG.md)（2026-05-18）

## 結構

- `index.html` — **課程首頁**（landing hub，列出所有 lesson；不載入 `wizard.js`，含 `#step-N` JS redirect 到 `lesson-1.html`）
- `lesson-1.html` — **Lesson 1**：Windows + WSL2 安裝精靈（Step 0 + 9 步，60 分鐘）
- `mac.html` — **macOS 安裝課程**：macOS 路徑（30 分鐘）
- `lesson-2.html` — **Lesson 2**：把 hermes 接到 Telegram（Step 0 + 7 步，30–45 分鐘）
- `lesson-3.html` — **Lesson 3**：hermes 日常使用入門（Step 0 + 5 步，45–55 分鐘，對話式 cron + 用 skill-creator 造你自己的 skill）
- `lesson-4.html` — **Lesson 4**：把 hermes 接到 LINE（Step 0 + 7 步，60 分鐘，含 ngrok）
- `style.css` / `wizard.js` — 共用樣式與導覽邏輯（`wizard.js` 從 `<body data-*>` 讀步數與 storage key，landing 不載入）
- `assets/screenshots/` — 各步截圖（每次驗證後可能更新）
- `pre-class-checklist.md` — **每次教學前必跑**的 smoke test 流程（人類版，簡潔）
- `ai-runbook.md` — AI 工具版的 runbook（含 Full Capture Run + Quick Smoke Test，明確檔名與構圖要求）
- `docs/superpowers/specs/` — 課程設計文件
- `docs/superpowers/plans/` — 實作計畫

## 上次驗證

- 日期：（待 smoke test 後填入）
- hermes 版本：（待填）
- Windows 版本：（待填）

## 更新內容

直接編輯對應的 `lesson-N.html` / `mac.html` 的 `<section data-step="N">`。零 build step。  
本地預覽：直接雙擊 `index.html`（landing），或開個別 `lesson-N.html`。

## 部署

```bash
git push    # GitHub Pages 自動發佈，10-30 秒生效
```

## License

MIT
