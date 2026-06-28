# Hướng dẫn setup Google Sheets CMS

## Bước 1 — Tạo Google Sheets

Mở [sheets.google.com](https://sheets.google.com) → tạo sheet mới → đặt tên **Blog CMS**.

Tạo các cột sau ở **hàng 1** (header):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | date | location | layout | text_en | text_vi | text_ja | mainImages | moreImages | scrollDir |

Thêm thêm 2 cột nếu dùng video:

| K | L |
|---|---|
| videoId | videoRatio |

---

## Bước 2 — Nhập dữ liệu

Mỗi hàng = 1 blog entry. Ví dụ hàng 2:

| Cột | Giá trị ví dụ | Ghi chú |
|-----|---------------|---------|
| A (id) | `blog18` | Không trùng, không dấu cách |
| B (date) | `2025.06.28` | Định dạng YYYY.MM.DD |
| C (location) | `Hà Nội` | Tự do |
| D (layout) | `1` | 1 / 2 / 3 / 4 / video |
| E (text_en) | `Caption in English.` | |
| F (text_vi) | `Caption tiếng Việt.` | |
| G (text_ja) | `日本語。` | |
| H (mainImages) | `Blog18_1.jpg\|16:9,Blog18_2.jpg\|3:4` | File\|ratio, cách nhau bởi dấu phẩy |
| I (moreImages) | `Blog18_3.jpg\|3:4,Blog18_4.jpg\|3:4` | Để trống nếu không có |
| J (scrollDir) | `horizontal` | `horizontal` hoặc `vertical` |
| K (videoId) | _(để trống)_ | Chỉ điền nếu layout = video |
| L (videoRatio) | _(để trống)_ | `16:9` hoặc `9:16` |

> **Ảnh:** đặt file vào folder `image/Blog/` trong repo, ghi đúng tên file (phân biệt hoa thường).

---

## Bước 3 — Tạo Apps Script

1. Trong Sheets: **Extensions → Apps Script**
2. Xoá code cũ, paste đoạn sau:

```javascript
function doGet(e) {
  const lang = (e.parameter.lang || "en").toLowerCase();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows  = sheet.getDataRange().getValues();
  const headers = rows[0];

  const COL = {};
  headers.forEach((h, i) => COL[h.toLowerCase()] = i);

  function parseImages(str) {
    if (!str) return [];
    return String(str).split(",").map(s => {
      const [file, ratio] = s.trim().split("|");
      return { file: file.trim(), ratio: (ratio || "4:3").trim() };
    }).filter(i => i.file);
  }

  const data = rows.slice(1)
    .filter(row => row[COL["id"]])
    .map(row => {
      const get = key => row[COL[key] ?? -1] ?? "";
      const layout = String(get("layout")).trim();
      const entry = {
        id:        String(get("id")).trim(),
        date:      String(get("date")).trim(),
        location:  String(get("location")).trim(),
        layout:    layout,
        text: {
          en: String(get("text_en")),
          vi: String(get("text_vi")),
          ja: String(get("text_ja")),
        },
        mainImages: parseImages(get("mainimages")),
        moreImages: parseImages(get("moreimages")),
        scrollDir:  String(get("scrolldir") || "horizontal").trim(),
      };
      if (layout === "video") {
        entry.videoId    = String(get("videoid")).trim();
        entry.videoRatio = String(get("videoratio") || "16:9").trim();
      }
      return entry;
    });

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Nhấn **Save** (Ctrl+S)
4. Nhấn **Deploy → New deployment**
5. Chọn type: **Web app**
6. Execute as: **Me**
7. Who has access: **Anyone**
8. Nhấn **Deploy** → copy URL (dạng `https://script.google.com/macros/s/ABC.../exec`)

---

## Bước 4 — Kết nối web với Sheets

Mở file `blog-sheets.js`, tìm dòng:

```javascript
const SHEETS_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";
```

Thay bằng URL vừa copy:

```javascript
const SHEETS_URL = "https://script.google.com/macros/s/ABC.../exec";
```

Lưu file → commit lên GitHub → Netlify tự deploy.

---

## Khi muốn thêm entry mới

1. Mở Google Sheets
2. Thêm hàng mới (dưới hàng cuối)
3. Điền thông tin, đặt ảnh vào repo
4. Commit ảnh lên GitHub → web cập nhật tự động

**Không cần đụng code gì cả.**

---

## Lưu ý

- Thứ tự hiển thị trên web = thứ tự hàng trong Sheets (hàng 2 hiển thị đầu tiên)
- Để ẩn 1 entry tạm thời: xoá nội dung cột `id` của hàng đó
- Nếu Sheets lỗi, web tự fallback về `blog-data.js` local
