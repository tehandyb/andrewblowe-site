document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const cursor = document.createElement('div');
  cursor.className = 'timeline-cursor';
  timeline.appendChild(cursor);

  let currentY = 0;
  let targetY = 0;

  function getTargetY() {
    const timelineTop = timeline.getBoundingClientRect().top + window.scrollY;
    const timelineHeight = timeline.scrollHeight;
    const viewportMid = window.scrollY + window.innerHeight * 0.45;
    const progress = (viewportMid - timelineTop) / timelineHeight;
    return Math.max(0, Math.min(timelineHeight, progress * timelineHeight));
  }

  function tick() {
    targetY = getTargetY();
    currentY += (targetY - currentY) * 0.1;
    cursor.style.top = currentY + 'px';
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
