/**
 * blog-sheets.js — fetch data từ Google Sheets thay thế blog-data.js
 *
 * SETUP (làm 1 lần):
 * 1. Mở Google Sheets của bạn
 * 2. Extensions → Apps Script → paste code Apps Script (xem hướng dẫn)
 * 3. Deploy → Web App → Anyone can access
 * 4. Copy URL deploy, dán vào SHEETS_URL bên dưới
 * 5. Xoá dòng <script src="../blog-data.js"> trong 3 file index.html
 */

const SHEETS_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";

function loadFromSheets(renderFn) {
  if (!SHEETS_URL || SHEETS_URL.includes("PASTE_YOUR")) {
    console.warn("blog-sheets.js: chưa cấu hình SHEETS_URL, dùng blog-data.js local");
    return; // fallback về blog-data.js
  }

  const lang = document.documentElement.lang || "en";

  fetch(`${SHEETS_URL}?lang=${lang}`)
    .then(r => r.json())
    .then(data => {
      if (!Array.isArray(data) || !data.length) {
        throw new Error("Sheets trả về data rỗng");
      }
      renderFn(data);
    })
    .catch(err => {
      console.error("blog-sheets.js: lỗi fetch Sheets, dùng blog-data.js local:", err);
      if (typeof BLOG_DATA !== "undefined") renderFn(BLOG_DATA);
    });
}
