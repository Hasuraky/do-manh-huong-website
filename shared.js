// shared.js — dùng chung mọi trang

// ── 1. Lang dropdown + hamburger ──────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Lang switch
  const langSwitch = document.querySelector(".lang-switch");
  const langBtn    = document.getElementById("langToggle");
  if (langSwitch && langBtn) {
    let closeTimer = null;
    const openMenu  = () => { clearTimeout(closeTimer); closeTimer = null; langSwitch.classList.add("open"); langBtn.setAttribute("aria-expanded","true"); };
    const closeMenu = () => { langSwitch.classList.remove("open"); langBtn.setAttribute("aria-expanded","false"); };
    const delayClose= () => { closeTimer = setTimeout(() => { closeMenu(); closeTimer = null; }, 600); };
    langSwitch.addEventListener("mouseenter", openMenu);
    langSwitch.addEventListener("mouseleave", delayClose);
    langBtn.addEventListener("click", e => { e.preventDefault(); langSwitch.classList.contains("open") ? closeMenu() : openMenu(); });
  }

  // Hamburger mobile
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
    });
    mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));
  }

  // ── 2. Hero intro fade-up ────────────────────────────────
  const heroText = document.querySelector(".hero-intro");
  if (heroText) {
    // Đã handle bằng CSS animation, chỉ cần class
    heroText.classList.add("hero-intro--ready");
  }

  // ── 3. Typewriter cho intro text ────────────────────────
  const typeEl = document.querySelector(".intro-typewriter");
  if (typeEl) {
    const fullHTML = typeEl.innerHTML;
    // Lấy text thuần, giữ <br>
    const lines = typeEl.innerText || typeEl.textContent;
    typeEl.innerHTML = "";
    typeEl.style.visibility = "visible";
    let i = 0;
    // Dùng innerText để gõ, rồi render HTML thật sau
    const chars = lines.split("");
    const cursor = document.createElement("span");
    cursor.className = "type-cursor";
    typeEl.appendChild(cursor);
    const tick = setInterval(() => {
      if (i >= chars.length) {
        clearInterval(tick);
        // Restore full HTML (với <br> tags)
        typeEl.innerHTML = fullHTML;
        return;
      }
      cursor.before(chars[i] === "\n" ? document.createElement("br") : document.createTextNode(chars[i]));
      i++;
    }, 18);
  }

  // ── 4. Scroll reveal cho blog cards ─────────────────────
  const revealEls = document.querySelectorAll(".reveal-on-scroll");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px" });
    window._blogRevealIO = io;
    revealEls.forEach(el => io.observe(el));
  }
  // Force reveal elements đã trong viewport ngay khi load (trang ngắn như Myself)
  setTimeout(() => {
    document.querySelectorAll(".reveal-on-scroll:not(.revealed)").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add("revealed");
      }
    });
  }, 100);

  // ── 5. Hover scale trên ảnh blog ─────────────────────────
  // Handled by CSS — không cần JS

  // ── 6. Page fade transition ──────────────────────────────
  document.querySelectorAll("a[href]").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto") || href.startsWith("http") || link.getAttribute("target") === "_blank") return;
    link.addEventListener("click", e => {
      e.preventDefault();
      document.body.classList.add("page-exit");
      setTimeout(() => { window.location.href = href; }, 180);
    });
  });
  // Fade in khi vào trang
  document.body.classList.add("page-enter");
  setTimeout(() => document.body.classList.remove("page-enter"), 250);
});

