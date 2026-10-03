# Framewright

## Icons (hard rule)

- Render every icon as `<Icon icon="hugeicons:<name>" />` from `@iconify/react`.
- Never import `lucide-react` or any other icon library. After running `shadcn add`, convert any lucide imports it adds.
- Use literal `hugeicons:name` strings. `scripts/build-icons.mjs` scans `src` for them and bundles only those icons offline into `src/shared/icons/hugeicons.generated.ts`. It runs on `predev` and `prebuild`, or manually with `npm run icons`.
- Do not build icon names dynamically from variables, because the scanner will miss them.

## Code style

- No inline comments.
- Run Prettier over the whole codebase before every push.
