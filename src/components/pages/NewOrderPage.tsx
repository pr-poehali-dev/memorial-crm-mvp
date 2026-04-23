import { useState } from "react";
import Icon from "@/components/ui/icon";
import { OrderItem, Deceased, MANAGERS, ESTIMATORS, uid } from "./newOrder.types";
import NewOrderForm from "./NewOrderForm";
import NewOrderSidebar from "./NewOrderSidebar";

export default function NewOrderPage({ onBack }: { onBack: () => void }) {
  // Заказчик
  const [clientName, setClientName]       = useState("");
  const [clientPhone, setClientPhone]     = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientComment, setClientComment] = useState("");

  // Умершие
  const [deceased, setDeceased] = useState<Deceased[]>([
    { id: uid(), lastName: "", firstName: "", middleName: "", birthYear: "", deathYear: "", epitaph: "", photoRequired: false },
  ]);

  // Параметры изделия
  const [stone, setStone]       = useState("");
  const [size, setSize]         = useState("");
  const [deadline, setDeadline] = useState("");

  // Позиции
  const [items, setItems] = useState<OrderItem[]>([
    { id: uid(), name: "Изготовление памятника (базовый)", qty: 1, unit: "шт.", price: 22000, status: "approved",   note: "" },
    { id: uid(), name: "Гравировка надписи",               qty: 1, unit: "шт.", price: 6500,  status: "approved",   note: "" },
    { id: uid(), name: "Портретное фото",                  qty: 1, unit: "шт.", price: null,  status: "needs_calc", note: "Цветное или ч/б — уточнить" },
    { id: uid(), name: "Доставка и установка",             qty: 1, unit: "шт.", price: 5000,  status: "by_manager", note: "" },
  ]);

  // Ответственные
  const [manager, setManager]     = useState(MANAGERS[0]);
  const [estimator, setEstimator] = useState(ESTIMATORS[0]);

  // UI state
  const [activeTab, setActiveTab] = useState<"client" | "deceased" | "items" | "meta">("client");
  const [saved, setSaved]         = useState(false);

  /* Deceased helpers */
  const addDeceased = () => setDeceased(d => [...d, {
    id: uid(), lastName: "", firstName: "", middleName: "",
    birthYear: "", deathYear: "", epitaph: "", photoRequired: false,
  }]);

  const removeDeceased = (id: string) => setDeceased(d => d.filter(x => x.id !== id));

  const updateDeceased = (id: string, field: keyof Deceased, value: string | boolean) =>
    setDeceased(d => d.map(x => x.id === id ? { ...x, [field]: value } : x));

  /* Items helpers */
  const addItem = () => setItems(it => [...it, {
    id: uid(), name: "", qty: 1, unit: "шт.", price: null, status: "by_manager", note: "",
  }]);

  const removeItem = (id: string) => setItems(it => it.filter(x => x.id !== id));

  const updateItem = <K extends keyof OrderItem>(id: string, field: K, value: OrderItem[K]) =>
    setItems(it => it.map(x => x.id === id ? { ...x, [field]: value } : x));

  /* Computed */
  const total          = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const needsCalcCount = items.filter(i => i.status === "needs_calc").length;

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
          <NewOrderForm
            activeTab={activeTab}
            onTabChange={setActiveTab}
            clientName={clientName}
            clientPhone={clientPhone}
            clientAddress={clientAddress}
            clientComment={clientComment}
            onClientName={setClientName}
            onClientPhone={setClientPhone}
            onClientAddress={setClientAddress}
            onClientComment={setClientComment}
            deceased={deceased}
            onAddDeceased={addDeceased}
            onRemoveDeceased={removeDeceased}
            onUpdateDeceased={updateDeceased}
            items={items}
            total={total}
            needsCalcCount={needsCalcCount}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            stone={stone}
            size={size}
            deadline={deadline}
            onStone={setStone}
            onSize={setSize}
            onDeadline={setDeadline}
          />

          <NewOrderSidebar
            clientName={clientName}
            clientPhone={clientPhone}
            deceased={deceased}
            items={items}
            stone={stone}
            deadline={deadline}
            total={total}
            needsCalcCount={needsCalcCount}
            manager={manager}
            estimator={estimator}
            onManagerChange={setManager}
            onEstimatorChange={setEstimator}
          />
        </div>
      </div>
    </div>
  );
}
