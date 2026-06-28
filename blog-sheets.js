/**
 * blog-sheets.js — fetch data từ Google Sheets AppScript
 * Load TRƯỚC blog-render.js trong HTML
 */

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxjsfjxfX3wBDGTEe6p8QplbJpo2k9Rrptz5S0odz9ioCquW-F2u0tSeMEOcs-gAB5a/exec";

// Cờ để blog-render.js biết đang chờ Sheets
window._sheetsLoading = true;

(function () {
  if (!SHEETS_URL) {
    window._sheetsLoading = false;
    return;
  }

  const lang = document.documentElement.lang || "en";

  fetch(`${SHEETS_URL}?lang=${lang}`)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data) || !data.length) {
        throw new Error("Data rỗng hoặc sai format");
      }
      console.log("blog-sheets: load OK,", data.length, "entries");
      window._sheetsLoading = false;
      // Gọi render nếu blog-render.js đã sẵn sàng
      if (typeof window.blogRender === "function") {
        window.blogRender(data);
      } else {
        // blog-render.js chưa load xong, lưu data lại để nó tự lấy
        window._sheetsData = data;
      }
    })
    .catch(err => {
      console.error("blog-sheets: lỗi fetch:", err);
      window._sheetsLoading = false;
      // Fallback về blog-data.js local
      if (typeof window.blogRender === "function" && typeof BLOG_DATA !== "undefined") {
        console.warn("blog-sheets: dùng dữ liệu local (blog-data.js)");
        window.blogRender(BLOG_DATA);
      }
    });
})();