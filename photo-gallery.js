(() => {
  'use strict';

  const photoNames = [
    '5f31ba0b600aaf1bf61f41f5807894e9',
    '7fe27909cf76beda9615a64a626aab29',
    '78fde12f81ed9cebb2f06ad859aa9e50',
    '478a0c62d371508efc84868b1b61ba5b',
    '00000568',
    '00000569',
    '00000570',
    '00000571',
    '00000572',
    '00000573',
    '00000574',
    '639af78ade00a824fe87b33f9b70073a',
    '3221c022d101f70405d832d977704539',
    '6729',
    '1483267d147795b49d032ed428b07adb',
    'a1b3de383a4868bc9a4342ef9d939a82',
    'c2a6b59b5895eebb7a0970fa3872df5e',
    'c34e89b3fd5d04645243b88a61882cb3',
    'c8923bd0a690c500eb2ccbf92c89e037',
    'cd3778d87bc6d9ae61402ed6b9cd65e7',
    'ead575459fc97b44a34edaba1391d991'
  ];

  const photos = photoNames.map(name => ({
    thumb: `assets/photos/thumb/${name}.webp`,
    full: `assets/photos/full/${name}.webp`
  }));

  const scene = document.getElementById('scene');
  const photoSection = document.getElementById('photos');
  const orb = document.getElementById('orb');
  const world = document.getElementById('world');
  const headline = document.getElementById('headline');
  const grid = document.getElementById('photoGrid');
  const gridReturnZones = document.querySelectorAll('.photo-grid-return');
  const archiveToggle = document.getElementById('archiveToggle');
  const viewer = document.getElementById('viewer');
  const viewerImage = document.getElementById('viewerImage');

  const cards = [];

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const radians = Math.PI / 180;

  const clamp = (value, low, high) =>
    Math.max(low, Math.min(high, value));

  let radius = 200;
  let yaw = 0;
  let pitch = -4;
  let velocityX = 0;
  let velocityY = 0;
  let pointer = null;
  let lastWidth = 0;
  let lastHeight = 0;
  let opened = false;

  photos.forEach((photo, index) => {
    const y = 1 - (index / (photos.length - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = index * goldenAngle;

    const x = Math.cos(angle) * ring;
    const z = Math.sin(angle) * ring;

    const latitude = Math.asin(y) / radians;
    const longitude = Math.atan2(x, z) / radians;

    /*
     * 照片球
     */
    const card = document.createElement('div');

    card.className = index === 19
      ? 'card tall'
      : 'card';

    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.setAttribute(
      'aria-label',
      `查看照片 ${String(index + 1).padStart(2, '0')}`
    );

    const figure = document.createElement('figure');

    const image = document.createElement('img');

    image.alt =
      `照片 ${String(index + 1).padStart(2, '0')}`;

    image.draggable = false;
    image.decoding = 'async';

    /*
     * 照片球只加载缩略图
     */
    image.src = photo.thumb;

    image.addEventListener('load', () => {
      image.classList.add('ready');
    });

    figure.append(image);
    card.append(figure);
    orb.append(card);

    /*
     * 照片网格
     */
    const gridFigure = document.createElement('figure');

    gridFigure.setAttribute('role', 'button');
    gridFigure.setAttribute('tabindex', '0');

    gridFigure.setAttribute(
      'aria-label',
      `查看照片 ${String(index + 1).padStart(2, '0')}`
    );

    const gridImage = document.createElement('img');

    gridImage.alt =
      `照片 ${String(index + 1).padStart(2, '0')}`;

    gridImage.decoding = 'async';

    /*
     * 浏览器原生 lazy loading
     */
    gridImage.loading = 'lazy';

    /*
     * 网格同样只加载缩略图
     */
    gridImage.src = photo.thumb;

    gridFigure.append(gridImage);
    grid.append(gridFigure);

    gridFigure.addEventListener('click', () => {
      openPhoto(index);
    });

    gridFigure.addEventListener('keydown', event => {
      if (
        event.key !== 'Enter' &&
        event.key !== ' '
      ) {
        return;
      }

      event.preventDefault();
      openPhoto(index);
    });

    card.addEventListener('keydown', event => {
      if (
        event.key !== 'Enter' &&
        event.key !== ' '
      ) {
        return;
      }

      event.preventDefault();
      openPhoto(index);
    });

    cards.push({
      element: card,
      image,
      x,
      y,
      z,
      latitude,
      longitude,
      shade: null,
      opacity: null
    });
  });

  /*
   * 照片球布局
   */
  function layout(force = false) {
    const width = scene.clientWidth;
    const height = scene.clientHeight;

    if (
      !force &&
      Math.abs(width - lastWidth) < 20 &&
      Math.abs(height - lastHeight) < 20
    ) {
      return;
    }

    lastWidth = width;
    lastHeight = height;

    radius = Math.max(
      108,
      Math.min(
        380,
        width * 0.4,
        height * 0.42
      )
    );

    const cardWidth = Math.round(
      Math.max(
        72,
        radius * (
          innerWidth <= 520
            ? 0.46
            : 0.47
        )
      )
    );

    scene.style.setProperty(
      '--cw',
      `${cardWidth}px`
    );

    scene.style.setProperty(
      '--persp',
      `${
        innerWidth <= 520
          ? 760
          : innerWidth <= 900
            ? 920
            : 1150
      }px`
    );

    cards.forEach(card => {
      card.element.style.transform =
        `translate3d(` +
        `${card.x * radius}px, ` +
        `${-card.y * radius}px, ` +
        `${card.z * radius}px` +
        `) ` +
        `rotateY(${card.longitude}deg) ` +
        `rotateX(${card.latitude}deg)`;
    });
  }

  /*
   * 动画循环
   */
  function frame() {
    if (!pointer && !opened) {
      yaw += velocityX;

      pitch = clamp(
        pitch + velocityY,
        -32,
        32
      );

      velocityX *= 0.94;
      velocityY *= 0.94;

      if (Math.abs(velocityX) < 0.002) {
        velocityX = 0;
      }

      if (Math.abs(velocityY) < 0.002) {
        velocityY = 0;
      }
    }

    world.style.transform =
      `rotateY(${yaw}deg) ` +
      `rotateX(${pitch}deg)`;

    headline.style.transform =
      `rotateX(${-pitch}deg) ` +
      `rotateY(${-yaw}deg) ` +
      `translateZ(${radius * 0.62}px)`;

    const sx = Math.sin(pitch * radians);
    const cx = Math.cos(pitch * radians);

    const sy = Math.sin(yaw * radians);
    const cy = Math.cos(yaw * radians);

    cards.forEach(card => {
      const depth =
        -sy * card.x +
        cy * (
          -card.y * sx +
          card.z * cx
        );

      const base =
        0.14 +
        0.86 *
          Math.pow(
            (depth + 1) / 2,
            0.85
          );

      const shade = 1 - base;

      if (shade !== card.shade) {
        card.element.style.setProperty(
          '--d',
          shade
        );

        card.shade = shade;
      }
    });

    requestAnimationFrame(frame);
  }

  /*
   * 鼠标 / 触摸拖动
   */
  scene.addEventListener(
    'pointerdown',
    event => {
      if (
        event.button !== 0 ||
        opened ||
        event.target.closest('.photo-arrow')
      ) {
        return;
      }

      pointer = {
        id: event.pointerId,
        type: event.pointerType,

        x: event.clientX,
        y: event.clientY,

        lastX: event.clientX,
        lastY: event.clientY,

        active:
          event.pointerType !== 'touch',

        card:
          event.target.closest('.card')
      };

      velocityX = 0;
      velocityY = 0;

      if (pointer.active) {
        event.preventDefault();

        scene.setPointerCapture(
          event.pointerId
        );
      }
    }
  );

  scene.addEventListener(
    'pointermove',
    event => {
      if (
        !pointer ||
        pointer.id !== event.pointerId
      ) {
        return;
      }

      const dx =
        event.clientX - pointer.x;

      const dy =
        event.clientY - pointer.y;

      if (!pointer.active) {
        if (
          Math.hypot(dx, dy) < 10
        ) {
          return;
        }

        if (
          Math.abs(dy) >
          Math.abs(dx) * 1.15
        ) {
          pointer = null;
          return;
        }

        pointer.active = true;

        scene.setPointerCapture(
          event.pointerId
        );
      }

      event.preventDefault();

      velocityX =
        (event.clientX -
          pointer.lastX) *
        0.13;

      velocityY =
        -(
          event.clientY -
          pointer.lastY
        ) *
        0.13;

      yaw += velocityX;

      pitch = clamp(
        pitch + velocityY,
        -32,
        32
      );

      pointer.lastX =
        event.clientX;

      pointer.lastY =
        event.clientY;
    },
    {
      passive: false
    }
  );

  function pointerEnd(event) {
    if (
      !pointer ||
      pointer.id !== event.pointerId
    ) {
      return;
    }

    const finished = pointer;

    pointer = null;

    if (
      scene.hasPointerCapture(
        event.pointerId
      )
    ) {
      scene.releasePointerCapture(
        event.pointerId
      );
    }

    if (
      event.type === 'pointercancel' ||
      event.type === 'lostpointercapture'
    ) {
      return;
    }

    const movement =
      Math.hypot(
        event.clientX - finished.x,
        event.clientY - finished.y
      );

    const threshold =
      finished.type === 'touch'
        ? 14
        : 6;

    if (
      movement <= threshold &&
      finished.card
    ) {
      velocityX = 0;
      velocityY = 0;

      openPhoto(
        cards.findIndex(
          card =>
            card.element ===
            finished.card
        )
      );
    }
  }

  scene.addEventListener(
    'pointerup',
    pointerEnd
  );

  scene.addEventListener(
    'pointercancel',
    pointerEnd
  );

  scene.addEventListener(
    'lostpointercapture',
    pointerEnd
  );

  scene.addEventListener(
    'dragstart',
    event => {
      event.preventDefault();
    }
  );

  /*
   * 左右箭头
   */
  document
    .getElementById('previous')
    .addEventListener(
      'click',
      () => {
        yaw -= 24;
        velocityX = 0;
      }
    );

  document
    .getElementById('next')
    .addEventListener(
      'click',
      () => {
        yaw += 24;
        velocityX = 0;
      }
    );

  /*
   * 网格视图
   */
  function toggleGrid(on) {
    photoSection.classList.toggle(
      'gridview',
      on
    );

    archiveToggle.setAttribute(
      'aria-pressed',
      String(on)
    );

    grid.hidden = !on;
    grid.inert = !on;

    gridReturnZones.forEach(zone => {
      zone.hidden = !on;
    });

    scene.inert = on;

    if (!on) {
      layout(true);
    }
  }

  archiveToggle.addEventListener(
    'click',
    () => {
      toggleGrid(
        !photoSection.classList.contains(
          'gridview'
        )
      );
    }
  );

  gridReturnZones.forEach(zone => {
    zone.addEventListener(
      'click',
      () => {
        toggleGrid(false);
      }
    );
  });

  document.addEventListener(
    'keydown',
    event => {
      if (
        event.key === 'Escape' &&
        !viewer.open &&
        photoSection.classList.contains(
          'gridview'
        )
      ) {
        toggleGrid(false);
      }
    }
  );

  /*
   * 高清图片查看器
   *
   * 只有用户真正点击照片之后，
   * 才开始下载 full 目录中的高清 WebP。
   */
  function openPhoto(index) {
    if (
      index < 0 ||
      index >= photos.length
    ) {
      return;
    }

    opened = true;

    velocityX = 0;
    velocityY = 0;

    /*
     * 关键：
     * 点击后才请求高清图
     */
    viewerImage.src =
      photos[index].full;

    viewerImage.alt =
      `照片 ${String(index + 1).padStart(2, '0')}`;

    viewer.showModal();

    viewer.focus({
      preventScroll: true
    });
  }

  function closePhoto() {
    viewer.close();
    opened = false;
  }

  viewer.addEventListener(
    'click',
    event => {
      if (
        event.target === viewer
      ) {
        closePhoto();
      }
    }
  );

  viewer.addEventListener(
    'close',
    () => {
      opened = false;
    }
  );

  /*
   * 初始化
   */
  layout(true);
  frame();

  let resizeFrame = 0;

  window.addEventListener(
    'resize',
    () => {
      cancelAnimationFrame(
        resizeFrame
      );

      resizeFrame =
        requestAnimationFrame(
          () => layout()
        );
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    'orientationchange',
    () =>
      setTimeout(
        () => layout(true),
        220
      )
  );
})();