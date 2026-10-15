import BackLink from "@/components/BackLink";

interface ScreenHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
}

export default function ScreenHeader({
  title,
  backHref = "/",
  backLabel = "کور",
}: ScreenHeaderProps) {
  return (
    <header className="border-b border-border bg-surface px-4 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
        <BackLink href={backHref} label={backLabel} />
        <h1 className="text-center text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h1>
        <span className="w-16 shrink-0" aria-hidden="true" />
      </div>
    </header>
  );
}
