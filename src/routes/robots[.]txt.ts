import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = (process.env["VITE_SITE_URL"] || new URL(request.url).origin).replace(/\/$/, "");
        return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, {
          headers: { "Content-Type": "text/plain" },
        });
      },
    },
  },
});
