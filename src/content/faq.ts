export interface FaqEntry {
  q: string;
  a?: string;
  open?: boolean;
}

export const faqEntries: FaqEntry[] = [
  {
    q: 'What exactly is ProveKit?',
    a: 'ProveKit is a zero-knowledge proof toolkit built around Noir. You write the rule you want to prove in Noir, ProveKit turns it into a proof your users can generate on their own device, and that proof is verifiable anywhere: your server, a browser, a phone, or on-chain. Think of Noir as the language and ProveKit as the runtime.',
    open: true,
  },
  {
    q: 'Do I need to be a cryptographer to use it?',
    a: "Not even a little. Install the CLI, point it at a Noir circuit, and ProveKit handles the proof system, the keys, and the verification pipeline. There are first-class SDKs for JavaScript, Swift, and Kotlin, so you don't need to touch Rust to ship it.",
  },
  {
    q: 'Can I really prove things inside a browser tab?',
    a: 'Yes. And inside an iOS or Android app, too. The same proof artifacts work everywhere: WASM bindings for the web, native SDKs for mobile, and a CLI or Rust crate for the server. Each runtime takes care of threading and memory so the device finishes the proof.',
  },
  {
    q: 'Is ProveKit ready for production?',
    a: 'The v1 branch is the audited, stable line, ships under the MIT license, and supports Noir v1.0.0-beta.11. Generate your keys once in CI, ship the verifier key with your app, and the same proofs verify identically on every host you target.',
  },
];
