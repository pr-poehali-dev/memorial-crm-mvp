"""Заготовки: задачи на нарезку, смены, результаты"""
import json, os, hashlib
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9542363_memorial_crm_mvp"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_company_id(token: str) -> int | None:
    if not token:
        return None
    secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
    conn = get_db()
    cur = conn.cursor()
    cur.execute(f"SELECT id, login, company_id FROM {SCHEMA}.users WHERE active=TRUE")
    rows = cur.fetchall()
    conn.close()
    for uid, login, cid in rows:
        if hashlib.sha256(f"{uid}:{login}:{secret}".encode()).hexdigest() == token:
            return cid
    return None

def handler(event: dict, context) -> dict:
    """Заготовки. GET /?section=tasks|shifts|places|employees|blank_types. POST /?action=..."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = event.get("headers", {}).get("X-Session-Token", "")
    company_id = get_company_id(token)
    if not company_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    section = params.get("section", "tasks")
    action  = params.get("action", "")

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET":
            if section == "tasks":
                cur.execute(
                    f"""SELECT ct.*, bt.name as blank_name, bt.size as blank_size
                        FROM {SCHEMA}.cutting_tasks ct
                        LEFT JOIN {SCHEMA}.blank_types bt ON bt.id=ct.blank_type_id
                        WHERE ct.company_id=%s
                        ORDER BY ct.created_at DESC""",
                    (company_id,)
                )
            elif section == "shifts":
                date_filter = params.get("date", "")
                sql = f"""SELECT s.*,
                          p.name as place_name, p.machine,
                          e.name as employee_name,
                          COALESCE(
                            json_agg(jsonb_build_object(
                              'id',sr.id,'blankTypeId',sr.blank_type_id,
                              'blankName',bt.name,'material',bt.material,
                              'produced',sr.produced,
                              'rawUsed',sr.raw_used,'orderRef',sr.order_ref
                            ) ORDER BY sr.sort_order) FILTER (WHERE sr.id IS NOT NULL), '[]'
                          ) as results
                          FROM {SCHEMA}.shifts s
                          LEFT JOIN {SCHEMA}.places p ON p.id=s.place_id
                          LEFT JOIN {SCHEMA}.employees e ON e.id=s.employee_id
                          LEFT JOIN {SCHEMA}.shift_results sr ON sr.shift_id=s.id
                          LEFT JOIN {SCHEMA}.blank_types bt ON bt.id=sr.blank_type_id
                          WHERE s.company_id=%s"""
                args = [company_id]
                if date_filter:
                    sql += " AND s.shift_date=%s"
                    args.append(date_filter)
                sql += " GROUP BY s.id, p.name, p.machine, e.name ORDER BY s.shift_date DESC, s.id DESC"
                cur.execute(sql, args)
            elif section == "places":
                cur.execute(f"SELECT * FROM {SCHEMA}.places WHERE company_id=%s AND active=TRUE", (company_id,))
            elif section == "employees":
                cur.execute(f"SELECT * FROM {SCHEMA}.employees WHERE company_id=%s AND active=TRUE", (company_id,))
            elif section == "blank_types":
                cur.execute(f"SELECT * FROM {SCHEMA}.blank_types WHERE company_id=%s AND active=TRUE", (company_id,))
            else:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown section"})}

            rows = cur.fetchall()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps([dict(r) for r in rows], default=str)}

        if method == "POST":
            body = json.loads(event.get("body") or "{}")

            if action == "create_task":
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.cutting_tasks
                        (company_id, blank_type_id, material_name, total_qty, status, deadline)
                        VALUES (%s,%s,%s,%s,'pending',%s) RETURNING id""",
                    (company_id, body.get("blankTypeId"), body.get("materialName",""),
                     body.get("totalQty",1), body.get("deadline"))
                )
                new_id = cur.fetchone()["id"]
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id})}

            if action == "assign_shift":
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.shifts
                        (company_id, place_id, employee_id, work_type, shift_date, status, started_at, task_id, task_qty_assigned)
                        VALUES (%s,%s,%s,%s,%s,'active',CURRENT_TIME::time,%s,%s) RETURNING id""",
                    (company_id, body.get("placeId"), body.get("employeeId"),
                     body.get("workType","cutting"), body.get("date"),
                     body.get("taskId"), body.get("taskQtyAssigned"))
                )
                shift_id = cur.fetchone()["id"]

                # Обновляем задачу: увеличиваем inProgressQty
                if body.get("taskId") and body.get("taskQtyAssigned"):
                    cur.execute(
                        f"""UPDATE {SCHEMA}.cutting_tasks
                            SET in_progress_qty=in_progress_qty+%s, status='active', updated_at=NOW()
                            WHERE id=%s AND company_id=%s""",
                        (body["taskQtyAssigned"], body["taskId"], company_id)
                    )
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": shift_id})}

            if action == "finish_shift":
                shift_id = body.get("shiftId")
                results  = body.get("results", [])

                # Проверяем что смена ещё активна — защита от двойного завершения
                cur.execute(
                    f"SELECT status FROM {SCHEMA}.shifts WHERE id=%s AND company_id=%s",
                    (shift_id, company_id)
                )
                shift_check = cur.fetchone()
                if not shift_check or shift_check["status"] != "active":
                    return {"statusCode": 409, "headers": CORS,
                            "body": json.dumps({"error": "shift already finished or not found"})}

                # Завершаем смену
                cur.execute(
                    f"""UPDATE {SCHEMA}.shifts
                        SET status='done', finished_at=CURRENT_TIME::time, updated_at=NOW()
                        WHERE id=%s AND company_id=%s""",
                    (shift_id, company_id)
                )

                # Получаем task_qty_assigned для защиты от превышения
                cur.execute(
                    f"SELECT task_qty_assigned FROM {SCHEMA}.shifts WHERE id=%s",
                    (shift_id,)
                )
                shift_meta = cur.fetchone()
                task_max = shift_meta["task_qty_assigned"] if shift_meta and shift_meta["task_qty_assigned"] else None

                # Записываем результаты
                total_produced_capped = 0
                for i, r in enumerate(results):
                    produced = int(r.get("produced", 0))
                    # Ограничиваем produced планом смены
                    if task_max is not None:
                        produced = min(produced, task_max - total_produced_capped)
                        produced = max(0, produced)
                    total_produced_capped += produced

                    raw_used = float(r.get("rawUsed", 0))
                    cur.execute(
                        f"""INSERT INTO {SCHEMA}.shift_results
                            (shift_id, blank_type_id, produced, raw_auto, raw_used, order_ref, sort_order)
                            VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                        (shift_id, r.get("blankTypeId"), produced,
                         r.get("rawAuto", True), raw_used,
                         r.get("orderId"), i)
                    )
                    # Увеличиваем количество заготовок по имени (blanks.name = blank_types.name)
                    if r.get("blankTypeId") and produced > 0:
                        cur.execute(
                            f"""UPDATE {SCHEMA}.blanks SET qty=qty+%s, updated_at=NOW()
                                WHERE name=(SELECT name FROM {SCHEMA}.blank_types WHERE id=%s LIMIT 1)
                                AND company_id=%s""",
                            (produced, r["blankTypeId"], company_id)
                        )

                # Снимаем резерв сырья по задаче и списываем фактически использованное
                cur.execute(
                    f"SELECT task_id FROM {SCHEMA}.shifts WHERE id=%s",
                    (shift_id,)
                )
                shift_task_row = cur.fetchone()
                if shift_task_row and shift_task_row["task_id"]:
                    task_id_for_reserve = shift_task_row["task_id"]
                    # Считаем сколько сырья фактически ушло в этой смене
                    actual_raw = sum(float(r.get("rawUsed", 0)) for r in results)
                    # Получаем зарезервированный материал
                    cur.execute(
                        f"""SELECT id, material_id, qty FROM {SCHEMA}.material_reserves
                            WHERE task_id=%s AND company_id=%s AND active=TRUE""",
                        (task_id_for_reserve, company_id)
                    )
                    reserve_row = cur.fetchone()
                    if reserve_row and actual_raw > 0:
                        mat_id_res = reserve_row["material_id"]
                        reserved_qty = float(reserve_row["qty"])
                        # Списываем фактически использованное (не больше чем зарезервировано)
                        to_deduct = min(actual_raw, reserved_qty)
                        cur.execute(
                            f"UPDATE {SCHEMA}.materials SET qty=GREATEST(0,qty-%s), updated_at=NOW() WHERE id=%s AND company_id=%s",
                            (to_deduct, mat_id_res, company_id)
                        )
                        cur.execute(
                            f"""SELECT qty FROM {SCHEMA}.materials WHERE id=%s""",
                            (mat_id_res,)
                        )
                        remain_row = cur.fetchone()
                        remain_after = float(remain_row["qty"]) if remain_row else None
                        # Запись в историю движений
                        cur.execute(
                            f"""INSERT INTO {SCHEMA}.warehouse_movements
                                (company_id, move_date, move_type, material_id, qty, note, remain_after)
                                VALUES (%s, CURRENT_DATE, 'use', %s, %s, %s, %s)""",
                            (company_id, mat_id_res, to_deduct,
                             f"Списание при завершении смены (задача #{task_id_for_reserve})",
                             remain_after)
                        )
                    # Снимаем резерв (деактивируем)
                    cur.execute(
                        f"""UPDATE {SCHEMA}.material_reserves
                            SET active=FALSE, released_at=NOW()
                            WHERE task_id=%s AND company_id=%s AND active=TRUE""",
                        (task_id_for_reserve, company_id)
                    )

                # Обновляем задачу
                cur.execute(
                    f"SELECT task_id, task_qty_assigned FROM {SCHEMA}.shifts WHERE id=%s",
                    (shift_id,)
                )
                shift_row = cur.fetchone()
                if shift_row and shift_row["task_id"]:
                    assigned = shift_row["task_qty_assigned"] or 0
                    # Используем уже ограниченное значение total_produced_capped
                    add_done = total_produced_capped
                    cur.execute(
                        f"""UPDATE {SCHEMA}.cutting_tasks
                            SET done_qty=LEAST(total_qty, done_qty+%s),
                                in_progress_qty=GREATEST(0,in_progress_qty-%s),
                                updated_at=NOW()
                            WHERE id=%s AND company_id=%s""",
                        (add_done, assigned, shift_row["task_id"], company_id)
                    )
                    # Проверяем выполнение — читаем актуальные значения после UPDATE
                    cur.execute(
                        f"SELECT total_qty, done_qty FROM {SCHEMA}.cutting_tasks WHERE id=%s",
                        (shift_row["task_id"],)
                    )
                    task = cur.fetchone()
                    if task and task["done_qty"] >= task["total_qty"]:
                        cur.execute(
                            f"UPDATE {SCHEMA}.cutting_tasks SET status='done', updated_at=NOW() WHERE id=%s",
                            (shift_row["task_id"],)
                        )
                    elif task:
                        # Если in_progress_qty стал 0 — возвращаем в pending
                        cur.execute(
                            f"""UPDATE {SCHEMA}.cutting_tasks
                                SET status=CASE WHEN in_progress_qty<=0 THEN 'pending' ELSE 'active' END,
                                    updated_at=NOW()
                                WHERE id=%s AND status='active'""",
                            (shift_row["task_id"],)
                        )

                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

            if action == "update_task":
                task_id = body.get("taskId")
                fields, vals = [], []
                for k, col in {"status":"status","doneQty":"done_qty","inProgressQty":"in_progress_qty"}.items():
                    if k in body:
                        fields.append(f"{col}=%s")
                        vals.append(body[k])
                if fields:
                    fields.append("updated_at=NOW()")
                    vals += [task_id, company_id]
                    cur.execute(
                        f"UPDATE {SCHEMA}.cutting_tasks SET {', '.join(fields)} WHERE id=%s AND company_id=%s",
                        vals
                    )
                    conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

            if action == "cancel_task":
                task_id = body.get("taskId")
                cur.execute(
                    f"UPDATE {SCHEMA}.cutting_tasks SET status='cancelled', updated_at=NOW() WHERE id=%s AND company_id=%s",
                    (task_id, company_id)
                )
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}

    finally:
        conn.close()