export async function copyText(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest<HTMLElement>('[data-copy]');
    if (!trigger) return;
    const value = trigger.dataset.copy ?? '';
    void copyText(value).then((ok) => {
      const label = trigger.querySelector<HTMLElement>('[data-copy-label]');
      if (!label) return;
      const original = label.textContent;
      label.textContent = ok ? 'Copied' : 'Failed';
      window.setTimeout(() => {
        label.textContent = original;
      }, 1500);
    });
  });
}
