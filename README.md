# Florian Grima — Portfolio

A React and TypeScript portfolio inspired by Typesafe AI’s oversized typography, pastel grain, pink desktop, and retro interactive windows.

## Run locally

Use Node.js 24 (also specified in `.nvmrc` and `.node-version`).

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The build runs TypeScript checks and generates `dist/`. The existing Vercel configuration is retained. No hosting or deployment changes are required.

## Update content

Edit `src/content/portfolio.json` for profile, hero, experience, projects, education, skills, metrics, and social links. The résumé supplied for this redesign was used for factual updates; existing projects and skills were retained when not contradicted. Career dates and titles follow the résumé. Experience metrics are résumé-reported results.

The downloadable résumé is `public/florian-grima-resume.pdf`. Replace it when updating the résumé. Public contact details live in the JSON; only the email is rendered on the site.

Project notes expand inline. Project repository URLs were not provided, so the site links to the existing GitHub profile instead of inventing project links.

## Motion and interaction

- Procedurally animated canvas grain, with animation suspended when the canvas is offscreen or the tab is hidden.
- Staggered hero entrance, scroll reveals, Lenis scrolling, and animated project illustrations.
- Desktop windows can be dragged by their title bars. Focus a title bar and use arrow keys to move it; Shift increases the step and Home resets its position.
- Live Paris time and a reseedable Conway’s Game of Life simulation.
- Footer motion control and system `prefers-reduced-motion` support.
- Responsive mobile navigation, native project/experience disclosures, and email copying.

The effects are native recreations for this portfolio, not copied Framer or proprietary animation assets. Google Fonts supplies DM Sans and IBM Plex Mono, with local font fallbacks.

## Verification

Production build and TypeScript checks pass. Browser checks covered 320, 390, 768, 1024, 1440, and 1920 pixel widths, internal links, mobile navigation, project/experience expansion, pointer dragging, résumé response, email copying, and reduced-motion behavior.
