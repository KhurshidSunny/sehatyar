import Link from "next/link";

interface BackLinkProps {
  href: string;
  label: string;
}

/** Large tap target back to the previous screen. */
export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center rounded-xl px-3 py-2 text-lg font-medium text-brand hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      ← {label}
    </Link>
  );
}
