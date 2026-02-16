import { fetchHomepageData, computeHomepageDerived, fetchSiteSettings, buildHeroUrl } from "@/lib/server-api";
import { HomePageContent } from "./_components/HomePageContent";

export default async function Home() {
  const [data, siteSettings] = await Promise.all([fetchHomepageData(), fetchSiteSettings()]);
  const derived = computeHomepageDerived(data);
  const initialHeroUrl = buildHeroUrl(siteSettings?.hero_image ?? null);
  return <HomePageContent data={derived} initialHeroUrl={initialHeroUrl} />;
}
