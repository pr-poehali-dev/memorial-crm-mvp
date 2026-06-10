/**
 * Конвертеры DB → UI типы.
 * Все dbTo-функции в одном месте — меняй здесь, работает везде.
 */
import type {
  DbOrder, DbClient,
  DbMaterial, DbBlank, DbMovement, DbStockItem,
  DbShift, DbPlace, DbEmployee, DbBlankType, DbCuttingTask,
} from "@/api/types";

import type { Order, DeadlineState, PayStatus } from "@/components/pages/orders/orders.types";
import type { Client } from "@/components/pages/ClientsPage";
import type {
  RawMaterial, Blank, Movement, StockItem,
} from "@/components/pages/warehouse/warehouse.types";
import type {
  Shift, Place, Employee, BlankType, CuttingTask, WorkType,
} from "@/components/pages/cutting/cutting.types";

import { fDate, fDateShort } from "./formatters";
import { today } from "@/components/pages/cutting/cutting.types";

/* ── Orders ──────────────────────────────────────────────────── */
export function dbToOrder(o: DbOrder): Order {
  return {
    id:            o.id,
    client:        o.client_name,
    phone:         o.phone        || "",
    stone:         o.stone        || "",
    size:          o.size         || "",
    inscription:   o.inscription  || "",
    design:        o.design       || "",
    status:        o.status,
    statusColor:   o.status_color,
    amount:        Number(o.amount),
    paid:          Number(o.paid),
    date:          fDate(o.order_date),
    deadline:      fDate(o.deadline),
    manager:       o.manager  || "",
    comment:       o.comment  || "",
    deadlineState: (o.deadline_state as DeadlineState) || "ok",
    payStatus:     (o.pay_status   as PayStatus)       || "unpaid",
  };
}

/* ── Clients ─────────────────────────────────────────────────── */
export function dbToClient(c: DbClient): Client {
  return {
    id:      String(c.id),
    name:    c.name,
    phone:   c.phone   || "",
    city:    c.city    || "",
    address: c.address || "",
    orders:  Number(c.orders_count  || 0),
    total:   Number(c.total_amount  || 0),
    paid:    Number(c.total_paid    || 0),
    last:    fDate(c.last_order_date),
    active:  c.active,
    comment: c.comment || "",
    manager: c.manager || "",
    since:   c.since_label || "",
  };
}

/* ── Warehouse ───────────────────────────────────────────────── */
export function dbToRaw(m: DbMaterial): RawMaterial {
  return {
    id:       String(m.id),
    name:     m.name,
    unit:     m.unit,
    qty:      Number(m.qty),
    min:      Number(m.min_qty),
    price:    Number(m.price),
    imageUrl: m.image_url,
  };
}

export function dbToBlank(b: DbBlank): Blank {
  return {
    id:            String(b.id),
    name:          b.name,
    size:          b.size || "",
    materialId:    String(b.material_id),
    qty:           Number(b.qty),
    min:           Number(b.min_qty),
    costPrice:     Number(b.cost_price)    || 0,
    salePrice:     Number(b.sale_price)    || 0,
    blankTypeId:   b.blank_type_id         || undefined,
    rawPerUnit:    b.raw_per_unit    ? Number(b.raw_per_unit)    : undefined,
    materialPrice: b.material_price  ? Number(b.material_price)  : undefined,
  };
}

export function dbToMovement(m: DbMovement): Movement {
  return {
    id:           String(m.id),
    date:         fDateShort(m.move_date),
    isoDate:      String(m.move_date).substring(0, 10),
    type:         m.move_type as Movement["type"],
    materialId:   m.material_id  ? String(m.material_id)  : undefined,
    blankId:      m.blank_id     ? String(m.blank_id)      : undefined,
    qty:          Number(m.qty),
    pricePerUnit: m.price_per_unit ? Number(m.price_per_unit) : undefined,
    totalSum:     m.total_sum      ? Number(m.total_sum)      : undefined,
    note:         m.note,
    receiptId:    m.receipt_id     || undefined,
    order:        m.order_ref      || undefined,
    remainAfter:  m.remain_after   ? Number(m.remain_after)   : undefined,
  };
}

export function dbToStock(s: DbStockItem): StockItem {
  return {
    id:        String(s.id),
    catalogId: s.catalog_id || "",
    name:      s.name,
    category:  s.category,
    qty:       s.qty,
    price:     Number(s.price),
    costPrice: Number(s.cost_price) || 0,
    addedAt:   fDateShort(s.added_at),
    note:      s.note,
  };
}

/* ── Cutting ─────────────────────────────────────────────────── */
export function dbToShift(s: DbShift): Shift {
  return {
    id:              String(s.id),
    placeId:         String(s.place_id),
    placeName:       s.place_name,
    employeeId:      String(s.employee_id),
    employeeName:    s.employee_name,
    workType:        s.work_type as WorkType,
    date:            s.shift_date?.substring(0, 10) || today,
    status:          s.status as "active" | "done",
    startedAt:       s.started_at?.substring(0, 5)  || "08:00",
    finishedAt:      s.finished_at?.substring(0, 5),
    taskId:          s.task_id          ? String(s.task_id)          : undefined,
    taskQtyAssigned: s.task_qty_assigned || undefined,
    results: (s.results || []).map(r => {
      type R = typeof r & { blankTypeId?: number; blankName?: string; produced?: number; rawUsed?: number; orderRef?: string };
      const rr = r as R;
      return {
        blankTypeId: String(rr.blankTypeId  ?? r.blank_type_id ?? ""),
        blankName:   rr.blankName           ?? r.blank_name,
        material:    r.material,
        produced:    Number(rr.produced     ?? 0),
        rawAuto:     true,
        rawUsed:     Number(rr.rawUsed      ?? r.raw_used ?? 0),
        orderId:     (rr.orderRef           ?? r.order_ref) || undefined,
      };
    }),
  };
}

export function dbToPlace(p: DbPlace): Place {
  return {
    id:        String(p.id),
    name:      p.name,
    machine:   p.machine,
    workTypes: p.work_types as WorkType[],
  };
}

export function dbToEmployee(e: DbEmployee): Employee {
  return { id: String(e.id), name: e.name };
}

export function dbToBlankType(b: DbBlankType): BlankType {
  return {
    id:         String(b.id),
    name:       b.name,
    size:       b.size,
    material:   b.material,
    rawPerUnit: Number(b.raw_per_unit),
  };
}

export function dbToTask(t: DbCuttingTask): CuttingTask {
  return {
    id:             String(t.id),
    blankTypeId:    t.blank_type_id ? String(t.blank_type_id) : "",
    blankName:      t.blank_name,
    blankSize:      t.blank_size,
    materialName:   t.material_name || "",
    totalQty:       t.total_qty,
    doneQty:        t.done_qty,
    inProgressQty:  t.in_progress_qty,
    status:         t.status as CuttingTask["status"],
    createdAt:      fDate(t.created_at),
    updatedAt:      t.updated_at ? t.updated_at.substring(0, 10) : undefined,
    deadline:       fDate(t.deadline) === "—" ? undefined : fDate(t.deadline),
  };
}