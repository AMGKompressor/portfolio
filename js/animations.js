/**
 * GSAP motion — toned down and sequenced.
 * Scroll reveals hide targets first, then animate in on enter (no visible-then-slide flash).
 */
(function () {
  "use strict";

  if (typeof gsap === "undefined") return;

  const SCROLL_PX_PER_SEC = 42;

  /**
   * Infinite vertical marquee: strip tall enough to cover the viewport, then duplicated once.
   * @param {string} trackSelector
   * @param {"up"|"down"} direction
   */
  function initSideScrollMarquee(trackSelector, direction) {
    const track = document.querySelector(trackSelector);
    if (!track) return;

    const strip = track.querySelector(".side-scroll__strip:not(.side-scroll__strip--loop)");
    if (!strip) return;

    if (!strip.dataset.baseCount) {
      strip.dataset.baseCount = String(strip.children.length);
    }

    function resetTrack() {
      track.querySelectorAll(".side-scroll__strip--loop").forEach((node) => node.remove());
    }

    /** Repeat the base tile set until one strip is taller than the viewport. */
    function fillStripToViewport() {
      const baseCount = parseInt(strip.dataset.baseCount, 10) || 1;
      while (strip.children.length > baseCount) {
        strip.lastElementChild.remove();
      }

      const minHeight = window.innerHeight * 1.2;
      let guard = 0;
      while (strip.offsetHeight < minHeight && guard < 48) {
        for (let i = 0; i < baseCount; i += 1) {
          strip.appendChild(strip.children[i].cloneNode(true));
        }
        guard += 1;
      }
    }

    function buildTrack() {
      resetTrack();
      fillStripToViewport();

      const loopStrip = strip.cloneNode(true);
      loopStrip.classList.add("side-scroll__strip--loop");
      loopStrip.setAttribute("aria-hidden", "true");
      track.appendChild(loopStrip);
    }

    function startLoop() {
      buildTrack();

      const loopHeight = strip.offsetHeight;
      if (loopHeight < 1) return;

      const duration = loopHeight / SCROLL_PX_PER_SEC;

      gsap.killTweensOf(track);
      gsap.set(track, { y: direction === "down" ? -loopHeight : 0 });

      gsap.to(track, {
        y: direction === "down" ? 0 : -loopHeight,
        duration,
        ease: "none",
        repeat: -1,
      });
    }

    const imgs = strip.querySelectorAll("img");
    let pending = imgs.length;

    function onStripReady() {
      pending -= 1;
      if (pending <= 0) {
        startLoop();
      }
    }

    if (!pending) {
      startLoop();
    } else {
      imgs.forEach((img) => {
        if (img.complete) {
          onStripReady();
        } else {
          img.addEventListener("load", onStripReady, { once: true });
          img.addEventListener("error", onStripReady, { once: true });
        }
      });
    }

    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(startLoop, 150);
    }

    window.addEventListener("resize", onResize);

    return function cleanupSideScrollMarquee() {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      gsap.killTweensOf(track);
      resetTrack();
    };
  }

  const sideScrollMm = gsap.matchMedia();
  sideScrollMm.add("(prefers-reduced-motion: no-preference)", () => {
    const cleanupUp = initSideScrollMarquee(".side-scroll__track--up", "up");
    const cleanupDown = initSideScrollMarquee(".side-scroll__track--down", "down");
    return () => {
      cleanupUp?.();
      cleanupDown?.();
    };
  });

  if (typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  function markRevealReady() {
    document.documentElement.classList.add("reveal-initialized");
  }

  /**
   * @param {string} selector
   * @param {{ start?: string, y?: number, x?: number, duration?: number, ease?: string, stagger?: number }} opts
   */
  function initScrollReveal(selector, opts) {
    const options = opts || {};
    const targets = gsap.utils.toArray(selector);
    if (!targets.length) return;

    const fromY = options.y !== undefined ? options.y : 18;
    const fromX = options.x !== undefined ? options.x : 0;

    gsap.set(targets, { autoAlpha: 0, y: fromY, x: fromX });

    ScrollTrigger.batch(targets, {
      start: options.start || "top 88%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          x: 0,
          duration: options.duration !== undefined ? options.duration : 0.45,
          ease: options.ease || "power2.out",
          stagger: options.stagger || 0,
          overwrite: true,
        });
      },
    });
  }

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(
      [
        "[data-animate]",
        ".section-eyebrow",
        "#home-heading",
        "#home > .lede",
        "#home .btn",
        "#overview-heading",
        "#overview > .lede",
      ],
      { clearProps: "all" }
    );
    markRevealReady();
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const ctx = gsap.context(() => {
      const loadTl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 0.45 },
      });

      loadTl
        .from(".page-frame-inner", { autoAlpha: 0, duration: 0.3 })
        .from(".top-banner", { y: -10, autoAlpha: 0, duration: 0.35 }, "<");

      if (document.getElementById("home-heading")) {
        loadTl
          .from("#home-heading", { y: 12, autoAlpha: 0, duration: 0.4 }, ">-0.08")
          .from("#home > .lede", { y: 10, autoAlpha: 0, stagger: 0.14, duration: 0.35 }, ">-0.12")
          .from("#home .btn", { y: 8, autoAlpha: 0, stagger: 0.08, duration: 0.3 }, ">-0.08")
          .from(".hero-card", { y: 12, autoAlpha: 0, duration: 0.4 }, ">-0.04");
      }

      if (document.getElementById("overview-heading")) {
        loadTl
          .from("#overview-heading", { y: 12, autoAlpha: 0, duration: 0.4 }, ">-0.08")
          .from("#overview > .lede", { y: 10, autoAlpha: 0, duration: 0.35 }, ">-0.12");
      }

      gsap.to(".hero-photo-notch img", {
        y: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-card",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      initScrollReveal(".section-block:not(#home):not(#overview) > .lede", {
        y: 10,
        stagger: 0.08,
        duration: 0.35,
        ease: "power1.out",
      });

      initScrollReveal("[data-animate='card']:not(.hero-card)", {
        y: 6,
        stagger: 0.08,
        duration: 0.4,
        ease: "power2.out",
      });

      initScrollReveal(".section-eyebrow", {
        x: -24,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      });

      initScrollReveal(".footer-nav a, .footer-band > p", {
        y: 8,
        stagger: 0.05,
        duration: 0.3,
        ease: "power1.out",
        start: "top 93%",
      });

      markRevealReady();
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  });
})();
