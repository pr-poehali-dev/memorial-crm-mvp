import { useState, useCallback } from "react";
import { CATALOG as CATALOG_DATA } from "@/data/catalog";
import { LineItem, ItemStatus, INIT_ITEMS, uid } from "./estimate.types";
import EstimateHeader from "./EstimateHeader";
import EstimateTable from "./EstimateTable";
import EstimateSidebar from "./EstimateSidebar";

export default function EstimatePage({ onBack }: { onBack?: () => void }) {
  const [items, setItems]       = useState<LineItem[]>(INIT_ITEMS);
  const [editId, setEditId]     = useState<string | null>(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [filterStatus, setFilterStatus] = useState<ItemStatus | "all">("all");
  const [saved, setSaved]       = useState(false);
  const [approved, setApproved] = useState(false);

  const update = useCallback(<K extends keyof LineItem>(id: string, field: K, val: LineItem[K]) =>
    setItems(its => its.map(x => x.id === id ? { ...x, [field]: val } : x)), []);

  const addFromCatalog = (cat: typeof CATALOG_DATA[number]) => {
    setItems(its => [...its, {
      id: uid(), name: cat.name, category: cat.category,
      qty: 1, unit: cat.unit, price: cat.price, cost: cat.cost,
      status: cat.calcType === "fixed" ? "calculated" : "needs_calc",
      author: "Дмитрий С.", locked: false, note: cat.comment,
    }]);
    setShowAdd(false);
  };

  const addBlank = () => {
    const id = uid();
    setItems(its => [...its, {
      id, name: "", category: "extra", qty: 1, unit: "шт.", price: 0, cost: 0,
      status: "needs_calc", author: "Дмитрий С.", locked: false, note: "",
    }]);
    setEditId(id);
    setShowAdd(false);
  };

  const approveItem = (id: string) =>
    setItems(its => its.map(x => x.id === id ? { ...x, status: "approved", locked: true } : x));

  const removeItem = (id: string) =>
    setItems(its => its.filter(x => x.id !== id));

  const markCalculated = (id: string) =>
    setItems(its => its.map(x => x.id === id ? { ...x, status: "calculated" } : x));

  const visible      = filterStatus === "all" ? items : items.filter(i => i.status === filterStatus);
  const totalPrice   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalCost    = items.reduce((s, i) => s + i.cost  * i.qty, 0);
  const totalMargin  = totalPrice - totalCost;
  const marginPct    = totalPrice > 0 ? Math.round((totalMargin / totalPrice) * 100) : 0;
  const needsCalc    = items.filter(i => i.status === "needs_calc").length;
  const calcDone     = items.filter(i => ["calculated", "approved"].includes(i.status)).length;

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="max-w-[1100px] mx-auto px-7 py-6">

        <EstimateHeader
          items={items}
          needsCalc={needsCalc}
          calcDone={calcDone}
          approved={approved}
          onBack={onBack}
          onApprove={() => { setApproved(true); setTimeout(() => setApproved(false), 2500); }}
        />

        <div className="flex gap-5 items-start">
          <EstimateTable
            visible={visible}
            filterStatus={filterStatus}
            items={items}
            editId={editId}
            showAdd={showAdd}
            onFilterChange={setFilterStatus}
            onToggleAdd={() => setShowAdd(s => !s)}
            onCloseAdd={() => setShowAdd(false)}
            onAddFromCatalog={addFromCatalog}
            onAddBlank={addBlank}
            onUpdate={update}
            onSetEditId={setEditId}
            onMarkCalculated={markCalculated}
            onApproveItem={approveItem}
            onRemoveItem={removeItem}
          />

          <EstimateSidebar
            items={items}
            totalPrice={totalPrice}
            totalCost={totalCost}
            totalMargin={totalMargin}
            marginPct={marginPct}
            needsCalc={needsCalc}
            saved={saved}
            onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          />
        </div>
      </div>
    </div>
  );
}
