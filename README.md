# Pinky's Plumbing — Website

Premium redesign of Pinky's Plumbing's site: Astro 7, React 19 (islands only), TypeScript (strict), Tailwind CSS v4, and Motion for animation.

## Stack

- **Astro** — static output, zero client JS by default
- **React** — only for the pieces that need interactivity: the testimonials carousel, animated stat counters, and the contact form (everything else is plain `.astro`, server-rendered, no hydration cost)
- **Tailwind CSS v4** — via `@tailwindcss/vite`; design tokens live in `src/styles/global.css`
- **Motion** (`motion/react`) — stat counter tweening; scroll-reveal elsewhere is a ~20-line vanilla `IntersectionObserver` (`src/scripts/reveal.ts`), not a library, to keep JS minimal
- **Swiper** — testimonials carousel
- **React Hook Form + Zod** — contact form validation, via a small hand-rolled resolver (`src/lib/zodResolver.ts`) since `@hookform/resolvers`' zod adapter still pins zod v3, which conflicts with Astro's own zod v4 dependency
- **Lucide** — icons, rendered server-side (no client JS) wherever a `client:*` directive isn't used

## Structure

```text
src/
├── assets/images/       source photos
├── components/
│   ├── ui/               Button, Container, IconBadge, etc — accept a `class` prop
│   ├── sections/          page sections (Hero, ServicesGrid, PromiseBanner, ...)
│   ├── layout/            Navbar, Footer, StickyCallBar
│   ├── islands/           React components (only these ever get client:* directives)
│   └── shared/            Reveal.astro (scroll-reveal wrapper)
├── data/                 business.ts, services.ts, faq.ts — single source of truth for site copy
├── layouts/BaseLayout.astro   SEO head, JSON-LD, global chrome
├── lib/                  utils (cn), zodResolver, contactSchema
├── pages/                 file-based routes
└── scripts/reveal.ts      the IntersectionObserver reveal script
```

## Commands

| Command                | Action                             |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Dev server at `localhost:4321`     |
| `npm run build`        | Production build to `./dist/`      |
| `npm run preview`      | Serve the production build locally |
| `npm run check`        | Astro + TypeScript diagnostics     |
| `npm run lint`         | ESLint                             |
| `npm run format`       | Prettier (writes)                  |
| `npm run format:check` | Prettier (check only, no writes)   |

A Husky pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files) automatically once you run `npm install` (via the `prepare` script).

## Before launch

- **Contact form has no backend yet.** It validates fully client-side, then hands off to a `mailto:` link (`src/components/islands/ContactForm.tsx`). Wire it to a real endpoint (a Vercel serverless function + Resend/SendGrid, or a hosted form service like Formspree/Web3Forms) before relying on it for lead capture.
- **Placeholder field to confirm:** the business email in `src/data/business.ts` is a placeholder guess (`service@pinkysplumbing.com`) — the Facebook/X/YouTube links are the real ones.
- **Privacy policy** (`src/pages/privacy-policy/`) is a reasonable generic template, not legal advice — have counsel review it before launch.
- **Analytics** (GA4 / GTM / Clarity / CallRail) aren't wired in yet — add via `BaseLayout.astro`'s `<head>` once you have the tracking IDs.