// ── 7. Gallery Lightbox với swipe + next/prev ─────────────
(function setupLightbox() {

  const EXCLUDED = ":not(.hero-banner__image):not(.no-zoom)";

  // ── Build overlay (1 lần duy nhất) ───────────────────────
  const overlay = document.createElement("div");
  overlay.className = "lb-overlay";
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-label","Image viewer");
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev" aria-label="Previous image">‹</button>
    <button class="lb-next" aria-label="Next image">›</button>
    <div class="lb-stage">
      <img class="lb-img" alt="" draggable="false" />
    </div>
    <div class="lb-counter"></div>
    <div class="lb-dots"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector(".lb-img");
  const lbPrev    = overlay.querySelector(".lb-prev");
  const lbNext    = overlay.querySelector(".lb-next");
  const lbClose   = overlay.querySelector(".lb-close");
  const lbCounter = overlay.querySelector(".lb-counter");
  const lbDots    = overlay.querySelector(".lb-dots");

  let currentGroup = [];
  let currentIdx   = 0;
  let isOpen       = false;

  // ── Lấy danh sách ảnh hiện tại (gọi mỗi lần open) ───────
  function getAllImgs() {
    return Array.from(document.querySelectorAll(`main img${EXCLUDED}`)).filter(img => {
      return !img.closest(".base-info_name") && !img.closest(".myself_image-skill") && !img.closest(".cooperation-image");
    });
  }

  function getGroup(img) {
    const allImgs = getAllImgs();
    const article = img.closest("article, .film-section");
    if (article) return allImgs.filter(i => article.contains(i));
    return allImgs;
  }

  // ── Open / close ─────────────────────────────────────────
  function open(img) {
    currentGroup = getGroup(img);
    currentIdx   = currentGroup.indexOf(img);
    if (currentIdx === -1) { currentGroup = [img]; currentIdx = 0; }
    isOpen       = true;
    overlay.classList.add("lb-open");
    document.body.style.overflow = "hidden";
    renderSlide(currentIdx, "none");
    buildDots();
    overlay.focus();
  }

  function close() {
    isOpen = false;
    overlay.classList.remove("lb-open");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  // ── Render slide ─────────────────────────────────────────
  function renderSlide(idx, dir) {
    const img = currentGroup[idx];
    if (!img) return;
    if (dir !== "none") {
      lbImg.classList.add(dir === "next" ? "lb-exit-left" : "lb-exit-right");
    }
    setTimeout(() => {
      lbImg.classList.remove("lb-exit-left","lb-exit-right","lb-enter-right","lb-enter-left");
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      if (dir !== "none") {
        lbImg.classList.add(dir === "next" ? "lb-enter-right" : "lb-enter-left");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => lbImg.classList.remove("lb-enter-right","lb-enter-left"));
        });
      }
      const total = currentGroup.length;
      lbCounter.textContent = total > 1 ? `${idx + 1} / ${total}` : "";
      lbDots.querySelectorAll(".lb-dot").forEach((d, i) => d.classList.toggle("lb-dot--active", i === idx));
      lbPrev.style.opacity = idx === 0 ? "0.25" : "1";
      lbPrev.style.pointerEvents = idx === 0 ? "none" : "auto";
      lbNext.style.opacity = idx === currentGroup.length - 1 ? "0.25" : "1";
      lbNext.style.pointerEvents = idx === currentGroup.length - 1 ? "none" : "auto";
      const showNav = total > 1;
      lbPrev.style.display = showNav ? "" : "none";
      lbNext.style.display = showNav ? "" : "none";
      lbDots.style.display = showNav ? "" : "none";
    }, dir === "none" ? 0 : 160);
  }

  function buildDots() {
    const n = currentGroup.length;
    lbDots.innerHTML = n > 1
      ? currentGroup.map((_, i) => `<span class="lb-dot${i === currentIdx ? " lb-dot--active" : ""}"></span>`).join("")
      : "";
  }

  function prev() { if (currentIdx > 0) { currentIdx--; renderSlide(currentIdx, "prev"); } }
  function next() { if (currentIdx < currentGroup.length - 1) { currentIdx++; renderSlide(currentIdx, "next"); } }

  // ── Events ───────────────────────────────────────────────
  lbClose.addEventListener("click", close);
  lbPrev.addEventListener("click", prev);
  lbNext.addEventListener("click", next);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", e => {
    if (!isOpen) return;
    if (e.key === "Escape")     close();
    if (e.key === "ArrowLeft")  prev();
    if (e.key === "ArrowRight") next();
  });
  let touchStartX = 0, touchStartY = 0;
  overlay.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  overlay.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    else if (dy > 80 && Math.abs(dx) < 40) { close(); }
  }, { passive: true });

  // ── Gắn click — dùng event delegation trên main ──────────
  // Hoạt động với cả ảnh tĩnh và ảnh được inject sau (blog entries)
  document.addEventListener("click", e => {
    const img = e.target.closest(`main img${EXCLUDED}`);
    if (!img) return;
    if (img.closest(".myself_image-skill") || img.closest(".cooperation-image")) return;
    open(img);
  });

  // ── Cursor zoom-in — gắn khi attach ──────────────────────
  window._attachLightbox = function() {
    document.querySelectorAll(`main img${EXCLUDED}`).forEach(img => {
      if (img.closest(".myself_image-skill") || img.closest(".cooperation-image")) return;
      img.style.cursor = "zoom-in";
    });
  };
  window._attachLightbox();

})();

