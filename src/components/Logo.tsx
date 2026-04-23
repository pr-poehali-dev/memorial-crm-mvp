type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { mark: number; text: string; gap: string }> = {
  sm: { mark: 22, text: "text-[13px]",  gap: "gap-2" },
  md: { mark: 28, text: "text-[15px]",  gap: "gap-2.5" },
  lg: { mark: 40, text: "text-[20px]",  gap: "gap-3.5" },
};

/* Модульная сетка 3×3 с акцентным квадратом */
function LogoMark({ size }: { size: number }) {
  const cell = size / 3.8;
  const gap  = size / 22;
  const r    = size / 18;

  const positions = [
    [0,0],[1,0],[2,0],
    [0,1],[1,1],[2,1],
    [0,2],[1,2],[2,2],
  ] as [number,number][];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {positions.map(([col, row]) => {
        const isAccent = col === 2 && row === 0;
        const isMid    = col === 1 && row === 1;
        const x = col * (cell + gap);
        const y = row * (cell + gap);
        return (
          <rect
            key={`${col}-${row}`}
            x={x} y={y} width={cell} height={cell} rx={r}
            fill={isAccent ? "#4A8EF0" : isMid ? "#1a1a1a" : "#D8D8D8"}
          />
        );
      })}
    </svg>
  );
}

export default function Logo({ size = "md", iconOnly = false }: { size?: Size; iconOnly?: boolean }) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center ${s.gap} shrink-0`}>
      <LogoMark size={s.mark} />
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-[#1a1a1a] tracking-tight ${s.text}`} style={{ fontFamily: "'Golos Text', sans-serif", letterSpacing: "-0.02em" }}>
            СИСТЕМА
          </span>
          <span className={`font-bold text-[#1a1a1a] tracking-tight ${s.text}`} style={{ fontFamily: "'Golos Text', sans-serif", letterSpacing: "0.04em" }}>
            ПАМЯТЬ
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoCompact() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <LogoMark size={24} />
      <span className="font-bold text-[#1a1a1a] text-[13px] tracking-tight whitespace-nowrap" style={{ fontFamily: "'Golos Text', sans-serif" }}>
        СИС<span style={{ color: "#4A8EF0" }}>.</span>ПАМЯТЬ
      </span>
    </div>
  );
}
