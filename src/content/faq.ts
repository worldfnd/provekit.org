export interface FaqEntry {
  q: string;
  a?: string;
  open?: boolean;
}

export const faqEntries: FaqEntry[] = [
  {
    q: 'What exactly is Provekit?',
    a: 'Provekit is a modular, client-side zero-knowledge toolkit built in Rust with WebAssembly bindings. It bundles a prover, verifier, and circuit compiler into a single lightweight package designed to generate proofs directly on a user\'s device — no trusted setup, no server round-trip required.',
    open: true,
  },
  {
    q: 'Does it work in the browser?',
    a: 'Yes. The prover ships as a ~340 KB WASM module with a TypeScript wrapper around it, and runs in any modern browser that supports SharedArrayBuffer. A typical Groth16-style proof completes in under 2 seconds on a mid-range laptop, and under 6 seconds on a 2022-era phone.',
  },
  {
    q: 'Is TypeScript supported?',
    a: 'First-class. Every public API is shipped with hand-written .d.ts files, and circuit inputs are fully typed against the Noir source — rename a witness in your circuit and the TypeScript compiler will flag every caller. ESM and CommonJS builds are both available.',
  },
  {
    q: 'Can I use it for runtime validation in production?',
    a: 'Provekit is used in production by World, Atheon, and a handful of other partners listed above. The proving and verification pipelines are deterministic across versions, the WASM module is reproducibly built from source on every release, and we publish signed checksums alongside each npm publish.',
  },
];
