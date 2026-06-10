"""Авторизация + каталог + admin + вход по slug"""
import json, hashlib, os, time
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9542363_memorial_crm_mvp"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

ROLES = {
    "owner":      "Владелец",
    "manager":    "Менеджер",
    "production": "Производство",
    "estimator":  "Сметчик",
    "accountant": "Бухгалтер",
}

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

def make_token(member_id: int, company_id: int, role: str) -> str:
    secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
    return sha256(f"member:{member_id}:{company_id}:{role}:{secret}")

def get_session(token: str):
    """Возвращает (company_id, role, member_id, name) или None"""
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        f"""SELECT m.id, m.company_id, m.role, m.name
            FROM {SCHEMA}.company_members m
            WHERE m.active=TRUE""",
    )
    rows = cur.fetchall()
    conn.close()
    secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
    for r in rows:
        expected = sha256(f"member:{r['id']}:{r['company_id']}:{r['role']}:{secret}")
        if expected == token:
            return r
    return None

def handler(event: dict, context) -> dict:
    """Auth + Admin + Каталог. section=slug_entry|slug_roles|enter_role|me|admin_*|catalog"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method  = event.get("httpMethod", "GET")
    params  = event.get("queryStringParameters") or {}
    section = params.get("section", "")
    token   = event.get("headers", {}).get("X-Session-Token", "")

    # ── Получить компанию по slug ──
    if section == "slug_entry":
        slug = params.get("slug", "").strip()
        if not slug:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "slug required"})}
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"SELECT id, name FROM {SCHEMA}.companies WHERE slug=%s AND active=TRUE",
            (slug,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Компания не найдена"})}
        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"id": row["id"], "name": row["name"]})}

    # ── Список сотрудников компании (для выбора роли) ──
    if section == "slug_roles":
        slug = params.get("slug", "").strip()
        if not slug:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "slug required"})}
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT m.id, m.name, m.role
                FROM {SCHEMA}.company_members m
                JOIN {SCHEMA}.companies c ON c.id=m.company_id
                WHERE c.slug=%s AND c.active=TRUE AND m.active=TRUE
                ORDER BY m.id""",
            (slug,)
        )
        members = [dict(r) for r in cur.fetchall()]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(members)}

    # ── Войти как сотрудник (без пароля) ──
    if section == "enter_role" and method == "POST":
        body = json.loads(event.get("body") or "{}")
        member_id = body.get("memberId")
        if not member_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "memberId required"})}
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT m.id, m.company_id, m.role, m.name, c.name as company_name, c.slug
                FROM {SCHEMA}.company_members m
                JOIN {SCHEMA}.companies c ON c.id=m.company_id
                WHERE m.id=%s AND m.active=TRUE AND c.active=TRUE""",
            (member_id,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
        tok = make_token(row["id"], row["company_id"], row["role"])
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "token": tok,
            "user": {
                "id": row["id"],
                "login": row["name"],
                "displayName": row["name"],
                "role": row["role"],
                "companyId": row["company_id"],
                "companyName": row["company_name"],
                "slug": row["slug"],
            }
        })}

    # ── Me (проверка токена) ──
    if section == "me" or (method == "GET" and not section):
        sess = get_session(token)
        if not sess:
            # Попробуем старую схему users (обратная совместимость)
            if token:
                secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
                conn = get_db()
                cur = conn.cursor()
                cur.execute(f"SELECT id, login, display_name, role, company_id FROM {SCHEMA}.users WHERE active=TRUE")
                rows = cur.fetchall()
                conn.close()
                for uid, ulogin, display_name, role, company_id in rows:
                    if sha256(f"{uid}:{ulogin}:{secret}") == token:
                        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                            "user": {"id": uid, "login": ulogin, "displayName": display_name or ulogin,
                                     "role": role, "companyId": company_id}
                        })}
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "invalid token"})}
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"SELECT name FROM {SCHEMA}.companies WHERE id=%s", (sess["company_id"],))
        comp = cur.fetchone()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "user": {
                "id": sess["id"],
                "login": sess["name"],
                "displayName": sess["name"],
                "role": sess["role"],
                "companyId": sess["company_id"],
                "companyName": comp["name"] if comp else "",
            }
        })}

    # ── ADMIN: список компаний ──
    if section == "admin_companies" and method == "GET":
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT c.id, c.name, c.slug, c.active, c.created_at,
                       COUNT(m.id) as members_count
                FROM {SCHEMA}.companies c
                LEFT JOIN {SCHEMA}.company_members m ON m.company_id=c.id AND m.active=TRUE
                GROUP BY c.id ORDER BY c.id""",
        )
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(rows, default=str)}

    # ── ADMIN: создать компанию ──
    if section == "admin_companies" and method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = body.get("name", "").strip()
        if not name:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "name required"})}
        # Генерируем slug из имени
        import re
        slug_base = re.sub(r'[^a-z0-9а-яё]', '-', name.lower())
        slug_base = re.sub(r'-+', '-', slug_base).strip('-')[:40] or "company"
        conn = get_db()
        cur = conn.cursor()
        # Уникальность slug
        slug = slug_base
        i = 1
        while True:
            cur.execute(f"SELECT 1 FROM {SCHEMA}.companies WHERE slug=%s", (slug,))
            if not cur.fetchone():
                break
            slug = f"{slug_base}-{i}"
            i += 1
        cur.execute(
            f"INSERT INTO {SCHEMA}.companies (name, slug) VALUES (%s, %s) RETURNING id",
            (name, slug)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id, "slug": slug})}

    # ── ADMIN: сотрудники компании ──
    if section == "admin_members" and method == "GET":
        company_id = params.get("company_id")
        if not company_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "company_id required"})}
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"SELECT id, name, role, active, created_at FROM {SCHEMA}.company_members WHERE company_id=%s ORDER BY id",
            (company_id,)
        )
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(rows, default=str)}

    # ── ADMIN: добавить сотрудника ──
    if section == "admin_members" and method == "POST":
        body = json.loads(event.get("body") or "{}")
        company_id = body.get("companyId")
        name = body.get("name", "").strip()
        role = body.get("role", "manager")
        if not company_id or not name:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "companyId and name required"})}
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.company_members (company_id, name, role) VALUES (%s,%s,%s) RETURNING id",
            (company_id, name, role)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id})}

    # ── ADMIN: обновить сотрудника ──
    if section == "admin_members" and method == "PUT":
        body = json.loads(event.get("body") or "{}")
        member_id = params.get("id")
        conn = get_db()
        cur = conn.cursor()
        fields, vals = [], []
        for k, col in {"name": "name", "role": "role", "active": "active"}.items():
            if k in body:
                fields.append(f"{col}=%s")
                vals.append(body[k])
        if fields:
            vals.append(member_id)
            cur.execute(f"UPDATE {SCHEMA}.company_members SET {', '.join(fields)} WHERE id=%s", vals)
            conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # ── Каталог ──
    if section == "catalog":
        sess = get_session(token)
        company_id = sess["company_id"] if sess else None
        if not company_id:
            # fallback old users
            from psycopg2.extras import RealDictCursor as RDC
            secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
            conn2 = get_db()
            cur2 = conn2.cursor()
            cur2.execute(f"SELECT id, login, company_id FROM {SCHEMA}.users WHERE active=TRUE")
            for uid, ulogin, cid in cur2.fetchall():
                if sha256(f"{uid}:{ulogin}:{secret}") == token:
                    company_id = cid
                    break
            conn2.close()
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
                for k, col in {"name":"name","price":"price","cost":"cost","active":"active","comment":"comment"}.items():
                    if k in body:
                        fields.append(f"{col}=%s")
                        vals.append(body[k])
                if fields:
                    fields.append("updated_at=NOW()")
                    vals += [item_id, company_id]
                    cur.execute(f"UPDATE {SCHEMA}.catalog_items SET {', '.join(fields)} WHERE id=%s AND company_id=%s", vals)
                    conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
        finally:
            conn.close()

    # ── Старый login (обратная совместимость) ──
    if section == "login" or (method == "POST" and not section):
        body = json.loads(event.get("body") or "{}")
        login_val = body.get("login", "").strip()
        password  = body.get("password", "").strip()
        if not login_val or not password:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "login and password required"})}
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
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный логин или пароль"})}
        uid, display_name, role, company_id, company_name = row
        secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
        tok = sha256(f"{uid}:{login_val}:{secret}")
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "token": tok,
            "user": {"id": uid, "login": login_val, "displayName": display_name,
                     "role": role, "companyId": company_id, "companyName": company_name}
        })}

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown section"})}
