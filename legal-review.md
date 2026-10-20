# CoachIn legal content review — 20 October 2026

## Prepared documents and identity

Privacy Policy and Terms of Use are prepared in English, French and Modern Standard Arabic. Six Markdown sources under `legal-source/` generate six complete static HTML pages. Each document has localized metadata, a contents navigation, same-document language links and the site's theme/header/footer. Terms include purchase provisions; no separate subscription-terms document is created.

The owner explicitly selected Staffly's publisher details for CoachIn: **Laissaoui Mohammed Lotfi, Algeria, contact@raystate.com**. Staffly supplies the document structure and publisher identity, not CoachIn's product facts. Its repository was read only, including its current uncommitted legal improvements; it was not changed.

Documents carry a **document date**, not a retroactive effective-date or a claim of adoption by all existing customers. Before publication, the publisher should review/adopt the text, confirm the intended effective-date/notice process and check the translations for legal meaning. This is a product-grounded drafting package, not independent legal certification. The complete pages are prepared now so the result can be reviewed without further implementation.

## Product evidence

The separate Flutter checkout `/home/ferhat/FlutterProjects/packages/coachin` was inspected read-only. No app changes are part of this website conversion.

| Subject | Evidence and limits reflected in the documents |
| --- | --- |
| Records | `lib/core/database/local_database.dart` defines profiles, photos, contact details, birth dates, height/weight, resting HR, cardio logs, cards, attendance, payments, packages and local settings. Soft deletion is not physical erasure. |
| Authentication | `AppSettings.coachPin` is a local text field. No database/backup encryption is configured. Do not describe it as Staffly's salted-verifier/encrypted-storage implementation. |
| QR passes | `lib/ui/sheets/digital_pass_sheet.dart` encodes member ID, name, phone, date of birth and address into Base64 JSON. The QR is readable/copyable and has no confidentiality guarantee. |
| Backup | `lib/core/services/backup_service.dart` copies the SQLite database; it does not bundle separate photos. The automatic check starts at app launch. `GymCubit.restoreDatabaseBackup` replaces the active database. Recovery is not guaranteed; see the app audit for defects. |
| Sharing | Image selection, file picker, share sheet and backup UI can send chosen exports to external recipients. Files outside the app remain subject to recipient/OS handling. No photo-metadata stripping promise is made. |
| Ads | `lib/core/ads/ad_helper.dart`, banner widget and `main.dart` initialize/request Google ads. No explicit member targeting attributes or dedicated UMP/privacy-options integration were found. Do not copy Staffly's consent gating, checkpoint ad exclusions or privacy-options claims. |
| Purchases | `GymCubit` configures RevenueCat, obtains CustomerInfo and performs package purchases/restores. Monthly/yearly/lifetime offers exist; store configuration, retention, exact identifiers/diagnostic settings and paid integration were not accessed. No indefinite offline entitlement promise is made. |
| Training | Cardio formulas, logs and timer/TTS/wakelock are training aids, not medical instruments. No clinical validation or background timing guarantee was established. |
| Website | Local assets/fonts/scripts, optional `coachin-theme` storage, path-based language, no analytics/ad SDK/form. GitHub Pages hosting disclosure includes provider connection information. |

The privacy policy separates local gym records, SDK/service information, voluntarily sent support data and website hosting. It does not claim that use of AdMob and RevenueCat means zero data collection or that a privacy page fixes missing app consent behavior.

## Publisher review before publication

- Confirm policy/terms wording and document adoption, especially for existing customers; review Arabic and French for the intended legal meaning. No language is declared universally superior to mandatory rights.
- Confirm current distributed APK behavior against this checkout and the actual Google/RevenueCat project settings. SDK provider categories are qualified; the publisher should review its dashboards/agreements and actual service configuration.
- Address the known app authorization, restore, PIN/storage and advertising-consent issues as separate engineering tasks. Website wording must not promise fixes that have not shipped.
- Reconcile the store's existing broad privacy/data-safety statements with actual SDK behavior and the new policy. Update Play Console and the app's legal URLs separately when appropriate; this conversion changes neither.
- Confirm the gym's responsibilities for minors and health-related data with applicable requirements. No arbitrary age threshold, retention duration, jurisdiction clause, blanket refund denial or unsupported compliance certification was invented.
- Review any future forms, analytics, embeds, hosting or service changes before adding them; they may change the website disclosure. Do not add a cosmetic consent banner that has no actual processing to control.

## Primary references

- [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)
- [Google Privacy Policy](https://policies.google.com/privacy) and [advertising information](https://policies.google.com/technologies/ads)
- [Google UMP integration guidance](https://developers.google.com/admob/flutter/privacy) — documents what consent integration requires, not proof it exists in CoachIn.
- [RevenueCat privacy information](https://www.revenuecat.com/privacy) — review applicable end-user/service arrangements with the publisher account.
- [Google Play subscription cancellation](https://support.google.com/googleplay/answer/7018481?hl=en), [management](https://play.google.com/store/account/subscriptions) and [refund guidance](https://support.google.com/googleplay/answer/2479637?hl=en)

## Maintenance

Edit the relevant Markdown and all corresponding translations, then run `python3 tools/render_pages.py` and `python3 tools/check_static.py`. Source/HTML drift is a validation failure. Update `content/site.json` when public settings or document dates change. Full static pages remain readable without JavaScript.
