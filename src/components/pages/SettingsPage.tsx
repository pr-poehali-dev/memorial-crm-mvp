export default function SettingsPage() {
  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Настройки</h1>
        <p className="text-[13px] text-[#9b9b9b] mt-0.5">Параметры компании и системы</p>
      </div>

      <div className="space-y-6">
        <Section title="Компания">
          <Field label="Название" defaultValue="ООО «МемориалГрупп»" />
          <Field label="Телефон" defaultValue="+7 495 123-45-67" />
          <Field label="Адрес" defaultValue="Москва, Варшавское ш., 12" />
          <Field label="ИНН" defaultValue="7701234567" />
        </Section>

        <Section title="Производство">
          <Field label="Мин. срок изготовления (дней)" defaultValue="7" />
          <Field label="НДС (%)" defaultValue="20" />
          <Field label="Доставка базовая (₽)" defaultValue="2500" />
        </Section>

        <Section title="Уведомления">
          <Toggle label="Уведомления о новых заказах" />
          <Toggle label="Напоминание о просроченных заказах" defaultChecked />
          <Toggle label="Отчёт на почту каждую неделю" defaultChecked />
        </Section>

        <button className="bg-[#1a1a1a] text-white text-[13px] px-5 py-2.5 rounded-[8px] hover:bg-[#333] transition-colors">
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#f5f5f5]">
        <p className="text-[12px] font-semibold text-[#9b9b9b] uppercase tracking-wide">{title}</p>
      </div>
      <div className="divide-y divide-[#f5f5f5]">{children}</div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <label className="text-[13px] text-[#6b6b6b] shrink-0">{label}</label>
      <input
        defaultValue={defaultValue}
        className="text-[13px] text-[#1a1a1a] text-right bg-transparent border-b border-transparent hover:border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors max-w-[200px] w-full"
      />
    </div>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <span className="text-[13px] text-[#6b6b6b]">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-9 h-5 bg-[#e5e5e5] peer-checked:bg-[#1a1a1a] rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
      </label>
    </div>
  );
}
