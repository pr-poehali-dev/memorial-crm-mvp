import { useState } from "react";

const clients = [
  { name: "Смирнова А.В.", phone: "+7 912 345-67-89", orders: 3, total: 94500, last: "12.04.2026", city: "Москва" },
  { name: "Козлов И.Д.", phone: "+7 903 211-44-55", orders: 1, total: 22000, last: "10.04.2026", city: "Москва" },
  { name: "Петрова О.Н.", phone: "+7 965 888-11-22", orders: 2, total: 87000, last: "05.04.2026", city: "Балашиха" },
  { name: "Фёдоров С.С.", phone: "+7 999 777-33-44", orders: 1, total: 31000, last: "01.04.2026", city: "Подольск" },
  { name: "Иванов П.К.", phone: "+7 900 123-00-00", orders: 4, total: 148000, last: "28.03.2026", city: "Москва" },
  { name: "Морозова Т.И.", phone: "+7 921 456-78-90", orders: 2, total: 68000, last: "25.03.2026", city: "Химки" },
  { name: "Белова Е.С.", phone: "+7 916 200-10-30", orders: 1, total: 35000, last: "15.04.2026", city: "Москва" },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Клиенты</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">{clients.length} клиентов</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
          + Добавить
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, телефону, городу..."
          className="w-full max-w-sm bg-white border border-[#ebebeb] rounded-[8px] px-4 py-2.5 text-[13px] text-[#1a1a1a] placeholder:text-[#b5b5b5] outline-none focus:border-[#c0c0c0] transition-colors"
        />
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f5f5f5]">
              {["Клиент", "Телефон", "Город", "Заказов", "Сумма", "Последний заказ"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-[#9b9b9b] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.name} className={`hover:bg-[#fafafa] cursor-pointer transition-colors ${i < filtered.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[12px] font-semibold text-[#6b6b6b] shrink-0">
                      {c.name[0]}
                    </div>
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#6b6b6b]">{c.phone}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#6b6b6b]">{c.city}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#1a1a1a] font-medium">{c.orders}</td>
                <td className="px-5 py-3.5 text-[13px] font-medium text-[#1a1a1a]">{c.total.toLocaleString("ru")} ₽</td>
                <td className="px-5 py-3.5 text-[13px] text-[#9b9b9b]">{c.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
