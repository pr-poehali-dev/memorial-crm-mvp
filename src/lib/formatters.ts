/**
 * Централизованные форматтеры — меняй здесь, работает везде.
 */

/* ── Даты ──────────────────────────────────────────────────── */

/** "2026-04-12" → "12.04.2026" */
export function fDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  if (typeof value === "string" && /^\d{2}\.\d{2}\.\d{4}$/.test(value)) return value;
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ru-RU");
  } catch {
    return "—";
  }
}

/** "2026-04-12" → "12 апр" */
export function fDateShort(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
  } catch {
    return "—";
  }
}

/** "2026-04-12T08:00:00" → "08:00" */
export function fTime(value: string | null | undefined): string {
  if (!value) return "—";
  const t = value.substring(0, 5);
  return /^\d{2}:\d{2}$/.test(t) ? t : "—";
}

/** ISO → "DD.MM" (для коротких меток) */
export function fDateDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

/* ── Деньги ────────────────────────────────────────────────── */

/**
 * Умное форматирование суммы:
 * 1 234 567 → "1.2 млн ₽"
 * 45 000    → "45 тыс. ₽"
 * 980       → "980 ₽"
 */
export function fMoney(value: number | null | undefined): string {
  const v = value ?? 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru")} ₽`;
}

/** Полный формат без сокращений: 38 500 ₽ */
export function fMoneyFull(value: number | null | undefined): string {
  return `${(value ?? 0).toLocaleString("ru")} ₽`;
}

/* ── Числа ─────────────────────────────────────────────────── */

/** 2.50000 → "2.5" (убирает лишние нули) */
export function fNum(value: number, decimals = 2): string {
  return +value.toFixed(decimals) + "";
}

/** Площадь: 2.5 → "2.5 м²" */
export function fArea(value: number | null | undefined): string {
  return `${fNum(value ?? 0)} м²`;
}

/** Штуки: 5 → "5 шт." */
export function fQty(value: number | null | undefined): string {
  return `${value ?? 0} шт.`;
}
