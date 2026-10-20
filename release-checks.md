# Static conversion validation — 20 October 2026

## Scope and result

The clean Lovable checkout at `20791c7` was converted in place to static HTML/CSS/JavaScript for `https://coachin.raystate.com/`. The three-language showcase and six new legal pages are complete; ten HTML files include the standalone 404 page. Git history and `.lovable/` provenance are preserved. No commit, push, deployment, DNS, GitHub settings, store configuration or Flutter app changes were performed.

The original source was inspected before conversion; the design was reconstructed from its component structure, exact supplied media and theme definitions. The converted pages were visually inspected in Chrome. No pixel-diff against a separately running original framework build was performed, and no package installation was needed.

## Completed checks

| Check | Final result |
| --- | --- |
| `python3 tools/check_static.py` | PASS: ten HTML pages, six legal sources, fourteen original assets, asset hashes, fonts, locale structure, links/anchors, metadata, sitemap, domain, no old build tree, and theme contrast checks |
| `python3 tools/render_pages.py --check` | PASS: all checked-in generated pages/hosting files match source content |
| `node --check assets/script.js` | PASS |
| `node --check tools/check_browser.mjs` | PASS |
| `git diff --check` | PASS |
| `COACHIN_QR_DECODER=/tmp/coachin-jsqr.cjs node tools/check_browser.mjs` | PASS: 54 layout cases, no runtime exceptions or HTTP resource failures, all additional interaction/fallback assertions passed |
| Repository-prefix preview | PASS: all nine content routes under `/coachin-showcase/`, no missing images, overflow or same-origin links escaping the prefix |
| Standalone 404 | PASS: self-contained, no remote asset dependency, noindex, three absolute language recovery links, no overflow |
| QR decode | PASS: independent jsQR 1.4.0 decoded pixels rendered from the actual SVG to `https://play.google.com/store/apps/details?id=com.raystate.coachin` |

### Browser matrix

Headless installed Google Chrome was controlled through its local DevTools protocol using Node's built-in WebSocket support; no browser-test package was installed. A loopback-only Python server served the site. All nine content routes were checked at **360×800**, **768×1024** and **1440×1000**, in **dark and light** themes: **54 cases**. A separate French **320px** width check also passed.

Every matrix case checked language/direction, a single page heading, loaded image resources and horizontal overflow. Font readiness and eager loading were used by the checker to inspect below-the-fold images; the actual site keeps lazy loading. Actual screenshots were inspected for the settled English desktop hero, Arabic mobile hero, and French light-theme legal page. These are representative visual inspections, not certification of every browser/device.

Additional exercised behavior:

- Theme toggle and persistence across language navigation.
- Mobile-menu opening and Escape closing.
- Section-preserving language links.
- Native FAQ expansion, with one expanded item at a time.
- Native gallery dialog, initial focus, keyboard focus containment, RTL arrow navigation, next control, emulated touchscreen swipe, Escape, focus restoration and scroll unlock.
- Arabic legal body and French gallery/FAQ links with page scripts disabled.
- Theme interaction when localStorage access throws a SecurityError.
- Reduced-motion styling disables hero animation.
- Direct legal-route visits and refresh/navigation at both root and repository-prefix origins.
- Standalone 404 with no external stylesheet, image or script requirement.

The independent decoder is test-only and was fetched to `/tmp`; it is not included or loaded by the website. The checked-in browser helper reports decoding as not run if a decoder path is not supplied. Current temporary evidence is `/tmp/coachin-browser-results.json`, `/tmp/coachin-prefix-results.json`, and `/tmp/coachin-*-final.png`; `/tmp` files are not durable release artifacts. The site and repeatable checks are checked in as ordinary working-tree files, not committed.

## Issues resolved during verification

- Original image records were CDN pointers; all fourteen actual image binaries were downloaded, type/size checked and localized. The first retrieval method was rejected by the public host; curl succeeded.
- The first Escape simulation omitted native key codes needed by Chrome's dialog handling. A targeted native-key check proved closing/focus restoration; the durable checker sends native key codes and now passes.
- The initial 404 depended on production-origin media before deployment. It is now self-contained, including an embedded existing favicon, so neither nested missing URLs nor Chrome's implicit `/favicon.ico` fetch require an undeployed asset.
- The small-text light-green contrast was increased while retaining the brand palette. Current light primary `#008538` against white is approximately **4.76:1**. Dark lime against `#151210` is approximately **15.87:1**. Static checks read actual theme tokens for text, links and buttons; this is not a full accessibility certification.

## Still outside local verification

- GitHub Pages is not enabled/configured by these files alone. Publish from main/root and configure the custom domain, DNS and HTTPS when authorized. Server-side GitHub redirect behavior and certificate issuance were not tested live.
- Python's local server does not automatically serve a custom 404 for arbitrary missing paths. The fallback file was tested directly; GitHub supplies the production missing-path routing.
- No physical NFC/camera/device behavior, real purchase, ad network, store consent setup or application recovery was tested here. The website changes no app behavior.
- Publisher adoption of the legal documents, effective-date/notice decisions, provider account settings and French/Arabic legal meaning remain review items in `legal-review.md`. Documents have a preparation date, not a claim of prior adoption or legal certification.
- No Android/Apple privacy declaration or installed-app privacy URL was changed. The old external RayState policy link is replaced only in this website.
- No analytics, tracking service, contact form, external font CDN or third-party video player was added.
