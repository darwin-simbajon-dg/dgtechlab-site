const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setLoadedState() {
  document.body.classList.add("is-loaded");
}

function setupEffectVisibility() {
  const effectSections = document.querySelectorAll(
    ".hero, .ocean-depth, .audience, #services, .product-showcase, #process, .proof, #contact"
  );

  if (!effectSections.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    effectSections.forEach((section) => section.classList.add("effects-active"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("effects-active", entry.isIntersecting);
      });
    },
    { threshold: 0.01, rootMargin: "18% 0px 18% 0px" }
  );

  effectSections.forEach((section) => observer.observe(section));
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

function setupMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (!button || !nav) return;

  const setOpen = (isOpen) => {
    document.body.classList.toggle("is-menu-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  button.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("is-menu-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("is-menu-open")) return;
    if (nav.contains(event.target) || button.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      button.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 641px)").matches) {
      setOpen(false);
    }
  });
}

function setupHeaderFirefly() {
  const header = document.querySelector(".site-header");
  const firefly = document.querySelector(".header-firefly");
  const navItems = [...document.querySelectorAll(".nav a:not(.nav-cta)")];
  if (!header || !firefly || !navItems.length || reduceMotion) return;

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (coarsePointer) return;

  const root = document.documentElement;
  let targetX = window.innerWidth / 2;
  let targetY = 48;
  let currentX = targetX;
  let currentY = targetY;
  let isNearHeader = false;
  let animationId = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateTarget = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  };

  const illuminateMenu = () => {
    isNearHeader = false;

    navItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(currentX - centerX, currentY - centerY);
      const glow = clamp(1 - distance / 135, 0, 1);
      const itemX = clamp(((currentX - rect.left) / rect.width) * 100, 0, 100);
      const itemY = clamp(((currentY - rect.top) / rect.height) * 100, 0, 100);

      item.style.setProperty("--item-glow", glow.toFixed(3));
      item.style.setProperty("--item-x", `${itemX.toFixed(1)}%`);
      item.style.setProperty("--item-y", `${itemY.toFixed(1)}%`);
      item.classList.toggle("is-lit", glow > 0.08);

      if (glow > 0.04) isNearHeader = true;
    });
  };

  const animate = () => {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;

    root.style.setProperty("--mouse-x", `${currentX.toFixed(2)}px`);
    root.style.setProperty("--mouse-y", `${currentY.toFixed(2)}px`);

    illuminateMenu();
    root.style.setProperty("--firefly-scale", isNearHeader ? "1.35" : "1");
    document.body.classList.toggle("has-header-firefly", isNearHeader);
    animationId = window.requestAnimationFrame(animate);
  };

  window.addEventListener("pointermove", updateTarget);
  animationId = window.requestAnimationFrame(animate);

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationId);
    window.removeEventListener("pointermove", updateTarget);
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
  let active = true;
  const hero = target.closest(".hero");

  if (hero && "IntersectionObserver" in window) {
    active = hero.classList.contains("effects-active");
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
      },
      { threshold: 0.08, rootMargin: "12% 0px 12% 0px" }
    );
    observer.observe(hero);
  }

  const tick = () => {
    if (!active) {
      setTimeout(tick, 500);
      return;
    }

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

function setupHeroCompanyCards() {
  const cards = [...document.querySelectorAll("[data-company-card]")];
  if (cards.length < 2) return;

  const floatSizeClasses = ["company-card-xs", "company-card-sm", "company-card-md", "company-card-lg"];

  const setFeatured = (selectedCard) => {
    const activeCard = cards.find((card) => card.classList.contains("is-active"));
    if (!selectedCard || selectedCard === activeCard) return;

    const selectedSlot = selectedCard.dataset.slot || "1";
    const selectedSizeClass = floatSizeClasses.find((className) => selectedCard.classList.contains(className)) || "company-card-md";

    if (activeCard) {
      activeCard.classList.remove("company-card-featured", "is-active");
      activeCard.classList.add("company-card-float", selectedSizeClass);
      activeCard.dataset.slot = selectedSlot;
      activeCard.setAttribute("aria-pressed", "false");
    }

    selectedCard.classList.remove("company-card-float", ...floatSizeClasses);
    selectedCard.classList.add("company-card-featured", "is-active");
    selectedCard.dataset.slot = "featured";
    selectedCard.setAttribute("aria-pressed", "true");
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => setFeatured(card));
  });
}

