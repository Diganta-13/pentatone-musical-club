import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  className = "h-12",
  priority = false,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Pentatone Musical Club home"
      className="inline-flex shrink-0 items-center"
    >
      <Image
        src="/assets/images/logo.png"
        alt="Pentatone Musical Club"
        width={190}
        height={58}
        priority={priority}
        className={`${className} w-auto object-contain`}
      />
    </Link>
  );
}