document.addEventListener('DOMContentLoaded', () => {
  const items = [...document.querySelectorAll('.timeline-item')];
  const dots  = [...document.querySelectorAll('.timeline-dot')];

  let lastActive = -1;

  function update() {
    const trigger = window.innerHeight * 0.5;
    let activeIndex = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i].getBoundingClientRect().top <= trigger) {
        activeIndex = i;
      }
    }

    if (activeIndex !== lastActive) {
      dots.forEach((dot, i) => dot.classList.toggle('reading', i === activeIndex));
      lastActive = activeIndex;
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
});
