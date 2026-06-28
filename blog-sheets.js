/**
 * blog-sheets.js — fetch data từ Google Sheets AppScript
 */

const SHEETS_URL = "https://script.google.com/macros/s/AKfycby4GyasHsVsLHSVdMVNuivdAk_Qnw7GhrTPaILsjGmWvX0ecGv33qUb9XJ6id_69Poy/exec";

(function () {
  if (!SHEETS_URL) return;

  const lang = document.documentElement.lang || "en";

  fetch(`${SHEETS_URL}?lang=${lang}`)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data) || !data.length) {
        throw new Error("Data rỗng");
      }
      console.log("blog-sheets: load OK,", data.length, "entries");

      // Gọi render — thử ngay, nếu chưa có thì đợi
      function tryRender() {
        if (typeof window.blogRender === "function") {
          window.blogRender(data);
        } else {
          setTimeout(tryRender, 50);
        }
      }
      tryRender();
    })
    .catch(err => {
      console.error("blog-sheets: lỗi fetch:", err);
      // Fallback: đợi blog-render.js rồi dùng local data
      function tryFallback() {
        if (typeof window.blogRender === "function" && typeof BLOG_DATA !== "undefined") {
          console.warn("blog-sheets: dùng dữ liệu local");
          window.blogRender(BLOG_DATA);
        } else {
          setTimeout(tryFallback, 50);
        }
      }
      tryFallback();
    });
})();