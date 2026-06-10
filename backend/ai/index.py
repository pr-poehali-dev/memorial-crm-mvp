"""AI-помощник: DeepSeek v4 Flash через Yandex Cloud OpenAI-совместимый API"""
import json, os, hashlib, urllib.request, urllib.error

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_DB = True
except ImportError:
    HAS_DB = False

SCHEMA       = "t_p9542363_memorial_crm_mvp"
FOLDER_ID    = "b1g6in0q7dqbjupvnt58"
MODEL        = f"gpt://{FOLDER_ID}/deepseek-v4-flash/latest"
API_BASE     = "https://ai.api.cloud.yandex.net/v1"

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

SYSTEM_PROMPT = (
    "Ты — AI-помощник производственной CRM для изготовления памятников. "
    "Отвечай кратко, по делу, на русском языке. "
    "Используй данные CRM из контекста — не придумывай цифры. "
    "Если данных нет — честно скажи об этом."
)

# ── БД ────────────────────────────────────────────────────────────

def get_db():
    if not HAS_DB:
        raise RuntimeError("psycopg2 not available")
    return psycopg2.connect(os.environ["DATABASE_URL"])

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

def get_company_id(token: str):
    if not token:
        return None
    secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
    conn = get_db()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"SELECT id, company_id, role FROM {SCHEMA}.company_members WHERE active=TRUE")
    for m in cur.fetchall():
        if sha256(f"member:{m['id']}:{m['company_id']}:{m['role']}:{secret}") == token:
            conn.close()
            return m["company_id"]

    cur.execute(f"SELECT id, login, company_id FROM {SCHEMA}.users WHERE active=TRUE")
    for u in cur.fetchall():
        if sha256(f"{u['id']}:{u['login']}:{secret}") == token:
            conn.close()
            return u["company_id"]

    conn.close()
    return None

def get_crm_context(company_id: int) -> str:
    conn = get_db()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT id, client_name, stone, size, status, amount, paid, deadline, deadline_state
        FROM {SCHEMA}.orders WHERE company_id=%s ORDER BY order_date DESC LIMIT 20
    """, (company_id,))
    orders = cur.fetchall()

    cur.execute(f"""
        SELECT name, qty, min_qty, unit FROM {SCHEMA}.materials
        WHERE company_id=%s AND active=TRUE ORDER BY (qty-min_qty) ASC LIMIT 10
    """, (company_id,))
    materials = cur.fetchall()

    cur.execute(f"""
        SELECT client_name, SUM(amount-paid) as debt
        FROM {SCHEMA}.orders WHERE company_id=%s AND paid < amount
        GROUP BY client_name ORDER BY debt DESC LIMIT 5
    """, (company_id,))
    debtors = cur.fetchall()

    cur.execute(f"""
        SELECT ct.id, bt.name as blank_name, ct.total_qty, ct.done_qty, ct.status
        FROM {SCHEMA}.cutting_tasks ct
        LEFT JOIN {SCHEMA}.blank_types bt ON bt.id=ct.blank_type_id
        WHERE ct.company_id=%s AND ct.status NOT IN ('done','cancelled')
        ORDER BY ct.created_at DESC LIMIT 10
    """, (company_id,))
    tasks = cur.fetchall()

    conn.close()

    lines = ["=== ДАННЫЕ CRM ==="]

    if orders:
        overdue = [o for o in orders if o.get("deadline_state") == "overdue"]
        in_work = [o for o in orders if o["status"] not in ("Выдан", "Готов")]
        lines.append(f"\nЗАКАЗЫ: в работе {len(in_work)}, просрочено {len(overdue)}")
        for o in overdue[:5]:
            lines.append(f"  ⚠ {o['id']} — {o['client_name']}, статус: {o['status']}, просрочен")
        for o in [x for x in orders if x.get("deadline_state") != "overdue"][:3]:
            lines.append(f"  • {o['id']} — {o['client_name']}, {o['status']}, {o['amount']} ₽")

    if debtors:
        total = sum(float(d["debt"]) for d in debtors)
        lines.append(f"\nДОЛГИ: {total:,.0f} ₽ суммарно")
        for d in debtors:
            lines.append(f"  {d['client_name']}: {float(d['debt']):,.0f} ₽")

    if materials:
        critical = [m for m in materials if float(m["qty"]) < float(m["min_qty"])]
        lines.append(f"\nСКЛАД: критичных позиций {len(critical)}")
        for m in critical[:5]:
            lines.append(f"  🚨 {m['name']}: {m['qty']} {m['unit']} (мин {m['min_qty']})")
        for m in [x for x in materials if float(x["qty"]) >= float(x["min_qty"])][:3]:
            lines.append(f"  ✓ {m['name']}: {m['qty']} {m['unit']}")

    if tasks:
        lines.append(f"\nЗАДАЧИ НАРЕЗКИ: {len(tasks)} активных")
        for t in tasks[:5]:
            lines.append(f"  {t['blank_name'] or 'Заготовка'}: {t['done_qty'] or 0}/{t['total_qty']} шт.")

    return "\n".join(lines)

# ── AI API ────────────────────────────────────────────────────────

def call_ai(api_key: str, messages: list, system: str) -> str:
    """OpenAI Responses API (Yandex Cloud)"""
    payload = {
        "model":            MODEL,
        "instructions":     system,
        "input":            messages[-1]["content"] if messages else "",
        "temperature":      0.3,
        "max_output_tokens": 800,
    }

    # Если есть история — передаём через input как массив
    if len(messages) > 1:
        payload["input"] = messages  # массив {"role":..., "content":...}

    data = json.dumps(payload).encode()
    req  = urllib.request.Request(
        f"{API_BASE}/responses",
        data=data,
        headers={
            "Content-Type":   "application/json",
            "Authorization":  f"Api-Key {api_key}",
            "OpenAI-Project": FOLDER_ID,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            # Responses API → output_text
            return result.get("output_text") or result.get("choices", [{}])[0].get("message", {}).get("content", "Нет ответа")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"AI error {e.code}: {body}")

# ── Handler ───────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """POST /?action=chat  body: {messages:[{role,content}]}"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}

    api_key = os.environ.get("ALICE_AI_API_KEY", "")
    if not api_key:
        return {"statusCode": 503, "headers": CORS, "body": json.dumps({"error": "AI ключ не настроен"})}

    token   = event.get("headers", {}).get("X-Session-Token", "")
    body    = json.loads(event.get("body") or "{}")
    messages = body.get("messages", [])

    if not messages:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "messages required"})}

    # Собираем CRM-контекст
    crm_ctx = ""
    try:
        company_id = get_company_id(token)
        if company_id:
            crm_ctx = get_crm_context(company_id)
    except Exception as e:
        crm_ctx = f"(данные CRM недоступны: {e})"

    system = SYSTEM_PROMPT + ("\n\n" + crm_ctx if crm_ctx else "")

    try:
        reply = call_ai(api_key, messages[-10:], system)
    except RuntimeError as e:
        return {"statusCode": 502, "headers": CORS, "body": json.dumps({"error": str(e)})}

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"reply": reply})}
