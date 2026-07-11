# Hướng dẫn kết nối Blog & Myself với Google Sheets (Apps Script CMS)

Tài liệu này mô tả cách phần **Blog** (`en/blog`, `vi/blog`, `ja/blog`) và phần **Myself** (`en/myself`, `vi/myself`, `ja/myself`) lấy dữ liệu từ Google Sheets thông qua Google Apps Script, và cách cấu hình/khôi phục hệ thống này khi cần.

> **Code Apps Script hoàn chỉnh nằm trong file `apps-script/Code.gs`** của repo — khi cần chỉ việc copy toàn bộ file đó dán vào trình soạn thảo Apps Script.
>
> URL Web App được cấu hình tại **`sheets-config.js`** (dùng chung cho cả Blog và Myself).

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

---

## 2. Cấu trúc Google Sheet

Script mới (`apps-script/Code.gs`) đọc dữ liệu blog từ tab tên **"Blog"**. Nếu không có tab tên "Blog", script tự dùng **tab đầu tiên** của Spreadsheet (tương thích với setup cũ). Khuyến nghị: đổi tên tab blog thành "Blog" và giữ nó ở vị trí đầu tiên.

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

- `tên_file` là **tên file ảnh** (không kèm đường dẫn), phải tồn tại sẵn trong thư mục `image/Blog/` của repo (`IMG_BASE = "/image/Blog/"`).
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
2. Xoá code cũ, dán vào **toàn bộ nội dung file `apps-script/Code.gs`** trong repo.
3. Bấm **Deploy → New deployment**.
4. Chọn loại **Web app**.
   - **Execute as**: Me (tài khoản sở hữu Sheet).
   - **Who has access**: **Anyone** (bắt buộc, vì `blog-sheets.js` gọi fetch ẩn danh từ trình duyệt — nếu để "Anyone with Google account" hoặc "Only myself" sẽ bị lỗi CORS/401).
5. Bấm **Deploy**, cấp quyền (Authorize access) nếu được hỏi.
6. Copy **Web app URL** dạng:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
7. Dán URL này vào biến `SHEETS_URL` trong file **`sheets-config.js`** ở gốc project (dùng chung cho Blog và Myself):
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
- **Không có** cơ chế fallback offline trong code hiện tại — nếu muốn có bản dự phòng, cần sửa `blog-sheets.js` để render một mảng data cứng khi `catch()`.

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

---

## 11. Trang Myself — chỉnh sửa qua Google Sheets

Trang Myself (3 ngôn ngữ) đọc **khối thông tin cá nhân**, **khối Kỹ năng – Năng lực** và **khối Work Experience** từ tab **"Myself"** trong cùng Spreadsheet với blog. Chỉ ảnh cooperation và ảnh chân dung còn nằm tĩnh trong HTML.

**Khác với Blog:** nội dung tĩnh trong HTML được giữ làm **fallback** — nếu fetch lỗi hoặc tab "Myself" chưa tồn tại, trang hiển thị nội dung cũ như bình thường, không bị trống.

### 11.1. Luồng hoạt động

```
Tab "Myself" trong Google Sheet
        │
        ▼
Apps Script doGet(?page=myself) → JSON { info, work }
        │
        ▼
myself-sheets.js → thay nội dung <ul> thông tin + các khối work-exp
```

### 11.2. Thiết lập lần đầu

1. Mở Spreadsheet blog → tạo tab mới, đặt tên đúng là **`Myself`**. Đổi tên tab blog cũ thành **`Blog`** (giữ ở vị trí đầu).
2. Import file **`apps-script/myself-tab-mau.csv`** vào tab này (File → Import → Upload → chọn "Replace current sheet" khi đang đứng ở tab Myself). File mẫu đã chứa toàn bộ nội dung hiện tại của trang (EN/VI/JA).
3. Dán **toàn bộ `apps-script/Code.gs`** vào Apps Script (thay code cũ).
4. Deploy → Manage deployments → ✏️ → **New version** → Deploy (giữ nguyên URL cũ).
5. Kiểm tra: mở `SHEETS_URL?page=myself` trên trình duyệt → thấy JSON `{info: [...], work: [...]}` là đúng.

