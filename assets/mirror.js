// The mirror on the home page: 294 patches of sunlight that leave a small
// hexagon of mirrors and meet on the wall as "hello". It copies the idea of a
// real one Peter built (github.com/peterdsharpe/mirror-array). Each spot moves
// in a straight line, as a reflected ray does, so a spot's position is a blend
// of where its mirror is and where its target is. The data comes from
// _tools/mirror_points.py.
import { side, mirrorX, mirrorY, up, targetX, targetY } from "./mirror-points.js";

const figure = document.querySelector("[data-mirror]");
if (figure) start(figure);

function start(figure) {
  const stage = figure.querySelector(".pm-mirror-stage");
  const canvas = stage.querySelector("canvas");
  const slider = figure.querySelector("input[type=range]");
  const ctx = canvas.getContext("2d");
  const count = mirrorX.length;
  const WALL_W = 1600; // design units; the data is laid out on a 1600 x 1000 wall
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  let distance = still.matches ? 1 : 0; // 0 at the mirror, 1 where the word is in focus
  let colors = readColors();
  let animation = 0;
  let pause = 0; // a setTimeout waiting to start the light travelling
  let started = still.matches;

  function readColors() {
    const style = getComputedStyle(document.documentElement);
    const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return {
      shade: read("--pm-shade", "#3a3027"),
      glow: read("--pm-glow", "#4a3c2f"),
      light: read("--pm-light", "#fff1c9"),
      halo: read("--pm-halo", "#ffc861"),
    };
  }

  // Each patch of light is a triangle, the shape of its mirror. The sun is a
  // disc, not a point, so a patch's edges blur more the farther it travels.
  // Drawing 294 soft triangles every frame would be slow, so a few blur
  // levels are drawn once into small sprites and stamped.
  const LEVELS = 9;
  const MAX_DISTANCE = 1.4;
  let sprites = null;
  let sprite = 0; // sprite size in device pixels
  let scale = 1; // device pixels per design unit

  const blurAt = (d, sidePx) => sidePx * (0.05 + 0.3 * d);

  function triangle(g, x, y, r, pointsUp) {
    const tip = pointsUp ? -1 : 1; // canvas y points down
    g.beginPath();
    g.moveTo(x, y + tip * r);
    g.lineTo(x - r * 0.866, y - tip * r * 0.5);
    g.lineTo(x + r * 0.866, y - tip * r * 0.5);
    g.closePath();
  }

  function makeSprites() {
    const sidePx = side * scale;
    const radius = sidePx / Math.sqrt(3);
    const maxBlur = blurAt(MAX_DISTANCE, sidePx);
    sprite = Math.ceil(2 * radius + 4 * maxBlur + 4);
    const shift = sprite * 3; // draw the shape off the sprite; its shadow lands in it
    const make = (blur, color, grow, pointsUp) => {
      const c = document.createElement("canvas");
      c.width = c.height = sprite;
      const g = c.getContext("2d");
      g.shadowColor = color;
      g.shadowBlur = blur;
      g.shadowOffsetX = shift;
      g.fillStyle = color;
      triangle(g, sprite / 2 - shift, sprite / 2, radius * grow, pointsUp);
      g.fill();
      return c;
    };
    sprites = [];
    for (let level = 0; level < LEVELS; level++) {
      const d = (level / (LEVELS - 1)) * MAX_DISTANCE;
      const blur = blurAt(d, sidePx);
      sprites.push({
        core: [make(blur, colors.light, 1, false), make(blur, colors.light, 1, true)],
        halo: [make(blur * 2 + sidePx * 0.5, colors.halo, 1.15, false), make(blur * 2 + sidePx * 0.5, colors.halo, 1.15, true)],
      });
    }
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(box.width * dpr));
    canvas.height = Math.max(1, Math.round(box.height * dpr));
    scale = canvas.width / WALL_W;
    makeSprites();
    draw();
  }

  function draw() {
    if (!sprites) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    const wall = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, w * 0.62);
    wall.addColorStop(0, colors.glow);
    wall.addColorStop(1, colors.shade);
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, h);

    const level = Math.round((Math.min(distance, MAX_DISTANCE) / MAX_DISTANCE) * (LEVELS - 1));
    const { core, halo } = sprites[level];
    const half = sprite / 2;
    const d = distance;
    ctx.globalCompositeOperation = "lighter";
    for (const [stamp, alpha] of [[halo, 0.11], [core, 0.72]]) {
      ctx.globalAlpha = alpha;
      for (let i = 0; i < count; i++) {
        const x = (mirrorX[i] + d * (targetX[i] - mirrorX[i])) * scale;
        const y = (mirrorY[i] + d * (targetY[i] - mirrorY[i])) * scale;
        ctx.drawImage(stamp[up[i]], x - half, y - half);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function setDistance(value) {
    distance = value;
    if (slider) slider.value = String(value);
    draw();
  }

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  function stop() {
    cancelAnimationFrame(animation);
    clearTimeout(pause);
  }

  function travel(from, to, ms, then) {
    stop();
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      setDistance(from + (to - from) * ease(t));
      if (t < 1) animation = requestAnimationFrame(step);
      else if (then) then();
    };
    animation = requestAnimationFrame(step);
  }

  function play() {
    if (still.matches) return setDistance(1);
    const back = Math.max(250, 700 * distance);
    travel(distance, 0, back, () => {
      pause = setTimeout(() => travel(0, 1, 2600), 300);
    });
  }

  stage.addEventListener("click", play);
  figure.querySelector(".pm-mirror-again")?.addEventListener("click", play);

  if (slider) {
    slider.addEventListener("input", () => {
      stop();
      started = true;
      setDistance(Number(slider.value));
    });
  }

  // Redraw when the colour scheme changes: Quarto swaps stylesheets and
  // marks <body>, and the system setting can change under us.
  const recolor = () => {
    colors = readColors();
    makeSprites();
    draw();
  };
  new MutationObserver(recolor).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", recolor);

  new ResizeObserver(resize).observe(stage);
  resize();
  setDistance(distance);

  // Start the light travelling the first time the mirror is mostly on screen.
  const seen = new IntersectionObserver(
    (entries) => {
      if (!started && entries.some((e) => e.isIntersecting)) {
        started = true;
        seen.disconnect();
        pause = setTimeout(() => travel(0, 1, 2600), 500);
      }
    },
    { threshold: 0.6 },
  );
  seen.observe(stage);
}
