import syllabossMark from "@/assets/syllaboss-mark.png";

export function SyllabossLogo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/" aria-label="Syllaboss home" className="inline-flex min-w-0 items-center gap-2.5">
      <img src={syllabossMark} width={512} height={512} alt="" className="size-10 shrink-0 object-contain" />
      {!compact && (
        <span className="truncate font-display text-xl font-semibold text-foreground">Syllaboss</span>
      )}
    </a>
  );
}