import { DbProductionOrder } from "@/api/client";

export type Stage = "cutting" | "engraving" | "polishing" | "ready";

export const STAGE_CONFIG: {
  key: Stage; label: string; color: string; status: string;
}[] = [
  { key: "cutting",   label: "Производство", color: "#f59e0b", status: "Производство" },
  { key: "engraving", label: "Гравировка",   color: "#ec4899", status: "Гравировка" },
  { key: "polishing", label: "Полировка",    color: "#14b8a6", status: "Полировка" },
  { key: "ready",     label: "Готово",       color: "#22c55e", status: "Готов" },
];

export type Task = {
  id: string;
  orderId: string;
  client: string;
  phone: string;
  stone: string;
  size: string;
  stage: Stage;
  status: string;
  deadline: string;
  deadlineState: "overdue" | "soon" | "ok";
  manager: string;
  comment: string;
  payment: string;
  amount: number;
  paid: number;
};

export type TaskFilter = "all" | "overdue" | "mine";

export function ordersToTasks(orders: DbProductionOrder[]): Task[] {
  return orders.map(o => {
    const stageConf = STAGE_CONFIG.find(s => s.status === o.status) ?? STAGE_CONFIG[0];
    return {
      id:            o.id,
      orderId:       o.id,
      client:        o.client_name,
      phone:         o.phone ?? "",
      stone:         o.stone ?? "",
      size:          o.size  ?? "",
      stage:         stageConf.key,
      status:        o.status,
      deadline:      o.deadline ? new Date(o.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) : "",
      deadlineState: o.deadline_state,
      manager:       o.manager ?? "",
      comment:       o.comment ?? "",
      payment:       o.payment_label,
      amount:        Number(o.amount),
      paid:          Number(o.paid),
    };
  });
}