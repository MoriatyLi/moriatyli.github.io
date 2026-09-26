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
    shelfTitle: document.getElementById('shelfTitle'),
    shelfTitleZh: document.getElementById('shelfTitleZh'),
    shelfCounter: document.getElementById('shelfCounter'),
    shelfDots: document.getElementById('shelfDots'),
    libraryCount: document.getElementById('libraryCount'),
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
  let currentBook = null;
  let lastBookButton = null;
  let savedShelf = 0;
  let faceWidth = 820;
  let ringRotation = 0;
  let dragState = null;
  let wheelTotal = 0;
  let wheelTimer = 0;
  let returnFocus = null;
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
    const saturation = 26 + ((number >>> 8) % 17);
    const lightness = 24 + ((number >>> 16) % 13);
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  function bookDimensions(article) {
    const weight = Math.log(Math.max(1, article.wordCount) + 1);
    return {
      width: Math.round(24 + Math.min(25, Math.max(0, (weight - 4.5) * 5))),
      height: Math.round(86 + Math.min(45, Math.max(0, (weight - 4.5) * 9)))
    };
  }

  function makeBook(article) {
    const book = el('button', 'book');
    const size = bookDimensions(article);
    book.type = 'button';
    book.dataset.bookId = article.id;
    book.style.setProperty('--book-width', `${size.width}px`);
    book.style.setProperty('--book-height', `${size.height}px`);
    book.style.setProperty('--book-color', bookColor(article.spineColorSeed));
    book.setAttribute('aria-label', `打开《${article.displayTitle}》，${SHELF_BY_ID.get(article.shelf).zh}，${article.readingTime} 分钟`);
    const title = el('span', 'book__title', article.displayTitle.length > 13 ? `${article.displayTitle.slice(0, 12)}…` : article.displayTitle);
    title.setAttribute('aria-hidden', 'true');
    book.append(title);
    book.addEventListener('pointerenter', () => showBookCard(article));
    book.addEventListener('focus', () => showBookCard(article));
    book.addEventListener('pointerleave', () => { if (document.activeElement !== book) hideBookCard(); });
    book.addEventListener('blur', hideBookCard);
    book.addEventListener('click', () => openBook(article, book));
    return book;
  }

  function createShelfFace(shelf, index, radius) {
    const face = el('section', 'shelf-face');
    face.setAttribute('aria-label', `${shelf.en}，${shelf.zh}`);
    face.style.width = `${faceWidth}px`;
    face.style.height = `${Math.min(590, Math.max(470, elements.scene.clientHeight * 0.88))}px`;
    face.style.marginLeft = `${-faceWidth / 2}px`;
    face.style.marginTop = `${-parseFloat(face.style.height) / 2}px`;
    face.style.transform = `rotateY(${index * 60}deg) translateZ(${radius}px)`;

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
    face.append(head, bookArea);
    return face;
  }

  function renderShelves() {
    if (!elements.scene || !elements.ring) return;
    faceWidth = Math.min(900, Math.max(290, elements.scene.clientWidth * (window.innerWidth < 620 ? 0.86 : 0.76)));
    const radius = faceWidth * Math.sqrt(3) / 2;
    elements.ring.replaceChildren(...SHELVES.map((shelf, index) => createShelfFace(shelf, index, radius)));
    setShelf(activeShelf, false);
  }

  function setShelf(index, animate = true) {
    activeShelf = (index + SHELVES.length) % SHELVES.length;
    ringRotation = -activeShelf * 60;
    elements.ring.style.transition = animate && !prefersReducedMotion.matches ? 'transform 720ms cubic-bezier(.2,.8,.2,1)' : 'none';
    elements.ring.style.transform = `rotateY(${ringRotation}deg)`;
    Array.from(elements.ring.children).forEach((face, faceIndex) => {
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

  function setupShelfDots() {
    elements.shelfDots.replaceChildren(...SHELVES.map((shelf, index) => {
      const dot = el('button', 'shelf-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', `转到 ${shelf.en}：${shelf.zh}`);
      dot.setAttribute('aria-current', String(index === activeShelf));
      dot.addEventListener('click', () => setShelf(index));
      return dot;
    }));
  }

  function showBookCard(article) {
    const shelf = SHELF_BY_ID.get(article.shelf);
    elements.cardShelf.textContent = shelf.en;
    elements.cardTitle.textContent = article.displayTitle;
    elements.cardExcerpt.textContent = article.excerpt;
    elements.cardMeta.textContent = `${article.year || 'ARCHIVE'}  ·  ${article.wordCount.toLocaleString('en-US')} 字  ·  ${article.readingTime} MIN`;
    elements.bookCard.hidden = false;
  }

  function hideBookCard() { elements.bookCard.hidden = true; }

  function displayCount() {
    elements.libraryCount.textContent = `${ARTICLES.length} VOLUMES · 6 COLLECTIONS`;
    elements.indexSummary.textContent = `${ARTICLES.length} volumes across six collections`;
  }

  function showDialog(dialog) {
    closeDialogs(false);
    returnFocus = document.activeElement;
    elements.backdrop.hidden = false;
    dialog.hidden = false;
    document.querySelector('.topbar').inert = true;
    document.getElementById('library').inert = true;
    document.querySelector('.site-footer').inert = true;
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
      document.getElementById('library').inert = false;
      document.querySelector('.site-footer').inert = false;
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
    if (!currentBook) savedShelf = activeShelf;
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
    document.getElementById('library').inert = true;
    document.querySelector('.site-footer').inert = true;
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
    document.getElementById('library').inert = false;
    document.querySelector('.site-footer').inert = false;
    setShelf(savedShelf, false);
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
    const count = Math.min(520, Math.round(window.innerWidth * window.innerHeight / 2600));
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let index = 0; index < count; index++) {
      const x = random() * window.innerWidth;
      const y = random() * window.innerHeight;
      const radius = random() < .035 ? 1.2 : .35 + random() * .42;
      const alpha = .08 + random() * .2;
      context.beginPath();
      context.fillStyle = `rgba(222, 211, 190, ${alpha})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  function setupInteractions() {
    document.getElementById('shelfPrev').addEventListener('click', () => setShelf(activeShelf - 1));
    document.getElementById('shelfNext').addEventListener('click', () => setShelf(activeShelf + 1));
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
      if (event.key === 'Escape') { closeDialogs(); if (currentBook) closeReader(); }
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
      if (event.key === '/' && elements.reader.getAttribute('aria-hidden') === 'true') {
        event.preventDefault();
        if (elements.backdrop.hidden) showDialog(elements.searchDialog);
        else if (!elements.searchDialog.hidden) elements.searchInput.focus();
      }
      if (elements.backdrop.hidden && !currentBook && event.key === 'ArrowLeft') { event.preventDefault(); setShelf(activeShelf - 1); }
      if (elements.backdrop.hidden && !currentBook && event.key === 'ArrowRight') { event.preventDefault(); setShelf(activeShelf + 1); }
    });

    elements.scene.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button')) return;
      dragState = { x: event.clientX, rotation: ringRotation, moved: false };
      elements.scene.setPointerCapture(event.pointerId);
    });
    elements.scene.addEventListener('pointermove', (event) => {
      if (!dragState) return;
      const delta = event.clientX - dragState.x;
      if (Math.abs(delta) > 4) dragState.moved = true;
      ringRotation = dragState.rotation - (delta / faceWidth) * 60;
      elements.ring.style.transition = 'none';
      elements.ring.style.transform = `rotateY(${ringRotation}deg)`;
    });
    const finishDrag = () => {
      if (!dragState) return;
      const nextShelf = Math.round(-ringRotation / 60);
      dragState = null;
      setShelf(nextShelf);
    };
    elements.scene.addEventListener('pointerup', finishDrag);
    elements.scene.addEventListener('pointercancel', finishDrag);
    elements.scene.addEventListener('wheel', (event) => {
      if (!elements.backdrop.hidden || currentBook) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      wheelTotal += delta;
      if (Math.abs(wheelTotal) > 58) {
        setShelf(activeShelf + (wheelTotal > 0 ? 1 : -1));
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
    window.addEventListener('resize', () => { renderShelves(); drawStars(); });
    const requestedSlug = decodeURIComponent(location.hash.replace(/^#/, ''));
    const deepLinkedArticle = ARTICLE_BY_SLUG.get(requestedSlug);
    if (deepLinkedArticle) openBook(deepLinkedArticle, null);
  }

  start();
}());
