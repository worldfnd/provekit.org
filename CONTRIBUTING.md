# Contributing

Thanks for considering a contribution.

- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `ci:`).
- All changes must pass `bun run prepush` and `bun run lhci` locally before opening a PR. The installed pre-push hook runs the same browser-WASM gate automatically.
- Keep components under ~150 lines. If a component grows beyond that, split it.
- New copy: avoid placeholder text and keep tone aligned with §6 of the design spec.
- New visuals: prefer SVG and CSS gradients; do not introduce raster images on the critical path.
