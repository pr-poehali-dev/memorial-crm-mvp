import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "company" | "managers" | "stages" | "estimates" | "notifications";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "company",       label: "Компания",          icon: "Building2" },
  { id: "managers",      label: "Сотрудники",         icon: "Users" },
  { id: "stages",        label: "Этапы производства", icon: "Hammer" },
  { id: "estimates",     label: "Шаблоны смет",       icon: "Calculator" },
  { id: "notifications", label: "Уведомления",        icon: "Bell" },
];

type Manager = { id: string; name: string; role: string; phone: string; active: boolean; color: string };
const INIT_MANAGERS: Manager[] = [
  { id: "m1", name: "Олег Краснов",    role: "Менеджер",    phone: "+7 916 100-11-22", active: true,  color: "#6366f1" },
  { id: "m2", name: "Анна Морозова",   role: "Менеджер",    phone: "+7 925 200-33-44", active: true,  color: "#22c55e" },
  { id: "m3", name: "Игорь Верещагин", role: "Производство", phone: "+7 903 300-55-66", active: true,  color: "#f59e0b" },
  { id: "m4", name: "Дмитрий Соколов", role: "Сметчик",     phone: "+7 965 400-77-88", active: false, color: "#ec4899" },
];

type Stage = { id: string; label: string; color: string; days: number; active: boolean };
const INIT_STAGES: Stage[] = [
  { id: "s1", label: "Эскиз",      color: "#6366f1", days: 2, active: true },
  { id: "s2", label: "Распил",     color: "#f59e0b", days: 3, active: true },
  { id: "s3", label: "Гравировка", color: "#ec4899", days: 4, active: true },
  { id: "s4", label: "Полировка",  color: "#14b8a6", days: 2, active: true },
  { id: "s5", label: "Готов",      color: "#22c55e", days: 0, active: true },
  { id: "s6", label: "Выдан",      color: "#9b9b9b", days: 0, active: true },
];

