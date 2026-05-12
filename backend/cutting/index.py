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
                              'blankName',bt.name,'produced',sr.produced,
                              'rawUsed',sr.raw_used,'orderRef',sr.order_ref
                            )) FILTER (WHERE sr.id IS NOT NULL), '[]'
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

                # Завершаем смену
                cur.execute(
                    f"""UPDATE {SCHEMA}.shifts
                        SET status='done', finished_at=CURRENT_TIME::time, updated_at=NOW()
                        WHERE id=%s AND company_id=%s""",
                    (shift_id, company_id)
                )

                # Записываем результаты
                for i, r in enumerate(results):
                    cur.execute(
                        f"""INSERT INTO {SCHEMA}.shift_results
                            (shift_id, blank_type_id, produced, raw_auto, raw_used, order_ref, sort_order)
                            VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                        (shift_id, r.get("blankTypeId"), r.get("produced",0),
                         r.get("rawAuto",True), r.get("rawUsed",0),
                         r.get("orderId"), i)
                    )
                    # Увеличиваем количество заготовок
                    if r.get("blankTypeId") and r.get("produced",0) > 0:
                        cur.execute(
                            f"""UPDATE {SCHEMA}.blanks SET qty=qty+%s, updated_at=NOW()
                                WHERE material_id=(
                                  SELECT m.id FROM {SCHEMA}.materials m
                                  JOIN {SCHEMA}.blank_types bt ON bt.material=m.name
                                  WHERE bt.id=%s AND m.company_id=%s LIMIT 1
                                ) AND company_id=%s""",
                            (r["produced"], r["blankTypeId"], company_id, company_id)
                        )

                # Обновляем задачу
                cur.execute(
                    f"SELECT task_id, task_qty_assigned FROM {SCHEMA}.shifts WHERE id=%s",
                    (shift_id,)
                )
                shift_row = cur.fetchone()
                if shift_row and shift_row["task_id"]:
                    total_produced = sum(r.get("produced",0) for r in results)
                    assigned = shift_row["task_qty_assigned"] or 0
                    cur.execute(
                        f"""UPDATE {SCHEMA}.cutting_tasks
                            SET done_qty=done_qty+%s,
                                in_progress_qty=GREATEST(0,in_progress_qty-%s),
                                updated_at=NOW()
                            WHERE id=%s AND company_id=%s""",
                        (total_produced, assigned, shift_row["task_id"], company_id)
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