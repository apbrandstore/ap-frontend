import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutUsPage() {
  return <PlaceholderPage title="About Us" />;
}
