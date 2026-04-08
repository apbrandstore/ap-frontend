"use client";

import { useParams } from "next/navigation";
import { ProductDetailClient } from "@/app/products/_components/ProductDetailClient";

export default function ProductDetailPage() {
  const params = useParams();
  const raw = params.path as unknown;
  const seg = Array.isArray(raw) ? raw[raw.length - 1] : raw;
  const identifier =
    typeof seg === "string" && seg.length > 0 ? decodeURIComponent(seg) : "";

  return <ProductDetailClient identifier={identifier} />;
}

