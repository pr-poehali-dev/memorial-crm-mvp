import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { OrderItem, Deceased, uid } from "./newOrder.types";
import { settingsApi, warehouseApi, ordersApi } from "@/api/client";
import { toast } from "sonner";
import NewOrderForm from "./NewOrderForm";
import NewOrderSidebar from "./NewOrderSidebar";

/* Генерация предварительного кода на основе счётчика */
async function generateOrderId(): Promise<string> {
  try {
    const orders = await ordersApi.list();
    const nums = orders
      .map(o => o.id)
      .filter(id => /^МП-\d+$/.test(id))
      .map(id => parseInt(id.replace("МП-", "")));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `МП-${String(max + 1).padStart(4, "0")}`;
  } catch {
    return `МП-${Date.now().toString().slice(-4)}`;
  }
}

export default function NewOrderPage({ onBack }: { onBack: () => void }) {
  // Код заказа (редактируемый)
  const [orderId,       setOrderId]       = useState("");
  const [editingId,     setEditingId]     = useState(false);
  const [loadingId,     setLoadingId]     = useState(true);

  // Заказчик
  const [clientName,    setClientName]    = useState("");
  const [clientPhone,   setClientPhone]   = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientComment, setClientComment] = useState("");

  // Умершие
  const [deceased, setDeceased] = useState<Deceased[]>([
    { id: uid(), lastName: "", firstName: "", middleName: "", birthYear: "", deathYear: "", epitaph: "", photoRequired: false },
  ]);

  // Параметры изделия
  const [stone,    setStone]    = useState("");
  const [size,     setSize]     = useState("");
  const [deadline, setDeadline] = useState("");

  // Позиции
  const [items, setItems] = useState<OrderItem[]>([
    { id: uid(), name: "Изготовление памятника (базовый)", qty: 1, unit: "шт.", price: 22000, status: "approved",   note: "" },
    { id: uid(), name: "Гравировка надписи",               qty: 1, unit: "шт.", price: 6500,  status: "approved",   note: "" },
    { id: uid(), name: "Портретное фото",                  qty: 1, unit: "шт.", price: null,  status: "needs_calc", note: "Цветное или ч/б — уточнить" },
    { id: uid(), name: "Доставка и установка",             qty: 1, unit: "шт.", price: 5000,  status: "by_manager", note: "" },
  ]);

  // Ответственные и справочники
  const [managers,     setManagers]     = useState<string[]>([]);
  const [estimators,   setEstimators]   = useState<string[]>([]);
  const [stoneTypes,   setStoneTypes]   = useState<string[]>([]);
  const [catalogItems, setCatalogItems] = useState<string[]>([]);
  const [manager,      setManager]      = useState("");
  const [estimator,    setEstimator]    = useState("");

  const [activeTab, setActiveTab] = useState<"client" | "deceased" | "items" | "meta">("client");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    // Генерируем код заказа
    generateOrderId().then(id => {
      setOrderId(id);
      setLoadingId(false);
    });
    // Загружаем справочники
    settingsApi.employees().then(emps => {
      const mgrs = emps.filter(e => e.active && ["manager","estimator","production"].includes(e.role ?? "")).map(e => e.name);
      const ests = emps.filter(e => e.active && e.role === "estimator").map(e => e.name);
      setManagers(mgrs.length ? mgrs : ["Менеджер"]);
      setEstimators(ests.length ? ests : mgrs);
      if (mgrs.length) setManager(mgrs[0]);
      if (ests.length) setEstimator(ests[0]);
    }).catch(console.error);
    warehouseApi.materials().then(mats => {
      setStoneTypes(mats.map(m => m.name));
    }).catch(console.error);
    settingsApi.estimateTemplates().then(tmpl => {
      setCatalogItems(tmpl.filter(t => t.active).map(t => t.name));
    }).catch(console.error);
  }, []);

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

  const total          = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const needsCalcCount = items.filter(i => i.status === "needs_calc").length;

  /* Сохранение заказа */
  const handleSave = async () => {
    if (!clientName.trim()) {
      toast.error("Укажите имя заказчика");
      setActiveTab("client");
      return;
    }
    if (!orderId.trim()) {
      toast.error("Укажите код заказа");
      return;
    }
    setSaving(true);
    try {
      const deceased0 = deceased[0];
      const inscription = deceased
        .filter(d => d.lastName || d.firstName)
        .map(d => `${[d.lastName, d.firstName, d.middleName].filter(Boolean).join(" ")}${d.birthYear || d.deathYear ? `\n${d.birthYear}–${d.deathYear}` : ""}${d.epitaph ? `\n${d.epitaph}` : ""}`)
        .join("\n\n");

      await ordersApi.create({
        id:          orderId.trim(),
        clientName:  clientName.trim(),
        phone:       clientPhone.trim(),
        stone:       stone,
        size:        size,
        inscription: inscription || "",
        design:      "",
        status:      "Эскиз",
        statusColor: "#6366f1",
        amount:      total,
        paid:        0,
        orderDate:   new Date().toISOString().slice(0, 10),
        deadline:    deadline || undefined,
        manager:     manager,
        comment:     clientComment.trim(),
        currentStage: 0,
      } as never);

      toast.success(`Заказ ${orderId} создан!`, {
        description: `${clientName} · ${total.toLocaleString("ru")} ₽`,
        duration: 4000,
      });
      onBack();
    } catch (e) {
      toast.error("Ошибка при создании заказа. Возможно, такой код уже существует.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
            {/* Код заказа с возможностью редактировать */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] text-[#9b9b9b]">Код заказа:</span>
              {editingId ? (
                <input
                  value={orderId}
                  onChange={e => setOrderId(e.target.value.toUpperCase())}
                  onBlur={() => setEditingId(false)}
                  onKeyDown={e => e.key === "Enter" && setEditingId(false)}
                  autoFocus
                  className="font-mono text-[13px] font-bold text-[#1a1a1a] border-b border-[#6366f1] outline-none bg-transparent w-[100px]"
                />
              ) : (
                <button
                  onClick={() => setEditingId(true)}
                  className="flex items-center gap-1 group"
                  title="Нажмите, чтобы изменить код"
                >
                  <span className="font-mono text-[13px] font-bold text-[#1a1a1a]">
                    {loadingId ? "..." : orderId}
                  </span>
                  <Icon name="Pencil" size={11} className="text-[#c5c5c5] group-hover:text-[#6366f1] transition-colors" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onBack}
              className="text-[13px] text-[#6b6b6b] border border-[#e5e5e5] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-[8px] transition-all bg-[#1a1a1a] text-white hover:bg-[#333] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon name="Save" size={13} />
              {saving ? "Сохраняем..." : "Сохранить заказ"}
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
            stoneTypes={stoneTypes}
            catalogItems={catalogItems}
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
            managers={managers}
            estimators={estimators}
            onManagerChange={setManager}
            onEstimatorChange={setEstimator}
          />
        </div>
      </div>
    </div>
  );
}
