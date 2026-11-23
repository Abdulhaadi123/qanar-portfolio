/** A photograph of a work in a box that keeps its proportions (no layout jump while it loads). */
export default function Photo({
  src,
  alt,
  ratio,
  fill,
  eager,
  className = "",
}: {
  src: string;
  alt: string;
  ratio: number;
  /** fill the parent instead of using the ratio */
  fill?: boolean;
  eager?: boolean;
  className?: string;
}) {
  return (
    <div style={fill ? undefined : { aspectRatio: ratio }} className={`relative overflow-hidden bg-paper-2 ${fill ? "size-full" : "w-full"} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}
