import { fetchHomepageData, computeHomepageDerived, fetchSiteSettings, buildHeroUrl, fetchCategoriesTree } from "@/lib/server-api";
import { HomePageContent } from "./_components/HomePageContent";

export default async function Home() {
  const [data, siteSettings, categories] = await Promise.all([
    fetchHomepageData(),
    fetchSiteSettings(),
    fetchCategoriesTree(),
  ]);
  const derived = computeHomepageDerived(data, categories);
  const initialHeroUrl = buildHeroUrl(siteSettings?.hero_image ?? null);
  return <HomePageContent data={derived} initialHeroUrl={initialHeroUrl} />;
}
