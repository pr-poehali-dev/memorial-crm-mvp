import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Shift, today, yesterday } from "../cutting/cutting.types";
import TodayTab     from "./ProcessTodayTab";
import YesterdayTab from "./ProcessYesterdayTab";
import JournalTab   from "./ProcessJournalTab";
import AnalyticsTab from "./ProcessAnalyticsTab";

type ProcessSubTab = "today" | "yesterday" | "journal" | "analytics";

export default function ProcessTab({ shifts }: { shifts: Shift[] }) {
  const [sub, setSub] = useState<ProcessSubTab>("today");

  const todayActive = shifts.filter(s => s.date === today && s.status === "active").length;
  const todayDone   = shifts.filter(s => s.date === today && s.status === "done").length;
  const yDone       = shifts.filter(s => s.date === yesterday && s.status === "done").length;

  const TABS: { key: ProcessSubTab; label: string; badge?: number }[] = [
    { key: "today",     label: "Сегодня",   badge: todayActive > 0 ? todayActive : undefined },
    { key: "yesterday", label: "Вчера",     badge: yDone > 0 ? yDone : undefined },
    { key: "journal",   label: "Журнал",    badge: undefined },
    { key: "analytics", label: "Аналитика", badge: undefined },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Подвкладки */}
      <div className="shrink-0 flex items-center gap-0 border-b border-[#f0f0f0] bg-white px-7">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-all ${
              sub === t.key
                ? "border-[#1a1a1a] text-[#1a1a1a]"
                : "border-transparent text-[#9b9b9b] hover:text-[#4b4b4b]"
            }`}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                sub === t.key ? "bg-[#1a1a1a] text-white" : "bg-green-100 text-green-700"
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto text-[11px] text-[#c0c0c0] py-3">
          {todayActive > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              {todayActive} в работе · {todayDone} завершено сегодня
            </span>
          )}
        </div>
      </div>

      {/* Контент */}
      {sub === "today"     && <TodayTab     shifts={shifts} />}
      {sub === "yesterday" && <YesterdayTab shifts={shifts} />}
      {sub === "journal"   && <JournalTab   shifts={shifts} />}
      {sub === "analytics" && <AnalyticsTab shifts={shifts} />}
    </div>
  );
}
