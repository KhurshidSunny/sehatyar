import type { DangerLevel } from "@/lib/types";

const BADGES: Record<Exclude<DangerLevel, "info">, { label: string; className: string }> = {
  clinic: {
    label: "کلینیک ته لاړ شئ",
    className: "border-amber-300 bg-amber-50 text-amber-900",
  },
  emergency: {
    label: "بیړنی حالت",
    className: "border-red-300 bg-red-50 text-red-900",
  },
};

export default function DangerBadge({ level }: { level: DangerLevel }) {
  if (level === "info") {
    return null;
  }

  const badge = BADGES[level];
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-semibold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
