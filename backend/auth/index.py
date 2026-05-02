"""Авторизация + каталог (объединённая функция)"""
import json, hashlib, os, time
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

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

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
        if sha256(f"{uid}:{login}:{secret}") == token:
            return cid
    return None

def handler(event: dict, context) -> dict:
    """Auth (?section=login или GET) и Каталог (?section=catalog)"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    section = params.get("section", "")
    token = event.get("headers", {}).get("X-Session-Token", "")

    # ── Login ──
    if section == "login" or (method == "POST" and not section):
        body = json.loads(event.get("body") or "{}")
        login_val = body.get("login", "").strip()
        password = body.get("password", "").strip()
        if not login_val or not password:
            return {"statusCode": 400, "headers": CORS,
                    "body": json.dumps({"error": "login and password required"})}
        pw_hash = sha256(password)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.id, u.display_name, u.role, u.company_id, c.name
                FROM {SCHEMA}.users u JOIN {SCHEMA}.companies c ON c.id=u.company_id
                WHERE u.login=%s AND u.password_hash=%s AND u.active=TRUE""",
            (login_val, pw_hash)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": CORS,
                    "body": json.dumps({"error": "Неверный логин или пароль"})}
        uid, display_name, role, company_id, company_name = row
        secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
        tok = sha256(f"{uid}:{login_val}:{secret}")
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "token": tok,
            "user": {"id": uid, "login": login_val, "displayName": display_name,
                     "role": role, "companyId": company_id, "companyName": company_name}
        })}

    # ── Me ──
    if section == "me" or (method == "GET" and not section):
        if not token:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "no token"})}
        secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, login, display_name, role, company_id FROM {SCHEMA}.users WHERE active=TRUE")
        rows = cur.fetchall()
        conn.close()
        for uid, ulogin, display_name, role, company_id in rows:
            if sha256(f"{uid}:{ulogin}:{secret}") == token:
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                    "user": {"id": uid, "login": ulogin, "displayName": display_name,
                             "role": role, "companyId": company_id}
                })}
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "invalid token"})}

    # ── Каталог ──
    if section == "catalog":
        company_id = get_company_id(token)
        if not company_id:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            if method == "GET":
                cur.execute(
                    f"""SELECT ci.*, COALESCE(si.qty,0) as stock_qty
                        FROM {SCHEMA}.catalog_items ci
                        LEFT JOIN {SCHEMA}.stock_items si ON si.catalog_id=ci.id AND si.company_id=ci.company_id
                        WHERE ci.company_id=%s ORDER BY ci.category, ci.name""",
                    (company_id,)
                )
                rows = cur.fetchall()
                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps([dict(r) for r in rows], default=str)}
            if method == "POST":
                body = json.loads(event.get("body") or "{}")
                new_id = f"ci{int(time.time())}"
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.catalog_items
                        (id, company_id, name, category, unit, price, cost, calc_type, active, comment, created_by)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                    (new_id, company_id, body.get("name",""), body.get("category","other"),
                     body.get("unit","шт."), body.get("price",0), body.get("cost",0),
                     body.get("calcType","fixed"), body.get("active",True),
                     body.get("comment",""), body.get("createdBy",""))
                )
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id})}
            if method == "PUT":
                item_id = params.get("id")
                body = json.loads(event.get("body") or "{}")
                fields, vals = [], []
                for k, col in {"name":"name","price":"price","cost":"cost",
                               "active":"active","comment":"comment"}.items():
                    if k in body:
                        fields.append(f"{col}=%s")
                        vals.append(body[k])
                if fields:
                    fields.append("updated_at=NOW()")
                    vals += [item_id, company_id]
                    cur.execute(
                        f"UPDATE {SCHEMA}.catalog_items SET {', '.join(fields)} WHERE id=%s AND company_id=%s",
                        vals
                    )
                    conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
        finally:
            conn.close()

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown section"})}
