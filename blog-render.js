/**
 * blog-render.js — render blog entries ra trang
 * KHÔNG tự fetch data — chờ blog-sheets.js gọi window.blogRender(data)
 */
(function () {
  const LANG     = document.documentElement.lang || "en";
  const IMG_BASE = "../image/Blog/";

  const HINT = { en: "← swipe →", vi: "← vuốt →", ja: "← スワイプ →" };
  const hint = HINT[LANG] || HINT.en;

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

  const LAYOUTS = {
    "1": function (entry) {
      const [a] = entry.mainImages || [];
      return `<div class="bl-1">
        ${textBlock(entry)}
        ${a ? `<div class="bl-1__img">${fig(a.file, a.ratio)}</div>` : ""}
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },
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
    "video": videoBlock,
  };

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

  // ── Hàm render chính — được gọi từ blog-sheets.js ────────
  window.blogRender = function(data) {
    const container = document.querySelector(".blog-entries");
    if (!container) {
      console.warn("blog-render: không tìm thấy .blog-entries");
      return;
    }
    console.log("blog-render: rendering", data.length, "entries");
    container.innerHTML = data.map(entry => renderEntry(entry)).join("\n");
    document.dispatchEvent(new Event("blog-rendered"));

    // Force reveal tất cả entries ngay lập tức, không chờ typewriter
    requestAnimationFrame(() => {
      container.querySelectorAll(".reveal-on-scroll").forEach(el => {
        el.classList.add("revealed");
      });
    });
  };

  // ── Fallback: nếu sau 5 giây vẫn chưa có data → dùng local ──
  setTimeout(function() {
    const container = document.querySelector(".blog-entries");
    if (container && container.innerHTML.trim() === "") {
      console.warn("blog-render: timeout, thử dùng dữ liệu local");
      if (typeof BLOG_DATA !== "undefined") {
        window.blogRender(BLOG_DATA);
      }
    }
  }, 5000);

})();