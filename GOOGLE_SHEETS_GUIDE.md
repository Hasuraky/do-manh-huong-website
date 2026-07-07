# Hướng dẫn kết nối Blog với Google Sheets (Apps Script CMS)

Tài liệu này mô tả cách phần **Blog** của website (`1.0_Blog_EN`, `2.0_Blog_VI`, `3.0_Blog_JP`) lấy dữ liệu từ Google Sheets thông qua Google Apps Script, và cách cấu hình/khôi phục hệ thống này khi cần.

---

## 1. Tổng quan luồng hoạt động

```
Google Sheet (dữ liệu blog)
        │
        ▼
Google Apps Script (doGet) ── deploy thành Web App
        │  trả về JSON
        ▼
blog-sheets.js  (fetch dữ liệu theo ?lang=)
        │  gọi window.blogRender(data)
        ▼
blog-render.js  (dựng HTML theo layout)
        │
        ▼
.blog-entries trong index.html của từng trang Blog
```

- `blog-sheets.js` là file **duy nhất** gọi mạng ra Apps Script. Nó không tự render, chỉ fetch rồi gọi `window.blogRender(data)`.
- `blog-render.js` không tự fetch — chỉ chờ được gọi.
- `blog-data.js` chỉ là mảng rỗng (`BLOG_DATA = []`), dùng làm chỗ dự phòng, **không còn được dùng thực tế** trong luồng hiện tại vì `blog-sheets.js` không import nó. Có thể giữ lại để tương lai làm fallback offline nếu muốn.

---

## 2. Cấu trúc Google Sheet

Sheet đang dùng là **sheet đang active** của Spreadsheet (`getActiveSpreadsheet().getActiveSheet()`), tức là **tab đầu tiên/đang mở** — không phải theo tên. Nếu đổi tên hoặc thêm nhiều tab, hãy đảm bảo tab chứa dữ liệu blog là tab đang active khi lưu, hoặc sửa script để chỉ định `getSheetByName("TênTab")`.

Hàng đầu tiên là **header**, tên cột **không phân biệt hoa thường** (script tự `toLowerCase()`). Các cột cần có:

| Cột (header) | Bắt buộc | Mô tả |
|---|---|---|
| `id` | ✅ | Mã định danh bài viết, dạng `blogN` (vd `blog1`, `blog12`). Dòng nào không có `id` sẽ bị bỏ qua. Phần số trong `id` dùng để **sắp xếp giảm dần** (id lớn hiện lên đầu). |
| `date` | ⭕ | Ngày đăng, có thể nhập dạng ngày bất kỳ Google Sheets nhận diện được (vd `2026-07-01`). Script tự format lại thành `YYYY.MM.DD`. Nếu để trống hoặc không parse được → giữ nguyên giá trị gốc dạng chuỗi. |
| `location` | ⭕ | Địa điểm, hiển thị cạnh ngày ở phần meta. |
| `layout` | ✅ | Số layout hoặc tên layout đặc biệt — xem bảng layout ở mục 3. |
| `text_en`, `text_vi`, `text_ja` | ⭕ | Nội dung caption theo từng ngôn ngữ. Trang EN dùng `text_en`, VI dùng `text_vi`, JP dùng `text_ja`. Nếu ngôn ngữ hiện tại rỗng, front-end tự fallback về `text_en`. |
| `slot1` … `slot7` | ⭕ (theo layout) | Danh sách ảnh cho từng ô, xem cú pháp ở mục 4. Layout nào cần bao nhiêu slot thì điền bấy nhiêu, các slot thừa bỏ trống. |
| `moreimages` | ⭕ | Dải ảnh cuộn thêm bên dưới bài viết (không áp dụng cho layout 6). Cú pháp giống các slot. |
| `scrolldir` | ⭕ | Hướng cuộn của `moreimages`: `horizontal` (mặc định) hoặc `vertical`. |
| `videoid` | Chỉ khi `layout` = `video`, `video-v`, `photo-video` | ID video YouTube (phần sau `v=` trong URL, vd `dQw4w9WgXcQ`). |
| `videoratio` | ⭕ (khi có video) | `16:9` (mặc định) hoặc `9:16`. Với layout `video-v` script luôn ép về `9:16`. |

> Lưu ý: script đọc cột theo `header.toLowerCase()`, vì vậy `moreImages` hay `moreimages` hay `MOREIMAGES` đều được, miễn đúng chính tả không dấu cách thừa.

---

## 3. Bảng mã Layout

`blog-render.js` định nghĩa các layout sau — điền đúng giá trị này vào cột `layout`:

