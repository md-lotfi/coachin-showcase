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

# Static Website Guidelines

## Structure and commands
CoachIn is now a build-free HTML/CSS/JavaScript GitHub Pages site. Homepages are `index.html`, `fr/index.html` and `ar/index.html`. Each locale also has `privacy-policy/` and `terms-of-use/` pages. Shared styling and progressive enhancements live in `assets/`; all screenshots, badges, artwork and fonts are local.

Run `python3 -m http.server 8080 --bind 127.0.0.1` to preview. Validate with `python3 tools/check_static.py`, `python3 tools/render_pages.py --check` and `node --check assets/script.js`. No npm/Bun installation or production build is needed.

## Editing and design
Keep all visitor translations in `content/translations.json` and public settings in `content/site.json`. Reviewable legal sources are `legal-source/{en,fr,ar}/`. After source changes, run `python3 tools/render_pages.py`; do not edit generated HTML alone. Do not reintroduce framework dependencies or runtime CDN asset pointers.

Preserve authentic localized screenshots, the app icon/logo and dark athletic/lime and light/green themes. Never fabricate application screens. Keep relative local paths, native HTML fallbacks, visible focus, reduced motion, safe storage handling, Arabic RTL and Western digits. Keep brands, email addresses and mixed-direction content legible.

## Product and legal truth
Read `legal-review.md` before changing legal or marketing claims. Website files do not fix app defects. Do not promise encrypted backups, comprehensive PIN authorization, zero SDK data collection, cloud sync, medical accuracy or purchase/restore outcomes that the app does not provide. Keep monthly/yearly subscriptions distinct from lifetime purchases. Publisher identity/contact are owner-confirmed.

## Git and publication
Check current Git status first and preserve unrelated work. Do not rewrite published Lovable history. `CNAME` is `coachin.raystate.com`; Pages publishes from `main` and `/ (root)`. Publishing, DNS, Play Console changes and Flutter app changes are separate actions requiring authorization. Report local checks separately from live deployment or device verification.
