import {
  fetchHomepageBundle,
  fetchBanners,
  homeHeroBannerImageUrl,
} from "@/lib/server-api";
import { getImageUrl } from "@/lib/api";
import { HomePageContent } from "./_components/HomePageContent";

export default async function Home() {
  const [derived, banners] = await Promise.all([
    fetchHomepageBundle(),
    fetchBanners(),
  ]);
  const initialHeroUrl = getImageUrl(homeHeroBannerImageUrl(banners) ?? null);
  return (
    <HomePageContent data={derived} initialHeroUrl={initialHeroUrl} />
  );
}
