"""Склад: материалы, заготовки, движения, готовые изделия"""
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
    """Склад. GET /?section=materials|blanks|movements|stock. POST /?action=in|cut|use|adjust|add_material|add_blank|add_stock|update_stock_qty|remove_stock|use_blank|use_any"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = event.get("headers", {}).get("X-Session-Token", "")
    company_id = get_company_id(token)
    if not company_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    section = params.get("section", "materials")
    action  = params.get("action", "")

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET":
            if section == "materials":
                cur.execute(
                    f"SELECT * FROM {SCHEMA}.materials WHERE company_id=%s AND active=TRUE ORDER BY name",
                    (company_id,)
                )
            elif section == "blanks":
                cur.execute(
                    f"""SELECT b.*, m.name as material_name, m.unit as material_unit,
                               m.price as material_price,
                               bt.id as blank_type_id, bt.raw_per_unit
                        FROM {SCHEMA}.blanks b
                        LEFT JOIN {SCHEMA}.materials m ON m.id=b.material_id
                        LEFT JOIN {SCHEMA}.blank_types bt ON bt.name=b.name AND bt.company_id=b.company_id
                        WHERE b.company_id=%s ORDER BY b.name""",
                    (company_id,)
                )
            elif section == "movements":
                cur.execute(
                    f"""SELECT wm.*, m.name as material_name, b.name as blank_name
                        FROM {SCHEMA}.warehouse_movements wm
                        LEFT JOIN {SCHEMA}.materials m ON m.id=wm.material_id
                        LEFT JOIN {SCHEMA}.blanks b ON b.id=wm.blank_id
                        WHERE wm.company_id=%s
                        ORDER BY wm.move_date DESC, wm.id DESC
                        LIMIT 100""",
                    (company_id,)
                )
            elif section == "stock":
                cur.execute(
                    f"SELECT * FROM {SCHEMA}.stock_items WHERE company_id=%s ORDER BY added_at DESC",
                    (company_id,)
                )
            elif section == "reserves":
                # Резервы = все активные задачи нарезки (не done/cancelled),
                # у которых есть привязка к blank_type → material
                # Количество = raw_per_unit * (total_qty - done_qty)
                cur.execute(
                    f"""SELECT
                           ct.id          AS id,
                           m.id           AS material_id,
                           ct.id          AS task_id,
                           GREATEST(
                               ROUND(bt.raw_per_unit::numeric * GREATEST(ct.total_qty - ct.done_qty, 0), 3),
                               0
                           )              AS qty,
                           ct.status      AS task_status,
                           ct.material_name,
                           ct.total_qty,
                           ct.done_qty,
                           bt.name        AS blank_name,
                           bt.size        AS blank_size,
                           NULL           AS note
                        FROM {SCHEMA}.cutting_tasks ct
                        JOIN {SCHEMA}.blank_types bt ON bt.id = ct.blank_type_id
                        JOIN {SCHEMA}.materials m
                             ON m.company_id = ct.company_id
                            AND m.name = bt.material
                            AND m.active = TRUE
                        WHERE ct.company_id = %s
                          AND ct.status NOT IN ('done', 'cancelled')
                          AND (ct.total_qty - ct.done_qty) > 0
                        ORDER BY ct.created_at DESC""",
                    (company_id,)
                )
            else:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown section"})}

            rows = cur.fetchall()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps([dict(r) for r in rows], default=str)}

        if method == "POST":
            body = json.loads(event.get("body") or "{}")

            if action == "add_material":
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.materials
                        (company_id, name, unit, qty, min_qty, price, image_url)
                        VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                    (company_id, body["name"], body.get("unit","м²"),
                     body.get("qty",0), body.get("minQty",5),
                     body.get("price",0), body.get("imageUrl"))
                )
                new_id = cur.fetchone()["id"]
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id})}

            if action == "add_blank":
                name      = body["name"]
                size      = body.get("size", "")
                mat_id_b  = body.get("materialId")
                min_qty   = body.get("minQty", 0)
                raw_per_u = float(body.get("rawPerUnit", 0))

                # Автоматически считаем себестоимость из цены материала
                auto_cost = 0.0
                if mat_id_b and raw_per_u > 0:
                    cur.execute(f"SELECT price FROM {SCHEMA}.materials WHERE id=%s", (mat_id_b,))
                    mat_row = cur.fetchone()
                    if mat_row:
                        auto_cost = round(float(mat_row["price"]) * raw_per_u, 2)

                cur.execute(
                    f"""INSERT INTO {SCHEMA}.blanks
                        (company_id, material_id, name, size, qty, min_qty, cost_price, sale_price)
                        VALUES (%s,%s,%s,%s,0,%s,%s,0) RETURNING id""",
                    (company_id, mat_id_b or None, name, size, min_qty, auto_cost)
                )
                blank_id_new = cur.fetchone()["id"]

                # Создаём запись в blank_types (для нарезки)
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.blank_types
                        (company_id, name, size, material, raw_per_unit, active)
                        VALUES (%s,%s,%s,
                          COALESCE((SELECT name FROM {SCHEMA}.materials WHERE id=%s LIMIT 1),''),
                          %s, TRUE)
                        ON CONFLICT DO NOTHING""",
                    (company_id, name, size, mat_id_b, raw_per_u)
                )
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": blank_id_new})}

            if action in ("in", "cut", "use", "adjust"):
                mat_id   = body.get("materialId")
                blank_id = body.get("blankId")
                qty      = float(body.get("qty", 0))

                if action == "in" and mat_id:
                    new_price = body.get("pricePerUnit", 0) or 0
                    cur.execute(
                        f"UPDATE {SCHEMA}.materials SET qty=qty+%s, price=%s, updated_at=NOW() WHERE id=%s AND company_id=%s",
                        (qty, new_price, mat_id, company_id)
                    )
                    # Пересчитываем себестоимость всех заготовок из этого материала
                    if new_price and float(new_price) > 0:
                        cur.execute(
                            f"""UPDATE {SCHEMA}.blanks b
                                SET cost_price = ROUND(bt.raw_per_unit * %s, 2),
                                    updated_at = NOW()
                                FROM {SCHEMA}.blank_types bt
                                WHERE bt.name = b.name
                                  AND bt.company_id = b.company_id
                                  AND b.material_id = %s
                                  AND b.company_id = %s
                                  AND bt.raw_per_unit > 0""",
                            (float(new_price), mat_id, company_id)
                        )
                elif action == "use" and mat_id:
                    cur.execute(
                        f"UPDATE {SCHEMA}.materials SET qty=GREATEST(0,qty-%s), updated_at=NOW() WHERE id=%s AND company_id=%s",
                        (qty, mat_id, company_id)
                    )
                elif action == "cut" and mat_id and blank_id:
                    # Не списываем сырьё сразу — создаём резерв под задачу нарезки.
                    # Фактическое списание произойдёт в finish_shift.
                    task_id = body.get("taskId")
                    cur.execute(
                        f"""INSERT INTO {SCHEMA}.material_reserves
                            (company_id, material_id, task_id, qty, note)
                            VALUES (%s,%s,%s,%s,%s)""",
                        (company_id, mat_id, task_id, qty, body.get("note",""))
                    )

                remain = None
                if mat_id:
                    cur.execute(f"SELECT qty FROM {SCHEMA}.materials WHERE id=%s", (mat_id,))
                    row = cur.fetchone()
                    if row:
                        remain = float(row["qty"])

                # Записываем движение (для истории), но qty не трогает остаток при cut
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.warehouse_movements
                        (company_id, move_date, move_type, material_id, blank_id,
                         qty, price_per_unit, total_sum, note, receipt_id, order_ref, remain_after)
                        VALUES (%s, CURRENT_DATE, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id""",
                    (company_id, action, mat_id, blank_id, qty,
                     body.get("pricePerUnit"), body.get("totalSum"),
                     body.get("note",""), body.get("receiptId"),
                     body.get("orderRef"), remain)
                )
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"ok": True})}

            if action == "use_blank":
                blank_id = body.get("blankId")
                qty      = int(body.get("qty", 0))
                if not blank_id or qty <= 0:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "invalid params"})}
                cur.execute(
                    f"UPDATE {SCHEMA}.blanks SET qty=GREATEST(0,qty-%s), updated_at=NOW() WHERE id=%s AND company_id=%s",
                    (qty, blank_id, company_id)
                )
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.warehouse_movements
                        (company_id, move_date, move_type, blank_id, qty, note, order_ref)
                        VALUES (%s, CURRENT_DATE, 'use', %s, %s, %s, %s)""",
                    (company_id, blank_id, qty,
                     body.get("note", "Списание на заказ"),
                     body.get("orderRef"))
                )
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"ok": True})}

            if action == "use_any":
                # Универсальное списание: itemType = raw | blank | stock
                item_type = body.get("itemType")
                item_id   = body.get("itemId")
                qty       = float(body.get("qty", 0))
                note      = body.get("note", "Списание")
                order_ref = body.get("orderRef")
                if not item_type or not item_id or qty <= 0:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "invalid params"})}

                if item_type == "raw":
                    cur.execute(
                        f"UPDATE {SCHEMA}.materials SET qty=GREATEST(0,qty-%s), updated_at=NOW() WHERE id=%s AND company_id=%s RETURNING qty",
                        (qty, item_id, company_id)
                    )
                    row = cur.fetchone()
                    remain = float(row["qty"]) if row else None
                    cur.execute(
                        f"""INSERT INTO {SCHEMA}.warehouse_movements
                            (company_id, move_date, move_type, material_id, qty, note, order_ref, remain_after)
                            VALUES (%s, CURRENT_DATE, 'use', %s, %s, %s, %s, %s)""",
                        (company_id, item_id, qty, note, order_ref, remain)
                    )
                elif item_type == "blank":
                    cur.execute(
                        f"UPDATE {SCHEMA}.blanks SET qty=GREATEST(0,qty-%s), updated_at=NOW() WHERE id=%s AND company_id=%s RETURNING qty",
                        (int(qty), item_id, company_id)
                    )
                    row = cur.fetchone()
                    remain = float(row["qty"]) if row else None
                    cur.execute(
                        f"""INSERT INTO {SCHEMA}.warehouse_movements
                            (company_id, move_date, move_type, blank_id, qty, note, order_ref, remain_after)
                            VALUES (%s, CURRENT_DATE, 'use', %s, %s, %s, %s, %s)""",
                        (company_id, item_id, int(qty), note, order_ref, remain)
                    )
                elif item_type == "stock":
                    cur.execute(
                        f"UPDATE {SCHEMA}.stock_items SET qty=GREATEST(0,qty-%s) WHERE id=%s AND company_id=%s RETURNING qty",
                        (int(qty), item_id, company_id)
                    )
                    row = cur.fetchone()
                    remain = float(row["qty"]) if row else None
                    # stock_items не связан FK с движениями — пишем без material/blank, инфо в note
                    cur.execute(
                        f"""INSERT INTO {SCHEMA}.warehouse_movements
                            (company_id, move_date, move_type, qty, note, order_ref, remain_after)
                            VALUES (%s, CURRENT_DATE, 'use', %s, %s, %s, %s)""",
                        (company_id, int(qty), note, order_ref, remain)
                    )
                else:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown itemType"})}

                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"ok": True})}

            if action == "add_stock":
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.stock_items
                        (company_id, catalog_id, name, category, qty, price, cost_price, note)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                    (company_id, body.get("catalogId"), body["name"],
                     body.get("category","other"), body.get("qty",0),
                     body.get("price",0), body.get("costPrice",0), body.get("note"))
                )
                new_id = cur.fetchone()["id"]
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id})}

            if action == "update_stock_qty":
                item_id = body.get("id")
                delta   = int(body.get("delta", 0))
                cur.execute(
                    f"UPDATE {SCHEMA}.stock_items SET qty=GREATEST(0,qty+%s) WHERE id=%s AND company_id=%s RETURNING qty",
                    (delta, item_id, company_id)
                )
                row = cur.fetchone()
                conn.commit()
                new_qty = int(row["qty"]) if row else 0
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "qty": new_qty})}

            if action == "update_stock_cost":
                item_id    = body.get("id")
                cost_price = float(body.get("costPrice", 0))
                cur.execute(
                    f"UPDATE {SCHEMA}.stock_items SET cost_price=%s WHERE id=%s AND company_id=%s",
                    (cost_price, item_id, company_id)
                )
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

            if action == "remove_stock":
                item_id = body.get("id")
                cur.execute(
                    f"DELETE FROM {SCHEMA}.stock_items WHERE id=%s AND company_id=%s",
                    (item_id, company_id)
                )
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}

    finally:
        conn.close()