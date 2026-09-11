(() => {
  "use strict";

  const stage = document.querySelector("[data-orbit-stage]");
  const canvas = document.querySelector("#petem-orbit");
  if (!stage || !(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stars = Array.from({ length: 54 }, (_, index) => {
    const wave = Math.sin(index * 117.17) * 43758.5453;
    const wave2 = Math.sin((index + 19) * 83.41) * 12731.743;
    return {
      x: wave - Math.floor(wave),
      y: wave2 - Math.floor(wave2),
      radius: 0.45 + (index % 4) * 0.18,
      phase: (index % 11) / 11,
    };
  });

  let width = 1;
  let height = 1;
  let frame = 0;
  let visible = true;
  let pointer = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let palette = {};

  const cssColor = (name, fallback) => {
    const value = getComputedStyle(document.body).getPropertyValue(name).trim();
    return value || fallback;
  };

  const readPalette = () => {
    palette = {
      ink: cssColor("--pm-ink", "#18223a"),
      muted: cssColor("--pm-muted", "#626675"),
      coral: cssColor("--pm-coral", "#c65243"),
      blue: cssColor("--pm-blue", "#315eaa"),
      gold: cssColor("--pm-gold", "#a86f05"),
    };
  };

  const resize = () => {
    const bounds = stage.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(performance.now());
  };

  const traceOrbit = (radiusX, radiusY, rotation, color, alpha, lineWidth = 1) => {
    context.save();
    context.rotate(rotation);
    context.beginPath();
    context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
    context.restore();
  };

  const satellite = (radiusX, radiusY, rotation, angle, color, size) => {
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const x0 = Math.cos(angle) * radiusX;
    const y0 = Math.sin(angle) * radiusY;
    const x = x0 * cosR - y0 * sinR;
    const y = x0 * sinR + y0 * cosR;

    context.save();
    context.shadowBlur = size * 4;
    context.shadowColor = color;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return { x, y };
  };

  const draw = (now) => {
    context.clearRect(0, 0, width, height);
    const size = Math.min(width, height);
    const time = motionQuery.matches ? 2.4 : now / 1000;

    pointer.x += (target.x - pointer.x) * 0.055;
    pointer.y += (target.y - pointer.y) * 0.055;

    context.save();
    context.globalAlpha = 0.24;
    context.fillStyle = palette.muted;
    stars.forEach((star) => {
      const shimmer = motionQuery.matches ? 0.65 : 0.48 + Math.sin(time * 0.8 + star.phase * 8) * 0.17;
      context.globalAlpha = Math.max(0.08, shimmer * 0.28);
      context.beginPath();
      context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();

    context.save();
    context.translate(width / 2 + pointer.x * size * 0.035, height / 2 + pointer.y * size * 0.035);

    traceOrbit(size * 0.36, size * 0.20, -0.52, palette.coral, 0.44, 1.25);
    traceOrbit(size * 0.35, size * 0.15, 0.67, palette.blue, 0.4, 1.1);
    traceOrbit(size * 0.28, size * 0.34, 0.24, palette.gold, 0.34, 0.9);
    traceOrbit(size * 0.41, size * 0.38, -0.14, palette.ink, 0.12, 0.75);

    const peter = satellite(size * 0.36, size * 0.20, -0.52, time * 0.44 + 0.4, palette.coral, Math.max(4.5, size * 0.011));
    const marta = satellite(size * 0.35, size * 0.15, 0.67, -time * 0.37 + 2.4, palette.blue, Math.max(4.5, size * 0.011));
    satellite(size * 0.28, size * 0.34, 0.24, time * 0.22 + 4.1, palette.gold, Math.max(2.8, size * 0.006));

    context.save();
    context.beginPath();
    context.moveTo(peter.x, peter.y);
    context.quadraticCurveTo(pointer.x * size * 0.12, pointer.y * size * 0.12, marta.x, marta.y);
    context.globalAlpha = 0.18;
    context.setLineDash([3, 7]);
    context.strokeStyle = palette.ink;
    context.lineWidth = 0.9;
    context.stroke();
    context.restore();

    context.restore();
  };

  const tick = (now) => {
    draw(now);
    frame = visible && !motionQuery.matches ? requestAnimationFrame(tick) : 0;
  };

  const restart = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (visible && !motionQuery.matches) frame = requestAnimationFrame(tick);
    else draw(performance.now());
  };

  stage.addEventListener("pointermove", (event) => {
    if (motionQuery.matches) return;
    const bounds = stage.getBoundingClientRect();
    target = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    };
  });

  stage.addEventListener("pointerleave", () => {
    target = { x: 0, y: 0 };
  });

  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && !document.hidden;
    restart();
  }, { rootMargin: "80px" }).observe(stage);

  const themeObserver = new MutationObserver(() => {
    readPalette();
    draw(performance.now());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-bs-theme"] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "data-bs-theme"] });

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden && stage.getBoundingClientRect().bottom > 0;
    restart();
  });

  motionQuery.addEventListener("change", restart);
  readPalette();
  resize();
  restart();
})();
