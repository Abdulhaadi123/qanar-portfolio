/**
 * A photograph of a work in a box that keeps its proportions (no layout jump while it loads).
 * `blur` is a tiny copy of the photograph (a data URL): it fills the box at once, so the page never shows an empty hole.
 */
export default function Photo({
  src,
  alt,
  ratio,
  blur,
  fill,
  eager,
  className = "",
}: {
  src: string;
  alt: string;
  ratio: number;
  blur?: string;
  /** fill the parent instead of using the ratio */
  fill?: boolean;
  eager?: boolean;
  className?: string;
}) {
  return (
    <div
      style={{
        ...(fill ? null : { aspectRatio: ratio }),
        ...(blur ? { backgroundImage: `url("${blur}")`, backgroundSize: "cover", backgroundPosition: "center" } : null),
      }}
      className={`relative overflow-hidden bg-paper-2 ${fill ? "size-full" : "w-full"} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}
