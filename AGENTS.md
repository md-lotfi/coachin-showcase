<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All visitor copy lives in src/i18n/dict.ts (en/fr/ar share one typed Dict); components never hardcode text — keeps the three languages in sync.
- Language routes are / (en), /fr, /ar, each rendering the shared Site component; <html lang/dir> is derived from the pathname in __root.
- Screenshots are real app captures only (SHOTS map in Site.tsx). To add more screens (e.g. dashboard), upload with lovable-assets, add per-language URLs to SHOTS and captions to dict screens.items; never fabricate screens.
- Production origin is configurable via VITE_SITE_URL (canonical, hreflang, sitemap, robots); no domain is hardcoded.
