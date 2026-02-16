import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Product | AP Brand Store" };
    const product = await res.json();
    const name = product?.name ?? "Product";
    const description =
      typeof product?.description === "string"
        ? product.description.slice(0, 160)
        : "View product details at AP Brand Store.";
    return {
      title: `${name} | AP Brand Store`,
      description,
    };
  } catch {
    return { title: "Product | AP Brand Store" };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
