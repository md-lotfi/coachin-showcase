import { createFileRoute } from "@tanstack/react-router";
import { Site } from "@/components/site/Site";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/ar")({
  head: () => pageHead("ar"),
  component: () => <Site lang="ar" />,
});
