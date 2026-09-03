import { describe, expect, it } from 'vitest';

import config from '../../vercel.json';

describe('Vercel cross-origin isolation', () => {
  it('serves the headers required by the threaded WASM prover', () => {
    const catchAll = config.headers.find((route) => route.source === '/(.*)');
    const headers = Object.fromEntries(
      (catchAll?.headers ?? []).map(({ key, value }) => [key.toLowerCase(), value]),
    );

    expect(headers).toMatchObject({
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-embedder-policy': 'require-corp',
    });
  });
});
