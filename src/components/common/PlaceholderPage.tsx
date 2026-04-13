/** Centred title + message layout for placeholder routes (consistent with `/products` page chrome). */
export function PlaceholderPage({
  title,
  message = "This page will be updated soon.",
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">
            {title}
          </h1>
          <p className="text-lg text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
