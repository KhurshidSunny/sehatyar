import Image from "next/image";
import Link from "next/link";

const SIZES = {
  sm: 72,
  md: 112,
  lg: 192,
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZES;
  priority?: boolean;
  /** When true, wraps the mark in a link to home. */
  href?: string | false;
  className?: string;
};

/** SehatYar brand mark from `/public/sehatyar-logo.png`. */
export default function BrandLogo({
  size = "md",
  priority = false,
  href = "/",
  className = "",
}: BrandLogoProps) {
  const px = SIZES[size];
  const image = (
    <Image
      src="/sehatyar-logo.png"
      alt="SehatYar"
      width={px}
      height={px}
      priority={priority}
      className={`rounded-2xl object-contain ${className}`.trim()}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      aria-label="SehatYar"
    >
      {image}
    </Link>
  );
}
