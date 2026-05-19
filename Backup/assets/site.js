const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setLoadedState() {
  document.body.classList.add("is-loaded");
}

function setupReveal() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  document.querySelectorAll(".legal-hero[data-reveal], .legal-page[data-reveal]").forEach((item, index) => {
    window.setTimeout(() => item.classList.add("is-visible"), 120 + index * 120);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      history.pushState(null, "", link.getAttribute("href"));
    });
  });
}

function setupPageTransitions() {
  if (reduceMotion) return;

  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      event.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 220);
    });
  });
}

function setupActiveNav() {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      links.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${visible.target.id}`
        );
      });
    },
    { threshold: [0.22, 0.4, 0.6], rootMargin: "-18% 0px -58% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupDynamicWord() {
  const target = document.querySelector(".dynamic-word");
  if (!target || reduceMotion) return;

  const words = (target.dataset.words || target.textContent)
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length < 2) return;

  let wordIndex = 0;
  let charIndex = target.textContent.length;
  let deleting = true;

  const tick = () => {
    const word = words[wordIndex];

    if (deleting) {
      charIndex -= 1;
      target.textContent = word.slice(0, Math.max(charIndex, 0));

      if (charIndex <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, 180);
        return;
      }
    } else {
      const nextWord = words[wordIndex];
      charIndex += 1;
      target.textContent = nextWord.slice(0, charIndex);

      if (charIndex >= nextWord.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    }

    setTimeout(tick, deleting ? 58 : 92);
  };

  setTimeout(tick, 1600);
}

window.addEventListener("DOMContentLoaded", () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
  setLoadedState();
  setupReveal();
  setupSmoothAnchors();
  setupPageTransitions();
  setupActiveNav();
  setupDynamicWord();
});
