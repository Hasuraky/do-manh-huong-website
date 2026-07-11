/**
 * myself-sheets.js — trang Myself lấy dữ liệu từ Google Sheets (tab "Myself")
 *
 * Fetch SHEETS_URL?page=myself (URL trong sheets-config.js) rồi thay:
 *   - Khối thông tin cá nhân: <ul> trong .base-info_name
 *   - Khối kinh nghiệm: các .work-exp_item trong .work-exp (giữ nguyên <h1>)
 *
 * Nội dung tĩnh trong HTML là FALLBACK dự phòng:
 *   - Khi trang tải: ẩn nội dung tĩnh, hiện skeleton loading.
 *   - Fetch OK       → render dữ liệu từ Sheets.
 *   - Fetch lỗi / quá 10s → khôi phục lại nội dung tĩnh.
 */
(function () {
  if (typeof SHEETS_URL === "undefined" || !SHEETS_URL) return;

  const LANG = document.documentElement.lang || "en";
  const TIMEOUT_MS = 10000;

  const $info  = () => document.querySelector(".base-info_name ul");
  const $work  = () => document.querySelector(".work-exp");
  const $skill = () => document.querySelector(".base-info_skill");

  // ── Skeleton: ẩn nội dung tĩnh trong lúc chờ Sheets ──────
  let staticInfo = null;
  let staticWork = null;
  let staticSkill = null;

  function showSkeleton() {
    const ul = $info();
    if (ul && staticInfo === null) {
      staticInfo = ul.innerHTML;
      ul.innerHTML = [70, 50, 85, 55]
        .map(w => `<li class="ms-skel" style="width:${w}%"></li>`).join("");
    }
    const skill = $skill();
    if (skill && staticSkill === null) {
      staticSkill = skill.innerHTML;
      const h3 = skill.querySelector("h3");
      skill.innerHTML = (h3 ? h3.outerHTML : "") +
        '<div class="ms-skel-block ms-skel-block--sm"></div>'.repeat(3);
    }
    const article = $work();
    if (article && staticWork === null) {
      staticWork = article.innerHTML;
      const h1 = article.querySelector("h1");
      article.innerHTML = (h1 ? h1.outerHTML : "") +
        '<div class="ms-skel-block"></div>'.repeat(3);
    }
  }

  function restoreStatic() {
    const ul = $info();
    if (ul && staticInfo !== null) ul.innerHTML = staticInfo;
    const skill = $skill();
    if (skill && staticSkill !== null) skill.innerHTML = staticSkill;
    const article = $work();
    if (article && staticWork !== null) article.innerHTML = staticWork;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showSkeleton);
  } else {
    showSkeleton();
  }

  // ── Render helpers ────────────────────────────────────────
  const esc = s => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // Chọn text theo ngôn ngữ trang, rỗng thì fallback về EN
  const pick = t => (t && (t[LANG] || t.en)) || "";
  const pickList = items =>
    (items && ((items[LANG] && items[LANG].length) ? items[LANG] : items.en)) || [];

  // Map key → itemprop schema.org (key khác vẫn hiển thị, chỉ không có itemprop)
  const ITEMPROP = { birthday: "birthDate", phone: "telephone", email: "email", address: "address" };

  function renderInfo(info) {
    const ul = $info();
    if (!ul) return;
    ul.innerHTML = info.map(row => {
      const raw = pick(row.text);
      if (!raw) return "";
      const val = esc(raw);
      const prop = ITEMPROP[row.key] ? ` itemprop="${ITEMPROP[row.key]}"` : "";
      if (row.key === "email") return `<li><a href="mailto:${val}"${prop}>${val}</a></li>`;
      if (row.key === "birthday") {
        const m = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/); // DD.MM.YYYY
        const dt = m ? ` datetime="${m[3]}-${m[2]}-${m[1]}"` : "";
        return `<li><time${dt}${prop}>${val}</time></li>`;
      }
      return `<li${prop}>${val}</li>`;
    }).join("");
  }

  // ── Khối kỹ năng ──────────────────────────────────────────
  const IMG_BASE = "/image/Myself/";

  function iconAlt(icon) {
    if (icon.alt) return icon.alt;
    // icon_Photoshop.png → Photoshop
    return icon.file.replace(/^icon_/i, "").replace(/\.[a-z0-9]+$/i, "");
  }

  function iconFig(icon) {
    const cls = "myself_image-skill" + (icon.wide ? " wide" : "") + (icon.border ? " bordered" : "");
    return `<figure class="${cls}"><img src="${IMG_BASE}${esc(icon.file)}" alt="${esc(iconAlt(icon))}" /></figure>`;
  }

  function renderSkills(skills) {
    const skill = $skill();
    if (!skill) return;
    const h3 = skill.querySelector("h3"); // giữ tiêu đề tĩnh theo ngôn ngữ trang
    const html = skills.map(g => {
      const items = pickList(g.items);
      const listHTML = items.length
        ? `<ul style="margin-left:20px">${items.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`
        : "";
      const iconsHTML = (g.icons || []).map(row =>
        `<div class="skill-icons">${row.map(iconFig).join("")}</div>`
      ).join("");
      return `<div class="skill-group"><h4>${esc(pick(g.title))}</h4>${listHTML}${iconsHTML}</div>`;
    }).join("");
    skill.innerHTML = (h3 ? h3.outerHTML : "") + html;
  }

  function itemsHTML(w) {
    const items = pickList(w.items);
    return items.length
      ? `<ul>${items.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`
      : "";
  }

  function headingHTML(tag, entry) {
    const period = pick(entry.period);
    const role = period ? ` <span class="role">(${esc(period)})</span>` : "";
    return `<${tag}>${esc(pick(entry.title))}${role}</${tag}>`;
  }

  function renderWork(work) {
    const article = $work();
    if (!article) return;
    const h1 = article.querySelector("h1"); // giữ tiêu đề tĩnh theo ngôn ngữ trang
    const html = work.map(w => {
      const kids = (w.children || []).map(c =>
        `<div class="work-exp_teky-project">${headingHTML("h4", c)}${itemsHTML(c)}</div>`
      ).join("");
      return `<div class="work-exp_item">${headingHTML("h3", w)}${itemsHTML(w)}${kids}</div>`;
    }).join("");
    article.innerHTML = (h1 ? h1.outerHTML : "") + html;
  }

  // ── Fetch (timeout 10s) ───────────────────────────────────
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  fetch(`${SHEETS_URL}?page=myself&lang=${LANG}`, { signal: ctrl.signal })
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      clearTimeout(timer);
      if (!data || data.error) throw new Error((data && data.error) || "Data rỗng");
      const hasInfo  = Array.isArray(data.info) && data.info.length;
      const hasWork  = Array.isArray(data.work) && data.work.length;
      const hasSkill = Array.isArray(data.skills) && data.skills.length;
      if (!hasInfo && !hasWork && !hasSkill) throw new Error("Data rỗng");
      // Khối nào không có data → trả lại bản tĩnh của khối đó
      if (hasInfo) renderInfo(data.info);
      else if (staticInfo !== null && $info()) $info().innerHTML = staticInfo;
      if (hasSkill) renderSkills(data.skills);
      else if (staticSkill !== null && $skill()) $skill().innerHTML = staticSkill;
      if (hasWork) renderWork(data.work);
      else if (staticWork !== null && $work()) $work().innerHTML = staticWork;
      console.log("myself-sheets: load OK —", (data.info || []).length, "info,",
        (data.skills || []).length, "skill,", (data.work || []).length, "work");
    })
    .catch(err => {
      clearTimeout(timer);
      restoreStatic(); // lỗi → hiện lại nội dung tĩnh
      console.warn("myself-sheets: dùng nội dung tĩnh (fetch lỗi):", err);
    });
})();
