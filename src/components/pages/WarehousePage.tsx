const items = [
  { name: "Гранит чёрный (габбро)", unit: "м²", qty: 14.5, reserved: 8, min: 5, price: 4200 },
  { name: "Гранит серый", unit: "м²", qty: 7.2, reserved: 4, min: 5, price: 3800 },
  { name: "Гранит красный (карелия)", unit: "м²", qty: 3.1, reserved: 3, min: 5, price: 5100 },
  { name: "Мрамор белый", unit: "м²", qty: 2.4, reserved: 2, min: 4, price: 6500 },
  { name: "Мрамор серый", unit: "м²", qty: 5.8, reserved: 1, min: 3, price: 5800 },
  { name: "Гранит габбро (полированный)", unit: "м²", qty: 9.0, reserved: 5, min: 4, price: 4700 },
  { name: "Бронза (для букв)", unit: "кг", qty: 12.0, reserved: 3, min: 10, price: 1800 },
  { name: "Абразивный диск 230мм", unit: "шт", qty: 45, reserved: 0, min: 20, price: 320 },
];

export default function WarehousePage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Склад</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">{items.length} позиций</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
          + Приход
        </button>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f5f5f5]">
              {["Материал", "Ед.", "На складе", "В резерве", "Свободно", "Мин. остаток", "Цена/ед."].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-[#9b9b9b] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const free = item.qty - item.reserved;
              const low = free <= item.min;
              return (
                <tr key={item.name} className={`hover:bg-[#fafafa] transition-colors ${i < items.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                  <td className="px-5 py-3.5 text-[13px] text-[#1a1a1a] font-medium">{item.name}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#9b9b9b]">{item.unit}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#1a1a1a] font-mono">{item.qty}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#f59e0b] font-mono">{item.reserved}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[13px] font-mono font-medium ${low ? "text-red-500" : "text-[#1a1a1a]"}`}>{free.toFixed(1)}</span>
                    {low && <span className="ml-2 text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-semibold">мало</span>}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#9b9b9b] font-mono">{item.min}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6b6b6b]">{item.price.toLocaleString("ru")} ₽</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
