# CoachIn Showcase

A complete English, French and Arabic website for **https://coachin.raystate.com/**, built with plain HTML, CSS and JavaScript. GitHub Pages serves the checked-in files directly: no package manager, compilation, backend or Lovable runtime is required.

## Preview and validate

From the repository root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://localhost:8080/`, `/fr/` and `/ar/`. Check the corresponding privacy-policy and terms-of-use pages too. Validation uses only Python's standard library and, optionally, Node for JavaScript syntax:

```sh
python3 tools/check_static.py
python3 tools/render_pages.py --check
node --check assets/script.js
```

Optional repeatable browser checks use Node 22+ and a separately running Chrome with a local debugging endpoint. Start the preview server above, then in another terminal:

```sh
google-chrome --headless=new --remote-debugging-address=127.0.0.1 --remote-debugging-port=9225 --user-data-dir=/tmp/coachin-check-browser about:blank
COACHIN_PREVIEW_ORIGIN=http://127.0.0.1:8080/ node tools/check_browser.mjs
```

The checker covers 54 layouts plus interaction/fallback cases. It writes screenshots/results to `/tmp/coachin-*`; it does not publish. Set `COACHIN_PREVIEW_ORIGIN=http://127.0.0.1:8084/coachin-showcase/` to repeat the checks under a repository prefix. Independent QR decoding is optional: supply a locally available jsQR-compatible CommonJS decoder with `COACHIN_QR_DECODER=/absolute/path/to/jsQR.cjs`. The checker reports QR decoding as not run when no decoder is provided. No decoder is loaded by the website. The decoder used during conversion was jsQR 1.4.0, fetched only to `/tmp`.

Node and Python are maintenance/preview tools, not hosting dependencies. Internal links and assets are relative so the site also works under a repository prefix.

## Editing

- `index.html`, `fr/index.html`, `ar/index.html`: complete localized showcase pages, readable without scripts.
- `privacy-policy/`, `terms-of-use/`, and matching `/fr/` and `/ar/` directories: six complete legal pages.
- `assets/styles.css` and `assets/script.js`: native presentation and progressive enhancements.
- `assets/`: all 14 original Lovable image binaries, icons, Play QR, social preview, local fonts and licenses. `tools/asset_sources.json` records the original image provenance; it is not used by the browser.
- `content/translations.json`: centralized showcase copy in all three languages.
- `content/site.json`: public domain, store destination, publisher/contact and document date; never put secrets here.
- `legal-source/{en,fr,ar}/`: reviewable Markdown legal documents. Raw HTML is not supported by the renderer.
- `tools/render_pages.py`: optional standard-library maintenance renderer for the checked-in HTML, sitemap, robots, CNAME and 404. It is not a required deployment build.

After editing content, configuration or legal Markdown, regenerate and validate:

```sh
python3 tools/render_pages.py
python3 tools/check_static.py
```

Do not edit generated HTML alone: `--check` detects drift. Keep translated sections and list counts aligned. Existing `coachin-theme` browser preferences are preserved; the root page remains English and Arabic uses RTL. Gallery links open the original image without JavaScript; menus and FAQ use native HTML. The stored preference is optional and the site is usable when browser storage is blocked.

## Legal documents

The confirmed publisher is **Laissaoui Mohammed Lotfi, Algeria**, with **contact@raystate.com** as the privacy/support contact. The new documents are dated 20 October 2026. Read [legal-review.md](legal-review.md) before publication: it records product evidence, provider references, known limitations, translation and publisher-adoption checks. These pages do not change the app, its Play Console declaration or its currently installed privacy links.

CoachIn's documents describe its own data handling. They do not import Staffly's encryption, employee-access, payroll, consent or recovery features. The Terms include monthly/yearly Premium subscriptions and the separate lifetime offer; no price, discount or trial is invented. The website itself includes no analytics, advertising, form or remote gym login.

## GitHub Pages publication

1. Review the site, legal documents and [release-checks.md](release-checks.md).
2. Commit and push normally to the existing `main` branch when authorized. Do not force-push or rewrite published Lovable history.
3. In GitHub **Settings → Pages**, choose **Deploy from a branch → main → / (root)**.
4. Configure **coachin.raystate.com** as the custom domain. Its checked-in `CNAME` records that hostname. No GitHub Actions build is needed; `.nojekyll` serves the static publish tree.
5. After setting the custom domain in GitHub, configure the DNS CNAME for `coachin` to **md-lotfi.github.io**, without a repository suffix. Enable HTTPS after GitHub issues the certificate.
6. Verify all three homepages and all six legal routes, images, downloads, sitemap and HTTPS on the live domain.

See [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Local conversion does not change GitHub settings, DNS or production deployment.

The source remains connected to Lovable; its provenance is retained in `.lovable/` and published Git history. This checkout is now maintained as a static website, so later Lovable-generated framework changes require review before integration.
