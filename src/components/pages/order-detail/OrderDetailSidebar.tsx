import Icon from "@/components/ui/icon";

const STAGES = ["Эскиз", "Распил", "Гравировка", "Полировка", "Готов", "Выдан"];

const STAGE_ROUTE: Record<string, string> = {
  "Распил":     "Заготовки",
  "Гравировка": "Производство",
  "Полировка":  "Производство",
};

type Props = {
  activeStage: number;
  amount: number;
  paid: number;
  debt: number;
  paidPct: number;
  manager: string;
  production: string;
  estimator: string;
  onStageBack: () => void;
  onStageNext: () => void;
};

export default function OrderDetailSidebar({
  activeStage, amount, paid, debt, paidPct,
  manager, production, estimator,
  onStageBack, onStageNext,
}: Props) {
  const currentStageName = STAGES[activeStage];
  const routeTarget      = STAGE_ROUTE[currentStageName];

  return (
    <div className="w-[260px] shrink-0 space-y-3 sticky top-6">

      {/* ── Этап производства ── */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
          <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
            <Icon name="Layers" size={11} className="text-[#6b6b6b]" />
          </div>
          <p className="text-[12px] font-semibold text-[#1a1a1a]">Этап производства</p>
        </div>
        <div className="px-4 py-3 space-y-1.5">
          {STAGES.map((s, i) => {
            const done   = i < activeStage;
            const active = i === activeStage;
            return (
              <div key={s} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  done   ? "bg-green-500" :
                  active ? "bg-[#1a1a1a]" : "bg-[#f0f0f0]"
                }`}>
                  {done
                    ? <Icon name="Check" size={10} className="text-white" />
                    : <span className={`text-[9px] font-bold ${active ? "text-white" : "text-[#c0c0c0]"}`}>{i + 1}</span>
                  }
                </div>
                <span className={`text-[12px] ${active ? "font-semibold text-[#1a1a1a]" : done ? "text-[#9b9b9b]" : "text-[#c0c0c0]"}`}>
                  {s}
                </span>
                {active && routeTarget && (
                  <span className="ml-auto text-[10px] font-medium text-[#2563eb] cursor-pointer hover:underline whitespace-nowrap">
                    → {routeTarget}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={onStageBack}
            className="flex-1 text-[11px] py-1.5 rounded-[7px] border border-[#ebebeb] text-[#6b6b6b] hover:border-[#c5c5c5] transition-colors"
          >
            ← Назад
          </button>
          <button
            onClick={onStageNext}
            className="flex-1 text-[11px] py-1.5 rounded-[7px] bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
          >
            Далее →
          </button>
        </div>
      </div>

      {/* ── Финансы ── */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
          <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
            <Icon name="Banknote" size={11} className="text-[#6b6b6b]" />
          </div>
          <p className="text-[12px] font-semibold text-[#1a1a1a]">Финансы</p>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <div>
            <p className="text-[11px] text-[#9b9b9b] mb-0.5">Сумма заказа</p>
            <p className="text-[20px] font-bold text-[#1a1a1a]">{amount.toLocaleString("ru")} ₽</p>
          </div>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#6b6b6b]">Оплачено</span>
              <span className="font-semibold text-[#16a34a]">{paid.toLocaleString("ru")} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6b6b]">Остаток</span>
              <span className={`font-semibold ${debt > 0 ? "text-red-500" : "text-[#9b9b9b]"}`}>
                {debt > 0 ? `${debt.toLocaleString("ru")} ₽` : "—"}
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-[#c0c0c0] mb-1">
              <span>Прогресс оплаты</span>
              <span>{paidPct}%</span>
            </div>
            <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${paidPct}%`, backgroundColor: paidPct >= 100 ? "#16a34a" : "#2563eb" }}
              />
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 bg-[#1a1a1a] text-white text-[12px] py-2 rounded-[8px] hover:bg-[#333] transition-colors mt-1">
            <Icon name="Banknote" size={12} /> Добавить оплату
          </button>
        </div>
      </div>

      {/* ── Ответственные ── */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
          <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
            <Icon name="Users" size={11} className="text-[#6b6b6b]" />
          </div>
          <p className="text-[12px] font-semibold text-[#1a1a1a]">Ответственные</p>
        </div>
        <div className="px-4 py-3 space-y-3">
          {[
            { label: "Менеджер",    name: manager,    icon: "UserCheck"  },
            { label: "Производство", name: production, icon: "Hammer"     },
            { label: "Сметчик",     name: estimator,  icon: "Calculator" },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#f4f4f4] flex items-center justify-center shrink-0">
                <Icon name={r.icon as never} size={12} className="text-[#6b6b6b]" />
              </div>
              <div>
                <p className="text-[11px] text-[#9b9b9b]">{r.label}</p>
                <p className="text-[12px] font-semibold text-[#1a1a1a]">{r.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Быстрые действия ── */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
          <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
            <Icon name="Zap" size={11} className="text-[#6b6b6b]" />
          </div>
          <p className="text-[12px] font-semibold text-[#1a1a1a]">Действия</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          <button className="w-full flex items-center gap-2 text-[12px] text-[#4b4b4b] border border-[#ebebeb] px-3 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            <Icon name="RefreshCw" size={12} className="text-[#9b9b9b]" /> Сменить этап
          </button>
          <button className="w-full flex items-center gap-2 text-[12px] text-[#4b4b4b] border border-[#ebebeb] px-3 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            <Icon name="Printer" size={12} className="text-[#9b9b9b]" /> Распечатать заказ
          </button>
          <button className="w-full flex items-center gap-2 text-[12px] text-red-500 border border-red-100 bg-red-50 px-3 py-2 rounded-[8px] hover:bg-red-100 hover:border-red-200 transition-colors">
            <Icon name="XCircle" size={12} /> Закрыть заказ
          </button>
        </div>
      </div>

    </div>
  );
}