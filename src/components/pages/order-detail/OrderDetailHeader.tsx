import Icon from "@/components/ui/icon";

type Props = {
  id: string;
  client: string;
  phone: string;
  deadline: string;
  manager: string;
  status: string;
  statusColor: string;
  onBack: () => void;
};

export default function OrderDetailHeader({
  id, client, phone, deadline, manager,
  status, statusColor, onBack,
}: Props) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
        >
          <Icon name="ChevronLeft" size={14} />
          Заказы
        </button>
        <span className="text-[#d5d5d5]">/</span>
        <span className="text-[13px] font-semibold text-[#1a1a1a] font-mono">{id}</span>
      </div>

      {/* Header card */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[12px] font-bold text-[#9b9b9b]">{id}</span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ color: statusColor, backgroundColor: statusColor + "15" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                {status}
              </span>
            </div>
            <h1 className="text-[20px] font-bold text-[#1a1a1a] tracking-tight leading-tight">
              {client}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 border border-[#e5e5e5] bg-white text-[#4b4b4b] text-[12px] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
              <Icon name="Pencil" size={12} /> Изменить
            </button>
            <button className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-[12px] px-3 py-2 rounded-[7px] hover:bg-[#333] transition-colors">
              <Icon name="Banknote" size={12} /> Оплата
            </button>
          </div>
        </div>

        {/* Мета-строка */}
        <div className="flex items-center gap-5 pt-3 border-t border-[#f5f5f5] flex-wrap gap-y-2">
          <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
            <Icon name="Calendar" size={13} className="text-[#b5b5b5]" />
            Срок: <span className="font-semibold text-[#1a1a1a] ml-1">{deadline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
            <Icon name="User" size={13} className="text-[#b5b5b5]" />
            <span className="font-medium text-[#1a1a1a]">{manager}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
            <Icon name="Phone" size={13} className="text-[#b5b5b5]" />
            {phone}
          </div>
        </div>
      </div>
    </>
  );
}
