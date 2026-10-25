# AGENTS.md

Public docs for Embra, built with Astro Starlight. See `README.md` for commands and layout.

- Vietnamese is the root locale; English lives under `src/content/docs/en/`.
- The API reference is hidden for now. Don't publish `openapi.yaml` or endpoint lists without founder approval.
- Only document behaviour that exists on the product repo's `main`. Check the code before writing.
- `npm run build` must pass with no new warnings before reporting done.
- Dev server: `astro dev --background`; manage with `astro dev stop|status|logs`.
- Style follows the console (`embra-dashboard` BRAND_GUIDE.md, tokens.css): light only, color only for status. Keep `src/styles/theme.css` in sync with the dashboard tokens.
