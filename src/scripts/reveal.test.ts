import { describe, it, expect, vi, beforeEach } from 'vitest';

let observerCb: IntersectionObserverCallback | null = null;
class FakeIO implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  constructor(cb: IntersectionObserverCallback) {
    observerCb = cb;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
}
beforeEach(() => {
  document.body.innerHTML = '<p class="pk-reveal" id="x">hi</p>';
  vi.stubGlobal('IntersectionObserver', FakeIO as unknown as typeof IntersectionObserver);
});

describe('reveal', () => {
  it('adds is-visible to intersecting elements', async () => {
    await import('./reveal');
    const el = document.getElementById('x')!;
    observerCb?.(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(el.classList.contains('is-visible')).toBe(true);
  });
});
