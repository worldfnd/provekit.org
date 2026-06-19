/**
 * Wires hover interactions on every <svg class="pk-line-chart"> on the page:
 * vertical guide line follows the cursor's nearest x-tick, tooltip flips in
 * with toolkit values sorted descending, hovered-column dots scale to r=6
 * and invert (white fill, colored stroke). Mouseleave resets everything.
 *
 * Direct port of design-system/ui_kits/landing/BenchmarkSection.jsx#LineChart
 * hover state, except in vanilla TS so each chart instance manages its own
 * scope.
 */

interface LineSeries {
  color: string;
  values: number[];
  label: string;
}
interface LineData {
  CHART_W: number;
  CHART_H: number;
  PAD_L: number;
  PAD_R: number;
  PAD_T: number;
  PAD_B: number;
  INNER_W: number;
  xLabels: string[];
  series: LineSeries[];
  yMax: number;
  unit: string;
}

function attach(svg: SVGSVGElement) {
  const raw = svg.dataset.lineData ?? '{}';
  const d = JSON.parse(raw) as LineData;
  const xAt = (i: number) => d.PAD_L + (d.INNER_W * i) / (d.xLabels.length - 1);
  const fmt = (v: number) => `${v >= 10 ? Math.round(v) : Math.round(v * 10) / 10}${d.unit}`;
  const guide = svg.querySelector<SVGLineElement>('[data-line-guide]');
  const tip = svg.querySelector<SVGGElement>('[data-line-tip]');
  const tipX = svg.querySelector<SVGTextElement>('[data-tip-x]');
  const dots = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-line-dot]'));
  const capture = svg.querySelector<SVGRectElement>('[data-line-capture]');
  if (!guide || !tip || !capture) return;

  // Last positions so mouseleave fades the tip/guide out from where they were,
  // not from translateX(0) which causes a visible snap.
  let lastGuideX = d.PAD_L;
  let lastTipTx = d.PAD_L;
  let lastTipTy = d.PAD_T;
  // Track current bucket so we only re-render (and re-flip) when the
  // cursor crosses into a new x-tick, not on every pixel of mousemove.
  let currentIdx: number | null = null;

  function setHover(i: number | null) {
    if (i === currentIdx) return;
    currentIdx = i;
    if (i == null) {
      guide!.setAttribute(
        'style',
        `transform:translateX(${lastGuideX}px);opacity:0;transition:transform 0.28s cubic-bezier(.2,.8,.2,1),opacity 0.2s ease`,
      );
      tip!.setAttribute(
        'style',
        `transform:translate(${lastTipTx}px,${lastTipTy}px);opacity:0;transition:transform 0.28s cubic-bezier(.2,.8,.2,1),opacity 0.2s ease;pointer-events:none`,
      );
      dots.forEach((dot) => {
        dot.setAttribute('r', '3.5');
        const si = Number(dot.dataset.si ?? 0);
        const s = d.series[si];
        if (s) dot.setAttribute('fill', s.color);
      });
      return;
    }

    const gx = xAt(i);
    lastGuideX = gx;
    guide!.setAttribute(
      'style',
      `transform:translateX(${gx}px);opacity:0.5;transition:transform 0.28s cubic-bezier(.2,.8,.2,1),opacity 0.2s ease`,
    );

    const items = d.series.map((s) => ({ ...s, v: s.values[i] ?? 0 }));
    items.sort((a, b) => b.v - a.v);
    const tw = 168;
    const th = 30 + items.length * 18 + 10;
    let tx = gx + 14;
    if (tx + tw > d.CHART_W - d.PAD_R) tx = gx - tw - 14;
    const ty = d.PAD_T + 8;
    lastTipTx = tx;
    lastTipTy = ty;
    tip!.setAttribute(
      'style',
      `transform:translate(${tx}px,${ty}px);opacity:1;transition:transform 0.28s cubic-bezier(.2,.8,.2,1),opacity 0.2s ease;pointer-events:none`,
    );
    const rect = tip!.querySelector<SVGRectElement>('[data-tip-rect]');
    if (rect) {
      rect.setAttribute('width', String(tw));
      rect.setAttribute('height', String(th));
    }
    if (tipX) tipX.textContent = d.xLabels[i] ?? '';
    items.forEach((s, idx) => {
      const sw = tip!.querySelector<SVGRectElement>(`[data-tip-sw="${idx}"]`);
      const label = tip!.querySelector<SVGTextElement>(`[data-tip-label="${idx}"]`);
      const value = tip!.querySelector<SVGTextElement>(`[data-tip-value="${idx}"]`);
      if (sw) sw.setAttribute('fill', s.color);
      if (label) label.textContent = s.label;
      if (value) {
        value.textContent = fmt(s.v);
        value.setAttribute('x', String(tw - 12));
        // Re-trigger the flip-in animation on each value update
        value.classList.remove('pk-tip-flip');
        // Force reflow so removing + re-adding the class restarts the animation
        void value.getBoundingClientRect();
        value.classList.add('pk-tip-flip');
      }
    });

    dots.forEach((dot) => {
      const di = Number(dot.dataset.i ?? 0);
      const si = Number(dot.dataset.si ?? 0);
      const s = d.series[si];
      if (di === i) {
        dot.setAttribute('r', '6');
        dot.setAttribute('fill', '#fff');
      } else {
        dot.setAttribute('r', '3.5');
        if (s) dot.setAttribute('fill', s.color);
      }
    });
  }

  capture.addEventListener('mousemove', (ev) => {
    const r = svg.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * d.CHART_W;
    if (x < d.PAD_L - 8 || x > d.CHART_W - d.PAD_R + 8) {
      setHover(null);
      return;
    }
    const t = ((x - d.PAD_L) / d.INNER_W) * (d.xLabels.length - 1);
    const idx = Math.max(0, Math.min(d.xLabels.length - 1, Math.round(t)));
    setHover(idx);
  });
  svg.addEventListener('mouseleave', () => setHover(null));
}

if (typeof document !== 'undefined') {
  function init() {
    document.querySelectorAll<SVGSVGElement>('.pk-line-chart').forEach(attach);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

export {};