type EstimateItem = { id: string; name: string; price: number; unit: string; active: boolean };
const INIT_ESTIMATE: EstimateItem[] = [
  { id: "e1", name: "Изготовление памятника (базовый)", price: 22000, unit: "шт.", active: true },
  { id: "e2", name: "Гравировка надписи",               price: 6500,  unit: "шт.", active: true },
  { id: "e3", name: "Портретное фото",                  price: 5000,  unit: "шт.", active: true },
  { id: "e4", name: "Доставка базовая",                 price: 2500,  unit: "км",  active: true },
  { id: "e5", name: "Установка на кладбище",            price: 5000,  unit: "шт.", active: true },
  { id: "e6", name: "Цветная гравировка",               price: 8000,  unit: "шт.", active: false },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("company");
  const [managers, setManagers] = useState(INIT_MANAGERS);
  const [stages, setStages] = useState(INIT_STAGES);
  const [estimates, setEstimates] = useState(INIT_ESTIMATE);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-7 max-w-[960px] mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Настройки</h1>
        <p className="text-[13px] text-[#9b9b9b] mt-0.5">Управление компанией и системой</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-[200px] shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[13px] transition-all text-left
                  ${tab === t.id ? "bg-[#f0f0f0] text-[#1a1a1a] font-semibold" : "text-[#6b6b6b] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"}`}>
                <Icon name={t.icon as never} size={14} className="shrink-0" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── COMPANY ── */}
          {tab === "company" && (
            <>
              <Card title="Реквизиты компании">
                <FormField label="Название"  defaultValue="ООО «МемориалГрупп»" />
                <FormField label="ИНН"       defaultValue="7701234567" />
                <FormField label="ОГРН"      defaultValue="1187746000001" />
                <FormField label="Телефон"   defaultValue="+7 495 123-45-67" />
                <FormField label="Email"     defaultValue="info@memorial-grp.ru" />
                <FormField label="Адрес"     defaultValue="Москва, Варшавское ш., 12" />
              </Card>
              <Card title="Производство">
                <FormField label="Мин. срок изготовления (дней)" defaultValue="7" />
                <FormField label="НДС (%)"                       defaultValue="20" />
                <FormField label="Доставка базовая (₽/км)"      defaultValue="50" />
                <FormField label="Рабочих часов в день"         defaultValue="8" />
              </Card>
              <SaveBtn onSave={handleSave} saved={saved} />
            </>
          )}

          {/* ── MANAGERS ── */}
          {tab === "managers" && (
            <>
              <Card title="Сотрудники">
                <div className="divide-y divide-[#f5f5f5]">
                  {managers.map((m) => (
                    <div key={m.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                        style={{ backgroundColor: m.color }}>
                        {m.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{m.name}</p>
                        <p className="text-[11px] text-[#9b9b9b]">{m.role} · {m.phone}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md
                        ${m.active ? "bg-green-50 text-green-600" : "bg-[#f5f5f5] text-[#9b9b9b]"}`}>
                        {m.active ? "Активен" : "Неактивен"}
                      </span>
                      <div className="flex gap-1.5">
                        <IconBtn icon="Pencil" title="Редактировать" />
                        <IconBtn icon={m.active ? "UserX" : "UserCheck"} title={m.active ? "Деактивировать" : "Активировать"}
                          onClick={() => setManagers(ms => ms.map(x => x.id === m.id ? { ...x, active: !x.active } : x))} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <button className="flex items-center gap-2 text-[13px] text-[#6b6b6b] border border-dashed border-[#e0e0e0] hover:border-[#c5c5c5] hover:text-[#1a1a1a] px-4 py-2.5 rounded-[8px] transition-colors">
                <Icon name="Plus" size={13} />Добавить сотрудника
              </button>
            </>
          )}

          {/* ── STAGES ── */}
          {tab === "stages" && (
            <>
              <Card title="Этапы производства"
                hint="Порядок этапов определяет движение заказа по канбан-доске">
                <div className="divide-y divide-[#f5f5f5]">
                  {stages.map((s, i) => (
                    <div key={s.id} className={`flex items-center gap-4 px-5 py-3 ${!s.active ? "opacity-50" : ""}`}>
                      <span className="text-[12px] font-bold text-[#d5d5d5] w-5 shrink-0">{i + 1}</span>
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#9b9b9b]">норм.</span>
                        <input defaultValue={s.days || "—"}
                          className="w-10 text-center text-[12px] font-mono bg-[#f5f5f5] border border-transparent hover:border-[#e0e0e0] focus:border-[#1a1a1a] rounded-md py-1 outline-none transition-colors" />
                        <span className="text-[11px] text-[#9b9b9b]">дн.</span>
                      </div>
                      <div className="flex gap-1.5 ml-2">
                        <IconBtn icon="GripVertical" title="Переместить" />
                        <IconBtn icon={s.active ? "EyeOff" : "Eye"} title={s.active ? "Скрыть" : "Показать"}
                          onClick={() => setStages(ss => ss.map(x => x.id === s.id ? { ...x, active: !x.active } : x))} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <button className="flex items-center gap-2 text-[13px] text-[#6b6b6b] border border-dashed border-[#e0e0e0] hover:border-[#c5c5c5] hover:text-[#1a1a1a] px-4 py-2.5 rounded-[8px] transition-colors">
                <Icon name="Plus" size={13} />Добавить этап
              </button>
              <SaveBtn onSave={handleSave} saved={saved} />
            </>
          )}

          {/* ── ESTIMATES ── */}
          {tab === "estimates" && (
            <>
              <Card title="Шаблон сметы"
                hint="Позиции используются при создании нового заказа и расчёте стоимости">
                <div className="divide-y divide-[#f5f5f5]">
                  {estimates.map((e) => (
                    <div key={e.id} className={`flex items-center gap-4 px-5 py-3.5 ${!e.active ? "opacity-50" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.active ? "bg-[#22c55e]" : "bg-[#d5d5d5]"}`} />
                      <span className="text-[13px] text-[#1a1a1a] flex-1">{e.name}</span>
                      <div className="flex items-center gap-1.5">
                        <input defaultValue={e.price.toLocaleString("ru")}
                          className="w-24 text-right text-[12px] font-mono bg-[#f5f5f5] border border-transparent hover:border-[#e0e0e0] focus:border-[#1a1a1a] rounded-md px-2 py-1 outline-none transition-colors" />
                        <span className="text-[11px] text-[#9b9b9b]">₽</span>
                      </div>
                      <span className="text-[11px] text-[#b5b5b5] w-8 text-center">{e.unit}</span>
                      <div className="flex gap-1.5">
                        <IconBtn icon={e.active ? "EyeOff" : "Eye"} title={e.active ? "Отключить" : "Включить"}
                          onClick={() => setEstimates(es => es.map(x => x.id === e.id ? { ...x, active: !x.active } : x))} />
                        <IconBtn icon="Trash2" title="Удалить" danger />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <button className="flex items-center gap-2 text-[13px] text-[#6b6b6b] border border-dashed border-[#e0e0e0] hover:border-[#c5c5c5] hover:text-[#1a1a1a] px-4 py-2.5 rounded-[8px] transition-colors">
                <Icon name="Plus" size={13} />Добавить позицию
              </button>
              <SaveBtn onSave={handleSave} saved={saved} />
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <>
              <Card title="Уведомления в системе">
                <Toggle label="Новый заказ создан"               defaultChecked />
                <Toggle label="Заказ просрочен"                  defaultChecked />
                <Toggle label="Клиент не оплатил вовремя"        defaultChecked />
                <Toggle label="Материал ниже минимума"           defaultChecked />
                <Toggle label="Заказ готов к выдаче"             defaultChecked />
                <Toggle label="Смена этапа производства"         />
              </Card>
              <Card title="Email-уведомления">
                <FormField label="Email для отчётов" defaultValue="director@memorial-grp.ru" />
                <Toggle label="Еженедельный отчёт"              defaultChecked />
                <Toggle label="Ежемесячный отчёт"               defaultChecked />
                <Toggle label="Уведомления о долгах"            defaultChecked />
                <Toggle label="Критичный склад"                  />
              </Card>
              <SaveBtn onSave={handleSave} saved={saved} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#f5f5f5]">
        <p className="text-[13px] font-semibold text-[#1a1a1a]">{title}</p>
        {hint && <p className="text-[11px] text-[#b5b5b5] mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function FormField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f8f8f8] last:border-0 gap-4">
      <label className="text-[13px] text-[#6b6b6b] shrink-0">{label}</label>
      <input defaultValue={defaultValue}
        className="text-[13px] text-[#1a1a1a] text-right bg-transparent border-b border-transparent hover:border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors max-w-[240px] w-full" />
    </div>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f8f8f8] last:border-0 gap-4">
      <span className="text-[13px] text-[#4b4b4b]">{label}</span>
      <button onClick={() => setChecked(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-[#1a1a1a]" : "bg-[#e5e5e5]"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function IconBtn({ icon, title, onClick, danger }: { icon: string; title: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button title={title} onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-[6px] border transition-all
        ${danger
          ? "border-red-100 text-red-400 hover:border-red-200 hover:bg-red-50"
          : "border-[#e8e8e8] text-[#9b9b9b] hover:border-[#c5c5c5] hover:text-[#1a1a1a]"
        }`}>
      <Icon name={icon as never} size={12} />
    </button>
  );
}

function SaveBtn({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <button onClick={onSave}
      className={`flex items-center gap-2 text-[13px] px-5 py-2.5 rounded-[8px] transition-all
        ${saved ? "bg-green-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#333]"}`}>
      <Icon name={saved ? "Check" : "Save"} size={13} />
      {saved ? "Сохранено!" : "Сохранить изменения"}
    </button>
  );
}
