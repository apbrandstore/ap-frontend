import type { Metadata } from "next";
import { storefrontAuthHeaders, storefrontV1Url } from "@/lib/storefront-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const identifier = Array.isArray(path) && path.length > 0 ? path[path.length - 1] : "";

  if (!identifier) return { title: "Product" };

  try {
    const res = await fetch(
      storefrontV1Url(`/products/${encodeURIComponent(identifier)}/`),
      {
        next: { revalidate: 60 },
        headers: storefrontAuthHeaders(),
      }
    );
    if (!res.ok) return { title: "Product" };
    const product = await res.json();
    const name = product?.name ?? "Product";
    const description =
      typeof product?.description === "string"
        ? product.description.slice(0, 160)
        : "View product details at AP Brand Store.";
    return {
      title: name,
      description,
    };
  } catch {
    return { title: "Product" };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

