import { fetchHomepageData, computeHomepageDerived } from "@/lib/server-api";
import { HomePageContent } from "./_components/HomePageContent";

export default async function Home() {
  const data = await fetchHomepageData();
  const derived = computeHomepageDerived(data);
  return <HomePageContent data={derived} />;
}
