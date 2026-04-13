import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return <PlaceholderPage title="Blog" />;
}
