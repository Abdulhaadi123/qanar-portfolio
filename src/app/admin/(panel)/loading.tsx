/** Shown at once while an admin page loads, so a click always feels answered. */
export default function Loading() {
  const bar = "animate-pulse bg-paper-2";
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6">
      <div className="border-b border-line-strong pb-6">
        <div className={`${bar} h-10 w-64 max-w-full`} />
        <div className={`${bar} mt-3 h-4 w-96 max-w-full`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${bar} h-28 border border-line`} />
        ))}
      </div>
      <div className={`${bar} h-64 border border-line`} />
    </div>
  );
}
