import { useState, useEffect, useCallback } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Icon from "@/components/ui/icon";
import { ordersApi, cuttingApi, DbProductionOrder, DbShift } from "@/api/client";
import { Shift, WorkType, today } from "./cutting/cutting.types";
import OrdersTab  from "./production/OrdersTab";
import TasksTab   from "./production/TasksTab";
import ProcessTab from "./production/ProcessTab";
import { useNav } from "@/store/navStore";

type MainTab = "orders" | "tasks" | "process";

/* ─── Конвертер смен ─── */
function dbToShift(s: DbShift): Shift {
  return {
    id:              String(s.id),
    placeId:         String(s.place_id),
    placeName:       s.place_name,
    employeeId:      String(s.employee_id),
    employeeName:    s.employee_name,
    workType:        s.work_type as WorkType,
    date:            s.shift_date?.substring(0, 10) || today,
    status:          s.status as "active" | "done",
    startedAt:       s.started_at?.substring(0, 5) || "08:00",
    finishedAt:      s.finished_at?.substring(0, 5),
    taskId:          s.task_id ? String(s.task_id) : undefined,
    taskQtyAssigned: s.task_qty_assigned || undefined,
    results: (s.results || []).map(r => ({
      blankTypeId: String(r.blank_type_id ?? ""),
      blankName:   r.blank_name,
      material:    r.material,
      produced:    r.produced,
      rawAuto:     true,
      rawUsed:     Number(r.raw_used),
      orderId:     r.order_ref || undefined,
    })),
  };
}

const NEXT_STATUS: Record<string, string> = {
  "Эскиз":        "Производство",
  "Производство": "Гравировка",
  "Гравировка":   "Полировка",
  "Полировка":    "Готов",
  "Готов":        "Доставка",
  "Доставка":     "",
};

export default function ProductionPage() {
  const { openOrder } = useNav();
  const [mainTab, setMainTab] = useState<MainTab>("orders");
  const [orders,  setOrders]  = useState<DbProductionOrder[]>([]);
  const [shifts,  setShifts]  = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() =>
    Promise.all([
      ordersApi.production(),
      cuttingApi.shifts(),
    ]).then(([ords, shiftData]) => {
      setOrders(ords);
      setShifts(shiftData.map(dbToShift));
    })
    .catch(console.error)
    .finally(() => setLoading(false)),
  []);

  useEffect(() => { reload(); }, [reload]);

  const handleNextStage = (id: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    ordersApi.update(id, { status: next }).then(() => reload()).catch(console.error);
  };

  /* Бейджи на вкладках */
  const overdueCount  = orders.filter(o => o.deadline_state === "overdue").length;
  const activeShifts  = shifts.filter(s => s.status === "active" && s.date === today).length;
  const inWorkOrders  = orders.filter(o => !["Готов","Доставка"].includes(o.status)).length;

  if (loading) return <LoadingScreen text="Загружаем производство" />;

  const TABS: { key: MainTab; label: string; badge?: number; badgeRed?: boolean }[] = [
    { key: "orders",  label: "Заказы",  badge: inWorkOrders  > 0 ? inWorkOrders  : undefined, badgeRed: overdueCount > 0 },
    { key: "tasks",   label: "Задачи",  badge: overdueCount > 0 ? overdueCount : undefined, badgeRed: true },
    { key: "process", label: "Процесс", badge: activeShifts  > 0 ? activeShifts  : undefined, badgeRed: false },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f7f7f8]">

      {/* ── Шапка ── */}
      <div className="shrink-0 bg-white border-b border-[#e8e8e8]">
        <div className="flex items-center justify-between px-7 pt-5 pb-0">
          <h1 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">Изготовление</h1>

          <div className="flex items-center gap-3 mb-1">
            {overdueCount > 0 && (
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <Icon name="AlertTriangle" size={13} />
                {overdueCount} просрочено
              </span>
            )}
            {activeShifts > 0 && (
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                {activeShifts} работают сейчас
              </span>
            )}
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-0 px-7">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setMainTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-[14px] font-medium border-b-2 transition-all ${
                mainTab === t.key
                  ? "border-[#1a1a1a] text-[#1a1a1a]"
                  : "border-transparent text-[#9b9b9b] hover:text-[#4b4b4b]"
              }`}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  mainTab === t.key
                    ? "bg-[#1a1a1a] text-white"
                    : t.badgeRed
                    ? "bg-red-100 text-red-600"
                    : t.key === "process"
                    ? "bg-green-100 text-green-700"
                    : "bg-[#f0f0f0] text-[#6b6b6b]"
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Контент вкладок ── */}
      {mainTab === "orders" && (
        <OrdersTab
          orders={orders}
          onOpenOrder={openOrder}
          onNextStage={handleNextStage}
        />
      )}

      {mainTab === "tasks" && (
        <TasksTab
          orders={orders}
          onNextStage={handleNextStage}
        />
      )}

      {mainTab === "process" && (
        <ProcessTab shifts={shifts} />
      )}
    </div>
  );
}
