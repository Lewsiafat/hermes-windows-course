# AgentVibe — AI Agent 養成課

從「什麼是 LLM / Agent / RAG」到裝好並每天實際用 [hermes-agent](https://github.com/NousResearch/hermes-agent) 的完整教材。純靜態 GitHub Pages 站，零 build step。

🔗 **教學頁**：https://lewsiafat.github.io/hermes-windows-course/
📦 **目前版本**：[v1.5.0](CHANGELOG.md)（2026-07-11）
🗺️ **課程地圖 SSOT**：[`course.json`](course.json) — 新增或調整任何課程頁，第一步永遠是先改這份 manifest

## 課程地圖

| 階段 | 內容 | 頁數 |
|------|------|------|
| 1. 觀念四部曲 | LLM 101 / AI Agent 101 / RAG 101 / AI Agent 使用（article，無 wizard 機制） | 4 |
| 2. 安裝 Hermes 路線 | Windows + WSL2（`lesson-1.html`）/ macOS（`mac.html`） | 2 |
| 3. 基礎工具 | Git 基礎（`git.html`） | 1 |
| 4. 進階整合與日常使用 | Telegram / 日常使用 / LINE / 晨報自動化（`lesson-2~5.html`） | 4 |
| 5. 實戰工作坊 | Vibe Coding / Skill 比較系列（3 頁） | 3 |

共 14 個課程頁 + 1 個 landing（`index.html`）。每頁的詳細 file / type / storageKey / stepsTotal 以 [`course.json`](course.json) 為準——這份 README 只給人看的總覽，不重複維護逐頁清單。

`index.html` 最下方另有「延伸資源」區塊，連到外部站台 [apply-tutorials](https://lewsi.ddns.net/apply-tutorials/)（8 平台 Bot / API Key 申請教學）——這是外部連結卡片，不是本 repo 的課程頁，不列入 `course.json`。

## 結構

- `index.html` — 課程首頁（landing hub），列出所有階段與頁面卡片，不載入 `wizard.js`
- `course.json` — **課程地圖 SSOT**，記錄所有頁面的 metadata
- `scripts/check-course-map.mjs` — 檢查 `course.json` 與實際頁面／`index.html`／footer 版號是否一致：`node scripts/check-course-map.mjs`
- `*.html`（root-level，kebab-case）— 各課程頁；分兩種類型：
  - **wizard 頁**（10 支）：載入 `wizard.js`，用 `<body data-total-steps data-storage-key>` + `<section data-step="N">` 做步驟切換，進度存在 localStorage
  - **article 頁**（4 支，觀念四部曲）：純 HTML，無 wizard 機制
- `style.css` / `wizard.js` — 共用樣式與導覽邏輯
- `pre-class-checklist.md` — 每次教學前必跑的 smoke test（人類版）
- `ai-runbook.md` — AI 工具版 runbook（Full Capture Run + Quick Smoke Test）
- `docs/superpowers/specs/`、`docs/superpowers/plans/` — 課程設計文件（另有其他零散設計文件並存，兩套皆保留、不整併，詳見 CLAUDE.md）

## 新增課程頁的慣例

新頁一律放在 repo root、檔名 kebab-case（例如 `new-topic.html`），不要再用 `lesson-N` 編號或建立子資料夾。新增後：1) 在 `course.json` 對應 stage 的 `pages[]` 加一筆 2) 在 `index.html` 加卡片與連結 3) 跑 `node scripts/check-course-map.mjs` 確認一致。

## 上次驗證

- 日期：（待 smoke test 後填入）
- hermes 版本：（待填）
- Windows 版本：（待填）

## 更新內容

直接編輯對應頁面的 `<section data-step="N">`（wizard 頁）或內文（article 頁）。零 build step，改完直接雙擊 HTML 檔在瀏覽器預覽即可。

## 部署

Push 到 `main` 後 GitHub Actions / Pages 會自動 build 上線，通常數十秒內生效。若需要手動確認或強制重新觸發一次：

```bash
git push --follow-tags
gh api --method POST repos/Lewsiafat/hermes-windows-course/pages/builds   # 選用，手動觸發一次 build
curl -sI https://lewsiafat.github.io/hermes-windows-course/   # 確認 200
```

## License

MIT
