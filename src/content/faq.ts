export interface FaqEntry {
  q: string;
  a?: string;
  open?: boolean;
}

// Questions are verbatim from the design-system Figma source.
// The Figma only ships an answer for Q1 (lorem-style); we provide concise
// on-brand answers for the other three so the toggles aren't dead UI.
export const faqEntries: FaqEntry[] = [
  {
    q: 'What exactly is Provekit?',
    a: 'Provekit is a lightweight assertion and verification library for JavaScript and TypeScript. It lets you write expressive, readable checks for both runtime validation and unit tests without pulling in a full testing framework.',
    open: true,
  },
  {
    q: 'Does it work in the browser?',
    a: 'Yes. Provekit ships as ES modules and runs unmodified in every modern browser. The runtime is dependency-free and stays under a few kilobytes once minified and gzipped.',
  },
  {
    q: 'Is TypeScript supported?',
    a: 'First-class. All assertions narrow types correctly, so a single check both validates at runtime and refines the static type for the rest of the block. The package ships its own .d.ts.',
  },
  {
    q: 'Can I use it for runtime validation in production?',
    a: 'Yes. The library is designed to be production-safe: zero dependencies, predictable error shapes, no implicit throws on the happy path, and tree-shakeable so unused assertions disappear from your bundle.',
  },
];
