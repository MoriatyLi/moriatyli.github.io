from pathlib import Path

src = Path("/mnt/data/app.js")
dst = Path("/mnt/data/app_mobile_fixed.js")

text = src.read_text(encoding="utf-8")

old_click = """    book.addEventListener('click', (event) => {
      if (previewPinned && previewArticle === article && previewButton === book) openBook(article, book);
      else showBookCard(article, event, book, true);
    });"""

new_click = """    book.addEventListener('click', (event) => {
      event.stopPropagation();

      const isTouchDevice =
        window.matchMedia('(pointer: coarse)').matches ||
        window.innerWidth <= 820;

      // 手机 / 平板：单击书脊直接打开文章，避免触摸设备没有 hover 时出现“点击无反应”的体验。
      if (isTouchDevice) {
        hideBookCard();
        openBook(article, book);
        return;
      }

      // 桌面端：保留“第一次固定预览，第二次打开文章”的原有交互。
      if (previewPinned && previewArticle === article && previewButton === book) {
        openBook(article, book);
      } else {
        showBookCard(article, event, book, true);
      }
    });"""

old_pointerdown = """    elements.scene.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || dragState) return;
      dragState = { pointerId: event.pointerId, x: event.clientX, rotation: ringRotation, moved: false };
    });"""

new_pointerdown = """    elements.scene.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || dragState) return;

      // 点击书本时不要启动书柜拖拽，避免手机上的轻微手指位移吞掉 book 的 click。
      if (event.target instanceof Element && event.target.closest('.book')) return;

      dragState = {
        pointerId: event.pointerId,
        x: event.clientX,
        rotation: ringRotation,
        moved: false
      };
    });"""

old_threshold = "      if (!dragState.moved && Math.abs(delta) < 7) return;"
new_threshold = "      if (!dragState.moved && Math.abs(delta) < 14) return;"

for old, label in [
    (old_click, "book click handler"),
    (old_pointerdown, "scene pointerdown handler"),
    (old_threshold, "drag threshold"),
]:
    if old not in text:
        raise RuntimeError(f"Could not find expected {label}; file was not modified.")

text = text.replace(old_click, new_click, 1)
text = text.replace(old_pointerdown, new_pointerdown, 1)
text = text.replace(old_threshold, new_threshold, 1)

dst.write_text(text, encoding="utf-8")

print(f"已生成：{dst.name}")
print("修改内容：")
print("1. 手机/平板点击书脊直接打开文章")
print("2. 点击 .book 时不启动书柜拖拽")
print("3. 拖拽判定阈值 7px → 14px")
print(f"文件大小：{dst.stat().st_size} bytes")