function setupProofWaves() {
  const canvas = document.querySelector(".proof-waves");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let animationId = 0;
  let active = false;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const wavePath = (base, amplitude, frequency, speed, offset) => {
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width + 8; x += 8) {
      const y =
        base +
        Math.sin(x * frequency + frame * speed + offset) * amplitude +
        Math.sin(x * frequency * 0.42 + frame * speed * 0.64 + offset) * amplitude * 0.54;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
  };

  const draw = () => {
    animationId = 0;
    ctx.clearRect(0, 0, width, height);

    const seaGlow = ctx.createLinearGradient(0, 0, 0, height);
    seaGlow.addColorStop(0, "rgba(0, 210, 255, 0.02)");
    seaGlow.addColorStop(0.38, "rgba(10, 37, 64, 0.34)");
    seaGlow.addColorStop(0.74, "rgba(2, 10, 18, 0.86)");
    seaGlow.addColorStop(1, "rgba(1, 5, 12, 0.98)");
    ctx.fillStyle = seaGlow;
    ctx.fillRect(0, 0, width, height);

    const layers = [
      { base: height * 0.34, amp: 10, freq: 0.014, speed: 0.018, alpha: 0.3, color: "0, 210, 255" },
      { base: height * 0.48, amp: 14, freq: 0.011, speed: 0.014, alpha: 0.26, color: "99, 91, 255" },
      { base: height * 0.55, amp: 20, freq: 0.009, speed: 0.011, alpha: 0.72, color: "1, 5, 12" },
    ];

    layers.forEach((layer, index) => {
      wavePath(layer.base, layer.amp, layer.freq, layer.speed, index * 1.7);
      const fill = ctx.createLinearGradient(0, layer.base - 40, 0, height);
      fill.addColorStop(0, `rgba(${layer.color}, ${layer.alpha})`);
      fill.addColorStop(0.62, index === 2 ? "rgba(1, 5, 12, 0.86)" : `rgba(${layer.color}, ${layer.alpha * 0.18})`);
      fill.addColorStop(1, index === 2 ? "rgba(0, 2, 8, 0.98)" : `rgba(${layer.color}, ${layer.alpha * 0.18})`);
      ctx.fillStyle = fill;
      ctx.fill();
    });

    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 3; i += 1) {
      const y = height * (0.32 + i * 0.14) + Math.sin(frame * 0.012 + i) * 9;
      const shine = ctx.createLinearGradient(0, y, width, y);
      shine.addColorStop(0, "rgba(139, 232, 255, 0)");
      shine.addColorStop(0.5, `rgba(139, 232, 255, ${0.08 - i * 0.014})`);
      shine.addColorStop(1, "rgba(183, 178, 255, 0)");
      ctx.strokeStyle = shine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const waveY = y + Math.sin(x * 0.012 + frame * 0.02 + i) * (6 + i * 2);
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";

    frame += reduceMotion ? 0 : 1;
    if (!reduceMotion && active) {
      animationId = window.requestAnimationFrame(draw);
    }
  };

  resize();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active && !animationId) draw();
        if (!active) {
          window.cancelAnimationFrame(animationId);
          animationId = 0;
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(canvas.closest(".proof") || canvas);
  } else {
    active = true;
    draw();
  }

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationId);
    animationId = 0;
    resize();
    if (active || reduceMotion) draw();
  });
}