### 11.3. Cấu trúc tab "Myself"

Hàng đầu là header (không phân biệt hoa thường). Các cột:

| Cột | Áp dụng | Mô tả |
|---|---|---|
| `section` | ✅ mọi dòng | `info` (thông tin cá nhân), `skill` (kỹ năng) hoặc `work` (kinh nghiệm) |
| `key` | ✅ mọi dòng | Với `info`: `birthday`, `phone`, `email`, `address` (hoặc key mới tùy ý). Với `skill`/`work`: mã bất kỳ, duy nhất (vd `sk1`, `w1`) |
| `parent` | chỉ `work` | Để trống = công ty. Điền `key` của công ty = dự án con hiển thị bên trong công ty đó |
| `title_en/vi/ja` | `skill` + `work` | Tên nhóm kỹ năng / công ty / dự án theo ngôn ngữ |
| `period_en/vi/ja` | chỉ `work` | Thời gian, vd `2020 - Present` / `2020 - Nay` / `2020年〜現在`. Tự bọc trong ngoặc khi hiển thị |
| `text_en/vi/ja` | mọi dòng | Với `info`: giá trị hiển thị. Với `skill`: gạch đầu dòng chữ (như nhóm Language). Với `work`: các gạch đầu dòng. **Mỗi dòng 1 gạch**, xuống dòng trong ô bằng **Alt+Enter** (Mac: Cmd+Enter) |
| `icons` | chỉ `skill` | Icon của nhóm. **Mỗi dòng trong ô = 1 hàng icon**; các icon cách nhau dấu phẩy. Cú pháp 1 icon: `tên_file.png\|wide\|border\|alt text` — `wide` = icon ngang, `border` = viền xanh (CapCut, Blender), đoạn còn lại làm alt. File phải có sẵn trong `image/Myself/` |

Quy tắc chung:
- Ngôn ngữ nào để trống → tự fallback về `text_en` (giống blog). Giá trị giống nhau cả 3 thứ tiếng (SĐT, email...) chỉ cần điền cột `_en`.
- **Thứ tự hiển thị = thứ tự dòng trong Sheet** (không sắp xếp theo id như blog). Muốn công ty nào lên đầu thì kéo dòng lên trên.
- `key` của `info` quyết định cách render: `email` → link mailto, `birthday` dạng `DD.MM.YYYY` → thẻ `<time>`, còn lại hiển thị chữ thường. Thêm dòng `info` với key mới (vd `website`) sẽ hiện thành một dòng mới trong danh sách.
- Thêm công ty mới: thêm 1 dòng `section=work`, `key` mới (vd `w7`), điền title/period/text. Thêm dự án con: thêm dòng với `parent` = key công ty.
- Thêm nhóm kỹ năng mới: thêm dòng `section=skill`, key mới (vd `sk6`), điền `title_*` + `text_*` (chữ) và/hoặc `icons`. Một nhóm có thể có cả chữ lẫn icon (chữ hiện trước, icon sau). Muốn dùng icon mới thì upload file PNG vào `image/Myself/` trước.
- Tiêu đề khối ("Skills & Abilities" / "Kĩ năng – Năng lực" / "スキル・能力" và "WORK EXPERIENCE"...) vẫn tĩnh trong HTML từng ngôn ngữ.

### 11.4. Lỗi thường gặp (Myself)

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| Trang vẫn hiện nội dung cũ | Fetch lỗi → đang dùng fallback tĩnh | Xem Console: `myself-sheets: dùng nội dung tĩnh...`; kiểm tra tab tên đúng `Myself`, đã deploy New version chưa |
| Dự án con không nằm trong công ty | `parent` sai/không khớp `key` nào | Sửa `parent` đúng bằng `key` của công ty |
| Gạch đầu dòng dính thành 1 dòng | Các ý không được xuống dòng trong ô | Dùng Alt+Enter (Cmd+Enter trên Mac) giữa các ý |
| JSON trả về `{error: ...}` | Chưa tạo tab `Myself` | Tạo tab đúng tên |
