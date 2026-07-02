/**
 * blog-render.js — render blog entries ra trang
 * KHÔNG tự fetch data — chờ blog-sheets.js gọi window.blogRender(data)
 *
 * SLOTS: mỗi layout dùng slot1..slot4 (mảng ảnh)
 *   - 1 ảnh  → hiển thị cố định
 *   - nhiều ảnh → tự động thành thanh cuộn ngang
 * SCROLL STRIP: moreImages → cuộn ngang/dọc phía dưới
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

  // ── 1 ảnh cố định ────────────────────────────────────────
  function fig(file, ratio) {
    const cls = RATIO_CLASS[ratio] || "ar-4x3";
    return `<figure class="${cls}"><img src="${IMG_BASE}${file}" alt="${file}" /></figure>`;
  }

  // ── Slot: 1 ảnh → cố định | nhiều ảnh → cuộn ngang ──────
  function slot(imgs, cls = "") {
    if (!imgs || !imgs.length) return "";
    if (imgs.length === 1) {
      return `<div class="be-slot ${cls}">${fig(imgs[0].file, imgs[0].ratio)}</div>`;
    }
    const items = imgs.map(i => fig(i.file, i.ratio)).join("");
    return `<div class="be-slot ${cls}">
      <div class="be-slot-scroll">
        <div class="be-scroll">${items}</div>
        <p class="be-scroll-hint">${hint}</p>
      </div>
    </div>`;
  }

  // ── Slot TOP: full width, nhiều ảnh → cuộn lớn ──────────
  function slotTop(imgs, cls = "") {
    if (!imgs || !imgs.length) return "";
    if (imgs.length === 1) {
      return `<div class="be-slot ${cls}">${fig(imgs[0].file, imgs[0].ratio)}</div>`;
    }
    const items = imgs.map(i => fig(i.file, i.ratio)).join("");
    return `<div class="be-slot ${cls}">
      <div class="be-scroll be-scroll--top">${items}</div>
    </div>`;
  }
  function textBlock(entry) {
    const caption = (entry.text && (entry.text[LANG] || entry.text.en)) || "";
    const dt = (entry.date || "").replace(/\./g, "-");
    return `<div class="be-info">
      <p class="be-text">${caption}</p>
      <p class="be-meta"><time datetime="${dt}">${entry.date}</time>, ${entry.location}</p>
    </div>`;
  }

  // ── Scroll strip phía dưới (moreImages) ──────────────────
  function scrollStrip(imgs, direction) {
    if (!imgs || !imgs.length) return "";
    const isV = direction === "vertical";
    const cls  = isV ? "be-scroll-v" : "be-scroll";
    const hintText = isV ? "↕ scroll" : hint;
    const items = imgs.map(i => fig(i.file, i.ratio)).join("");
    return `<div class="be-scroll-wrap">
      <div class="${cls}">${items}</div>
      <p class="be-scroll-hint">${hintText}</p>
    </div>`;
  }

  // ── Video frame ───────────────────────────────────────────
  function videoFrame(videoId, ratio) {
    const cls = ratio === "9:16" ? "9x16" : "16x9";
    return `<div class="be-video__frame be-video__frame--${cls}">
      <iframe src="https://www.youtube.com/embed/${videoId}"
        title="video" frameborder="0"
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
        allowfullscreen></iframe>
    </div>`;
  }

  // ── Parse slot từ entry ───────────────────────────────────
  // AppScript trả về slot1, slot2, slot3, slot4 là mảng {file, ratio}
  function getSlot(entry, n) {
    return entry[`slot${n}`] || [];
  }

  // ════════════════════════════════════════════════════════
  // LAYOUTS
  // ════════════════════════════════════════════════════════
  const LAYOUTS = {

    // ── Layout 1: Text + 1 slot full width ───────────────
    "1": function (entry) {
      return `<div class="bl-1">
        ${textBlock(entry)}
        ${slot(getSlot(entry, 1), "bl-1__img")}
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 2: Text + 2 slot cạnh nhau 50/50 ──────────
    "2": function (entry) {
      return `<div class="bl-2">
        ${textBlock(entry)}
        <div class="bl-2__imgs">
          ${slot(getSlot(entry, 1))}
          ${slot(getSlot(entry, 2))}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 3: Text + slot lớn trái + 2 slot nhỏ phải ─
    "3": function (entry) {
      return `<div class="bl-3">
        ${textBlock(entry)}
        <div class="bl-3__imgs">
          ${slot(getSlot(entry, 1), "bl-3__main")}
          <div class="bl-3__right">
            ${slot(getSlot(entry, 2))}
            ${slot(getSlot(entry, 3))}
          </div>
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 4: Text + 4 slot lưới ngang đều ───────────
    "4": function (entry) {
      return `<div class="bl-4">
        ${textBlock(entry)}
        <div class="bl-4__imgs">
          ${slot(getSlot(entry, 1))}
          ${slot(getSlot(entry, 2))}
          ${slot(getSlot(entry, 3))}
          ${slot(getSlot(entry, 4))}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 5: Text + 3 slot bằng nhau ngang hàng ─────
    "5": function (entry) {
      return `<div class="bl-5">
        ${textBlock(entry)}
        <div class="bl-5__imgs">
          ${slot(getSlot(entry, 1))}
          ${slot(getSlot(entry, 2))}
          ${slot(getSlot(entry, 3))}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 6: Text trái + slot2 trái dưới + slot1 phải lớn
    "6": function (entry) {
      return `<div class="bl-6">
        ${slot(getSlot(entry, 1), "bl-6__right")}
        <div class="bl-6__left">
          ${textBlock(entry)}
          ${slot(getSlot(entry, 2), "bl-6__slot2")}
        </div>
      </div>`;
    },

    // ── Layout 7: Text + slot trái + slot phải (2 cột) ───
    "7": function (entry) {
      return `<div class="bl-7">
        ${textBlock(entry)}
        <div class="bl-7__imgs">
          ${slot(getSlot(entry, 1), "bl-7__left")}
          ${slot(getSlot(entry, 2), "bl-7__right")}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 8: Text + slot full width cinematic (21:9) ─
    "8": function (entry) {
      return `<div class="bl-8">
        ${textBlock(entry)}
        ${slot(getSlot(entry, 1), "bl-8__img")}
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 9: Text + 1 slot lớn trên + 3 slot nhỏ dưới
    "9": function (entry) {
      return `<div class="bl-9">
        ${textBlock(entry)}
        ${slotTop(getSlot(entry, 1), "bl-9__top")}
        <div class="bl-9__bottom">
          ${slot(getSlot(entry, 2))}
          ${slot(getSlot(entry, 3))}
          ${slot(getSlot(entry, 4))}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Layout 10: Text + 1 slot lớn trên + 6 slot nhỏ dưới (2 hàng x 3)
    "10": function (entry) {
      return `<div class="bl-10">
        ${textBlock(entry)}
        ${slotTop(getSlot(entry, 1), "bl-10__top")}
        <div class="bl-10__bottom">
          ${slot(getSlot(entry, 2))}
          ${slot(getSlot(entry, 3))}
          ${slot(getSlot(entry, 4))}
          ${slot(getSlot(entry, 5))}
          ${slot(getSlot(entry, 6))}
          ${slot(getSlot(entry, 7))}
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },

    // ── Video ngang ───────────────────────────────────────
    "video": function (entry) {
      return `<div class="be-video">
        ${textBlock(entry)}
        ${videoFrame(entry.videoId, entry.videoRatio)}
      </div>`;
    },

    // ── Video dọc 9:16 ────────────────────────────────────
    "video-v": function (entry) {
      return `<div class="be-video be-video--vertical">
        ${textBlock(entry)}
        ${videoFrame(entry.videoId, "9:16")}
      </div>`;
    },

    // ── Layout kết hợp: Text + ảnh trái + video phải ─────
    "photo-video": function (entry) {
      return `<div class="bl-pv">
        ${textBlock(entry)}
        <div class="bl-pv__cols">
          ${slot(getSlot(entry, 1), "bl-pv__photo")}
          <div class="bl-pv__video">
            ${videoFrame(entry.videoId, entry.videoRatio)}
          </div>
        </div>
        ${scrollStrip(entry.moreImages, entry.scrollDir)}
      </div>`;
    },
  };

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

  // ── Hàm render chính ─────────────────────────────────────
  window.blogRender = function(data) {
    const container = document.querySelector(".blog-entries");
    if (!container) {
      console.warn("blog-render: không tìm thấy .blog-entries");
      return;
    }
    console.log("blog-render: rendering", data.length, "entries");
    container.innerHTML = data.map(entry => renderEntry(entry)).join("\n");
    document.dispatchEvent(new Event("blog-rendered"));

    requestAnimationFrame(() => {
      container.querySelectorAll(".reveal-on-scroll").forEach(el => {
        el.classList.add("revealed");
      });
    });
  };

})();