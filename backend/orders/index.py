"""CRUD заказов для компании пользователя"""
import json, os, hashlib
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9542363_memorial_crm_mvp"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    """Заказы: GET / (список), GET /?id=МП-0041, POST / (создать), PUT /?id=... (обновить)"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = event.get("headers", {}).get("X-Session-Token", "")
    company_id = get_company_id(token)
    if not company_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    order_id = params.get("id")

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET":
            if order_id:
                # Один заказ с позициями и комментариями
                cur.execute(
                    f"""SELECT o.*,
                        COALESCE(
                          json_agg(DISTINCT jsonb_build_object(
                            'id',oi.id,'name',oi.name,'qty',oi.qty,'unit',oi.unit,
                            'price',oi.price,'approved',oi.approved,'hasCalc',oi.has_calc,
                            'sortOrder',oi.sort_order
                          )) FILTER (WHERE oi.id IS NOT NULL), '[]'
                        ) as items,
                        COALESCE(
                          json_agg(DISTINCT jsonb_build_object(
                            'id',cm.id,'author',cm.author,'text',cm.text,
                            'createdAt',cm.created_at
                          )) FILTER (WHERE cm.id IS NOT NULL), '[]'
                        ) as comments
                        FROM {SCHEMA}.orders o
                        LEFT JOIN {SCHEMA}.order_items oi ON oi.order_id=o.id
                        LEFT JOIN {SCHEMA}.comments cm ON cm.order_id=o.id
                        WHERE o.id=%s AND o.company_id=%s
                        GROUP BY o.id""",
                    (order_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
                return {"statusCode": 200, "headers": CORS, "body": json.dumps(dict(row), default=str)}
            else:
                # Список заказов
                cur.execute(
                    f"""SELECT o.id, o.client_name, o.phone, o.stone, o.size,
                        o.status, o.status_color, o.amount, o.paid, o.order_date,
                        o.deadline, o.manager, o.comment, o.current_stage,
                        CASE
                          WHEN o.deadline < CURRENT_DATE AND o.status NOT IN ('Выдан') THEN 'overdue'
                          WHEN o.deadline <= CURRENT_DATE + 7 AND o.status NOT IN ('Выдан') THEN 'soon'
                          WHEN o.status = 'Выдан' THEN 'done'
                          ELSE 'ok'
                        END as deadline_state,
                        CASE
                          WHEN o.paid >= o.amount THEN 'paid'
                          WHEN o.paid > 0 THEN 'partial'
                          ELSE 'unpaid'
                        END as pay_status
                        FROM {SCHEMA}.orders o
                        WHERE o.company_id=%s
                        ORDER BY o.order_date DESC, o.id DESC""",
                    (company_id,)
                )
                rows = cur.fetchall()
                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps([dict(r) for r in rows], default=str)}

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            # Генерация ID заказа
            cur.execute(
                f"SELECT id FROM {SCHEMA}.orders WHERE company_id=%s ORDER BY created_at DESC LIMIT 1",
                (company_id,)
            )
            last = cur.fetchone()
            if last and last["id"].startswith("МП-"):
                num = int(last["id"].replace("МП-", "")) + 1
            else:
                cur.execute(f"SELECT COUNT(*)+1 FROM {SCHEMA}.orders WHERE company_id=%s", (company_id,))
                num = cur.fetchone()["count"]
            new_id = f"МП-{num:04d}"

            cur.execute(
                f"""INSERT INTO {SCHEMA}.orders
                    (id, company_id, client_id, client_name, phone, stone, size,
                     inscription, design, status, status_color, amount, paid,
                     order_date, deadline, manager, comment, current_stage)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                            COALESCE(%s::date, CURRENT_DATE),
                            %s::date,%s,%s,%s)
                    RETURNING id""",
                (new_id, company_id,
                 body.get("clientId"), body.get("clientName", ""),
                 body.get("phone", ""), body.get("stone", ""), body.get("size", ""),
                 body.get("inscription", ""), body.get("design", ""),
                 body.get("status", "Эскиз"), body.get("statusColor", "#6366f1"),
                 body.get("amount", 0), body.get("paid", 0),
                 body.get("orderDate"), body.get("deadline"),
                 body.get("manager", ""), body.get("comment", ""),
                 body.get("currentStage", 0))
            )
            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"id": new_id})}

        if method == "PUT":
            if not order_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
            body = json.loads(event.get("body") or "{}")
            fields = []
            vals = []
            mapping = {
                "status": "status", "statusColor": "status_color",
                "currentStage": "current_stage", "amount": "amount",
                "paid": "paid", "comment": "comment", "manager": "manager",
                "stone": "stone", "size": "size",
            }
            for key, col in mapping.items():
                if key in body:
                    fields.append(f"{col}=%s")
                    vals.append(body[key])
            if not fields:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "no fields"})}
            fields.append("updated_at=NOW()")
            vals += [order_id, company_id]
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET {', '.join(fields)} WHERE id=%s AND company_id=%s",
                vals
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    finally:
        conn.close()

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
