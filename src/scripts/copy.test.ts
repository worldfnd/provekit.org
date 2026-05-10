import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyText } from './copy';

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe('copyText', () => {
  it('writes the given string to the clipboard', async () => {
    const ok = await copyText('cargo install provekit-cli');
    expect(ok).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('cargo install provekit-cli');
  });

  it('returns false when clipboard fails', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('denied'));
    const ok = await copyText('x');
    expect(ok).toBe(false);
  });
});
