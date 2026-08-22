export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-gold/40" />
        <span className="absolute inset-1.5 rounded-full border border-star/30" />
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      </span>
      {!compact ? (
        <span className="display text-[15px] font-semibold tracking-[0.14em] uppercase text-cream">
          Billion Universe
        </span>
      ) : null}
    </div>
  );
}