| Giá trị `layout` | Bố cục | Slot cần dùng |
|---|---|---|
| `1` | Text + 1 ảnh/khối full width | `slot1` |
| `2` | Text + 2 khối cạnh nhau (50/50) | `slot1`, `slot2` |
| `3` | Text + 1 khối lớn bên trái + 2 khối nhỏ bên phải | `slot1` (lớn), `slot2`, `slot3` (nhỏ) |
| `4` | Text + 4 khối chia đều theo hàng ngang | `slot1`–`slot4` |
| `5` | Text + 3 khối bằng nhau theo hàng ngang | `slot1`–`slot3` |
| `6` | Text bên trái + `slot2` nhỏ dưới text + `slot1` lớn bên phải (không có `moreimages`) | `slot1`, `slot2` |
| `7` | Text + 2 cột trái/phải | `slot1`, `slot2` |
| `8` | Text + 1 khối full width tỉ lệ điện ảnh (khuyên dùng ratio `21:9`) | `slot1` |
| `9` | Text + 1 khối lớn trên + 3 khối nhỏ dưới | `slot1` (trên), `slot2`–`slot4` (dưới) |
| `10` | Text + 1 khối lớn trên + 6 khối nhỏ dưới (2 hàng × 3) | `slot1` (trên), `slot2`–`slot7` (dưới) |
| `video` | Text + video YouTube ngang | `videoid`, `videoratio` |
| `video-v` | Text + video YouTube dọc (ép 9:16) | `videoid` |
| `photo-video` | Text + ảnh bên trái + video bên phải | `slot1`, `videoid`, `videoratio` |

Nếu điền sai giá trị `layout` (không khớp bảng trên), bài viết đó sẽ **không hiển thị** — kiểm tra Console log sẽ thấy cảnh báo `unknown layout "..." for entry ...`.

---

## 4. Cú pháp điền ảnh vào các cột slot / moreimages

Mỗi ô slot chấp nhận **nhiều ảnh**, phân tách bằng dấu phẩy `,`. Mỗi ảnh viết theo dạng:

```
tên_file.jpg|tỉ_lệ
```

- `tên_file` là **tên file ảnh** (không kèm đường dẫn), phải tồn tại sẵn trong thư mục `image/Blog/` của repo (`IMG_BASE = "../image/Blog/"`).
- `tỉ_lệ` (không bắt buộc) là một trong: `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9`. Nếu bỏ trống hoặc không hợp lệ → mặc định `4:3`.

**Ví dụ:**

```
blog5-1.jpg|4:3
```
→ 1 ảnh cố định, tỉ lệ 4:3.

```
blog5-1.jpg|1:1, blog5-2.jpg|1:1, blog5-3.jpg|1:1
```
→ 3 ảnh, tự động chuyển thành **thanh cuộn ngang** kèm gợi ý "← swipe →" (hoặc "← vuốt →" / "← スワイプ →" tùy ngôn ngữ trang).

> Quan trọng: đây chỉ là **tên file**, không phải link ảnh online. Muốn thêm bài mới có ảnh mới, bạn phải **upload ảnh vào thư mục `image/Blog/` trong source code** trước, rồi mới điền tên file vào Sheet.

---

## 5. Thiết lập Google Apps Script (deploy Web App)

1. Mở Google Sheet chứa dữ liệu blog → **Extensions (Tiện ích mở rộng) → Apps Script**.
2. Xoá code mẫu, dán vào **toàn bộ đoạn code** `doGet(e)` + `formatDate()` (bản bạn đang dùng).
3. Bấm **Deploy → New deployment**.
4. Chọn loại **Web app**.
   - **Execute as**: Me (tài khoản sở hữu Sheet).
   - **Who has access**: **Anyone** (bắt buộc, vì `blog-sheets.js` gọi fetch ẩn danh từ trình duyệt — nếu để "Anyone with Google account" hoặc "Only myself" sẽ bị lỗi CORS/401).
5. Bấm **Deploy**, cấp quyền (Authorize access) nếu được hỏi.
6. Copy **Web app URL** dạng:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
7. Dán URL này vào biến `SHEETS_URL` trong file `blog-sheets.js` ở gốc project:
   ```js
   const SHEETS_URL = "https://script.google.com/macros/s/.../exec";
   ```

### Khi cần cập nhật code Apps Script sau này
Mỗi lần sửa code trong Apps Script, phải **Deploy → Manage deployments → chỉnh sửa (biểu tượng bút chì) → chọn "New version" → Deploy** thì thay đổi mới có hiệu lực trên URL cũ. Sửa code mà không tạo version mới sẽ **không** cập nhật ra ngoài.

