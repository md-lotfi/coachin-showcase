import type { Lang } from "@/i18n/dict";
import { DICT, LANG_PATH, LANGS } from "@/i18n/dict";

export const PLAY_BASE = "https://play.google.com/store/apps/details?id=com.raystate.coachin";
export const playUrl = (l: Lang) => `${PLAY_BASE}&hl=${l}`;

/** Production origin. Set VITE_SITE_URL once the final domain is known; empty = relative URLs. */
export const SITE_URL = ((import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "").replace(/\/$/, "");

export function pageHead(lang: Lang) {
  const t = DICT[lang];
  const abs = (p: string) => `${SITE_URL}${p}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CoachIn",
    operatingSystem: "Android",
    applicationCategory: "BusinessApplication",
    description: t.meta.description,
    inLanguage: ["en", "fr", "ar"],
    downloadUrl: PLAY_BASE,
    installUrl: PLAY_BASE,
    publisher: { "@type": "Organization", name: "RayState", url: "https://raystate.com" },
  };
  return {
    meta: [
      { title: t.meta.title },
      { name: "description", content: t.meta.description },
      { property: "og:title", content: t.meta.title },
      { property: "og:description", content: t.meta.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: lang === "en" ? "en_US" : lang === "fr" ? "fr_FR" : "ar_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: t.meta.title },
      { name: "twitter:description", content: t.meta.description },
    ],
    links: [
      ...LANGS.map((l) => ({ rel: "alternate", hrefLang: l, href: abs(LANG_PATH[l]) })),
      { rel: "alternate", hrefLang: "x-default", href: abs("/") },
      ...(SITE_URL ? [{ rel: "canonical", href: abs(LANG_PATH[lang]) }] : []),
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
  };
}
