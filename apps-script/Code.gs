/** ═══════════════════════════════════════════════════════════════
 * Apps Script cho website huongdm.com — DÁN TOÀN BỘ FILE NÀY
 * vào trình soạn thảo Apps Script (Extensions → Apps Script).
 *
 * Phục vụ 2 loại request:
 *   - Blog:   GET ?lang=en|vi|ja      → JSON mảng bài blog (tab "Blog")
 *   - Myself: GET ?page=myself        → JSON {info, work}   (tab "Myself")
 *
 * Quy ước tab:
 *   - Tab blog nên đặt tên "Blog". Nếu không có tab tên "Blog",
 *     script sẽ dùng TAB ĐẦU TIÊN của Spreadsheet (tương thích cũ).
 *   - Tab Myself BẮT BUỘC tên "Myself".
 *
 * Sau khi sửa code phải: Deploy → Manage deployments → ✏️ → New version → Deploy
 * ═══════════════════════════════════════════════════════════════ */

var BLOG_SHEET_NAME   = "Blog";
var MYSELF_SHEET_NAME = "Myself";
var VALID_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9", "21:9"];

function doGet(e) {
  var page = String((e && e.parameter && e.parameter.page) || "").toLowerCase();
  var data = page === "myself" ? getMyselfData() : getBlogData();
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Helpers chung ─────────────────────────────────────────────── */

function readSheet(name, fallbackFirst) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh && fallbackFirst) sh = ss.getSheets()[0];
  if (!sh) return null;
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return { header: [], rows: [] };
  var header = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  return { header: header, rows: values.slice(1) };
}

function rowToObj(header, row) {
  var o = {};
  header.forEach(function (h, i) { if (h) o[h] = row[i]; });
  return o;
}

function str(v) { return v == null ? "" : String(v).trim(); }

function langText(o, base) {
  return {
    en: str(o[base + "_en"]),
    vi: str(o[base + "_vi"]),
    ja: str(o[base + "_ja"])
  };
}

function formatDate(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy.MM.dd");
  }
  var s = str(v);
  if (!s) return "";
  var d = new Date(s);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy.MM.dd");
  }
  return s; // không parse được → giữ nguyên chuỗi gốc
}

/* Ô ảnh: "file.jpg|4:3, file2.jpg|1:1" → [{file, ratio}, ...] */
function parseImgList(cell) {
  var s = str(cell);
  if (!s) return [];
  return s.split(",").map(function (part) {
    var bits = part.split("|");
    var file = str(bits[0]);
    var ratio = str(bits[1]);
    if (!file) return null;
    return { file: file, ratio: VALID_RATIOS.indexOf(ratio) >= 0 ? ratio : "4:3" };
  }).filter(function (x) { return x; });
}

function numPart(id) {
  var m = String(id).match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/* ── BLOG (tab "Blog" hoặc tab đầu tiên) ───────────────────────── */

function getBlogData() {
  var sheet = readSheet(BLOG_SHEET_NAME, true);
  if (!sheet) return [];
  var entries = [];
  sheet.rows.forEach(function (row) {
    var o = rowToObj(sheet.header, row);
    var id = str(o.id);
    if (!id) return; // bỏ dòng không có id
    var layout = str(o.layout) || "1";
    var entry = {
      id: id,
      date: formatDate(o.date),
      location: str(o.location),
      layout: layout,
      text: langText(o, "text"),
      moreImages: parseImgList(o.moreimages),
      scrollDir: str(o.scrolldir).toLowerCase() === "vertical" ? "vertical" : "horizontal"
    };
    for (var n = 1; n <= 7; n++) entry["slot" + n] = parseImgList(o["slot" + n]);
    var videoId = str(o.videoid);
    if (videoId) {
      entry.videoId = videoId;
      entry.videoRatio = layout === "video-v" ? "9:16"
        : (str(o.videoratio) === "9:16" ? "9:16" : "16:9");
    }
    entries.push(entry);
  });
  // id số lớn hơn hiện lên đầu (blog12 > blog2 > blog1)
  entries.sort(function (a, b) { return numPart(b.id) - numPart(a.id); });
  return entries;
}

/* ── MYSELF (tab "Myself") ─────────────────────────────────────── */

function getMyselfData() {
  var sheet = readSheet(MYSELF_SHEET_NAME, false);
  if (!sheet) {
    return { error: 'Không tìm thấy tab "' + MYSELF_SHEET_NAME + '"', info: [], work: [] };
  }
  var info = [];
  var workAll = [];

  sheet.rows.forEach(function (row) {
    var o = rowToObj(sheet.header, row);
    var section = str(o.section).toLowerCase();

    if (section === "info") {
      var key = str(o.key).toLowerCase();
      if (!key) return;
      info.push({ key: key, text: langText(o, "text") });

    } else if (section === "work") {
      var wkey = str(o.key);
      if (!wkey) return;
      workAll.push({
        key: wkey,
        parent: str(o.parent),
        title: langText(o, "title"),
        period: langText(o, "period"),
        items: {
          en: splitLines(o.text_en),
          vi: splitLines(o.text_vi),
          ja: splitLines(o.text_ja)
        },
        children: []
      });
    }
  });

  // Ghép dự án con (parent = key của công ty) vào công ty, giữ thứ tự dòng
  var byKey = {};
  workAll.forEach(function (w) { byKey[w.key] = w; });
  var work = [];
  workAll.forEach(function (w) {
    if (w.parent && byKey[w.parent]) byKey[w.parent].children.push(w);
    else work.push(w);
  });

  return { info: info, work: work };
}

/* Ô nhiều dòng (Alt+Enter trong Sheets) → mảng gạch đầu dòng */
function splitLines(cell) {
  return str(cell).split(/\r?\n/).map(function (s) { return s.trim(); }).filter(function (s) { return s; });
}
