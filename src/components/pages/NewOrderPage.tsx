import { useState } from "react";
import Icon from "@/components/ui/icon";

/* ─────────────── Types ─────────────── */

type ItemStatus = "approved" | "needs_calc" | "by_manager";

type OrderItem = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number | null;
  status: ItemStatus;
  note: string;
};

type Deceased = {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthYear: string;
  deathYear: string;
  epitaph: string;
  photoRequired: boolean;
};

/* ─────────────── Constants ─────────────── */

const ITEM_STATUS_META: Record<ItemStatus, { label: string; color: string; bg: string; border: string; icon: string; hint: string }> = {
  approved:    { label: "Утверждено",         color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "BadgeCheck",  hint: "Пересчёту не подлежит" },
  needs_calc:  { label: "Нужен расчёт",       color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "Calculator",  hint: "Сметчик рассчитает" },
  by_manager:  { label: "Внесено менеджером", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", icon: "Pencil",      hint: "Предварительная цена" },
};

const CATALOG_ITEMS = [
  "Изготовление памятника (базовый)",
  "Гравировка надписи",
  "Портретное фото",
  "Цветная гравировка",
  "Доставка и установка",
  "Бронзовые буквы",
  "Эпитафия (текст)",
  "Орнамент / декор",
];

const MANAGERS = ["Олег Краснов", "Анна Морозова", "Игорь Верещагин"];
const ESTIMATORS = ["Дмитрий Соколов", "Анна Морозова"];
const STONE_TYPES = ["Гранит чёрный (габбро)", "Гранит серый", "Гранит красный", "Мрамор белый", "Мрамор серый", "Гранит габбро (полированный)"];

function uid() { return Math.random().toString(36).slice(2, 8); }

/* ─────────────── Component ─────────────── */

export default function NewOrderPage({ onBack }: { onBack: () => void }) {
  // Заказчик
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientComment, setClientComment] = useState("");

  // Умершие
  const [deceased, setDeceased] = useState<Deceased[]>([
    { id: uid(), lastName: "", firstName: "", middleName: "", birthYear: "", deathYear: "", epitaph: "", photoRequired: false },
  ]);

  // Параметры изделия
  const [stone, setStone] = useState("");
  const [size, setSize] = useState("");
  const [deadline, setDeadline] = useState("");

  // Позиции
  const [items, setItems] = useState<OrderItem[]>([
    { id: uid(), name: "Изготовление памятника (базовый)", qty: 1, unit: "шт.", price: 22000, status: "approved",   note: "" },
    { id: uid(), name: "Гравировка надписи",               qty: 1, unit: "шт.", price: 6500,  status: "approved",   note: "" },
    { id: uid(), name: "Портретное фото",                  qty: 1, unit: "шт.", price: null,  status: "needs_calc", note: "Цветное или ч/б — уточнить" },
    { id: uid(), name: "Доставка и установка",             qty: 1, unit: "шт.", price: 5000,  status: "by_manager", note: "" },
  ]);

  // Ответственные
  const [manager, setManager] = useState(MANAGERS[0]);
  const [estimator, setEstimator] = useState(ESTIMATORS[0]);

  // UI state
  const [activeTab, setActiveTab] = useState<"client" | "deceased" | "items" | "meta">("client");
  const [saved, setSaved] = useState(false);

  /* Helpers */
  const addDeceased = () => setDeceased(d => [...d, {
    id: uid(), lastName: "", firstName: "", middleName: "",
    birthYear: "", deathYear: "", epitaph: "", photoRequired: false,
  }]);

  const removeDeceased = (id: string) => setDeceased(d => d.filter(x => x.id !== id));

  const updateDeceased = (id: string, field: keyof Deceased, value: string | boolean) =>
    setDeceased(d => d.map(x => x.id === id ? { ...x, [field]: value } : x));

  const addItem = () => setItems(it => [...it, {
    id: uid(), name: "", qty: 1, unit: "шт.", price: null, status: "by_manager", note: "",
  }]);

  const removeItem = (id: string) => setItems(it => it.filter(x => x.id !== id));

  const updateItem = <K extends keyof OrderItem>(id: string, field: K, value: OrderItem[K]) =>
    setItems(it => it.map(x => x.id === id ? { ...x, [field]: value } : x));

  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const needsCalcCount = items.filter(i => i.status === "needs_calc").length;

  const TABS = [
    { id: "client",   label: "Заказчик",  icon: "User",       done: !!clientName && !!clientPhone },
    { id: "deceased", label: "Умершие",   icon: "Heart",      done: deceased.some(d => d.lastName) },
    { id: "items",    label: "Позиции",   icon: "List",        done: items.length > 0 },
    { id: "meta",     label: "Параметры", icon: "Settings2",  done: !!stone && !!deadline },
  ] as const;

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="max-w-[900px] mx-auto px-7 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors">
            <Icon name="ChevronLeft" size={14} />Заказы
          </button>
          <span className="text-[#d5d5d5]">/</span>
          <span className="text-[13px] font-semibold text-[#1a1a1a]">Новый заказ</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Создать заказ</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">Заполните все блоки — заказ отправится на проверку сметчику</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onBack}
              className="text-[13px] text-[#6b6b6b] border border-[#e5e5e5] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
              Отмена
            </button>
            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              className={`flex items-center gap-2 text-[13px] px-4 py-2 rounded-[8px] transition-all
                ${saved ? "bg-green-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#333]"}`}>
              <Icon name={saved ? "Check" : "Save"} size={13} />
              {saved ? "Сохранено!" : "Сохранить заказ"}
            </button>
          </div>
        </div>

        <div className="flex gap-5 items-start">

          {/* ─── LEFT: main form ─── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Tab bar */}
            <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-xl p-1">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium transition-all
                    ${activeTab === t.id ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
                  <Icon name={t.icon as never} size={13} />
                  {t.label}
                  {t.done && activeTab !== t.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab: Заказчик ── */}
            {activeTab === "client" && (
              <Block title="Данные заказчика" icon="User"
                hint="Человек, который оплачивает заказ и является контактным лицом">
                <div className="grid grid-cols-2 gap-4 p-5">
                  <FormField label="Фамилия Имя Отчество *" value={clientName} onChange={setClientName} placeholder="Иванов Иван Иванович" span2 />
                  <FormField label="Телефон *"    value={clientPhone}   onChange={setClientPhone}   placeholder="+7 900 000-00-00" />
                  <FormField label="Адрес"        value={clientAddress} onChange={setClientAddress} placeholder="Город, улица, дом" />
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">Комментарий</label>
                    <textarea value={clientComment} onChange={e => setClientComment(e.target.value)}
                      placeholder="Особые пожелания, источник обращения..."
                      rows={2}
                      className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] resize-none transition-colors" />
                  </div>
                </div>
              </Block>
            )}

            {/* ── Tab: Умершие ── */}
            {activeTab === "deceased" && (
              <div className="space-y-3">
                {deceased.map((d, i) => (
                  <Block key={d.id}
                    title={`Умерший ${deceased.length > 1 ? `#${i + 1}` : ""}`}
                    icon="Heart"
                    hint="Данные для надписи на памятнике и дизайна"
                    action={deceased.length > 1 ? (
                      <button onClick={() => removeDeceased(d.id)}
                        className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                        <Icon name="Trash2" size={11} />Удалить
                      </button>
                    ) : undefined}>
                    <div className="grid grid-cols-3 gap-4 p-5">
                      <FormField label="Фамилия *"   value={d.lastName}   onChange={v => updateDeceased(d.id, "lastName", v)}   placeholder="Иванов" />
                      <FormField label="Имя *"       value={d.firstName}  onChange={v => updateDeceased(d.id, "firstName", v)}  placeholder="Пётр" />
                      <FormField label="Отчество"    value={d.middleName} onChange={v => updateDeceased(d.id, "middleName", v)} placeholder="Семёнович" />
                      <FormField label="Год рождения" value={d.birthYear} onChange={v => updateDeceased(d.id, "birthYear", v)}  placeholder="1945" />
                      <FormField label="Год смерти"  value={d.deathYear}  onChange={v => updateDeceased(d.id, "deathYear", v)}  placeholder="2021" />
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div onClick={() => updateDeceased(d.id, "photoRequired", !d.photoRequired)}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${d.photoRequired ? "bg-[#1a1a1a]" : "bg-[#e5e5e5]"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${d.photoRequired ? "left-[18px]" : "left-0.5"}`} />
                          </div>
                          <span className="text-[12px] text-[#6b6b6b]">Нужно фото</span>
                        </label>
                      </div>
                      <div className="col-span-3">
                        <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">Эпитафия / надпись</label>
                        <textarea value={d.epitaph} onChange={e => updateDeceased(d.id, "epitaph", e.target.value)}
                          placeholder="Текст для гравировки на памятнике..."
                          rows={2}
                          className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] resize-none transition-colors" />
                      </div>
                    </div>
                  </Block>
                ))}

                <button onClick={addDeceased}
                  className="w-full flex items-center justify-center gap-2 text-[13px] text-[#6b6b6b] border border-dashed border-[#d5d5d5] hover:border-[#b5b5b5] hover:text-[#1a1a1a] py-3 rounded-xl transition-all">
                  <Icon name="Plus" size={14} />Добавить ещё одного умершего
                </button>
              </div>
            )}

            {/* ── Tab: Позиции ── */}
            {activeTab === "items" && (
              <Block title="Позиции заказа" icon="List"
                hint="Менеджер вносит позиции. Сметчик пересчитает только помеченные.">

                {/* Legend */}
                <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-[#f5f5f5] flex-wrap">
                  {Object.entries(ITEM_STATUS_META).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: v.color }}>
                      <Icon name={v.icon as never} size={11} />
                      {v.label}
                      <span className="text-[#c5c5c5] font-normal">— {v.hint}</span>
                    </div>
                  ))}
                </div>

                <div className="divide-y divide-[#f8f8f8]">
                  {items.map((item) => {
                    const meta = ITEM_STATUS_META[item.status];
                    return (
                      <div key={item.id} className="px-5 py-3.5" style={{ backgroundColor: meta.bg + "60" }}>
                        <div className="flex items-start gap-3">
                          {/* Status pill */}
                          <div className="mt-1 shrink-0">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border"
                              style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}>
                              <Icon name={meta.icon as never} size={9} />
                              {meta.label}
                            </span>
                          </div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <select value={item.name}
                              onChange={e => updateItem(item.id, "name", e.target.value)}
                              className="w-full text-[13px] text-[#1a1a1a] font-medium bg-transparent border-b border-transparent hover:border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors pb-0.5 cursor-pointer">
                              <option value="">— выбрать из каталога —</option>
                              {CATALOG_ITEMS.map(c => <option key={c} value={c}>{c}</option>)}
                              {item.name && !CATALOG_ITEMS.includes(item.name) && (
                                <option value={item.name}>{item.name}</option>
                              )}
                            </select>
                            {item.note && (
                              <p className="text-[11px] text-[#9b9b9b] mt-1 flex items-center gap-1">
                                <Icon name="MessageSquare" size={10} />{item.note}
                              </p>
                            )}
                          </div>

                          {/* Qty */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input type="number" min={1} value={item.qty}
                              onChange={e => updateItem(item.id, "qty", Number(e.target.value))}
                              className="w-10 text-center text-[12px] font-mono bg-white border border-[#e5e5e5] rounded-md py-1 outline-none focus:border-[#1a1a1a] transition-colors" />
                            <span className="text-[11px] text-[#9b9b9b]">{item.unit}</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1 shrink-0">
                            {item.status === "needs_calc" ? (
                              <span className="text-[12px] text-[#d97706] font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                                расчёт
                              </span>
                            ) : (
                              <>
                                <input type="number" value={item.price ?? ""}
                                  onChange={e => updateItem(item.id, "price", e.target.value ? Number(e.target.value) : null)}
                                  disabled={item.status === "approved"}
                                  className={`w-24 text-right text-[12px] font-mono rounded-md py-1 px-2 outline-none transition-colors border
                                    ${item.status === "approved"
                                      ? "bg-green-50 border-green-100 text-green-700 cursor-default"
                                      : "bg-white border-[#e5e5e5] text-[#1a1a1a] focus:border-[#1a1a1a]"
                                    }`} />
                                <span className="text-[11px] text-[#9b9b9b]">₽</span>
                              </>
                            )}
                          </div>

                          {/* Status switcher */}
                          <div className="flex items-center gap-1 shrink-0">
                            {(["approved", "needs_calc", "by_manager"] as ItemStatus[]).map(s => (
                              <button key={s} title={ITEM_STATUS_META[s].label}
                                onClick={() => updateItem(item.id, "status", s)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all border
                                  ${item.status === s
                                    ? "border-current"
                                    : "border-transparent hover:border-[#e0e0e0] opacity-30 hover:opacity-60"
                                  }`}
                                style={{ color: ITEM_STATUS_META[s].color, backgroundColor: item.status === s ? ITEM_STATUS_META[s].bg : "transparent" }}>
                                <Icon name={ITEM_STATUS_META[s].icon as never} size={11} />
                              </button>
                            ))}
                            <button onClick={() => removeItem(item.id)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-[#d5d5d5] hover:text-red-400 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
                              <Icon name="X" size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 py-4 border-t border-[#f5f5f5] flex items-center justify-between">
                  <button onClick={addItem}
                    className="flex items-center gap-2 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] border border-dashed border-[#e0e0e0] hover:border-[#c5c5c5] px-3 py-2 rounded-lg transition-all">
                    <Icon name="Plus" size={12} />Добавить позицию
                  </button>
                  <div className="text-right">
                    <p className="text-[11px] text-[#9b9b9b] mb-0.5">
                      Итого (без расчёта)
                      {needsCalcCount > 0 && <span className="ml-1 text-amber-500">+ {needsCalcCount} позиции</span>}
                    </p>
                    <p className="text-[20px] font-bold text-[#1a1a1a]">{total.toLocaleString("ru")} ₽</p>
                  </div>
                </div>
              </Block>
            )}

            {/* ── Tab: Параметры ── */}
            {activeTab === "meta" && (
              <Block title="Параметры изделия" icon="Settings2"
                hint="Технические характеристики памятника">
                <div className="grid grid-cols-2 gap-4 p-5">
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">Материал *</label>
                    <select value={stone} onChange={e => setStone(e.target.value)}
                      className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors cursor-pointer">
                      <option value="">— выбрать —</option>
                      {STONE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <FormField label="Размер (см)" value={size} onChange={setSize} placeholder="100×50×8" />
                  <FormField label="Срок (дедлайн) *" value={deadline} onChange={setDeadline} placeholder="30.05.2026" />
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">Дизайн / описание</label>
                    <textarea rows={2} placeholder="Дополнительные пожелания по дизайну..."
                      className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] resize-none transition-colors" />
                  </div>
                </div>
              </Block>
            )}
          </div>

          {/* ─── RIGHT: summary ─── */}
          <div className="w-[260px] shrink-0 space-y-4 sticky top-6">

            {/* Order summary */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Сводка заказа</p>
              <div className="space-y-3">
                <SummaryRow icon="User"    label="Заказчик"     value={clientName || <span className="text-[#c5c5c5]">не указан</span>} />
                <SummaryRow icon="Heart"   label="Умерших"      value={`${deceased.length} чел.`} />
                <SummaryRow icon="Layers"  label="Позиций"      value={`${items.length} шт.`} />
                <SummaryRow icon="Box"     label="Материал"     value={stone || <span className="text-[#c5c5c5]">не выбран</span>} />
                <SummaryRow icon="Calendar" label="Дедлайн"    value={deadline || <span className="text-[#c5c5c5]">не указан</span>} />
              </div>

              {needsCalcCount > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Calculator" size={12} className="text-amber-500" />
                    <span className="text-[12px] font-semibold text-amber-700">Нужен расчёт</span>
                  </div>
                  <p className="text-[11px] text-amber-600">{needsCalcCount} позиции отправятся сметчику</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
                <div className="flex justify-between items-baseline">
                  <span className="text-[12px] text-[#9b9b9b]">Итого (предв.)</span>
                  <span className="text-[18px] font-bold text-[#1a1a1a]">{total.toLocaleString("ru")} ₽</span>
                </div>
              </div>
            </div>

            {/* Responsible */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Ответственные</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-[#9b9b9b] block mb-1.5">Менеджер (создаёт)</label>
                  <select value={manager} onChange={e => setManager(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2 text-[12px] font-semibold text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors cursor-pointer">
                    {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#9b9b9b] block mb-1.5">Сметчик (проверяет)</label>
                  <select value={estimator} onChange={e => setEstimator(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2 text-[12px] font-semibold text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors cursor-pointer">
                    {ESTIMATORS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#f5f5f5] space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-[#9b9b9b]">
                  <Icon name="Info" size={11} />
                  <span>Сметчик получит уведомление</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#9b9b9b]">
                  <Icon name="BadgeCheck" size={11} />
                  <span>Утверждённые позиции — без пересчёта</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Чеклист</p>
              <div className="space-y-2">
                {[
                  { label: "Заказчик заполнен",   done: !!clientName && !!clientPhone },
                  { label: "Умерший(ие) указаны", done: deceased.some(d => d.lastName) },
                  { label: "Позиции добавлены",   done: items.length > 0 },
                  { label: "Материал выбран",      done: !!stone },
                  { label: "Дедлайн указан",       done: !!deadline },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all
                      ${c.done ? "bg-[#22c55e]" : "bg-[#f0f0f0]"}`}>
                      {c.done && <Icon name="Check" size={9} className="text-white" />}
                    </div>
                    <span className={`text-[12px] ${c.done ? "text-[#1a1a1a]" : "text-[#b5b5b5]"}`}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── UI helpers ─────────────── */

function Block({ title, icon, hint, action, children }: {
  title: string; icon: string; hint?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#f5f5f5] flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name={icon as never} size={14} className="text-[#9b9b9b]" />
          <div>
            <p className="text-[14px] font-semibold text-[#1a1a1a]">{title}</p>
            {hint && <p className="text-[11px] text-[#b5b5b5]">{hint}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, span2 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors" />
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon as never} size={12} className="text-[#c5c5c5] shrink-0" />
      <span className="text-[12px] text-[#9b9b9b] shrink-0">{label}</span>
      <span className="text-[12px] font-medium text-[#1a1a1a] ml-auto text-right truncate max-w-[120px]">{value}</span>
    </div>
  );
}
