import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link
        href="/"
        className="btn-primary"
      >
        Back to home
      </Link>
    </div>
  );
}
