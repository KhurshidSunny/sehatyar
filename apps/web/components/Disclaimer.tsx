/** Permanent non-prescribing notice shown on every user-facing screen. */

export default function Disclaimer() {
  return (
    <aside
      className="border-t-2 border-disclaimer-border bg-disclaimer-bg px-4 py-4 sm:px-6"
      role="note"
      aria-label="Safety disclaimer"
    >
      <p className="mx-auto max-w-xl text-center text-base font-medium leading-relaxed text-disclaimer-text sm:text-lg">
        دا اپلیکیشن یوازې معلومات ورکوي. دا ډاکټر نه دی او درمل نه تجویز کوي. که
        ناروغي سخته وي، کلینیک یا روغتون ته لاړ شئ.
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-disclaimer-text/90">
        Information only — not a diagnosis or prescription. Seek clinic care for
        serious symptoms.
      </p>
    </aside>
  );
}
