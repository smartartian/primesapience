const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress span");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileNavLinks = [...document.querySelectorAll(".mobile-nav a")];
const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 24);
  if (progressBar) {
    progressBar.style.width = `${progress * 100}%`;
  }
}

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);

function closeMenu() {
  document.body.classList.remove("nav-open");
  mobileNav?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "打开导航");
  mobileNav?.setAttribute("aria-hidden", "true");
}

menuToggle?.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  document.body.classList.toggle("nav-open", willOpen);
  mobileNav?.classList.toggle("is-open", willOpen);
  menuToggle.setAttribute("aria-expanded", String(willOpen));
  menuToggle.setAttribute("aria-label", willOpen ? "关闭导航" : "打开导航");
  mobileNav?.setAttribute("aria-hidden", String(!willOpen));
});

mobileNavLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -7% 0px",
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  if (reduceMotion) {
    element.classList.add("is-visible");
  } else {
    revealObserver.observe(element);
  }
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry) return;

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${visibleEntry.target.id}`;
      link.classList.toggle("is-active", isActive);
    });
  },
  {
    threshold: [0.15, 0.35, 0.55],
    rootMargin: "-20% 0px -55% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

function initSignalCanvas() {
  const canvas = document.querySelector("#signal-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrame = 0;
  let points = [];
  const pointer = { x: -1000, y: -1000, active: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const density = width < 700 ? 42 : width < 1100 ? 68 : 92;
    points = Array.from({ length: density }, (_, index) => ({
      baseX: ((index * 47 + (index % 7) * 29) % 997) / 997,
      baseY: ((index * 83 + (index % 11) * 37) % 991) / 991,
      phase: index * 0.79,
      speed: 0.00017 + (index % 5) * 0.000035,
      radius: index % 9 === 0 ? 1.8 : index % 3 === 0 ? 1.3 : 0.8,
      accent: index % 8 === 0 ? "brand" : index % 13 === 0 ? "warm" : "plain",
      x: 0,
      y: 0,
    }));
  }

  function positionPoint(point, time) {
    const waveX = Math.sin(time * point.speed + point.phase) * 28;
    const waveY = Math.cos(time * point.speed * 1.18 + point.phase) * 22;
    let x = point.baseX * width + waveX;
    let y = point.baseY * height + waveY;

    if (pointer.active) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 180 && distance > 0.1) {
        const force = (1 - distance / 180) * 34;
        x += (dx / distance) * force;
        y += (dy / distance) * force;
      }
    }

    point.x = x;
    point.y = y;
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#090c0f";
    context.fillRect(0, 0, width, height);

    const glowX = pointer.active ? pointer.x : width * 0.74;
    const glowY = pointer.active ? pointer.y : height * 0.46;
    const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.52);
    glow.addColorStop(0, "rgba(5, 168, 229, 0.105)");
    glow.addColorStop(0.45, "rgba(5, 168, 229, 0.024)");
    glow.addColorStop(1, "rgba(5, 168, 229, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    points.forEach((point) => positionPoint(point, time));

    for (let first = 0; first < points.length; first += 1) {
      for (let second = first + 1; second < points.length; second += 1) {
        const a = points[first];
        const b = points[second];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance < (width < 700 ? 105 : 142)) {
          const alpha = (1 - distance / 150) * 0.16;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(125, 211, 235, ${alpha})`;
          context.lineWidth = 0.65;
          context.stroke();
        }
      }
    }

    points.forEach((point) => {
      const pulse = 0.6 + Math.sin(time * 0.0014 + point.phase) * 0.35;
      const color =
        point.accent === "brand"
          ? `rgba(5, 168, 229, ${0.62 * pulse})`
          : point.accent === "warm"
            ? `rgba(255, 129, 82, ${0.5 * pulse})`
            : `rgba(238, 243, 244, ${0.25 * pulse})`;

      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();

      if (point.accent === "brand") {
        context.beginPath();
        context.arc(point.x, point.y, point.radius * 4.8, 0, Math.PI * 2);
        context.strokeStyle = "rgba(5, 168, 229, 0.09)";
        context.lineWidth = 0.8;
        context.stroke();
      }
    });

    const scanY = ((time * 0.022) % (height + 240)) - 120;
    context.beginPath();
    context.moveTo(0, scanY);
    context.lineTo(width, scanY);
    context.strokeStyle = "rgba(131, 223, 248, 0.08)";
    context.lineWidth = 1;
    context.stroke();

    animationFrame = window.requestAnimationFrame(draw);
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.x = -1000;
    pointer.y = -1000;
  });

  window.addEventListener("resize", resize);
  resize();

  if (reduceMotion) {
    draw(0);
    window.cancelAnimationFrame(animationFrame);
  } else {
    animationFrame = window.requestAnimationFrame(draw);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else if (!reduceMotion) {
      animationFrame = window.requestAnimationFrame(draw);
    }
  });
}

initSignalCanvas();