// ── 8. Protect images ─────────────────────────────────────
document.addEventListener("contextmenu", e => e.preventDefault());
document.querySelectorAll("img").forEach(img => {
  img.setAttribute("draggable","false");
  img.addEventListener("dragstart", e => e.preventDefault());
});

// ── Re-init sau khi blog-render.js inject HTML ────────────
document.addEventListener("blog-rendered", function () {
  // Re-observe scroll reveal
  const revealEls = document.querySelectorAll(".reveal-on-scroll:not(.revealed)");
  if (revealEls.length && window._blogRevealIO) {
    revealEls.forEach(el => window._blogRevealIO.observe(el));
  }
  // Re-attach lightbox
  if (window._attachLightbox) window._attachLightbox();
  // Re-protect images
  document.querySelectorAll("img").forEach(img => {
    img.setAttribute("draggable","false");
    img.addEventListener("dragstart", e => e.preventDefault());
  });
  // Init auto-scroll
  initAutoScroll();
});

// ── 9. Auto-scroll với hiệu ứng Push ─────────────────────
function initAutoScroll() {
  const INTERVAL     = 2000;
  const RESUME_DELAY = 4000;

  document.querySelectorAll(".be-scroll").forEach(track => {
    const figures = track.querySelectorAll("figure");
    if (figures.length < 2) return;

    let current  = 0;
    let timer    = null;
    let isPaused = false;

    function scrollToIdx(idx) {
      const fig = figures[idx];
      if (!fig) return;
      // scrollLeft = vị trí figure trong track (tính từ track)
      const trackRect = track.getBoundingClientRect();
      const figRect   = fig.getBoundingClientRect();
      const offset    = figRect.left - trackRect.left + track.scrollLeft;
      track.scrollTo({ left: offset, behavior: "smooth" });
      current = idx;
    }

    function next() {
      const total   = figures.length;
      const nextIdx = (current + 1) % total;
      scrollToIdx(nextIdx);
    }

    function startTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!isPaused) next();
      }, INTERVAL);
    }

    // Dừng khi người dùng vuốt, tự chạy lại sau RESUME_DELAY
    let resumeTimer = null;

    track.addEventListener("touchstart", () => {
      isPaused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    }, { passive: true });

    track.addEventListener("touchend", () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        // Đồng bộ current với vị trí scroll hiện tại
        let closest = 0;
        let minDist = Infinity;
        figures.forEach((fig, i) => {
          const trackRect = track.getBoundingClientRect();
          const figRect   = fig.getBoundingClientRect();
          const dist = Math.abs(figRect.left - trackRect.left);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        current = closest;
        isPaused = false;
      }, RESUME_DELAY);
    }, { passive: true });

    // Dừng khi hover (desktop)
    track.addEventListener("mouseenter", () => { isPaused = true; });
    track.addEventListener("mouseleave", () => { isPaused = false; });

    startTimer();
  });
}