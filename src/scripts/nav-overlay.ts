/*
 * nav-overlay.ts — controller for the full-page navigation sheet.
 *
 * Wires:
 *   - [data-nav-toggle] hamburger button ↔ [data-nav-overlay] sheet root
 *   - aria-expanded / aria-hidden / data-open state in lockstep
 *   - ESC + backdrop click + nav link click to close
 *   - body scroll lock while open
 */

const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const overlay = document.querySelector<HTMLElement>('[data-nav-overlay]');
const backdrop = overlay?.querySelector<HTMLElement>('[data-nav-backdrop]');

if (toggle && overlay) {
  const navLinks = overlay.querySelectorAll<HTMLAnchorElement>('a[href]');

  let prevOverflow = '';

  const setOpen = (open: boolean) => {
    overlay.dataset['open'] = open ? 'true' : 'false';
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Focus the first nav link for keyboard users.
      const first = overlay.querySelector<HTMLAnchorElement>('.pk-nav-item');
      first?.focus({ preventScroll: true });
    } else {
      document.body.style.overflow = prevOverflow;
      toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });

  backdrop?.addEventListener('click', () => setOpen(false));

  navLinks.forEach((a) =>
    a.addEventListener('click', () => {
      // Close on same-page anchor clicks too; routing handles the rest.
      setOpen(false);
    }),
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      e.preventDefault();
      setOpen(false);
    }
  });
}
