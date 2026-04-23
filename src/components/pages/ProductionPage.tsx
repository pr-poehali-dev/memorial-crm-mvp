type Card = { id: string; client: string; stone: string; size: string; days: number; urgent?: boolean };

const columns: { id: string; label: string; color: string; cards: Card[] }[] = [
  {
    id: "sketch",
    label: "Эскиз",
    color: "#6366f1",
    cards: [
      { id: "МП-0040", client: "Козлов И.Д.", stone: "Мрамор белый", size: "80×40×6", days: 2 },
      { id: "МП-0042", client: "Белова Е.С.", stone: "Гранит чёрный", size: "90×45×7", days: 1 },
    ],
  },
  {
    id: "cutting",
    label: "Распил",
    color: "#f59e0b",
    cards: [
      { id: "МП-0041", client: "Смирнова А.В.", stone: "Гранит чёрный", size: "100×50×8", days: 5, urgent: true },
      { id: "МП-0036", client: "Морозова Т.И.", stone: "Гранит габбро", size: "110×55×8", days: 3 },
    ],
  },
  {
    id: "engraving",
    label: "Гравировка",
    color: "#ec4899",
    cards: [
      { id: "МП-0035", client: "Лебедев К.А.", stone: "Гранит серый", size: "100×50×8", days: 7 },
    ],
  },
  {
    id: "polishing",
    label: "Полировка",
    color: "#14b8a6",
    cards: [
      { id: "МП-0034", client: "Новикова П.В.", stone: "Мрамор серый", size: "80×40×6", days: 9 },
      { id: "МП-0033", client: "Семёнов Д.О.", stone: "Гранит красный", size: "90×45×7", days: 8 },
    ],
  },
  {
    id: "ready",
    label: "Готов",
    color: "#22c55e",
    cards: [
      { id: "МП-0039", client: "Петрова О.Н.", stone: "Гранит серый", size: "120×60×10", days: 14 },
      { id: "МП-0037", client: "Иванов П.К.", stone: "Гранит чёрный", size: "100×50×8", days: 12 },
    ],
  },
];

export default function ProductionPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Производство</h1>
        <p className="text-[13px] text-[#9b9b9b] mt-0.5">
          {columns.reduce((acc, c) => acc + c.cards.length, 0)} изделий в работе
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
        {columns.map((col) => (
          <div key={col.id} className="min-w-[230px] w-[230px] flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">{col.label}</span>
              <span className="ml-auto text-[12px] text-[#b5b5b5] font-medium bg-[#f5f5f5] rounded-md px-1.5 py-0.5">{col.cards.length}</span>
            </div>

            {col.cards.map((card) => (
              <div
                key={card.id}
                className="bg-white border border-[#ebebeb] rounded-xl p-4 hover:border-[#d0d0d0] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-[11px] text-[#9b9b9b] font-medium">{card.id}</span>
                  {card.urgent && (
                    <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-semibold shrink-0">срочно</span>
                  )}
                </div>
                <p className="text-[13px] font-medium text-[#1a1a1a] mb-1">{card.client}</p>
                <p className="text-[12px] text-[#9b9b9b] mb-3">{card.stone} · {card.size} см</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (card.days / 14) * 100)}%`, backgroundColor: col.color }}
                    />
                  </div>
                  <span className="text-[11px] text-[#b5b5b5]">{card.days} дн.</span>
                </div>
              </div>
            ))}

            <button className="w-full text-[12px] text-[#b5b5b5] hover:text-[#6b6b6b] border border-dashed border-[#e5e5e5] hover:border-[#c5c5c5] rounded-xl py-3 transition-colors">
              + Добавить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
