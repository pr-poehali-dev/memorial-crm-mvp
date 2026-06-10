"""AI-помощник на базе Alice AI (YandexGPT Foundation Models)"""
import json, os, hashlib
import urllib.request
import urllib.error

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_DB = True
except ImportError:
    HAS_DB = False

SCHEMA = "t_p9542363_memorial_crm_mvp"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

MODEL_URI  = "gpt://b1gjur90o0dnmfed3k1i/yandexgpt-lite/latest"
AI_API_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"

SYSTEM_PROMPT = """Ты — AI-помощник производственной CRM для изготовления памятников.
Твоя задача: отвечать на вопросы о заказах, клиентах, складе, производстве и аналитике.
Отвечай кратко, по существу, на русском языке. Используй данные которые тебе передают в контексте.
Если данных нет — говори об этом честно. Не придумывай цифры."""

def get_db():
    if not HAS_DB:
        raise RuntimeError("psycopg2 not available")
    return psycopg2.connect(os.environ["DATABASE_URL"])

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

def get_company_id(token: str):
    """Получаем company_id из токена (поддерживаем оба формата)"""
    if not token:
        return None
    secret = os.environ.get("SESSION_SECRET", "memorial-crm-secret")
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Новый формат (company_members)
    cur.execute(f"SELECT id, company_id, role, name FROM {SCHEMA}.company_members WHERE active=TRUE")
    members = cur.fetchall()
    for m in members:
        expected = sha256(f"member:{m['id']}:{m['company_id']}:{m['role']}:{secret}")
        if expected == token:
            conn.close()
            return m["company_id"]

    # Старый формат (users)
    cur.execute(f"SELECT id, login, company_id FROM {SCHEMA}.users WHERE active=TRUE")
    users = cur.fetchall()
    conn.close()
    for u in users:
        if sha256(f"{u['id']}:{u['login']}:{secret}") == token:
            return u["company_id"]
    return None

def get_crm_context(company_id: int) -> str:
    """Собираем актуальные данные CRM для контекста"""
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Заказы
    cur.execute(f"""
        SELECT id, client_name, stone, size, status, amount, paid,
               deadline, deadline_state
        FROM {SCHEMA}.orders
        WHERE company_id=%s
        ORDER BY order_date DESC LIMIT 20
    """, (company_id,))
    orders = cur.fetchall()

    # Склад (критичные позиции)
    cur.execute(f"""
        SELECT name, qty, min_qty, unit
        FROM {SCHEMA}.materials
        WHERE company_id=%s AND active=TRUE
        ORDER BY (qty - min_qty) ASC LIMIT 10
    """, (company_id,))
    materials = cur.fetchall()

    # Задачи нарезки
    cur.execute(f"""
        SELECT ct.id, bt.name as blank_name, ct.total_qty, ct.done_qty,
               ct.in_progress_qty, ct.status, ct.deadline
        FROM {SCHEMA}.cutting_tasks ct
        LEFT JOIN {SCHEMA}.blank_types bt ON bt.id=ct.blank_type_id
        WHERE ct.company_id=%s AND ct.status NOT IN ('done','cancelled')
        ORDER BY ct.created_at DESC LIMIT 10
    """, (company_id,))
    tasks = cur.fetchall()

    # Клиенты с долгами
    cur.execute(f"""
        SELECT client_name, SUM(amount-paid) as debt
        FROM {SCHEMA}.orders
        WHERE company_id=%s AND paid < amount
        GROUP BY client_name
        ORDER BY debt DESC LIMIT 5
    """, (company_id,))
    debtors = cur.fetchall()

    conn.close()

    # Формируем текстовый контекст
    lines = ["=== ТЕКУЩИЕ ДАННЫЕ CRM ===\n"]

    if orders:
        lines.append(f"ЗАКАЗЫ ({len(orders)} последних):")
        overdue = [o for o in orders if o.get("deadline_state") == "overdue"]
        in_work = [o for o in orders if o["status"] not in ("Выдан", "Готов")]
        lines.append(f"  В работе: {len(in_work)}, просрочено: {len(overdue)}")
        for o in overdue[:3]:
            lines.append(f"  ⚠ {o['id']} — {o['client_name']}, {o['status']}, дедлайн просрочен")
        lines.append("")

    if debtors:
        total_debt = sum(float(d['debt']) for d in debtors)
        lines.append(f"ДОЛГИ КЛИЕНТОВ (топ-5, всего ~{total_debt:,.0f} ₽):")
        for d in debtors:
            lines.append(f"  {d['client_name']}: {float(d['debt']):,.0f} ₽")
        lines.append("")

    if materials:
        critical = [m for m in materials if float(m['qty']) < float(m['min_qty'])]
        lines.append(f"СКЛАД (материалов: {len(materials)}, критичных: {len(critical)}):")
        for m in critical[:5]:
            lines.append(f"  🚨 {m['name']}: {m['qty']} {m['unit']} (мин. {m['min_qty']})")
        ok = [m for m in materials if float(m['qty']) >= float(m['min_qty'])][:3]
        for m in ok:
            lines.append(f"  ✓ {m['name']}: {m['qty']} {m['unit']}")
        lines.append("")

    if tasks:
        lines.append(f"ЗАДАЧИ НАРЕЗКИ ({len(tasks)} активных):")
        for t in tasks[:5]:
            done = t['done_qty'] or 0
            total = t['total_qty'] or 0
            lines.append(f"  {t['blank_name'] or 'Заготовка'}: {done}/{total} шт. ({t['status']})")
        lines.append("")

    return "\n".join(lines)

def call_alice(api_key: str, messages: list, context: str) -> str:
    """Вызов Alice AI через Yandex Foundation Models API"""
    system_with_context = SYSTEM_PROMPT + "\n\n" + context

    payload = {
        "modelUri": MODEL_URI,
        "completionOptions": {
            "stream": False,
            "temperature": 0.3,
            "maxTokens": 800,
        },
        "messages": [
            {"role": "system", "text": system_with_context},
        ] + messages,
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        AI_API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            result = json.loads(resp.read().decode())
            return result["result"]["alternatives"][0]["message"]["text"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"AI API error {e.code}: {body}")

def handler(event: dict, context) -> dict:
    """AI-помощник. POST /?action=chat — отправить сообщение"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token  = event.get("headers", {}).get("X-Session-Token", "")
    method = event.get("httpMethod", "POST")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "chat")

    if method != "POST":
        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}

    api_key = os.environ.get("ALICE_AI_API_KEY", "")
    if not api_key:
        return {"statusCode": 503, "headers": CORS, "body": json.dumps({"error": "AI не настроен"})}

    body = json.loads(event.get("body") or "{}")

    if action == "chat":
        # messages: [{"role": "user"|"assistant", "text": "..."}]
        messages = body.get("messages", [])
        if not messages:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "messages required"})}

        # Получаем CRM-контекст если есть токен
        crm_context = ""
        company_id = get_company_id(token)
        if company_id:
            try:
                crm_context = get_crm_context(company_id)
            except Exception:
                crm_context = ""

        # Ограничиваем историю последними 10 сообщениями
        recent = messages[-10:]

        reply = call_alice(api_key, recent, crm_context)
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"reply": reply})}

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}