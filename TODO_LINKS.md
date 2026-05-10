# TODO_LINKS

Replace every placeholder anchor before launch. Each row points to the exact source location where the URL is hard-coded as `#` and tagged with a `data-todo` attribute.

| Token                         | File                                             | Purpose                            |
| ----------------------------- | ------------------------------------------------ | ---------------------------------- |
| `docs`                        | `src/components/nav/TopBar.astro`                | Top-bar Docs pill                  |
| `repo`                        | `src/components/hero/Hero.astro`                 | Hero "Visit Repo" primary CTA      |
| `docs`                        | `src/components/hero/Hero.astro`                 | Hero "Explore Docs" ghost CTA      |
| `guide`                       | `src/components/install/InstallScript.astro`     | Install section "Read Guide" CTA   |
| `partner-logos`               | `src/components/credits/EngineeringCredit.astro` | World / Atheon / Reilabs href list |
| `github`                      | `src/components/credits/EngineeringCredit.astro` | "Visit GitHub" CTA                 |
| `benchmarks`                  | `src/components/benchmarks/Benchmarks.astro`     | "All Benchmarks" CTA               |
| `contact`                     | `src/components/faq/Faq.astro`                   | "Contact Us" mailto                |
| `docs` `guide` `benchmarks`   | `src/components/footer/SiteFooter.astro`         | Footer Product column              |
| `telegram` `twitter` `github` | `src/components/footer/SiteFooter.astro`         | Footer Community column            |

After replacing, run:

    grep -rn 'data-todo=' src/

This should return zero matches. Then delete this file (or keep as a launch checklist).
