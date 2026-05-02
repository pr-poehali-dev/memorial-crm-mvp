"""CRUD клиентов"""
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
    """Клиенты: GET / (список), GET /?id=1 (один с заказами), POST / (создать), PUT /?id=1 (обновить)"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = event.get("headers", {}).get("X-Session-Token", "")
    company_id = get_company_id(token)
    if not company_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    client_id = params.get("id")

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET":
            if client_id:
                cur.execute(
                    f"""SELECT c.*,
                        COUNT(DISTINCT o.id) as orders_count,
                        COALESCE(SUM(o.amount),0) as total_amount,
                        COALESCE(SUM(o.paid),0) as total_paid,
                        MAX(o.order_date) as last_order_date,
                        COALESCE(
                          json_agg(DISTINCT jsonb_build_object(
                            'id',o.id,'status',o.status,'statusColor',o.status_color,
                            'amount',o.amount,'paid',o.paid,'orderDate',o.order_date
                          )) FILTER (WHERE o.id IS NOT NULL), '[]'
                        ) as orders,
                        COALESCE(
                          json_agg(DISTINCT jsonb_build_object(
                            'id',cm.id,'author',cm.author,'text',cm.text,'createdAt',cm.created_at
                          )) FILTER (WHERE cm.id IS NOT NULL), '[]'
                        ) as comments
                        FROM {SCHEMA}.clients c
                        LEFT JOIN {SCHEMA}.orders o ON o.client_id=c.id
                        LEFT JOIN {SCHEMA}.comments cm ON cm.client_id=c.id
                        WHERE c.id=%s AND c.company_id=%s
                        GROUP BY c.id""",
                    (client_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
                return {"statusCode": 200, "headers": CORS, "body": json.dumps(dict(row), default=str)}
            else:
                cur.execute(
                    f"""SELECT c.*,
                        COUNT(DISTINCT o.id) as orders_count,
                        COALESCE(SUM(o.amount),0) as total_amount,
                        COALESCE(SUM(o.paid),0) as total_paid,
                        MAX(o.order_date) as last_order_date
                        FROM {SCHEMA}.clients c
                        LEFT JOIN {SCHEMA}.orders o ON o.client_id=c.id
                        WHERE c.company_id=%s
                        GROUP BY c.id
                        ORDER BY c.created_at DESC""",
                    (company_id,)
                )
                rows = cur.fetchall()
                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps([dict(r) for r in rows], default=str)}

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            cur.execute(
                f"""INSERT INTO {SCHEMA}.clients
                    (company_id, name, phone, city, address, active, comment, manager, since_label)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (company_id, body.get("name",""), body.get("phone",""),
                 body.get("city",""), body.get("address",""),
                 body.get("active", True), body.get("comment",""),
                 body.get("manager",""), body.get("sinceLabel",""))
            )
            new_id = cur.fetchone()["id"]
            conn.commit()
            return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id})}

        if method == "PUT":
            if not client_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
            body = json.loads(event.get("body") or "{}")
            fields, vals = [], []
            for key, col in {"name":"name","phone":"phone","city":"city","address":"address",
                             "active":"active","comment":"comment","manager":"manager"}.items():
                if key in body:
                    fields.append(f"{col}=%s")
                    vals.append(body[key])
            if not fields:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "no fields"})}
            fields.append("updated_at=NOW()")
            vals += [client_id, company_id]
            cur.execute(
                f"UPDATE {SCHEMA}.clients SET {', '.join(fields)} WHERE id=%s AND company_id=%s",
                vals
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    finally:
        conn.close()

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
