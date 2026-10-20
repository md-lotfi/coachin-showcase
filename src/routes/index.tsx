import { createFileRoute } from "@tanstack/react-router";
import { Site } from "@/components/site/Site";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => pageHead("en"),
  component: () => <Site lang="en" />,
});
