(function () {
  'use strict';

  const section = document.getElementById('thoughtTree');
  const canvas = document.getElementById('thoughtTreeCanvas');
  if (!section || !canvas) return;

  const context = canvas.getContext('2d');

  const bubble = document.getElementById('thoughtBubble');
  const bubbleText = document.getElementById('thoughtBubbleText');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Precomputed samples work over file:// as well as HTTP, without a tainted Canvas.
  const posterData = window.MORIATY_POSTER;
  const timeline = { form: 850, hold: 2000, morph: 2600, end: 4600 };
  let posterCache = null;
  let treeParticles = [];
  let treeInteractive = false;
  const particleColors = ['#b77b40', '#cf9654', '#e0ad68', '#edc483', '#ffe0a6'];
  const crownLobes = [
    [.25, .40, .19, .14], [.36, .30, .19, .16], [.49, .25, .20, .16],
    [.62, .29, .20, .17], [.76, .39, .19, .15], [.40, .43, .22, .13],
    [.60, .43, .23, .14]
  ];
  const particleSprites = particleColors.map(makeParticleSprite);
  const thoughts = [
    "成为自己，并不意味着保持不变。",
    "现实先于叙事。",
    "人永远比解释他的标签更完整。",
    "不能被现实修正的理论，最终只能解释自己。",
    "行动，是思想向现实提交的证据。",
    "结构塑造人，但不能替人完成选择。",
    "真正的自由，不只是能够选择，也包括能够拒绝。",
    "信用保存过去，信任组织当下，信心指向未来。",
    "言行可以观察，动机只能假设。",
    "问题被看见的那一刻，才真正进入可解决的世界。",
    "理论应当是工具，而不是身份。",
    "理性帮助我们理解世界，感性告诉我们为何值得活在其中。",
    "工具可以扩展认知，却不能替人承担目的与责任。",
    "世界不是一个静止的答案，而是一场持续发生的拟合。",
    "真正延续下来的，不是不变之物，而是能够在变化中保存自身连续性的东西。",
    "正义是一种张力",
    "人具有一定特点",
    "知行合一是欲望与能力的正义",
    "拉拢一批，中立一批，打倒一批",
    "阐释赋予现实意义，也赋予现实混乱",
    "真实提供选择，选择创造信任",
    "金钱并非万能，但至少能维持你已经拥有的一切",
    "可见即可解决"
];
  const nodeLayer = document.getElementById('thoughtNodes');
  const thoughtNodes = [];
  let hoveredNode = -1;
  let focusedNode = -1;
  let pinnedNode = -1;

  let width = 0;
  let height = 0;
  let ratio = 1;
  let treeTop = 0;
  let treeHeight = 0;
  let treeWidthRatio = .64;
  let particles = [];
  let ambientParticles = [];
  let raf = 0;
  let started = false;
  let ready = false;
  let isInView = false;
  let startTime = 0;
  let seed = 872341;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  function particleLimit() {
    // Keep per-frame canvas work bounded; the full-detail portrait is cached once.
    return Math.min(7000, Math.max(3600, Math.round(width * height / 230)));
  }

  function makeParticleSprite(color) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 48;
    const pen = sprite.getContext('2d');
    if (!pen) return sprite;
    const glow = pen.createRadialGradient(24, 24, 0, 24, 24, 24);
    glow.addColorStop(0, '#fff0cf');
    glow.addColorStop(.14, color);
    glow.addColorStop(.25, color + 'd9');
    glow.addColorStop(.43, color + '40');
    glow.addColorStop(1, color + '00');
    pen.fillStyle = glow;
    pen.fillRect(0, 0, 48, 48);
    return sprite;
  }

  function layoutTree() {
    // A permanent upper stage keeps the entire halo clear of the crown, including when hidden.
    treeTop = bubble.offsetTop + bubble.offsetHeight + 18;
    treeHeight = Math.max(260, height * .96 - treeTop);
    treeWidthRatio = Math.min(.78, .64 + Math.max(0, 1.3 - width / height) * .2);
  }

  function resize() {
    const bounds = section.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    layoutTree();
    ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (ready) {
      samplePoster();
      draw(performance.now());
    }
  }

  function targetPoint(index) {
    const targetKind = random();
    const part = targetKind < .77 ? 'crown' : targetKind < .97 ? 'trunk' : 'ground';
    let x;
    let y;
    if (targetKind < .77) {
      // Overlapping volumes give the crown a rounded, irregular contour and a dense core.
      const [cx, cy, rx, ry] = crownLobes[Math.floor(random() * crownLobes.length)];
      const angle = random() * Math.PI * 2;
      const depth = random() * 2 - 1;
      const radius = Math.cbrt(random()) * Math.sqrt(1 - depth * depth);
      x = cx + Math.cos(angle) * radius * rx;
      y = cy + Math.sin(angle) * radius * ry;
      y += Math.sin(x * 27 + cy * 16) * .012;
    } else if (targetKind < .97) {
      // A broad shoulder gathers into a tapered particle trunk, with no stroke geometry.
      y = .40 + random() * .56;
      const progress = (y - .40) / .56;
      const widthAtY = .022 + .14 * Math.pow(1 - progress, 2.3) + .028 * Math.pow(progress, 10);
      const center = .5 + Math.sin(progress * 5.4) * .017;
      x = center + (random() + random() - 1) * widthAtY;
    } else {
      const angle = random() * Math.PI * 2;
      const radius = .08 + random() * .44;
      x = .5 + Math.cos(angle) * radius;
      y = .92 + Math.sin(angle) * radius * .075;
    }
    return { x: width * (.5 + (x - .5) * treeWidthRatio),
      y: treeTop + y * treeHeight, u: x, v: y, part, seed: random() * Math.PI * 2 };
  }

  function makeParticles(sourcePoints) {
    if (!sourcePoints.length) throw new Error('The observer source contains no visible samples.');
    const count = sourcePoints.length;
    const treeCount = Math.min(count, particleLimit());
    const sizeScale = clamp(Math.sqrt(width * height / 1200000), .85, 1.3);
    particles = [];
    for (let index = 0; index < count; index++) {
      // Every source sample is retained; the tree has its own bounded particle budget.
      const source = sourcePoints[index];
      const belongsToTree = Math.floor((index + 1) * treeCount / count) > Math.floor(index * treeCount / count);
      const target = targetPoint(index);
      // Uniform disc projection; every particle shares one circular gathering boundary.
      const gatherAngle = random() * Math.PI * 2;
      const gatherRadius = Math.sqrt(random()) * Math.min(width * .18, treeHeight * .24);
      const gatherX = width * .5 + Math.cos(gatherAngle) * gatherRadius;
      const gatherY = treeTop + treeHeight * .46 + Math.sin(gatherAngle) * gatherRadius;
      const depth = random();
      const highlight = random() > .95;
      const colorIndex = highlight ? 4 : Math.min(3, Math.floor(depth * 4));
      const centerDistance = Math.hypot(source.u - .5, source.v - .62);
      const observerCore = Math.abs(source.u - .5) < .08 && source.v > .49 && source.v < .83;
      particles.push({
        sx: source.x, sy: source.y,
        tx: target.x, ty: target.y, gx: gatherX, gy: gatherY, u: target.u, v: target.v, part: target.part,
        alpha: 1, radius: source.radius, posterColor: source.color, belongsToTree,
        treeAlpha: belongsToTree ? .54 + depth * .39 : 0,
        treeRadius: (highlight ? 2.5 + random() * .55 : .9 + depth * 1.05) * sizeScale,
        sprite: particleSprites[colorIndex],
        seed: target.seed,
        formDelay: random() * .45,
        morphDelay: clamp((centerDistance - .28) * .52 + random() * .24, 0, .52) + (observerCore ? .3 : 0),
        color: particleColors[colorIndex],
        observerCore
      });
    }
    treeParticles = particles.filter((particle) => particle.belongsToTree);
    positionThoughtNodes(treeParticles);
    ambientParticles = Array.from({ length: Math.min(420, Math.max(180, Math.round(width * .28))) }, (_, index) => {
      const angle = index * 2.399963;
      const spread = .18 + ((index * 37) % 101) / 100 * .48;
      return {
        x: width * (.5 + Math.cos(angle) * spread),
        y: treeTop + ((index * 53) % 97) / 100 * treeHeight * .62,
        radius: .35 + ((index * 17) % 10) / 10 * .7,
        phase: angle,
        alpha: .08 + ((index * 19) % 10) / 100
      };
    });
  }

  function samplePoster() {
    if (!posterData?.points || !posterData.palette?.length) {
      throw new Error('Moriaty poster particle data is missing.');
    }
    seed = 872341;
    const bytes = atob(posterData.points);
    const scale = Math.min(width * .9 / posterData.width, height * .88 / posterData.height);
    const imageWidth = posterData.width * scale;
    const imageHeight = posterData.height * scale;
    const left = (width - imageWidth) / 2;
    const top = (height - imageHeight) / 2 - height * .018;
    const radius = posterData.step * scale * .44;
    const recordCount = Math.floor(bytes.length / 5);
    const sampleCount = Math.min(recordCount, particleLimit());
    const sampleStride = recordCount / sampleCount;
    const points = [];
    for (let index = 0; index < sampleCount; index++) {
      // Keep the motion samples spread over the whole source image instead of
      // rendering every poster pixel as an independently animated particle.
      const offset = Math.floor(index * sampleStride) * 5;
      const x = bytes.charCodeAt(offset) | bytes.charCodeAt(offset + 1) << 8;
      const y = bytes.charCodeAt(offset + 2) | bytes.charCodeAt(offset + 3) << 8;
      const color = posterData.palette[bytes.charCodeAt(offset + 4)];
      points.push({ x: left + x * scale, y: top + y * scale,
        u: x / posterData.width, v: y / posterData.height, radius, color });
    }
    makeParticles(points);
    // Cache the detailed, stationary portrait; only moving particles need per-frame work.
    posterCache = document.createElement('canvas');
    posterCache.width = canvas.width;
    posterCache.height = canvas.height;
    const pen = posterCache.getContext('2d');
    pen.setTransform(ratio, 0, 0, ratio, 0, 0);
    for (let offset = 0; offset < bytes.length; offset += 5) {
      const x = bytes.charCodeAt(offset) | bytes.charCodeAt(offset + 1) << 8;
      const y = bytes.charCodeAt(offset + 2) | bytes.charCodeAt(offset + 3) << 8;
      pen.fillStyle = posterData.palette[bytes.charCodeAt(offset + 4)];
      const px = left + x * scale;
      const py = top + y * scale;
      pen.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
  }

  function drawGroundRings(progress, now) {
    if (progress <= .01) return;
    const pulse = reducedMotion.matches ? 0 : Math.sin(now * .0007) * 2;
    const centerX = width * .5;
    const centerY = treeTop + treeHeight * .96;
    const baseRadius = Math.min(width * .39, height * .72);
    context.save();
    context.globalAlpha = progress * .34;
    context.lineWidth = .8;
    context.strokeStyle = '#bf8d48';
    context.shadowColor = '#d4a14c';
    context.shadowBlur = 12;
    [1, .83, .66, .48, .31, .17].forEach((scale, index) => {
      const ripple = pulse * (index % 2 ? -1 : 1);
      context.globalAlpha = progress * (.1 + (1 - scale) * .17);
      context.beginPath();
      context.ellipse(centerX, centerY, baseRadius * scale + ripple, baseRadius * scale * .135 + ripple * .22, 0, 0, Math.PI * 2);
      context.stroke();
    });
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * .62);
    glow.addColorStop(0, `rgba(211, 157, 78, ${.16 * progress})`);
    glow.addColorStop(.3, `rgba(161, 104, 43, ${.08 * progress})`);
    glow.addColorStop(1, 'rgba(89, 55, 24, 0)');
    context.globalAlpha = 1;
    context.fillStyle = glow;
    context.beginPath();
    context.ellipse(centerX, centerY, baseRadius * .66, baseRadius * .11, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawAmbient(progress, now) {
    if (progress <= .01) return;
    context.save();
    ambientParticles.forEach((particle, index) => {
      const drift = reducedMotion.matches ? 0 : Math.sin(now * .00045 + particle.phase) * 4;
      context.globalAlpha = particle.alpha * progress;
      context.fillStyle = index % 9 === 0 ? '#e4c28a' : index % 3 === 0 ? '#c49351' : '#986a35';
      context.beginPath();
      context.arc(particle.x + drift, particle.y + (reducedMotion.matches ? 0 : Math.cos(now * .00032 + particle.phase) * 2.5), particle.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function phaseFor(elapsed, particle) {
    if (elapsed < timeline.form) {
      const amount = ease((elapsed / timeline.form - particle.formDelay * .3) / .78);
      const scatterX = particle.sx + Math.sin(particle.seed) * width * .16;
      const scatterY = particle.sy + Math.cos(particle.seed * 1.3) * height * .16;
      return { x: scatterX + (particle.sx - scatterX) * amount,
        y: scatterY + (particle.sy - scatterY) * amount, alpha: amount, tree: 0, gold: 0 };
    }
    if (elapsed < timeline.hold) {
      return { x: particle.sx, y: particle.sy, alpha: 1, tree: 0, gold: 0 };
    }
    const morph = clamp((elapsed - timeline.hold) / timeline.morph);
    if (morph < .47) {
      const gather = ease(morph / .47);
      return { x: particle.sx + (particle.gx - particle.sx) * gather,
        y: particle.sy + (particle.gy - particle.sy) * gather,
        alpha: 1 - gather * (particle.belongsToTree ? .3 : 1), tree: 0, gold: gather };
    }
    // Hold the complete sphere long enough for its circular outline to read.
    if (morph < .67) {
      return { x: particle.gx, y: particle.gy,
        alpha: particle.belongsToTree ? .7 : 0, tree: 0, gold: 1 };
    }
    const form = ease((morph - .67) / .33);
    return { x: particle.gx + (particle.tx - particle.gx) * form,
      y: particle.gy + (particle.ty - particle.gy) * form,
      alpha: particle.belongsToTree ? .7 : 0, tree: form, gold: 1 };
  }

  function draw(now) {
    if (!context || !ready || !width || !height) return;
    context.clearRect(0, 0, width, height);
    const elapsed = started ? now - startTime : 0;
    const treeProgress = ease((elapsed - timeline.hold - timeline.morph * .67) / (timeline.morph * .33));
    const interactive = elapsed >= timeline.end;
    if (interactive !== treeInteractive) setTreeInteractive(interactive);
    if (elapsed >= timeline.form && elapsed < timeline.hold && posterCache) {
      context.drawImage(posterCache, 0, 0, width, height);
      return;
    }
    drawGroundRings(treeProgress, now);
    drawAmbient(treeProgress, now);
    context.save();
    const settled = elapsed >= timeline.end;
    const idle = settled && !reducedMotion.matches;
    const selected = thoughtNodes[currentThoughtIndex()];
    const visibleParticles = settled ? treeParticles : particles;
    visibleParticles.forEach((particle) => {
      const point = phaseFor(elapsed, particle);
      if (point.alpha <= .001 && point.tree <= .001) return;
      const nearActive = treeInteractive && selected && Math.hypot(particle.tx - selected.x, particle.ty - selected.y) < Math.min(44, width * .055);
      const drift = idle && !particle.thoughtNode ? Math.sin(now * .00075 + particle.seed) * 1.25 : 0;
      const hoverBoost = (hoveredNode >= 0 || focusedNode >= 0) && nearActive ? .3 : 0;
      const clickBoost = pinnedNode >= 0 && nearActive ? .16 : 0;
      const breathing = idle ? 1 + Math.sin(now * .001 + particle.seed) * .07 : 1;
      const alpha = (point.alpha + (particle.treeAlpha - point.alpha) * point.tree) * (1 + hoverBoost + clickBoost) * breathing;
      if (alpha <= .001) return;
      context.globalAlpha = clamp(alpha, 0, 1);
      const radius = (particle.radius + (particle.treeRadius - particle.radius) * Math.max(point.tree, point.gold)) * (nearActive ? 1.16 : 1);
      if (point.gold <= .04 && point.tree <= 0) {
        // Crisp source-colored grains preserve lettering, masonry and the observer silhouette.
        context.fillStyle = particle.posterColor;
        context.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
      } else {
        const size = radius * 6;
        context.drawImage(particle.sprite, point.x - size / 2, point.y + drift - size / 2, size, size);
      }
    });
    context.restore();
  }

  function frame(now) {
    draw(now);
    if (!reducedMotion.matches) raf = window.requestAnimationFrame(frame);
  }

  function startAnimation() {
    if (started || !ready) return;
    started = true;
    startTime = performance.now();
    if (reducedMotion.matches) {
      startTime -= timeline.end;
      draw(performance.now());
      return;
    }
    raf = window.requestAnimationFrame(frame);
  }

  function currentThoughtIndex() {
    return hoveredNode >= 0 ? hoveredNode : focusedNode >= 0 ? focusedNode : pinnedNode;
  }

  function refreshThought() {
    const index = treeInteractive ? currentThoughtIndex() : -1;
    const visible = index >= 0;
    if (visible) {
      bubbleText.textContent = thoughts[index];
      bubbleText.lang = /^[A-Za-z]/.test(thoughts[index]) ? 'en' : 'zh-CN';
    }
    bubble.classList.toggle('is-visible', visible);
    bubble.setAttribute('aria-hidden', String(!visible));
    thoughtNodes.forEach((node, nodeIndex) => {
      node.button.classList.toggle('is-active', nodeIndex === index);
      node.button.classList.toggle('is-pinned', nodeIndex === pinnedNode);
      node.button.setAttribute('aria-pressed', String(nodeIndex === pinnedNode));
      node.button.setAttribute('aria-expanded', String(visible && nodeIndex === index));
    });
    if (reducedMotion.matches) draw(performance.now());
  }

  function dismissThought() {
    hoveredNode = focusedNode = pinnedNode = -1;
    refreshThought();
  }

  function createThoughtNodes() {
    thoughts.forEach((thought, index) => {
      const button = document.createElement('button');
      button.className = 'thought-node';
      button.type = 'button';
      button.disabled = true;
      button.setAttribute('aria-label', `思想 ${index + 1}：${thought}`);
      button.setAttribute('aria-controls', 'thoughtBubble');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-pressed', 'false');
      button.style.setProperty('--pulse-delay', `${index * -.37}s`);
      button.addEventListener('pointerenter', (event) => {
        if (!treeInteractive || event.pointerType === 'touch') return;
        hoveredNode = index;
        refreshThought();
      });
      button.addEventListener('pointerleave', () => {
        if (hoveredNode === index) hoveredNode = -1;
        refreshThought();
      });
      button.addEventListener('focus', () => {
        if (!treeInteractive) return;
        focusedNode = index;
        refreshThought();
      });
      button.addEventListener('blur', () => {
        if (focusedNode === index) focusedNode = -1;
        refreshThought();
      });
      button.addEventListener('click', () => {
        if (!treeInteractive) return;
        pinnedNode = pinnedNode === index ? -1 : index;
        hoveredNode = focusedNode = -1;
        refreshThought();
      });
      thoughtNodes.push({ button, x: 0, y: 0 });
      nodeLayer.appendChild(button);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') dismissThought();
    });
    section.addEventListener('click', (event) => {
      if (!event.target.closest('.thought-node')) dismissThought();
    });
    // Close the thought when leaving this chapter.
    window.addEventListener('scroll', () => {
      if (!bubble.classList.contains('is-visible')) return;
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) dismissThought();
    }, { passive: true });
  }

  function positionThoughtNodes(points) {
    // Select actual crown particles, inset from the silhouette and clear of the trunk shoulder.
    const candidates = points.filter((point) => point.part === 'crown' &&
      !(point.v > .40 && Math.abs(point.u - .51) < .14) &&
      crownLobes.some(([cx, cy, rx, ry]) =>
        ((point.u - cx) / rx) ** 2 + ((point.v - cy) / ry) ** 2 < .68));
    if (candidates.length < thoughts.length) throw new Error('Insufficient crown particles for the thought nodes.');
    const distance = (a, b) => (a.tx - b.tx) ** 2 + (a.ty - b.ty) ** 2;
    const nearest = (center) => candidates.reduce((best, candidate) =>
      distance(candidate, center) < distance(best, center) ? candidate : best);
    let anchors = [nearest({ tx: width * .5, ty: treeTop + treeHeight * .27 })];
    const minDistances = candidates.map((candidate) => distance(candidate, anchors[0]));
    // Farthest-point sampling spreads the nodes across the entire crown in screen space.
    while (anchors.length < thoughts.length) {
      let bestIndex = 0;
      minDistances.forEach((value, index) => { if (value > minDistances[bestIndex]) bestIndex = index; });
      const next = candidates[bestIndex];
      anchors.push(next);
      candidates.forEach((candidate, index) => {
        minDistances[index] = Math.min(minDistances[index], distance(candidate, next));
      });
    }
    // Relax toward equally covered areas, then snap back onto real particles.
    for (let pass = 0; pass < 3; pass++) {
      const regions = anchors.map(() => ({ tx: 0, ty: 0, count: 0 }));
      candidates.forEach((candidate) => {
        let best = 0;
        anchors.forEach((anchor, index) => { if (distance(candidate, anchor) < distance(candidate, anchors[best])) best = index; });
        regions[best].tx += candidate.tx;
        regions[best].ty += candidate.ty;
        regions[best].count++;
      });
      const relaxed = regions.map((region, index) => region.count
        ? nearest({ tx: region.tx / region.count, ty: region.ty / region.count }) : anchors[index]);
      const hasCollision = relaxed.some((anchor, index) => relaxed.some((other, otherIndex) =>
        index !== otherIndex && distance(anchor, other) < 46 * 46));
      if (hasCollision) break;
      anchors = relaxed;
    }
    // Keep reading order predictable, while the sentence bound to each button never changes.
    anchors.sort((a, b) => Math.floor(a.v / .10) - Math.floor(b.v / .10) || a.u - b.u);
    const nearestGap = Math.sqrt(Math.min(...anchors.flatMap((anchor, index) =>
      anchors.slice(index + 1).map((other) => distance(anchor, other)))));
    const hitSize = Math.max(24, Math.min(44, nearestGap - 4));
    points.forEach((point) => { point.thoughtNode = false; });
    anchors.forEach((particle, index) => {
      particle.thoughtNode = true;
      const node = thoughtNodes[index];
      node.x = particle.tx;
      node.y = particle.ty;
      node.particle = particle;
      node.button.style.setProperty('--node-size', `${hitSize}px`);
      node.button.style.left = `${particle.tx / width * 100}%`;
      node.button.style.top = `${particle.ty / height * 100}%`;
    });
  }

  function setTreeInteractive(interactive) {
    treeInteractive = interactive;
    section.classList.toggle('thought-tree--ready', interactive);
    nodeLayer.inert = !interactive;
    thoughtNodes.forEach(({ button }) => { button.disabled = !interactive; });
    if (!interactive) dismissThought();
  }

  function showFallbackTree() {
    const svg = section.querySelector('.thought-tree__fallback');
    if (!svg) return;
    const bounds = section.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    layoutTree();
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    seed = 872341;
    const dots = document.createDocumentFragment();
    const fallbackPoints = [];
    for (let index = 0; index < Math.min(8000, particleLimit()); index++) {
      const point = targetPoint(index);
      fallbackPoints.push({ ...point, tx: point.x, ty: point.y });
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', point.x);
      dot.setAttribute('cy', point.y);
      dot.setAttribute('r', .9 + random() * 1.4);
      dot.setAttribute('fill', particleColors[Math.floor(random() * particleColors.length)]);
      dot.setAttribute('opacity', .55 + random() * .4);
      dots.appendChild(dot);
    }
    svg.replaceChildren(dots);
    positionThoughtNodes(fallbackPoints);
    section.classList.add('thought-tree--fallback');
    setTreeInteractive(true);
  }

  createThoughtNodes();
  setTreeInteractive(false);
  if (!context) {
    showFallbackTree();
    window.addEventListener('resize', showFallbackTree, { passive: true });
    return;
  }
  resize();
  try {
    samplePoster();
    ready = true;
  } catch (error) {
    console.warn('The observer particle data could not be loaded.', error);
    showFallbackTree();
    window.addEventListener('resize', showFallbackTree, { passive: true });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (!entry) return;
    isInView = entry.isIntersecting;
    if (isInView) {
      startAnimation();
      if (started && ready && !reducedMotion.matches && !raf) raf = window.requestAnimationFrame(frame);
    } else if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  }, { threshold: .28 });
  observer.observe(section);
  window.addEventListener('resize', resize, { passive: true });

  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      if (started) startTime = performance.now() - timeline.end;
      draw(performance.now());
    } else if (started && ready && isInView && !raf) {
      startTime = performance.now() - timeline.end;
      raf = window.requestAnimationFrame(frame);
    }
  });
}());
