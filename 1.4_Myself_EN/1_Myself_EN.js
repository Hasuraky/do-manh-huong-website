// 1_Myself_EN.js

document.addEventListener("DOMContentLoaded", () => {
  const langSwitch = document.querySelector(".lang-switch");
  const langBtn = document.getElementById("langToggle");

  if (!langSwitch || !langBtn) return;

  let closeTimer = null;

  const openMenu = () => {
    // Hủy timer đóng nếu chuột quay lại nhanh
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    langSwitch.classList.add("open");
    langBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    langSwitch.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
  };

  const delayedClose = () => {
    // Trì hoãn 0.6 giây rồi mới đóng
    closeTimer = setTimeout(() => {
      closeMenu();
      closeTimer = null;
    }, 600); // bạn có thể chỉnh 500–1000ms tùy ý
  };

  // Hover mở menu
  langSwitch.addEventListener("mouseenter", openMenu);

  // Hover rời ra → trì hoãn đóng
  langSwitch.addEventListener("mouseleave", delayedClose);

  // Click để hỗ trợ mobile
  langBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Nếu đang mở → đóng ngay
    if (langSwitch.classList.contains("open")) {
      closeMenu();
      return;
    }

    // Nếu đang đóng → mở
    openMenu();
  });
});
// =========================
//  IMAGE LIGHTBOX – CLICK TO ZOOM
// =========================
(function setupImageLightbox() {
  // Lấy tất cả ảnh trong phần nội dung chính
  const images = document.querySelectorAll(".myself-home img");
  if (!images || images.length === 0) return;

  // Tạo overlay chỉ 1 lần
  const overlay = document.createElement("div");
  overlay.className = "image-lightbox";
  overlay.setAttribute("aria-hidden", "true");

  const overlayInner = document.createElement("div");
  overlayInner.className = "image-lightbox__inner";

  const overlayImg = document.createElement("img");
  overlayImg.className = "image-lightbox__image";
  overlayImg.alt = "";

  overlayInner.appendChild(overlayImg);
  overlay.appendChild(overlayInner);
  document.body.appendChild(overlay);

  function openLightbox(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || "";
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    // Khóa scroll nền
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    overlayImg.src = "";
  }

  // Click vào nền tối hoặc vùng trống để đóng
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target === overlayInner) {
      closeLightbox();
    }
  });

  // Nhấn ESC để đóng
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  // Gắn event cho từng ảnh
  images.forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      openLightbox(img.src, img.alt);
    });
  });
})();

// =========================
// PREVENT RIGHT-CLICK SAVE IMAGE
// =========================
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// =========================
// PREVENT DRAGGING IMAGES
// =========================
const imgs = document.querySelectorAll("img");
imgs.forEach((img) => {
  img.setAttribute("draggable", "false");
  img.addEventListener("dragstart", (e) => e.preventDefault());
});
