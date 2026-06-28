/**
 * blog-render.js — render BLOG_DATA ra trang
 * Không cần sửa file này. Thêm layout mới = thêm function vào LAYOUTS.
 */
(function () {
  const LANG     = document.documentElement.lang || "en";
  const IMG_BASE = "../image/Blog/";

  const HINT = { en: "← swipe →", vi: "← vuốt →", ja: "← スワイプ →" };
  const hint = HINT[LANG] || HINT.en;

  // ── Tỷ lệ → class CSS ──────────────────────────────────────
  const RATIO_CLASS = {
    "1:1": "ar-1x1", "3:4": "ar-3x4", "4:3": "ar-4x3",
    "9:16": "ar-9x16", "16:9": "ar-16x9", "21:9": "ar-21x9",
  };

  function fig(file, ratio) {
    const cls = RATIO_CLASS[ratio] || "ar-4x3";
    return `<figure class="${cls}"><img src="${IMG_BASE}${file}" alt="${file}" /></figure>`;
  }

  function textBlock(entry) {
    const caption = (entry.text && (entry.text[LANG] || entry.text.en)) || "";
    const dt = (entry.date || "").replace(/\./g, "-");
    return `<p class="be-text">${caption}</p>
            <p class="be-meta"><time datetime="${dt}">${entry.date}</time>, ${entry.location}</p>`;
  }

  // ── Scroll strip (ảnh thứ 5+) ─────────────────────────────
  function scrollStrip(imgs, direction) {
    if (!imgs || !imgs.length) return "";
    const isV = direction === "vertical";
    const cls  = isV ? "be-scroll-v" : "be-scroll";
    const hintText = isV ? "↕ scroll" : hint;
    const items = imgs.map(item => fig(item.file, item.ratio)).join("");
    return `<div class="be-scroll-wrap">
      <div class="${cls}">${items}</div>
      <p class="be-scroll-hint">${hintText}</p>
    </div>`;
  }

  // ── Video ─────────────────────────────────────────────────
  function videoBlock(entry) {
    const ratio = entry.videoRatio === "9:16" ? "9x16" : "16x9";
    return `<div class="be-video">
      ${textBlock(entry)}
      <div class="be-video__frame be-video__frame--${ratio}">
        <iframe src="https://www.youtube.com/embed/${entry.videoId}"
          title="video" frameborder="0"
          allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
          allowfullscreen></iframe>
      </div>
    </div>`;
  }

  // ══════════════════════════════════════════════════════════
  // LAYOUT RENDERERS
  // Thêm layout mới: thêm function LAYOUTS["5"] = function(entry){...}
  // entry.mainImages  = [{file, ratio}, ...]  — tối đa 4 ảnh lớn
  // entry.moreImages  = [{file, ratio}, ...]  — ảnh thứ 5+
  // entry.scrollDir   = "horizontal" | "vertical"
  // ══════════════════════════════════════════════════════════
  const LAYOUTS = {

    // Layout 1 — 1 ảnh full width
    "1": function (entry) {
      const [a] = entry.mainImages || [];
      return `<div class="bl-1">
        ${textBlock(entry)}
        ${a ? `<div class="bl-1__img">${fig(a.file, a.ratio)}</div>` : ""}
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // Layout 2 — 2 ảnh cạnh nhau
    "2": function (entry) {
      const [a, b] = entry.mainImages || [];
      return `<div class="bl-2">
        ${textBlock(entry)}
        <div class="bl-2__imgs">
          ${a ? fig(a.file, a.ratio) : ""}
          ${b ? fig(b.file, b.ratio) : ""}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // Layout 3 — 1 ảnh to trái + 2 ảnh nhỏ phải
    "3": function (entry) {
      const [a, b, c] = entry.mainImages || [];
      return `<div class="bl-3">
        ${textBlock(entry)}
        <div class="bl-3__imgs">
          ${a ? fig(a.file, a.ratio) : ""}
          <div class="bl-3__right">
            ${b ? fig(b.file, b.ratio) : ""}
            ${c ? fig(c.file, c.ratio) : ""}
          </div>
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // Layout 4 — 4 ảnh hàng ngang đều
    "4": function (entry) {
      const imgs = (entry.mainImages || []).slice(0, 4);
      return `<div class="bl-4">
        ${textBlock(entry)}
        <div class="bl-4__imgs">
          ${imgs.map(i => fig(i.file, i.ratio)).join("")}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // Layout video — không có ảnh
    "video": videoBlock,

  };

  // ── Parse data từ Google Sheets (flat row) → object ───────
  function parseRow(row) {
    // Sheets trả về mảng flat, blog-sheets.js map sang object này
    // Nếu dùng blog-data.js local thì object đã đúng format rồi
    return row;
  }

  // ── Render 1 entry ────────────────────────────────────────
  function renderEntry(entry) {
    const layout = String(entry.layout || "1");
    const fn = LAYOUTS[layout];
    if (!fn) {
      console.warn(`blog-render: unknown layout "${layout}" for entry ${entry.id}`);
      return "";
    }
    return `<article class="blog-entry reveal-on-scroll" id="${entry.id}">
      ${fn(entry)}
    </article>`;
  }

  // ── Main render ───────────────────────────────────────────
  function render(data) {
    const container = document.querySelector(".blog-entries");
    if (!container) return;
    container.innerHTML = data.map(row => renderEntry(parseRow(row))).join("\n");
    document.dispatchEvent(new Event("blog-rendered"));
  }

  // ── Entry point: ưu tiên Sheets, fallback local data ──────
  function init() {
    if (typeof loadFromSheets === "function") {
      // blog-sheets.js sẽ fetch từ Google Sheets rồi gọi render()
      loadFromSheets(render);
    } else if (typeof BLOG_DATA !== "undefined") {
      render(BLOG_DATA);
    } else {
      console.warn("blog-render: no data source found");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Export để blog-sheets.js dùng
  window.blogRender = render;
})();
