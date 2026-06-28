// 1_Blog_EN.js

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
