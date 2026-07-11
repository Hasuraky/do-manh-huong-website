/**
 * myself-sheets.js — trang Myself lấy dữ liệu từ Google Sheets (tab "Myself")
 *
 * Fetch SHEETS_URL?page=myself (URL trong sheets-config.js) rồi thay:
 *   - Khối thông tin cá nhân: <ul> trong .base-info_name
 *   - Khối kinh nghiệm: các .work-exp_item trong .work-exp (giữ nguyên <h1>)
 *
 * Nội dung tĩnh sẵn có trong HTML là FALLBACK — nếu fetch lỗi,
 * trang vẫn hiển thị bình thường với nội dung cũ.
 */
(function () {
  if (typeof SHEETS_URL === "undefined" || !SHEETS_URL) return;

  const LANG = document.documentElement.lang || "en";

  const esc = s => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // Chọn text theo ngôn ngữ trang, rỗng thì fallback về EN
  const pick = t => (t && (t[LANG] || t.en)) || "";
  const pickList = items =>
    (items && ((items[LANG] && items[LANG].length) ? items[LANG] : items.en)) || [];

  // Map key → itemprop schema.org (key khác vẫn hiển thị, chỉ không có itemprop)
  const ITEMPROP = { birthday: "birthDate", phone: "telephone", email: "email", address: "address" };

  // ── Khối thông tin cá nhân ────────────────────────────────
  function renderInfo(info) {
    const ul = document.querySelector(".base-info_name ul");
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

  // ── Khối kinh nghiệm làm việc ─────────────────────────────
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
    const article = document.querySelector(".work-exp");
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

  // ── Fetch ─────────────────────────────────────────────────
  fetch(`${SHEETS_URL}?page=myself&lang=${LANG}`)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      if (!data || data.error) throw new Error((data && data.error) || "Data rỗng");
      if (Array.isArray(data.info) && data.info.length) renderInfo(data.info);
      if (Array.isArray(data.work) && data.work.length) renderWork(data.work);
      console.log("myself-sheets: load OK —", (data.info || []).length, "info,", (data.work || []).length, "work");
    })
    .catch(err => {
      // Giữ nguyên nội dung tĩnh trong HTML
      console.warn("myself-sheets: dùng nội dung tĩnh (fetch lỗi):", err);
    });
})();
