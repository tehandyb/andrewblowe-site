document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.timeline-item');
  const dots  = document.querySelectorAll('.timeline-dot');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = [...items].indexOf(entry.target);
        dots.forEach((dot, i) => dot.classList.toggle('reading', i === index));
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '-15% 0px -40% 0px'
  });

  items.forEach(item => observer.observe(item));
});
