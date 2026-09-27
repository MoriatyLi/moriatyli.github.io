(function () {
  'use strict';

  const SHELVES = [
    { id: 'thought', roman: 'I', en: 'THOUGHT & SELF', zh: '思想 · 认知 · 自我' },
    { id: 'society', roman: 'II', en: 'SOCIETY & CULTURE', zh: '社会 · 文化 · 舆论' },
    { id: 'policy', roman: 'III', en: 'POLICY & ECONOMY', zh: '政策 · 经济 · 治理' },
    { id: 'technology', roman: 'IV', en: 'TECHNOLOGY & RESEARCH', zh: '科技 · 数据 · 医疗' },
    { id: 'literature', roman: 'V', en: 'LITERATURE & CREATION', zh: '文学 · 创作' },
    { id: 'archive', roman: 'VI', en: 'ARCHIVE & NOTES', zh: '档案 · 学习 · 杂记' }
  ];
  const SHELF_BY_ID = new Map(SHELVES.map((shelf) => [shelf.id, shelf]));
  const RAW_ARTICLES = Array.isArray(window.MORIATY_ARTICLES) ? window.MORIATY_ARTICLES : [];
  const ARTICLES = RAW_ARTICLES.slice().sort((a, b) => a.displayTitle.localeCompare(b.displayTitle, 'zh-CN'));
  const ARTICLE_BY_SLUG = new Map(ARTICLES.map((article) => [article.slug, article]));
  const PALETTE = [4, 12, 20, 29, 38, 110, 140, 176, 194, 212, 222, 255, 282, 318, 340];

  const elements = {
    ring: document.getElementById('shelfRing'),
    scene: document.getElementById('libraryScene'),
    shelfPrev: document.getElementById('shelfPrev'),
    shelfNext: document.getElementById('shelfNext'),
    shelfTitle: document.getElementById('shelfTitle'),
    shelfTitleZh: document.getElementById('shelfTitleZh'),
    shelfCounter: document.getElementById('shelfCounter'),
    shelfDots: document.getElementById('shelfDots'),
    libraryCount: document.getElementById('libraryCount'),
    creationTotal: document.getElementById('creationTotal'),
    bookCard: document.getElementById('bookCard'),
    cardShelf: document.getElementById('cardShelf'),
    cardTitle: document.getElementById('cardTitle'),
    cardExcerpt: document.getElementById('cardExcerpt'),
    cardMeta: document.getElementById('cardMeta'),
    reader: document.getElementById('reader'),
    readerBook: document.getElementById('readerBook'),
    readerCollection: document.getElementById('readerCollection'),
    readerTitle: document.getElementById('readerTitle'),
    readerMeta: document.getElementById('readerMeta'),
    readerTags: document.getElementById('readerTags'),
    readerContent: document.getElementById('readerContent'),
    backdrop: document.getElementById('dialogBackdrop'),
    searchDialog: document.getElementById('searchDialog'),
    indexDialog: document.getElementById('indexDialog'),
    searchInput: document.getElementById('searchInput'),
    searchCount: document.getElementById('searchCount'),
    searchResults: document.getElementById('searchResults'),
    filterShelf: document.getElementById('filterShelf'),
    filterYear: document.getElementById('filterYear'),
    filterTag: document.getElementById('filterTag'),
    filterType: document.getElementById('filterType'),
    indexResults: document.getElementById('indexResults'),
    indexCount: document.getElementById('indexCount'),
    indexSummary: document.getElementById('indexSummary')
  };

  let activeShelf = 0;
  let shelfStep = 0;
  let currentBook = null;
  let lastBookButton = null;
  let savedShelfStep = 0;
  let faceWidth = 820;
  let ringRotation = 0;
  let dragState = null;
  let suppressDragClick = false;
  let wheelTotal = 0;
  let wheelTimer = 0;
  let returnFocus = null;
  let previewArticle = null;
  let previewButton = null;
  let previewPinned = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const searchable = new Map(ARTICLES.map((article) => [
    article.id,
    `${article.displayTitle} ${article.tags.join(' ')} ${article.excerpt} ${article.markdown.replace(/data:image\/[^;\s]+;base64,[A-Za-z0-9+/=\r\n]+/g, ' image ')}`.toLocaleLowerCase('zh-CN')
  ]));

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function bookColor(seed) {
    const number = parseInt(String(seed).slice(0, 8), 16) || 0;
    const hue = PALETTE[number % PALETTE.length];
    const saturation = 18 + ((number >>> 8) % 12);
    const lightness = 23 + ((number >>> 16) % 12);
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  function bookDimensions(article) {
    const weight = Math.log(Math.max(1, article.wordCount) + 1);
    const seed = String(article.id || article.slug || article.displayTitle);
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index++) {
      hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
    }
    const variation = (offset) => {
      const value = Math.imul(hash ^ offset, 2246822519) >>> 0;
      return value / 4294967295;
    };
    return {
      width: Math.round((24 + Math.min(25, Math.max(0, (weight - 4.5) * 5))) * (.78 + variation(31) * .44)),
      height: Math.round((86 + Math.min(45, Math.max(0, (weight - 4.5) * 9))) * (.88 + variation(73) * .24)),
      tilt: `${((variation(127) - .5) * 2.4).toFixed(2)}deg`,
      depth: `${(variation(191) * 2.5).toFixed(2)}px`
    };
  }

  function makeBook(article) {
    const book = el('button', 'book');
    const size = bookDimensions(article);
    book.type = 'button';
    book.dataset.bookId = article.id;
    book.style.setProperty('--book-width', `${size.width}px`);
    book.style.setProperty('--book-height', `${size.height}px`);
    book.style.setProperty('--book-tilt', size.tilt);
    book.style.setProperty('--book-depth', size.depth);
    book.style.setProperty('--book-color', bookColor(article.spineColorSeed));
    book.setAttribute('aria-label', `《${article.displayTitle}》，点击查看信息，再次点击打开文章。${SHELF_BY_ID.get(article.shelf).zh}，${article.readingTime} 分钟`);
    const title = el('span', 'book__title', article.spineLabel || spineTitle(article.displayTitle));
    title.setAttribute('aria-hidden', 'true');
    book.append(title);
    book.addEventListener('pointerenter', (event) => showBookCard(article, event, book));
    book.addEventListener('pointermove', (event) => {
      if (!previewPinned && previewButton === book) positionBookCard(event, book);
    });
    book.addEventListener('focus', () => showBookCard(article, null, book));
    book.addEventListener('pointerleave', () => { if (!previewPinned && document.activeElement !== book) hideBookCard(); });
    book.addEventListener('blur', () => { if (!previewPinned) hideBookCard(); });
    book.addEventListener('click', (event) => {
      if (previewPinned && previewArticle === article && previewButton === book) openBook(article, book);
      else showBookCard(article, event, book, true);
    });
    return book;
  }

  function spineTitle(value) {
    const normalized = String(value || '').normalize('NFC').replace(/\s+/g, ' ').trim();
    const characters = Array.from(normalized);
    return characters.length > 6 ? characters.slice(0, 6).join('') : normalized;
  }

  function createShelfFace(shelf, index, radius) {
    const unit = el('div', 'shelf-unit');
    unit.setAttribute('aria-label', `${shelf.en}，${shelf.zh}`);
    unit.style.width = `${faceWidth}px`;
    unit.style.height = `${Math.min(window.innerWidth < 620 ? 360 : 560, Math.max(window.innerWidth < 620 ? 310 : 360, elements.scene.clientHeight * (window.innerWidth < 620 ? 0.78 : 0.76)))}px`;
    unit.style.marginLeft = `${-faceWidth / 2}px`;
    unit.style.marginTop = `${-parseFloat(unit.style.height) / 2}px`;
    unit.style.transform = `rotateY(${index * 60}deg) translateZ(${radius}px)`;

    const face = el('section', 'shelf-face');
    face.setAttribute('aria-label', `${shelf.en}，${shelf.zh}`);
    const back = el('div', 'cabinet-back');
    back.setAttribute('aria-hidden', 'true');
    const interior = el('div', 'cabinet-interior');
    interior.setAttribute('aria-hidden', 'true');

    const cabinetTop = el('div', 'cabinet-cap cabinet-cap--top');
    cabinetTop.setAttribute('aria-hidden', 'true');
    const cabinetLeft = el('div', 'cabinet-side cabinet-side--left');
    cabinetLeft.setAttribute('aria-hidden', 'true');
    const cabinetRight = el('div', 'cabinet-side cabinet-side--right');
    cabinetRight.setAttribute('aria-hidden', 'true');
    const cabinetRoof = el('div', 'cabinet-roof');
    cabinetRoof.setAttribute('aria-hidden', 'true');
    const cabinetFloor = el('div', 'cabinet-floor');
    cabinetFloor.setAttribute('aria-hidden', 'true');
    const cabinetBase = el('div', 'cabinet-cap cabinet-cap--base');
    cabinetBase.setAttribute('aria-hidden', 'true');

    const head = el('div', 'shelf-face__head');
    const plaque = el('div', 'shelf-plaque');
    plaque.append(el('strong', '', shelf.en), el('span', '', shelf.zh));
    head.append(plaque);
    const bookArea = el('div', 'shelf-face__books');
    const books = ARTICLES.filter((article) => article.shelf === shelf.id);
    const rows = [[], [], [], []];
    books.forEach((article, bookIndex) => rows[bookIndex % rows.length].push(article));
    rows.forEach((rowItems, rowIndex) => {
      const row = el('div', 'book-row');
      row.setAttribute('aria-label', `${shelf.en}, shelf ${rowIndex + 1}`);
      rowItems.forEach((article) => row.append(makeBook(article)));
      bookArea.append(row);
    });
    face.append(cabinetTop, cabinetBase, head, bookArea);
    unit.append(back, interior, cabinetLeft, cabinetRight, cabinetRoof, cabinetFloor, face);
    return unit;
  }

  function renderShelves() {
    if (!elements.scene || !elements.ring) return;
    const narrowScreen = window.innerWidth < 620;
    faceWidth = narrowScreen
      ? Math.min(300, Math.max(220, elements.scene.clientWidth * 0.66))
      : Math.min(420, Math.max(240, Math.min(elements.scene.clientWidth * 0.29, window.innerWidth * 0.23)));
    const radius = faceWidth * Math.sqrt(3) / 2;
    elements.ring.replaceChildren(...SHELVES.map((shelf, index) => createShelfFace(shelf, index, radius)));
    setShelf(shelfStep, false);
  }

  function setShelf(step, animate = true) {
    shelfStep = step;
    activeShelf = ((step % SHELVES.length) + SHELVES.length) % SHELVES.length;
    ringRotation = -shelfStep * 60;
    elements.ring.style.transition = animate && !prefersReducedMotion.matches ? 'transform 720ms cubic-bezier(.22,1,.36,1)' : 'none';
    elements.ring.style.transform = `rotateY(${ringRotation}deg)`;
    Array.from(elements.ring.children).forEach((face, faceIndex) => {
      const steps = (faceIndex - activeShelf + SHELVES.length) % SHELVES.length;
      const distance = Math.min(steps, SHELVES.length - steps);
      const scales = [1, .86, .77, .72];
      const light = [1, .78, .58, .46];
      face.dataset.depth = String(distance);
      face.style.setProperty('--depth-scale', scales[distance]);
      face.style.setProperty('--depth-light', light[distance]);
      face.style.scale = String(scales[distance]);
      face.style.filter = `brightness(${light[distance]}) saturate(${light[distance]})`;
      face.style.transition = animate && !prefersReducedMotion.matches ? 'scale 720ms cubic-bezier(.22,1,.36,1), filter 720ms cubic-bezier(.22,1,.36,1)' : 'none';
      face.inert = faceIndex !== activeShelf;
      face.setAttribute('aria-hidden', String(faceIndex !== activeShelf));
    });
    const shelf = SHELVES[activeShelf];
    elements.shelfCounter.textContent = `${shelf.roman} / VI`;
    elements.shelfTitle.textContent = shelf.en;
    elements.shelfTitleZh.textContent = shelf.zh;
    Array.from(elements.shelfDots.children).forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', String(dotIndex === activeShelf));
    });
    hideBookCard();
  }

  function setShelfByIndex(index) {
    const forward = (index - activeShelf + SHELVES.length) % SHELVES.length;
    setShelf(shelfStep + (forward > SHELVES.length / 2 ? forward - SHELVES.length : forward));
  }

  function setupShelfDots() {
    elements.shelfDots.replaceChildren(...SHELVES.map((shelf, index) => {
      const dot = el('button', 'shelf-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', `转到 ${shelf.en}：${shelf.zh}`);
      dot.setAttribute('aria-current', String(index === activeShelf));
      dot.addEventListener('click', () => setShelfByIndex(index));
      return dot;
    }));
  }

  function showBookCard(article, event, button, pin = false) {
    if (dragState && dragState.moved) return;
    if (previewPinned && !pin) return;
    const shelf = SHELF_BY_ID.get(article.shelf);
    elements.cardShelf.textContent = shelf.en;
    elements.cardTitle.textContent = article.displayTitle;
    elements.cardExcerpt.textContent = article.excerpt;
    elements.cardMeta.textContent = `${article.year || 'ARCHIVE'}  ·  ${article.wordCount.toLocaleString('en-US')} 字  ·  ${article.readingTime} MIN`;
    previewArticle = article;
    previewButton = button;
    previewPinned = pin;
    elements.bookCard.hidden = false;
    elements.bookCard.classList.toggle('is-pinned', pin);
    positionBookCard(event, button);
  }

  function positionBookCard(event, button) {
    const bounds = button.getBoundingClientRect();
    const usePointer = event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY) && (event.clientX !== 0 || event.clientY !== 0);
    const x = usePointer ? event.clientX : bounds.right;
    const y = usePointer ? event.clientY : bounds.top;
    const card = elements.bookCard.getBoundingClientRect();
    const margin = 12;
    const gap = 18;
    const rightOfBook = Math.max(x, bounds.right) + gap;
    const leftOfBook = Math.min(x, bounds.left) - card.width - gap;
    const left = rightOfBook + card.width <= window.innerWidth - margin ? rightOfBook : leftOfBook;
    const top = y + gap + card.height <= window.innerHeight - margin ? y + gap : y - card.height - gap;
    elements.bookCard.style.left = `${Math.max(margin, Math.min(left, window.innerWidth - card.width - margin))}px`;
    elements.bookCard.style.top = `${Math.max(margin, Math.min(top, window.innerHeight - card.height - margin))}px`;
  }

  function hideBookCard() {
    elements.bookCard.hidden = true;
    elements.bookCard.classList.remove('is-pinned');
    previewArticle = null;
    previewButton = null;
    previewPinned = false;
  }

  function displayCount() {
    elements.libraryCount.textContent = `${ARTICLES.length} VOLUMES · 6 COLLECTIONS`;
    const chineseCharacters = ARTICLES.reduce((total, article) => total + (Number(article.chineseCharCount) || 0), 0);
    elements.creationTotal.textContent = chineseCharacters.toLocaleString('zh-CN');
    elements.indexSummary.textContent = `${ARTICLES.length} volumes across six collections`;
  }

  function showDialog(dialog) {
    closeDialogs(false);
    hideBookCard();
    returnFocus = document.activeElement;
    elements.backdrop.hidden = false;
    dialog.hidden = false;
    document.querySelector('.topbar').inert = true;
    const hero = document.getElementById('hero');
    if (hero) hero.inert = true;
    document.getElementById('library').inert = true;
    document.querySelector('.site-footer').inert = true;
    elements.shelfPrev.inert = true;
    elements.shelfNext.inert = true;
    document.body.classList.add('dialog-open');
    const focusTarget = dialog === elements.searchDialog ? elements.searchInput : dialog.querySelector('select');
    window.requestAnimationFrame(() => focusTarget && focusTarget.focus());
  }

  function closeDialogs(restore = true) {
    if (elements.backdrop.hidden) return;
    elements.searchDialog.hidden = true;
    elements.indexDialog.hidden = true;
    elements.backdrop.hidden = true;
    document.body.classList.remove('dialog-open');
    if (!currentBook) {
      document.querySelector('.topbar').inert = false;
      const hero = document.getElementById('hero');
      if (hero) hero.inert = false;
      document.getElementById('library').inert = false;
      document.querySelector('.site-footer').inert = false;
      elements.shelfPrev.inert = false;
      elements.shelfNext.inert = false;
    }
    if (restore && returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  }

  function appendResult(container, article) {
    const item = el('button', 'result-item');
    item.type = 'button';
    item.setAttribute('aria-label', `打开《${article.displayTitle}》，${SHELF_BY_ID.get(article.shelf).zh}`);
    const title = el('span', 'result-item__title', article.displayTitle);
    const shelf = el('span', 'result-item__shelf', SHELF_BY_ID.get(article.shelf).en);
    const excerpt = el('span', 'result-item__excerpt', article.excerpt);
    item.append(title, shelf, excerpt);
    item.addEventListener('click', () => {
      closeDialogs(false);
      openBook(article, null);
    });
    container.append(item);
  }

  function renderSearchResults(query) {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    const matches = normalized ? ARTICLES.filter((article) => searchable.get(article.id).includes(normalized)) : [];
    const results = matches.slice(0, 60);
    elements.searchResults.replaceChildren();
    elements.searchCount.textContent = normalized ? `${matches.length} VOLUMES FOUND${matches.length > results.length ? ` · SHOWING FIRST ${results.length}` : ''}` : '输入关键词开始检索';
    if (normalized && matches.length === 0) elements.searchResults.append(el('div', 'empty-state', '没有找到匹配的文章。试试更短的关键词。'));
    results.forEach((article) => appendResult(elements.searchResults, article));
  }

  function setupIndexFilters() {
    SHELVES.forEach((shelf) => {
      const option = document.createElement('option');
      option.value = shelf.id;
      option.textContent = `${shelf.en} · ${shelf.zh}`;
      elements.filterShelf.append(option);
    });
    const years = Array.from(new Set(ARTICLES.map((article) => article.year).filter(Boolean))).sort().reverse();
    years.forEach((year) => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      elements.filterYear.append(option);
    });
    const types = Array.from(new Set(ARTICLES.map((article) => article.type))).sort();
    types.forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      elements.filterType.append(option);
    });
    const tags = Array.from(new Set(ARTICLES.flatMap((article) => article.tags))).sort((a, b) => a.localeCompare(b, 'zh-CN'));
    tags.forEach((tag) => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      elements.filterTag.append(option);
    });
  }

  function renderIndex() {
    const shelf = elements.filterShelf.value;
    const year = elements.filterYear.value;
    const tag = elements.filterTag.value;
    const type = elements.filterType.value;
    const results = ARTICLES.filter((article) =>
      (shelf === 'all' || article.shelf === shelf) &&
      (year === 'all' || article.year === year) &&
      (tag === 'all' || article.tags.includes(tag)) &&
      (type === 'all' || article.type === type)
    );
    elements.indexResults.replaceChildren();
    elements.indexCount.textContent = `${results.length} / ${ARTICLES.length}`;
    if (results.length === 0) elements.indexResults.append(el('div', 'empty-state', '这些筛选条件下没有文章。'));
    results.forEach((article) => appendResult(elements.indexResults, article));
  }

  function openBook(article, button) {
    if (!article) return;
    if (!currentBook) savedShelfStep = shelfStep;
    lastBookButton = button || (currentBook ? lastBookButton : returnFocus);
    currentBook = article;
    const shelf = SHELF_BY_ID.get(article.shelf);
    elements.readerCollection.textContent = `${shelf.roman} / ${shelf.en}  ·  ${shelf.zh}`;
    elements.readerTitle.textContent = article.displayTitle;
    elements.readerMeta.textContent = `${article.year || 'ARCHIVE'}  ·  ${article.wordCount.toLocaleString('en-US')} 字  ·  ${article.readingTime} 分钟阅读`;
    elements.readerTags.replaceChildren(...article.tags.map((tag) => el('span', 'tag-chip', tag)));
    elements.readerContent.innerHTML = renderMarkdown(article.markdown);
    updateReaderNeighbors();
    elements.reader.classList.add('is-open');
    elements.reader.inert = false;
    elements.reader.setAttribute('aria-hidden', 'false');
    document.querySelector('.topbar').inert = true;
    const hero = document.getElementById('hero');
    if (hero) hero.inert = true;
    document.getElementById('library').inert = true;
    document.querySelector('.site-footer').inert = true;
    elements.shelfPrev.inert = true;
    elements.shelfNext.inert = true;
    document.body.classList.add('reader-open');
    hideBookCard();
    writeHash(article.slug);
    window.requestAnimationFrame(() => {
      elements.reader.scrollTop = 0;
      elements.readerBook.focus({ preventScroll: true });
    });
  }

  function updateReaderNeighbors() {
    if (!currentBook || ARTICLES.length < 2) return;
    const index = ARTICLES.findIndex((article) => article.id === currentBook.id);
    const previous = ARTICLES[(index - 1 + ARTICLES.length) % ARTICLES.length];
    const next = ARTICLES[(index + 1) % ARTICLES.length];
    const previousButton = document.getElementById('bookPrev');
    const nextButton = document.getElementById('bookNext');
    previousButton.querySelector('strong').textContent = previous.displayTitle;
    nextButton.querySelector('strong').textContent = next.displayTitle;
    previousButton.onclick = () => openBook(previous, null);
    nextButton.onclick = () => openBook(next, null);
  }

  function closeReader() {
    elements.reader.classList.remove('is-open');
    elements.reader.inert = true;
    elements.reader.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('reader-open');
    currentBook = null;
    document.querySelector('.topbar').inert = false;
    const hero = document.getElementById('hero');
    if (hero) hero.inert = false;
    document.getElementById('library').inert = false;
    document.querySelector('.site-footer').inert = false;
    elements.shelfPrev.inert = false;
    elements.shelfNext.inert = false;
    setShelf(savedShelfStep, false);
    writeHash('library');
    window.setTimeout(() => {
      if (lastBookButton && document.contains(lastBookButton)) lastBookButton.focus();
      else document.getElementById('shelfNext').focus();
    }, prefersReducedMotion.matches ? 0 : 340);
  }

  function writeHash(fragment) {
    try { history.replaceState(null, '', `#${fragment}`); }
    catch (_) { location.hash = fragment; }
  }

  function setReaderTheme(theme) {
    const paper = theme === 'paper';
    elements.reader.classList.toggle('is-paper', paper);
    document.getElementById('themeNight').classList.toggle('is-active', !paper);
    document.getElementById('themePaper').classList.toggle('is-active', paper);
    document.getElementById('themeNight').setAttribute('aria-pressed', String(!paper));
    document.getElementById('themePaper').setAttribute('aria-pressed', String(paper));
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function safeImageSource(value) {
    const source = value.trim().replace(/&amp;/g, '&');
    if (/^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/=\r\n]+$/i.test(source)) return source.replace(/\s/g, '');
    return '';
  }

  function safeLink(value) {
    const source = value.trim().replace(/&amp;/g, '&');
    try {
      const url = new URL(source, window.location.href);
      if (url.protocol === 'https:' || url.protocol === 'http:' || (url.protocol === 'file:' && source.startsWith('#'))) return source;
    } catch (_) { return ''; }
    return '';
  }

  function renderInline(raw) {
    let text = escapeHTML(raw).replace(/\\([\\`*_{}\[\]()#+.!|>~-])/g, '$1');
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, source) => {
      const safe = safeImageSource(source);
      return safe ? `<img src="${safe}" alt="${alt}" loading="lazy">` : '<span class="image-unavailable">[外部图片未加载]</span>';
    });
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const safe = safeLink(href);
      if (!safe) return label;
      const external = /^https?:/i.test(safe);
      return `<a href="${safe}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    });
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong>$1$2</strong>');
    text = text.replace(/\*(.+?)\*|_(.+?)_/g, '<em>$1$2</em>');
    return text;
  }

  function tableCells(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown || '').replace(/\r/g, '').split('\n');
    const output = [];
    let index = 0;
    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) { index++; continue; }

      if (/^\s*(```|~~~)/.test(line)) {
        const fence = line.trim().slice(0, 3);
        const code = [];
        index++;
        while (index < lines.length && !lines[index].trim().startsWith(fence)) code.push(lines[index++]);
        if (index < lines.length) index++;
        output.push(`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`);
        continue;
      }

      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        const level = Math.min(heading[1].length + 1, 6);
        output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        index++;
        continue;
      }
      if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) { output.push('<hr>'); index++; continue; }

      if (line.includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
        const headers = tableCells(line);
        index += 2;
        const rows = [];
        while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(tableCells(lines[index++]));
        const headHTML = headers.map((cell) => `<th>${renderInline(cell)}</th>`).join('');
        const bodyHTML = rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${renderInline(row[cellIndex] || '')}</td>`).join('')}</tr>`).join('');
        output.push(`<div class="table-wrap"><table><thead><tr>${headHTML}</tr></thead><tbody>${bodyHTML}</tbody></table></div>`);
        continue;
      }

      if (/^\s*>/.test(line)) {
        const quote = [];
        while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ''));
        output.push(`<blockquote>${renderMarkdown(quote.join('\n'))}</blockquote>`);
        continue;
      }

      const listMatch = line.match(/^\s*(?:([-+*])|(\d+)[.)])\s+(.+)$/);
      if (listMatch) {
        const ordered = Boolean(listMatch[2]);
        const items = [];
        while (index < lines.length) {
          const itemMatch = lines[index].match(/^\s*(?:([-+*])|(\d+)[.)])\s+(.+)$/);
          if (!itemMatch || Boolean(itemMatch[2]) !== ordered) break;
          items.push(`<li>${renderInline(itemMatch[3])}</li>`);
          index++;
        }
        const tag = ordered ? 'ol' : 'ul';
        output.push(`<${tag}>${items.join('')}</${tag}>`);
        continue;
      }

      const paragraph = [line.trim()];
      index++;
      while (index < lines.length && lines[index].trim() &&
        !/^\s*(?:#{1,6}\s|>|```|~~~|[-+*]\s|\d+[.)]\s|---+\s*$)/.test(lines[index])) {
        paragraph.push(lines[index++].trim());
      }
      output.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    }
    return output.join('\n');
  }

  function drawStars() {
    const canvas = document.getElementById('starfield');
    const context = canvas.getContext('2d');
    if (!context) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    let seed = 441812;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const count = Math.min(550, Math.round(window.innerWidth * window.innerHeight / 4000));
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const constellations = [
      { points: [[.035,.19],[.075,.13],[.112,.17],[.15,.105],[.19,.14],[.225,.08]], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[1,4]] },
      { points: [[.75,.17],[.79,.105],[.835,.14],[.87,.075],[.92,.12],[.96,.07]], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[0,3]] },
      { points: [[.035,.46],[.075,.40],[.12,.44],[.15,.35],[.195,.39],[.23,.31]], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[1,4]] },
      { points: [[.765,.46],[.80,.39],[.845,.43],[.875,.34],[.92,.39],[.96,.31]], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[0,3],[2,5]] },
      { points: [[.37,.09],[.405,.045],[.44,.085],[.47,.035],[.505,.075]], edges: [[0,1],[1,2],[2,3],[3,4]] }
    ];

    context.lineWidth = .8;
    context.strokeStyle = 'rgba(196, 176, 139, .29)';
    constellations.forEach(({ points, edges }) => {
      context.beginPath();
      edges.forEach(([from, to]) => {
        context.moveTo(points[from][0] * window.innerWidth, points[from][1] * window.innerHeight);
        context.lineTo(points[to][0] * window.innerWidth, points[to][1] * window.innerHeight);
      });
      context.stroke();
      points.forEach(([x, y], index) => {
        const radius = index % 3 === 0 ? 1.35 : .75;
        context.beginPath();
        context.fillStyle = index % 3 === 0 ? 'rgba(238, 229, 212, .78)' : 'rgba(238, 229, 212, .52)';
        context.shadowColor = 'rgba(204, 183, 142, .4)';
        context.shadowBlur = index % 3 === 0 ? 4 : 1.5;
        context.arc(x * window.innerWidth, y * window.innerHeight, radius, 0, Math.PI * 2);
        context.fill();
      });
    });
    context.shadowBlur = 0;

    for (let index = 0; index < count; index++) {
      const x = random() * window.innerWidth;
      const y = random() * window.innerHeight * .5;
      const highlight = random() < .012;
      const radius = highlight ? 1.15 : .28 + random() * .32;
      const alpha = highlight ? .7 + random() * .13 : .16 + random() * .25;
      context.beginPath();
      context.fillStyle = `rgba(222, 211, 190, ${alpha})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    drawChartGrid(context, window.innerWidth, window.innerHeight);
  }

  function drawChartGrid(context, width, height) {
    context.save();
    context.beginPath();
    context.rect(0, 0, width, height * .52);
    context.clip();
    context.lineWidth = .65;
    context.strokeStyle = 'rgba(201, 171, 116, .16)';
    const centerX = width * .5;
    const centerY = height * .42;
    [1, 1.22, 1.48].forEach((scale) => {
      context.beginPath();
      context.ellipse(centerX, centerY, width * .26 * scale, height * .36 * scale, 0, Math.PI * 1.04, Math.PI * 1.96);
      context.stroke();
    });
    for (let index = 0; index < 24; index++) {
      const angle = Math.PI * (1.06 + index * .88 / 23);
      const innerRadius = width * .18;
      const outerRadius = width * .43;
      context.beginPath();
      context.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius * .7);
      context.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius * .7);
      context.stroke();
    }
    context.restore();

    context.save();
    context.fillStyle = 'rgba(208, 183, 138, .54)';
    context.font = '10px Georgia, serif';
    context.textAlign = 'center';
    if ('letterSpacing' in context) context.letterSpacing = '3px';
    [
      ['URSA MAJOR', .09, .21], ['DRACO', .32, .105], ['CASSIOPEIA', .7, .13],
      ['ANDROMEDA', .91, .24], ['ORION', .09, .48], ['PEGASUS', .91, .48]
    ].forEach(([label, x, y]) => context.fillText(label, width * x, height * y));
    context.restore();

    const horizon = height * .54;
    context.save();
    context.beginPath();
    context.rect(0, horizon, width, height - horizon);
    context.clip();
    context.lineWidth = .8;
    context.strokeStyle = 'rgba(195, 151, 78, .15)';
    for (let index = 0; index <= 18; index++) {
      const endX = width * (index / 18);
      context.beginPath();
      context.moveTo(centerX, horizon);
      context.lineTo(endX, height * 1.08);
      context.stroke();
    }
    for (let index = 1; index <= 9; index++) {
      const progress = index / 9;
      const y = horizon + (height - horizon) * progress * progress;
      context.beginPath();
      context.moveTo(-width * .1, y);
      context.quadraticCurveTo(centerX, y - height * .035 * (1 - progress), width * 1.1, y);
      context.stroke();
    }
    context.strokeStyle = 'rgba(208, 170, 102, .14)';
    for (let index = 1; index <= 5; index++) {
      const radiusX = width * index * .13;
      context.beginPath();
      context.ellipse(centerX, horizon, radiusX, radiusX * .21, 0, 0, Math.PI * 2);
      context.stroke();
    }
    const circleY = height * .72;
    const circleXRadius = width * .39;
    const circleYRadius = height * .16;
    context.strokeStyle = 'rgba(220, 170, 90, .2)';
    [1, .96, .74, .7].forEach((scale) => {
      context.beginPath();
      context.ellipse(centerX, circleY, circleXRadius * scale, circleYRadius * scale, 0, 0, Math.PI * 2);
      context.stroke();
    });
    for (let index = 0; index < 12; index++) {
      const angle = index * Math.PI / 6;
      const x1 = centerX + Math.cos(angle) * circleXRadius * .74;
      const y1 = circleY + Math.sin(angle) * circleYRadius * .74;
      const x2 = centerX + Math.cos(angle) * circleXRadius;
      const y2 = circleY + Math.sin(angle) * circleYRadius;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      if (index % 3 === 0) {
        context.beginPath();
        context.moveTo(x2, y2 - 5);
        context.lineTo(x2 + 5, y2);
        context.lineTo(x2, y2 + 5);
        context.lineTo(x2 - 5, y2);
        context.closePath();
        context.fillStyle = 'rgba(228, 185, 110, .28)';
        context.fill();
      }
    }
    context.restore();
  }

  function setupInteractions() {
    const forwardClick = (sourceId, targetId) => {
      const source = document.getElementById(sourceId);
      const target = document.getElementById(targetId);
      if (source && target) source.addEventListener('click', () => target.click());
    };
    forwardClick('heroSearchOpen', 'searchOpen');
    forwardClick('heroIndexOpen', 'indexOpen');

    const hero = document.getElementById('hero');
    const heroEnter = document.getElementById('heroEnterArchive');
    const library = document.getElementById('library');
    if (hero && heroEnter && library) {
      heroEnter.addEventListener('click', (event) => {
        event.preventDefault();
        hero.classList.add('is-exiting');
        window.setTimeout(() => {
          library.scrollIntoView({
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
            block: 'start'
          });
          library.focus({ preventScroll: true });
          writeHash('library');
          window.setTimeout(() => hero.classList.remove('is-exiting'), prefersReducedMotion.matches ? 0 : 700);
        }, prefersReducedMotion.matches ? 0 : 500);
      });
    }

    document.getElementById('shelfPrev').addEventListener('click', () => setShelf(shelfStep - 1));
    document.getElementById('shelfNext').addEventListener('click', () => setShelf(shelfStep + 1));
    document.getElementById('cardOpen').addEventListener('click', () => {
      if (previewArticle) openBook(previewArticle, previewButton);
    });
    document.getElementById('cardClose').addEventListener('click', () => {
      const button = previewButton;
      hideBookCard();
      if (button && document.contains(button)) {
        button.focus({ preventScroll: true });
        hideBookCard();
      }
    });
    document.addEventListener('pointerdown', (event) => {
      if (!previewPinned || !(event.target instanceof Element)) return;
      if (!elements.bookCard.contains(event.target) && !event.target.closest('.book')) hideBookCard();
    });
    document.getElementById('searchOpen').addEventListener('click', () => showDialog(elements.searchDialog));
    document.getElementById('indexOpen').addEventListener('click', () => { renderIndex(); showDialog(elements.indexDialog); });
    document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeDialogs()));
    elements.backdrop.addEventListener('click', (event) => { if (event.target === elements.backdrop) closeDialogs(); });
    document.getElementById('readerBack').addEventListener('click', closeReader);
    document.getElementById('readerReturn').addEventListener('click', closeReader);
    document.getElementById('themeNight').addEventListener('click', () => setReaderTheme('night'));
    document.getElementById('themePaper').addEventListener('click', () => setReaderTheme('paper'));
    elements.searchInput.addEventListener('input', () => renderSearchResults(elements.searchInput.value));
    elements.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const first = elements.searchResults.querySelector('.result-item');
        if (first) first.click();
      }
    });
    [elements.filterShelf, elements.filterYear, elements.filterTag, elements.filterType].forEach((filter) => filter.addEventListener('change', renderIndex));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { hideBookCard(); closeDialogs(); if (currentBook) closeReader(); }
      if (event.key === 'Tab' && !elements.backdrop.hidden) {
        const activeDialog = elements.searchDialog.hidden ? elements.indexDialog : elements.searchDialog;
        const focusable = Array.from(activeDialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])')).filter((node) => !node.hidden);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last && last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first && first.focus(); }
      }
      if (event.key === 'Tab' && currentBook) {
        const focusable = Array.from(elements.reader.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')).filter((node) => !node.hidden);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last && last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first && first.focus(); }
      }
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target.isContentEditable) return;
      if (event.target instanceof Element && event.target.closest('#photos, #viewer')) return;
      if (event.key === '/' && elements.reader.getAttribute('aria-hidden') === 'true') {
        event.preventDefault();
        if (elements.backdrop.hidden) showDialog(elements.searchDialog);
        else if (!elements.searchDialog.hidden) elements.searchInput.focus();
      }
      if (elements.backdrop.hidden && !currentBook && event.key === 'ArrowLeft') { event.preventDefault(); setShelf(shelfStep - 1); }
      if (elements.backdrop.hidden && !currentBook && event.key === 'ArrowRight') { event.preventDefault(); setShelf(shelfStep + 1); }
    });

    elements.scene.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || dragState) return;
      dragState = { pointerId: event.pointerId, x: event.clientX, rotation: ringRotation, moved: false };
    });
    window.addEventListener('pointermove', (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      const delta = event.clientX - dragState.x;
      if (!dragState.moved && Math.abs(delta) < 7) return;
      if (!dragState.moved) {
        dragState.moved = true;
        hideBookCard();
        elements.scene.setPointerCapture(event.pointerId);
      }
      const visualScale = elements.scene.getBoundingClientRect().width / elements.scene.clientWidth || 1;
      ringRotation = dragState.rotation + (delta / (faceWidth * visualScale)) * 60;
      elements.ring.style.transition = 'none';
      elements.ring.style.transform = `rotateY(${ringRotation}deg)`;
    });
    const finishDrag = (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      const moved = dragState.moved;
      if (elements.scene.hasPointerCapture(event.pointerId)) elements.scene.releasePointerCapture(event.pointerId);
      dragState = null;
      if (!moved) return;
      suppressDragClick = true;
      window.setTimeout(() => { suppressDragClick = false; }, 0);
      setShelf(Math.round(-ringRotation / 60));
    };
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    document.addEventListener('click', (event) => {
      if (!suppressDragClick) return;
      suppressDragClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    elements.scene.addEventListener('wheel', (event) => {
      if (!elements.backdrop.hidden || currentBook) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      wheelTotal += delta;
      if (Math.abs(wheelTotal) > 58) {
        setShelf(shelfStep + (wheelTotal > 0 ? 1 : -1));
        wheelTotal = 0;
      }
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { wheelTotal = 0; }, 180);
    }, { passive: false });
  }

  function start() {
    displayCount();
    setupShelfDots();
    setupIndexFilters();
    setupInteractions();
    renderShelves();
    drawStars();
    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        renderShelves();
        drawStars();
        resizeFrame = 0;
      });
    }, { passive: true });
    if (!prefersReducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
      let pointerFrame = 0;
      let pointerX = 0;
      let pointerY = 0;
      window.addEventListener('pointermove', (event) => {
        pointerX = (event.clientX / window.innerWidth - .5) * 6;
        pointerY = (event.clientY / window.innerHeight - .5) * 6;
        if (pointerFrame) return;
        pointerFrame = window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--parallax-x', `${pointerX.toFixed(2)}px`);
          document.documentElement.style.setProperty('--parallax-y', `${pointerY.toFixed(2)}px`);
          pointerFrame = 0;
        });
      }, { passive: true });
    }
    const requestedSlug = decodeURIComponent(location.hash.replace(/^#/, ''));
    const deepLinkedArticle = ARTICLE_BY_SLUG.get(requestedSlug);
    if (deepLinkedArticle) openBook(deepLinkedArticle, null);
  }

  start();
}());
