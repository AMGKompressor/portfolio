/**
 * Portfolio UI — nav, mobile menu, gallery modal, section tracking.
 */
(function () {
  "use strict";

  const navLinks = document.querySelectorAll(".side-nav a, .footer-nav a");
  const sections = document.querySelectorAll(".section-block[id]");
  const toggle = document.querySelector(".mobile-nav-toggle");
  const sideNav = document.querySelector(".side-nav");
  const modal = document.querySelector(".modal");
  const modalImg = document.querySelector(".modal__img");
  const modalClose = document.querySelector(".modal__close");

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  if (toggle && sideNav) {
    toggle.addEventListener("click", () => {
      const open = sideNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (sideNav) {
        sideNav.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  function openModal(src, alt) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = alt || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    modalClose?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalImg.src = "";
  }

  document.querySelectorAll(".gallery__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (img) openModal(img.src, img.alt);
    });
  });

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  window.addEventListener("load", () => {
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  });
})();
