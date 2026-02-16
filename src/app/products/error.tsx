"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-4">
      <h2 className="text-xl font-semibold text-foreground">Failed to load products</h2>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}
