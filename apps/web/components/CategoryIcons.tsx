/** Simple inline SVG icons for FAQ topics and medicine dosage forms. */

import type { ReactNode } from "react";

type IconProps = { className?: string; title?: string };

function Svg({
  children,
  className,
  title,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className ?? "h-10 w-10 shrink-0"}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function FeverIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#fee2e2" />
      <path
        d="M32 14v22"
        stroke="#b91c1c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="44" r="4" fill="#b91c1c" />
      <path
        d="M22 22c4-6 16-6 20 0"
        fill="none"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChildCareIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#dbeafe" />
      <circle cx="32" cy="24" r="8" fill="#1d4ed8" />
      <path
        d="M18 46c2-10 10-14 14-14s12 4 14 14"
        fill="#3b82f6"
      />
    </Svg>
  );
}

export function DiarrheaOrsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#e0f2fe" />
      <path
        d="M24 18h16l4 28H20l4-28z"
        fill="#0284c7"
      />
      <path d="M28 26h8M27 34h10" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function PregnancyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#fce7f3" />
      <circle cx="32" cy="18" r="7" fill="#be185d" />
      <path
        d="M20 50c1-8 5-12 12-14 7 2 11 6 12 14"
        fill="#db2777"
      />
      <ellipse cx="34" cy="36" rx="10" ry="9" fill="#f472b6" />
    </Svg>
  );
}

export function VaccinesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#dcfce7" />
      <rect x="28" y="12" width="8" height="22" rx="2" fill="#15803d" />
      <path d="M24 34h16v6H24z" fill="#16a34a" />
      <path d="M30 40v10M34 40v10" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="52" r="3" fill="#166534" />
    </Svg>
  );
}

export function ClinicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#ffedd5" />
      <rect x="18" y="22" width="28" height="24" rx="3" fill="#ea580c" />
      <path d="M32 26v12M26 32h12" stroke="#fff7ed" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function FaqCategoryIcon({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) {
  switch (categoryId) {
    case "fever":
      return <FeverIcon className={className} />;
    case "child-care":
      return <ChildCareIcon className={className} />;
    case "diarrhea-ors":
      return <DiarrheaOrsIcon className={className} />;
    case "pregnancy":
      return <PregnancyIcon className={className} />;
    case "vaccines":
      return <VaccinesIcon className={className} />;
    case "when-to-visit-clinic":
      return <ClinicIcon className={className} />;
    default:
      return <ClinicIcon className={className} />;
  }
}

export function TabletIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#ecfdf5" />
      <ellipse cx="32" cy="32" rx="18" ry="12" fill="#0f766e" />
      <path d="M14 32h36" stroke="#99f6e4" strokeWidth="3" />
    </Svg>
  );
}

export function CapsuleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#eff6ff" />
      <path
        d="M18 40c0-8 6-14 14-14h0c8 0 14 6 14 14v0c0 8-6 14-14 14h0c-8 0-14-6-14-14z"
        fill="none"
        transform="rotate(-35 32 32)"
      />
      <rect
        x="14"
        y="26"
        width="36"
        height="12"
        rx="6"
        fill="#2563eb"
        transform="rotate(-35 32 32)"
      />
      <rect
        x="32"
        y="26"
        width="18"
        height="12"
        rx="6"
        fill="#93c5fd"
        transform="rotate(-35 32 32)"
      />
    </Svg>
  );
}

export function SyrupIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#fef3c7" />
      <path d="M24 14h16v8H24z" fill="#b45309" />
      <path d="M22 22h20l-3 28H25l-3-28z" fill="#d97706" />
      <path d="M26 34h12" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function DropsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#e0f2fe" />
      <path
        d="M32 14c8 12 14 18 14 26a14 14 0 0 1-28 0c0-8 6-14 14-26z"
        fill="#0284c7"
      />
    </Svg>
  );
}

export function InjectionIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#fce7f3" />
      <rect
        x="18"
        y="28"
        width="28"
        height="8"
        rx="2"
        fill="#be185d"
        transform="rotate(-30 32 32)"
      />
      <path
        d="M40 20l6-6M42 26l6-2"
        stroke="#9d174d"
        strokeWidth="3"
        strokeLinecap="round"
        transform="rotate(-30 32 32)"
      />
      <circle cx="20" cy="40" r="3" fill="#db2777" />
    </Svg>
  );
}

export function CreamIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#f3e8ff" />
      <rect x="22" y="16" width="20" height="32" rx="4" fill="#7e22ce" />
      <rect x="26" y="12" width="12" height="8" rx="2" fill="#a855f7" />
      <path d="M26 28h12M26 36h12" stroke="#f3e8ff" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function PowderIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#f1f5f9" />
      <path d="M18 44l6-24h16l6 24H18z" fill="#64748b" />
      <circle cx="26" cy="36" r="2" fill="#e2e8f0" />
      <circle cx="34" cy="32" r="2" fill="#e2e8f0" />
      <circle cx="38" cy="40" r="2" fill="#e2e8f0" />
    </Svg>
  );
}

export function InhalerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#ccfbf1" />
      <rect x="26" y="14" width="12" height="28" rx="3" fill="#0f766e" />
      <path d="M26 42h12l4 8H22l4-8z" fill="#14b8a6" />
    </Svg>
  );
}

export function OtherFormIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#e2e8f0" />
      <circle cx="32" cy="32" r="10" fill="#475569" />
      <circle cx="32" cy="32" r="4" fill="#f8fafc" />
    </Svg>
  );
}

export function AnyFormIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#ecfdf5" />
      <circle cx="22" cy="30" r="7" fill="#0f766e" />
      <rect x="30" y="24" width="16" height="10" rx="5" fill="#14b8a6" transform="rotate(20 38 29)" />
      <path d="M28 42c4-6 12-4 16 2" fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function MedicineFormIcon({
  formId,
  className,
}: {
  formId: string;
  className?: string;
}) {
  switch (formId) {
    case "tablet":
      return <TabletIcon className={className} />;
    case "capsule":
      return <CapsuleIcon className={className} />;
    case "syrup":
      return <SyrupIcon className={className} />;
    case "drops":
      return <DropsIcon className={className} />;
    case "injection":
      return <InjectionIcon className={className} />;
    case "cream":
      return <CreamIcon className={className} />;
    case "powder":
      return <PowderIcon className={className} />;
    case "inhaler":
      return <InhalerIcon className={className} />;
    case "any":
      return <AnyFormIcon className={className} />;
    default:
      return <OtherFormIcon className={className} />;
  }
}

export function HealthQuestionsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#ecfdf5" />
      <path
        d="M20 40c0-10 6-16 12-16s10 4 10 10c0 6-4 8-6 10"
        fill="none"
        stroke="#0f766e"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="48" r="3" fill="#0f766e" />
    </Svg>
  );
}

export function MedicinePackIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="32" cy="32" r="28" fill="#ecfdf5" />
      <rect x="16" y="18" width="32" height="28" rx="4" fill="#0f766e" />
      <rect x="22" y="24" width="20" height="8" rx="2" fill="#99f6e4" />
      <path d="M24 38h16" stroke="#ccfbf1" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}
