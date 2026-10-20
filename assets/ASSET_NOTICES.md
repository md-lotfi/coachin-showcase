# Asset provenance

The 14 CoachIn logo/icon, screenshot and Google Play badge binaries were retrieved from the original Lovable project's public asset URLs. Their original metadata is retained in `tools/asset_sources.json` and local checksums in `tools/asset_checksums.json`. The gallery screenshots are authentic app captures, not recreated interfaces.

The two favicon files were preserved from the original repository. The social preview was composed locally from the supplied app icon and the CoachIn palette with the app's Cairo font. The download QR encodes the official CoachIn Google Play URL; it was generated once using qrcode-generator 2.0.4 (Kazuhiko Arase, MIT), then independently decoded with jsQR 1.4.0. Neither library is a runtime dependency or bundled into the site.

Manrope and Cairo are self-hosted WOFF2 fonts under their accompanying Open Font License files. Cairo files came from the Fontsource Variable Cairo 5.3.0 distribution; Manrope files/license were reused from the publisher's existing Staffly showcase assets. Outline SVG symbols use/adapt Lucide conventions; the Lucide ISC license is retained as `lucide-LICENSE.txt`.

The Google Play badge artwork and product marks remain subject to their respective owners' rights. Do not distort the badges or replace real app screenshots with fabricated screens. If assets change intentionally, update the provenance/checksum records and validate the localized pages.