function setupLighthouseBeam() {
  const canvas = document.querySelector(".proof-beam");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let animationId = 0;
  let active = false;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const drawBeam = (angle, alpha) => {
    const originX = width * 0.5;
    const originY = height * 0.38;
    const length = width * 0.62;
    const spread = 0.18;
    const endX = originX + Math.cos(angle) * length;
    const endY = originY + Math.sin(angle) * length;
    const sideA = angle - spread;
    const sideB = angle + spread;

    const beam = ctx.createRadialGradient(originX, originY, 0, originX, originY, length);
    beam.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.44})`);
    beam.addColorStop(0.22, `rgba(139, 232, 255, ${alpha * 0.2})`);
    beam.addColorStop(0.58, `rgba(183, 178, 255, ${alpha * 0.1})`);
    beam.addColorStop(1, "rgba(0, 210, 255, 0)");

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + Math.cos(sideA) * length, originY + Math.sin(sideA) * length);
    ctx.quadraticCurveTo(endX, endY, originX + Math.cos(sideB) * length, originY + Math.sin(sideB) * length);
    ctx.closePath();
    ctx.fillStyle = beam;
    ctx.fill();

    const core = ctx.createLinearGradient(originX, originY, endX, endY);
    core.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.34})`);
    core.addColorStop(0.38, `rgba(139, 232, 255, ${alpha * 0.18})`);
    core.addColorStop(1, "rgba(139, 232, 255, 0)");
    ctx.strokeStyle = core;
    ctx.lineWidth = Math.max(10, width * 0.012);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const glow = ctx.createRadialGradient(originX, originY, 0, originX, originY, 42);
    glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.72})`);
    glow.addColorStop(0.35, `rgba(139, 232, 255, ${alpha * 0.32})`);
    glow.addColorStop(1, "rgba(139, 232, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(originX, originY, 42, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = () => {
    animationId = 0;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "screen";

    const sweep = Math.sin(frame * 0.014);
    const baseAlpha = 0.62 + Math.sin(frame * 0.046) * 0.12;
    drawBeam(-0.08 + sweep * 0.22, baseAlpha);
    drawBeam(Math.PI + 0.08 - sweep * 0.22, baseAlpha * 0.82);

    ctx.globalCompositeOperation = "source-over";
    frame += reduceMotion ? 0 : 1;
    if (!reduceMotion && active) {
      animationId = window.requestAnimationFrame(draw);
    }
  };

  resize();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active && !animationId) draw();
        if (!active) {
          window.cancelAnimationFrame(animationId);
          animationId = 0;
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(canvas.closest(".proof") || canvas);
  } else {
    active = true;
    draw();
  }

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationId);
    animationId = 0;
    resize();
    if (active || reduceMotion) draw();
  });
}

function setupProcessThunder() {
  const stormSection = document.querySelector("#process");
  const lightningBolt = stormSection?.querySelector(".process-lightning-bolt");
  if (!stormSection || !lightningBolt || reduceMotion) return;

  const setFlash = ({ top = 0, left = 0, right = 0, full = 0, bolt = 0 }) => {
    stormSection.style.setProperty("--flash-top", top);
    stormSection.style.setProperty("--flash-left", left);
    stormSection.style.setProperty("--flash-right", right);
    stormSection.style.setProperty("--flash-full", full);
    stormSection.style.setProperty("--bolt-opacity", bolt);
  };

  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const thunderFlash = async () => {
    const flashSide = Math.random();
    const boltLeft = 25 + Math.random() * 55;
    const boltRotate = -12 + Math.random() * 24;

    stormSection.style.setProperty("--bolt-left", `${boltLeft}%`);
    stormSection.style.setProperty("--bolt-rotate", `${boltRotate}deg`);

    if (flashSide < 0.33) {
      setFlash({ top: 0.42, left: 0.55, full: 0.1, bolt: 0.95 });
    } else if (flashSide < 0.66) {
      setFlash({ top: 0.36, right: 0.58, full: 0.08, bolt: 0.85 });
    } else {
      setFlash({ top: 0.5, left: 0.35, right: 0.35, full: 0.14, bolt: 1 });
    }

    await sleep(70);
    setFlash({ top: 0.05, left: 0.06, right: 0.06, full: 0.01, bolt: 0 });
    await sleep(90);
    setFlash({ top: 0.28, left: 0.32, right: 0.32, full: 0.07, bolt: 0.55 });
    await sleep(45);
    setFlash({});
  };

  const scheduleNextThunder = () => {
    const randomDelay = 2600 + Math.random() * 4600;
    window.setTimeout(async () => {
      if (stormSection.classList.contains("is-visible")) {
        await thunderFlash();
      }
      scheduleNextThunder();
    }, randomDelay);
  };

  scheduleNextThunder();
}

function setupCrystalGlow() {
  const section = document.querySelector("#services");
  if (!section || reduceMotion) return;

  let active = false;
  let timer = 0;

  const setGlow = ({ left = 0.16, right = 0.16, floor = 0.1, flash = 0 }) => {
    section.style.setProperty("--crystal-left", left);
    section.style.setProperty("--crystal-right", right);
    section.style.setProperty("--crystal-floor", floor);
    section.style.setProperty("--crystal-flash", flash);
  };

  const pulse = () => {
    if (!active) {
      timer = window.setTimeout(pulse, 800);
      return;
    }

    const side = Math.random();
    if (side < 0.34) {
      setGlow({ left: 0.34, right: 0.12, floor: 0.16, flash: 0.02 });
    } else if (side < 0.68) {
      setGlow({ left: 0.12, right: 0.34, floor: 0.18, flash: 0.025 });
    } else {
      setGlow({ left: 0.24, right: 0.26, floor: 0.3, flash: 0.035 });
    }

    window.setTimeout(() => setGlow({ left: 0.14, right: 0.14, floor: 0.09, flash: 0 }), 420);
    timer = window.setTimeout(pulse, 1400 + Math.random() * 1600);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
      },
      { threshold: 0.18 }
    );
    observer.observe(section);
  } else {
    active = true;
  }

  pulse();
  window.addEventListener("pagehide", () => window.clearTimeout(timer));
}

function setupCityLights() {
  const canvas = document.querySelector(".audience-lights");
  const section = document.querySelector("#who");
  if (!canvas || !section) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let animationId = 0;
  let active = false;
  let lights = [];

  const buildLights = () => {
    const regions = [
      { x1: 0.02, x2: 0.22, y1: 0.22, y2: 0.9, count: 46 },
      { x1: 0.74, x2: 0.98, y1: 0.24, y2: 0.9, count: 50 },
      { x1: 0.26, x2: 0.72, y1: 0.54, y2: 0.9, count: 38 },
    ];

    lights = regions.flatMap((region) =>
      Array.from({ length: region.count }, () => {
        const palette = [
          [139, 232, 255],
          [183, 178, 255],
          [162, 89, 255],
          [80, 168, 255],
        ];
        return {
          x: width * (region.x1 + Math.random() * (region.x2 - region.x1)),
          y: height * (region.y1 + Math.random() * (region.y2 - region.y1)),
          w: 2 + Math.random() * 5,
          h: 2 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.018 + Math.random() * 0.04,
          color: palette[Math.floor(Math.random() * palette.length)],
          threshold: 0.14 + Math.random() * 0.42,
        };
      })
    );
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildLights();
  };

  const draw = () => {
    animationId = 0;
    ctx.clearRect(0, 0, width, height);

    if (active || reduceMotion) {
      ctx.globalCompositeOperation = "screen";
      lights.forEach((light) => {
        const pulse = Math.sin(frame * light.speed + light.phase);
        if (pulse <= light.threshold && !reduceMotion) return;

        const alpha = reduceMotion ? 0.22 : 0.2 + Math.max(0, pulse) * 0.55;
        const [r, g, b] = light.color;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(light.x, light.y, light.w, light.h);

        const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 18);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.42})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(light.x + light.w / 2, light.y + light.h / 2, 18, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    }

    frame += 1;
    if (!reduceMotion && active) {
      animationId = window.requestAnimationFrame(draw);
    }
  };

  resize();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active && !animationId) draw();
        if (!active) {
          window.cancelAnimationFrame(animationId);
          animationId = 0;
          ctx.clearRect(0, 0, width, height);
        }
      },
      { threshold: 0.14 }
    );
    observer.observe(section);
  } else {
    active = true;
  }

  if (active || reduceMotion) draw();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationId);
    animationId = 0;
    resize();
    if (active || reduceMotion) draw();
  });
}

function setupContactSunrise() {
  const section = document.querySelector("#contact");
  if (!section) return;

  let progress = reduceMotion ? 0.68 : 0;
  let frame = 0;
  let active = false;
  let complete = reduceMotion;
  let animationId = 0;

  const smoothstep = (edge0, edge1, value) => {
    const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return x * x * (3 - 2 * x);
  };

  const setVar = (name, value) => {
    section.style.setProperty(name, value);
  };

  const applySunrise = (value) => {
    const sunVisible = smoothstep(0.05, 0.38, value);
    const daylight = smoothstep(0.14, 0.92, value);
    const warmth = smoothstep(0.08, 0.64, value);
    const ridge = smoothstep(0.16, 0.62, value);
    const shimmer = Math.sin(frame * 0.026) * 0.012;

    setVar("--sunrise-progress", value.toFixed(3));
    setVar("--sunrise-sun-y", `${(88 - value * 34).toFixed(2)}%`);
    setVar("--sunrise-sun-opacity", (sunVisible * 0.94).toFixed(3));
    setVar("--sunrise-sun-core", (sunVisible * 0.76).toFixed(3));
    setVar("--sunrise-sun-mid", (sunVisible * 0.5).toFixed(3));
    setVar("--sunrise-sun-halo", (0.04 + sunVisible * 0.22).toFixed(3));
    setVar("--sunrise-horizon-warm", (warmth * 0.28).toFixed(3));
    setVar("--sunrise-haze-alpha", (0.08 + warmth * 0.22).toFixed(3));
    setVar("--sunrise-ridge-alpha", (ridge * 0.22).toFixed(3));
    setVar("--sunrise-sky-cyan", (daylight * 0.16).toFixed(3));
    setVar("--sunrise-darkness", (0.74 - daylight * 0.52).toFixed(3));
    setVar("--sunrise-darkness-mid", (0.44 - daylight * 0.25).toFixed(3));
    setVar("--sunrise-darkness-low", (0.6 - daylight * 0.34).toFixed(3));
    setVar("--sunrise-mountain-dim", (0.26 - daylight * 0.12).toFixed(3));
    setVar("--sunrise-photo-brightness", (0.54 + daylight * 0.5).toFixed(3));
    setVar("--sunrise-photo-saturation", (0.78 + daylight * 0.34).toFixed(3));
    setVar("--sunrise-panel-warm", (daylight * 0.16).toFixed(3));
    setVar("--sunrise-sky-saturation", (0.9 + daylight * 0.34).toFixed(3));
  };

  const draw = () => {
    animationId = 0;

    if (active && !complete) {
      progress = Math.min(1, progress + 0.0024);
      if (progress >= 1) complete = true;
    } else if (active && complete) {
      progress = 0.88 + Math.sin(frame * 0.01) * 0.045;
    }

    applySunrise(progress);
    frame += 1;
    if (!reduceMotion && active) {
      animationId = window.requestAnimationFrame(draw);
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasActive = active;
        active = entry.isIntersecting;

        if (entry.isIntersecting && !wasActive) {
          progress = 0.12;
          frame = 0;
          complete = false;
          applySunrise(progress);
          if (!animationId && !reduceMotion) draw();
        } else if (!entry.isIntersecting) {
          window.cancelAnimationFrame(animationId);
          animationId = 0;
          progress = 0;
          complete = false;
          applySunrise(progress);
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(section);
  } else {
    active = true;
  }

  applySunrise(progress);
  if (active || reduceMotion) draw();
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationId));
}

function setupPlatformSunrise() {
  const section = document.querySelector(".ocean-depth");
  if (!section) return;

  let progress = reduceMotion ? 0.62 : 0;
  let frame = 0;
  let active = false;
  let complete = reduceMotion;
  let animationId = 0;

  const smoothstep = (edge0, edge1, value) => {
    const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return x * x * (3 - 2 * x);
  };

  const setVar = (name, value) => {
    section.style.setProperty(name, value);
  };

  const applyLight = (value) => {
    const sunVisible = smoothstep(0.04, 0.36, value);
    const daylight = smoothstep(0.12, 0.88, value);
    const rays = smoothstep(0.18, 0.76, value);
    const bioglow = 0.12 + daylight * 0.22 + Math.sin(frame * 0.022) * 0.018;

    setVar("--platform-progress", value.toFixed(3));
    setVar("--platform-sun-y", `${(86 - value * 28).toFixed(2)}%`);
    setVar("--platform-sun-core", (sunVisible * 0.46).toFixed(3));
    setVar("--platform-sun-mid", (sunVisible * 0.28).toFixed(3));
    setVar("--platform-sun-halo", (0.05 + sunVisible * 0.18).toFixed(3));
    setVar("--platform-rays-cyan", (0.01 + rays * 0.075).toFixed(3));
    setVar("--platform-rays-violet", (0.01 + rays * 0.06).toFixed(3));
    setVar("--platform-haze", (0.1 + daylight * 0.16).toFixed(3));
    setVar("--platform-bioglow", Math.max(0, bioglow).toFixed(3));
    setVar("--platform-particle-a", Math.min(0.72, bioglow + 0.34).toFixed(3));
    setVar("--platform-particle-b", Math.min(0.66, bioglow + 0.28).toFixed(3));
    setVar("--platform-particle-c", Math.min(0.56, bioglow + 0.18).toFixed(3));
    setVar("--platform-particle-d", Math.min(0.6, bioglow + 0.22).toFixed(3));
    setVar("--platform-darkness", (0.56 - daylight * 0.34).toFixed(3));
    setVar("--platform-darkness-mid", (0.26 - daylight * 0.14).toFixed(3));
    setVar("--platform-darkness-low", (0.34 - daylight * 0.18).toFixed(3));
    setVar("--platform-ray-angle", `${(frame * 0.016).toFixed(2)}deg`);
  };

  const draw = () => {
    animationId = 0;

    if (active && !complete) {
      progress = Math.min(1, progress + 0.002);
      if (progress >= 1) complete = true;
    } else if (active && complete) {
      progress = 0.82 + Math.sin(frame * 0.01) * 0.05;
    }

    applyLight(progress);
    frame += 1;
    if (!reduceMotion && active) {
      animationId = window.requestAnimationFrame(draw);
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasActive = active;
        active = entry.isIntersecting;

        if (entry.isIntersecting && !wasActive) {
          progress = 0.1;
          frame = 0;
          complete = false;
          applyLight(progress);
          if (!animationId && !reduceMotion) draw();
        } else if (!entry.isIntersecting) {
          window.cancelAnimationFrame(animationId);
          animationId = 0;
          progress = 0;
          complete = false;
          applyLight(progress);
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(section);
  } else {
    active = true;
  }

  applyLight(progress);
  if (active || reduceMotion) draw();
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationId));
}

window.addEventListener("DOMContentLoaded", () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  const isHomePage = document.body.classList.contains("home-page");

  setLoadedState();
  setupEffectVisibility();
  setupReveal();
  setupSmoothAnchors();
  setupMobileMenu();
  setupHeaderFirefly();
  setupPageTransitions();

  if (isHomePage) {
    setupActiveNav();
    setupDynamicWord();
    setupHeroCompanyCards();
    setupCityLights();
    setupCrystalGlow();
    setupProcessThunder();
    setupLighthouseBeam();
    setupProofWaves();
    setupPlatformSunrise();
    setupContactSunrise();
  }
});
