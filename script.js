(function () {
  "use strict";

  // Helpers
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  // Confirmation of GSAP and ScrollTrigger availability
  function safeRegisterGSAP() {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      try {
        gsap.registerPlugin(ScrollTrigger);
        return true;
      } catch (e) {
        console.warn("GSAP available but register failed", e);
        return false;
      }
    }
    return false;
  }

  // NAVBAR scroll effect
  function initNavbar() {
    const navbar = $(".navbar");
    if (!navbar) return;
    const onScroll = () => {
      if (window.scrollY > 30) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // initial
    onScroll();
  }

  // Smooth internal links (accounts for fixed navbar)
  function initSmoothLinks() {
    const links = $$('a[href^="#"]');
    const navbarHeight =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--navbar-height"
        )
      ) || 72;
    links.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const rect = target.getBoundingClientRect();
          const offsetTop = window.pageYOffset + rect.top - (navbarHeight + 12);
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      });
    });
  }

  // MENU Mobile
  function initMenuMobile() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("open");
    });

    // Fecha o menu ao clicar em um link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("open");
      });
    });
  }

  // FAB behavior
  function initFAB() {
    const fab = $("#fab");
    const fabMain = $("#fabMain");
    const fabOptions = document.getElementById("fabOptions");
    if (!fab || !fabMain || !fabOptions) return;
    fabMain.addEventListener("click", (e) => {
      e.stopPropagation();
      fab.classList.toggle("open");
      fabOptions.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!fab.contains(e.target) && fab.classList.contains("open")) {
        fab.classList.remove("open");
        fabOptions.classList.remove("open");
      }
    });
  }

  // Init Lazy Background
  function initLazyBackgrounds() {
    const lazyBackgrounds = document.querySelectorAll("[data-bg-image]");

    if (lazyBackgrounds.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0.001,
    };

    const backgroundObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const imageUrl = element.getAttribute("data-bg-image");

          element.style.backgroundImage = `url('${imageUrl}')`;

          element.removeAttribute("data-bg-image");
          observer.unobserve(element);
        }
      });
    }, observerOptions);

    lazyBackgrounds.forEach((bg) => {
      backgroundObserver.observe(bg);
    });
  }

  // Portfolio gallery modal
  function initGallery() {
    const galleries = {
      suite_casal: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        "https://images.unsplash.com/photo-1600210492493-0946911123ea",
      ],
      suite_infantil: [
        "https://images.unsplash.com/photo-1600566753190-58a0b1d2117f",
      ],
      sala: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"],
      cozinha: ["https://images.unsplash.com/photo-1556909114-87a56c87c3e1"],
      banheiro: [
        "https://images.unsplash.com/photo-1589176531086-df6f1cbd7470",
      ],
      escritorio: [
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
      ],
      variados: [
        "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
      ],
    };

    const modal = $("#galleryModal");
    const galleryImages = $("#galleryImages");
    if (!modal || !galleryImages) return;

    // open
    $$(".portfolio-card").forEach((card) => {
      card.addEventListener("click", () => {
        const type = card.dataset.gallery;
        const imgs = galleries[type] || [];
        galleryImages.innerHTML = imgs
          .map((src) => `<img src="${src}" loading="lazy" alt="Projeto">`)
          .join("");
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
        if (window.gtag)
          gtag("event", "open_gallery", {
            event_category: "engagement",
            event_label: type,
          });
      });
    });

    // close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeGallery();
    });
    window.closeGallery = function () {
      modal.classList.remove("open");
      galleryImages.innerHTML = "";
      document.body.style.overflow = "";
    };
  }

  // Form -> WhatsApp
  function initForm() {
    window.sendQuote = function (openWhatsApp = true) {
      const name = encodeURIComponent(
        (document.getElementById("clientName") || {}).value || ""
      );
      const phone = encodeURIComponent(
        (document.getElementById("clientPhone") || {}).value || ""
      );
      const hasProject = encodeURIComponent(
        (document.getElementById("hasProject") || {}).value || ""
      );
      const message = encodeURIComponent(
        (document.getElementById("clientMessage") || {}).value || ""
      );
      const ambientesEls = document.querySelectorAll(
        'input[name="ambientes"]:checked'
      );
      const ambientes = Array.from(ambientesEls)
        .map((i) => i.value)
        .join(", ");

      if (!name || !phone) {
        alert("Por favor preencha nome e telefone.");
        return;
      }

      const text = `Olá, sou ${decodeURIComponent(
        name
      )}%0aTelefone: ${decodeURIComponent(
        phone
      )}%0aJá tem projeto: ${decodeURIComponent(
        hasProject
      )}%0aAmbientes: ${ambientes}%0aMensagem: ${decodeURIComponent(
        message
      )}%0aRegião: Fortaleza / RMF`;
      const waNumber = "5585988355164";
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
        text
      )}`;

      if (window.gtag)
        gtag("event", "submit_orcamento", {
          event_category: "conversion",
          event_label: "form_to_whatsapp",
        });
      window.open(waUrl, "_blank");
    };
  }

  // Fade-up observer fallback (works even without GSAP)
  function initFadeObserver() {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    $$(".fade-up").forEach((el) => observer.observe(el));
  }

  // GSAP animations (if available)
  function initGSAP() {
    const ok = safeRegisterGSAP();
    if (!ok) return false;

    try {
      // hero parallax
      gsap.to(".hero-inner", {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          scrub: true,
        },
      });

      // staggered reveal for .fade-up
      gsap.utils.toArray(".fade-up").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.2,
            delay: i * 0.02,
            scrollTrigger: {
              trigger: el,
              start: "-20% 95%",
            },
          }
        );
      });

      // small hover interaction for portfolio
      $$(".portfolio-card").forEach((card) => {
        card.addEventListener("mouseenter", () =>
          gsap.to(card, { scale: 1.03, duration: 0.1 })
        );
        card.addEventListener("mouseleave", () =>
          gsap.to(card, { scale: 1, duration: 0.1 })
        );
      });

      return true;
    } catch (err) {
      console.warn("GSAP animations failed", err);
      return false;
    }
  }

  // Init all
  document.addEventListener("DOMContentLoaded", () => {
    initMenuMobile();
    initNavbar();
    initSmoothLinks();
    initFAB();
    initLazyBackgrounds();  
    initGallery();
    initForm();
    initFadeObserver();
    initGSAP();
  });
})();
