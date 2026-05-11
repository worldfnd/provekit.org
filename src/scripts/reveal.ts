function init() {
  const targets = document.querySelectorAll<HTMLElement>('.pk-reveal');
  if (targets.length === 0) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px 0px 0px', threshold: 0.01 },
  );
  targets.forEach((el) => io.observe(el));

  // Safety: anything still unrevealed after 2s gets promoted unconditionally.
  window.setTimeout(() => {
    document
      .querySelectorAll<HTMLElement>('.pk-reveal:not(.is-visible)')
      .forEach((el) => el.classList.add('is-visible'));
  }, 2000);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

export {};
