# Hermes Windows Course

教 Windows 使用者在 60 分鐘內裝好 [hermes-agent](https://github.com/NousResearch/hermes-agent) 並完成第一次對話。配套教學頁部署於 GitHub Pages。

🔗 **教學頁**：https://lewsiafat.github.io/hermes-windows-course/

## 結構

- `index.html` — 前言頁（為什麼選 hermes）+ 9 步教學精靈
- `style.css` / `wizard.js` — 樣式與導覽邏輯
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

直接編輯 `index.html` 對應 `<section data-step="N">`。零 build step。  
本地預覽：直接雙擊 `index.html`。

## 部署

```bash
git push    # GitHub Pages 自動發佈，10-30 秒生效
```

## License

MIT