### Kiểm tra nhanh
Dán trực tiếp URL kèm tham số ngôn ngữ vào trình duyệt để xem JSON trả về, ví dụ:
```
https://script.google.com/macros/s/XXXX/exec?lang=vi
```
Nếu thấy mảng JSON các entry là đã chạy đúng.

---

## 6. Cách đa ngôn ngữ hoạt động

- Mỗi trang blog set `<html lang="en">`, `lang="vi"`, hoặc `lang="ja"` tương ứng.
- `blog-sheets.js` đọc `document.documentElement.lang` và gọi:
  ```
  SHEETS_URL?lang=en   (hoặc vi / ja)
  ```
- Trong Apps Script hiện tại, tham số `lang` được nhận (`e.parameter.lang`) nhưng **chưa dùng để lọc dữ liệu** — script trả về **toàn bộ** các dòng cho mọi ngôn ngữ, chỉ khác nhau ở việc `blog-render.js` chọn đúng field `text_en` / `text_vi` / `text_ja` để hiển thị caption theo `LANG` hiện tại của trang. Điều này có nghĩa là **một Sheet duy nhất phục vụ cả 3 trang ngôn ngữ**, bạn không cần 3 sheet riêng.

---

## 7. Thứ tự hiển thị bài viết

Apps Script sắp xếp theo phần số trong `id`, **giảm dần** (id số lớn hơn hiện lên đầu, vd `blog12` > `blog2` > `blog1`). Muốn đổi bài nào lên đầu, chỉ cần đổi số trong `id` — không liên quan đến `date` hay thứ tự dòng trong Sheet.

---

## 8. Cơ chế dự phòng khi fetch lỗi

- Khi trang tải, `blog-sheets.js` hiện ngay 3 khối **skeleton loading** trong `.blog-entries`.
- Nếu fetch thành công và có dữ liệu (`data.length > 0`) → gọi `blogRender(data)`, skeleton được thay bằng nội dung thật.
- Nếu fetch lỗi (HTTP lỗi, JSON rỗng, mất mạng, sai quyền truy cập Web App...) → xoá skeleton, để trống `.blog-entries`, đồng thời log lỗi ra Console (`blog-sheets: lỗi fetch:`).
- **Không có** cơ chế fallback tự động sang `blog-data.js` trong code hiện tại — nếu muốn có bản dự phòng offline, cần chủ động sửa `blog-sheets.js` để dùng `BLOG_DATA` khi `catch()`.

---

## 9. Checklist khi thêm 1 bài blog mới

1. Upload ảnh liên quan vào `image/Blog/` trong source code (đúng tên file sẽ điền ở bước 3).
2. Thêm 1 dòng mới trong Sheet, đặt `id` là số lớn hơn bài mới nhất hiện có (vd đang có `blog12` thì bài mới là `blog13`).
3. Điền `layout` theo bảng ở mục 3, điền đúng số slot mà layout đó cần (xem mục 4 về cú pháp `file|ratio`).
4. Điền `date`, `location`, `text_en` / `text_vi` / `text_ja`.
5. Nếu layout có video: điền `videoid`, `videoratio`.
6. Không cần deploy lại Apps Script — chỉ cần lưu Sheet là dữ liệu mới sẽ tự lên khi tải lại trang (do `doGet` luôn đọc live từ Sheet).
7. Mở lại trang Blog (hard refresh / xoá cache nếu cần) để kiểm tra hiển thị đúng.

---

## 10. Các lỗi thường gặp

| Hiện tượng | Nguyên nhân khả dĩ | Cách xử lý |
|---|---|---|
| Trang Blog trắng, không hiện gì | `SHEETS_URL` sai/rỗng, hoặc Web App chưa deploy quyền "Anyone" | Kiểm tra lại bước 5, xem Console log |
| Bài viết bị thiếu, không hiện | `id` bị trống ở dòng đó | `doGet` lọc bỏ dòng không có `id` |
| Ảnh không hiện (vỡ ảnh) | Sai tên file, hoặc ảnh chưa upload vào `image/Blog/` | Kiểm tra chính xác tên file kể cả hoa/thường và đuôi file |
| Bài hiện sai layout / không hiện | Giá trị `layout` không khớp bảng mục 3 | Sửa lại đúng giá trị (`1`–`10`, `video`, `video-v`, `photo-video`) |
| Sửa Sheet nhưng web không cập nhật | Trình duyệt cache response fetch | Hard refresh (Ctrl/Cmd + Shift + R) |
| Sửa Apps Script nhưng không có hiệu lực | Chưa tạo **New version** khi deploy lại | Deploy → Manage deployments → New version |
