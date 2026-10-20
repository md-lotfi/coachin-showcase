import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = (process.env.VITE_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
        const paths = ["/", "/fr", "/ar"];
        const alts = paths
          .map((p, i) => `<xhtml:link rel="alternate" hreflang="${["en", "fr", "ar"][i]}" href="${origin}${p}"/>`)
          .join("");
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.map((p) => `<url><loc>${origin}${p}</loc>${alts}</url>`).join("\n")}
</urlset>`;
        return new Response(body, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
