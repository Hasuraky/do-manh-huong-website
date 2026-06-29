/**
 * blog-sheets.js — fetch data từ Google Sheets AppScript
 */

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxb3H86O-0tgEKpO0Mb0cHYIPheCelVTkR4pllIIogvLAghUlLPX47Y93Ws3ds2D6Sf/exec";

(function () {
  if (!SHEETS_URL) return;

  // ── Hiện skeleton ngay lập tức trong lúc chờ Sheets ──────
  function showSkeleton() {
    const container = document.querySelector(".blog-entries");
    if (!container) return;
    const skeletonHTML = Array(3).fill(`
      <div class="blog-skeleton revealed">
        <div class="bs-text"></div>
        <div class="bs-meta"></div>
        <div class="bs-img"></div>
      </div>
    `).join("");
    container.innerHTML = skeletonHTML;
  }

  // Hiện skeleton ngay sau khi DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showSkeleton);
  } else {
    showSkeleton();
  }

  const lang = document.documentElement.lang || "en";

  fetch(`${SHEETS_URL}?lang=${lang}`)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data) || !data.length) throw new Error("Data rỗng");
      console.log("blog-sheets: load OK,", data.length, "entries");
      function tryRender() {
        if (typeof window.blogRender === "function") { window.blogRender(data); }
        else { setTimeout(tryRender, 50); }
      }
      tryRender();
    })
    .catch(err => {
      console.error("blog-sheets: lỗi fetch:", err);
      // Xóa skeleton nếu lỗi
      const container = document.querySelector(".blog-entries");
      if (container) container.innerHTML = "";
    });
})();