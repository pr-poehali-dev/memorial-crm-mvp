import { useState } from "react";
import Icon from "@/components/ui/icon";

type Order = {
  id: string;
  client: string;
  phone: string;
  stone: string;
  size: string;
  inscription: string;
  design: string;
  status: string;
  statusColor: string;
  amount: number;
  date: string;
};

const orders: Order[] = [
  { id: "МП-0041", client: "Смирнова А.В.", phone: "+7 912 345-67-89", stone: "Гранит чёрный", size: "100×50×8", inscription: "Иванов Пётр Семёнович\n1945–2021", design: "Портрет + орнамент", status: "Производство", statusColor: "#f59e0b", amount: 38500, date: "12.04.2026" },
  { id: "МП-0040", client: "Козлов И.Д.", phone: "+7 903 211-44-55", stone: "Мрамор белый", size: "80×40×6", inscription: "Козлова Мария\n1950–2023", design: "Крест + розы", status: "Эскиз", statusColor: "#6366f1", amount: 22000, date: "10.04.2026" },
  { id: "МП-0039", client: "Петрова О.Н.", phone: "+7 965 888-11-22", stone: "Гранит серый", size: "120×60×10", inscription: "Петров Алексей\n1938–2020", design: "Фото + берёзы", status: "Готов", statusColor: "#22c55e", amount: 54000, date: "05.04.2026" },
  { id: "МП-0038", client: "Фёдоров С.С.", phone: "+7 999 777-33-44", stone: "Гранит красный", size: "90×45×7", inscription: "Фёдорова Нина\n1960–2024", design: "Лилии", status: "Доставка", statusColor: "#3b82f6", amount: 31000, date: "01.04.2026" },
  { id: "МП-0037", client: "Иванов П.К.", phone: "+7 900 123-00-00", stone: "Гранит чёрный", size: "100×50×8", inscription: "Иванов Константин\n1955–2022", design: "Портрет", status: "Выдан", statusColor: "#9b9b9b", amount: 41000, date: "28.03.2026" },
  { id: "МП-0036", client: "Морозова Т.И.", phone: "+7 921 456-78-90", stone: "Гранит габбро", size: "110×55×8", inscription: "Морозов Виктор\n1942–2021", design: "Звезда + надпись", status: "Производство", statusColor: "#f59e0b", amount: 46000, date: "25.03.2026" },
];

const statuses = ["Все", "Эскиз", "Производство", "Готов", "Доставка", "Выдан"];

export default function OrdersPage() {
  const [filter, setFilter] = useState("Все");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = filter === "Все" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Заказы</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">{filtered.length} заказов</p>
          </div>
          <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
            <Icon name="Plus" size={14} />
            Новый заказ
          </button>
        </div>

        <div className="flex gap-1.5 mb-5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors
                ${filter === s ? "bg-[#1a1a1a] text-white" : "bg-white border border-[#ebebeb] text-[#6b6b6b] hover:border-[#d0d0d0]"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f5f5f5]">
                {["Номер", "Клиент", "Камень", "Размер", "Статус", "Сумма"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-[#9b9b9b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={`hover:bg-[#fafafa] cursor-pointer transition-colors
                    ${selected?.id === o.id ? "bg-[#f5f5f5]" : ""}
                    ${i < filtered.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-mono text-[#1a1a1a] font-medium">{o.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] text-[#1a1a1a]">{o.client}</div>
                    <div className="text-[11px] text-[#b5b5b5]">{o.phone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6b6b6b]">{o.stone}</td>
                  <td className="px-5 py-3.5 text-[13px] font-mono text-[#6b6b6b]">{o.size}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: o.statusColor }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: o.statusColor }} />
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1a1a1a]">
                    {o.amount.toLocaleString("ru")} ₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-[320px] border-l border-[#ebebeb] bg-white p-6 overflow-y-auto animate-slide-in-right">
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{selected.id}</span>
            <button onClick={() => setSelected(null)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
              <Icon name="X" size={15} />
            </button>
          </div>

          <div className="space-y-5">
            <Section title="Клиент">
              <Field label="Имя" value={selected.client} />
              <Field label="Телефон" value={selected.phone} />
            </Section>

            <Section title="Памятник">
              <Field label="Камень" value={selected.stone} />
              <Field label="Размер (см)" value={selected.size} />
              <Field label="Дизайн" value={selected.design} />
            </Section>

            <Section title="Надпись">
              <div className="bg-[#fafafa] rounded-[8px] p-3 text-[13px] text-[#1a1a1a] whitespace-pre-line border border-[#f0f0f0]">
                {selected.inscription}
              </div>
            </Section>

            <Section title="Смета">
              <div className="bg-[#fafafa] rounded-[8px] p-3 border border-[#f0f0f0] space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Изготовление</span>
                  <span className="text-[#1a1a1a]">{Math.round(selected.amount * 0.7).toLocaleString("ru")} ₽</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Гравировка</span>
                  <span className="text-[#1a1a1a]">{Math.round(selected.amount * 0.2).toLocaleString("ru")} ₽</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Доставка</span>
                  <span className="text-[#1a1a1a]">{Math.round(selected.amount * 0.1).toLocaleString("ru")} ₽</span>
                </div>
                <div className="border-t border-[#ebebeb] pt-2 flex justify-between text-[13px] font-semibold">
                  <span className="text-[#1a1a1a]">Итого</span>
                  <span className="text-[#1a1a1a]">{selected.amount.toLocaleString("ru")} ₽</span>
                </div>
              </div>
            </Section>

            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selected.statusColor }} />
              <span className="text-[13px] font-medium" style={{ color: selected.statusColor }}>{selected.status}</span>
              <span className="text-[#c5c5c5] text-[12px] ml-auto">{selected.date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#b5b5b5] uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-[12px] text-[#9b9b9b] shrink-0">{label}</span>
      <span className="text-[13px] text-[#1a1a1a] text-right">{value}</span>
    </div>
  );
}
