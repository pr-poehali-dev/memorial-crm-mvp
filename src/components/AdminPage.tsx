import { useState, useEffect } from "react";
import { authApi } from "@/api/client";
import Icon from "@/components/ui/icon";

const ROLE_LABELS: Record<string, string> = {
  owner:      "Владелец",
  manager:    "Менеджер",
  production: "Производство",
  estimator:  "Сметчик",
  accountant: "Бухгалтер",
};

type Company = { id: number; name: string; slug: string; active: boolean; created_at: string; members_count: number };
type Member  = { id: number; name: string; role: string; active: boolean };

function getEntryUrl(slug: string): string {
  return `${window.location.origin}/?company=${slug}`;
}

export default function AdminPage() {
  const [companies, setCompanies]   = useState<Company[]>([]);
  const [selected,  setSelected]    = useState<Company | null>(null);
  const [members,   setMembers]     = useState<Member[]>([]);
  const [loading,   setLoading]     = useState(true);
  const [copied,    setCopied]      = useState<string | null>(null);

  /* Форма новой компании */
  const [showAddCo, setShowAddCo]   = useState(false);
  const [newCoName, setNewCoName]   = useState("");
  const [savingCo,  setSavingCo]    = useState(false);

  /* Форма нового сотрудника */
  const [showAddM,  setShowAddM]    = useState(false);
  const [newMName,  setNewMName]    = useState("");
  const [newMRole,  setNewMRole]    = useState("manager");
  const [savingM,   setSavingM]     = useState(false);

  const loadCompanies = () => {
    setLoading(true);
    authApi.adminCompanies()
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadMembers = (co: Company) => {
    setSelected(co);
    authApi.adminMembers(co.id).then(setMembers).catch(console.error);
  };

  useEffect(() => { loadCompanies(); }, []);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(getEntryUrl(slug));
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const createCompany = async () => {
    if (!newCoName.trim()) return;
    setSavingCo(true);
    await authApi.adminCreateCompany(newCoName.trim()).catch(console.error);
    setNewCoName(""); setShowAddCo(false); setSavingCo(false);
    loadCompanies();
  };

  const addMember = async () => {
    if (!selected || !newMName.trim()) return;
    setSavingM(true);
    await authApi.adminAddMember(selected.id, newMName.trim(), newMRole).catch(console.error);
    setNewMName(""); setNewMRole("manager"); setShowAddM(false); setSavingM(false);
    loadMembers(selected);
    loadCompanies();
  };

  const toggleMember = async (m: Member) => {
    await authApi.adminUpdateMember(m.id, { active: !m.active }).catch(console.error);
    if (selected) loadMembers(selected);
    loadCompanies();
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-golos">

      {/* Шапка */}
      <div className="bg-white border-b border-[#ebebeb] px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
          <Icon name="Settings" size={14} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-[#1a1a1a] leading-none">Администратор</h1>
          <p className="text-[11px] text-[#9b9b9b] mt-0.5">Управление компаниями</p>
        </div>
      </div>

      <div className="p-6 max-w-[960px] mx-auto flex gap-5">

        {/* ── Левая колонка: компании ── */}
        <div className="w-[340px] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold text-[#9b9b9b] uppercase tracking-wide">Компании</p>
            <button
              onClick={() => setShowAddCo(v => !v)}
              className="flex items-center gap-1.5 text-[12px] text-brand hover:text-brand-hover font-medium transition-colors"
            >
              <Icon name="Plus" size={13} />
              Добавить
            </button>
          </div>

          {/* Форма новой компании */}
          {showAddCo && (
            <div className="bg-white border border-[#e8e8e8] rounded-xl p-3 space-y-2">
              <input
                value={newCoName}
                onChange={e => setNewCoName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createCompany()}
                placeholder="Название компании..."
                autoFocus
                className="w-full border border-[#e8e8e8] rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-brand transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowAddCo(false)} className="flex-1 py-1.5 text-[12px] text-[#9b9b9b] border border-[#e8e8e8] rounded-[7px] hover:border-[#c0c0c0] transition-colors">Отмена</button>
                <button
                  onClick={createCompany}
                  disabled={!newCoName.trim() || savingCo}
                  className="flex-1 py-1.5 text-[12px] font-semibold bg-brand text-white rounded-[7px] hover:bg-brand-hover disabled:opacity-40 transition-colors"
                >
                  {savingCo ? "..." : "Создать"}
                </button>
              </div>
            </div>
          )}

          {/* Список компаний */}
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[13px] text-[#b5b5b5]">Загрузка...</div>
          ) : (
            <div className="space-y-2">
              {companies.map(co => (
                <div
                  key={co.id}
                  onClick={() => loadMembers(co)}
                  className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all ${
                    selected?.id === co.id ? "border-brand shadow-sm" : "border-[#ebebeb] hover:border-[#d0d0d0]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{co.name}</p>
                      <p className="text-[11px] text-[#9b9b9b] mt-0.5">{co.members_count} сотр.</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); copyLink(co.slug); }}
                      title="Копировать ссылку входа"
                      className={`shrink-0 flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-all ${
                        copied === co.slug
                          ? "bg-green-100 text-green-700"
                          : "bg-[#f4f4f4] text-[#6b6b6b] hover:bg-[#ebebeb]"
                      }`}
                    >
                      <Icon name={copied === co.slug ? "Check" : "Link"} size={11} />
                      {copied === co.slug ? "Скопировано" : "Ссылка"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#b5b5b5] bg-[#f4f4f4] px-2 py-0.5 rounded truncate">
                      ?company={co.slug}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Правая колонка: сотрудники ── */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-[#ebebeb] rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-3">
                <Icon name="Building2" size={20} className="text-[#c0c0c0]" />
              </div>
              <p className="text-[14px] text-[#b0b0b0] font-medium">Выберите компанию</p>
              <p className="text-[12px] text-[#c5c5c5] mt-1">чтобы управлять сотрудниками</p>
            </div>
          ) : (
            <div className="bg-white border border-[#ebebeb] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-bold text-[#1a1a1a]">{selected.name}</h2>
                  <p className="text-[11px] text-[#9b9b9b] mt-0.5">Сотрудники и роли</p>
                </div>
                <button
                  onClick={() => setShowAddM(v => !v)}
                  className="flex items-center gap-2 text-[12px] font-semibold bg-brand text-white px-3 py-1.5 rounded-[8px] hover:bg-brand-hover transition-colors"
                >
                  <Icon name="UserPlus" size={13} />
                  Добавить
                </button>
              </div>

              {/* Форма добавления сотрудника */}
              {showAddM && (
                <div className="px-5 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
                  <div className="flex gap-2">
                    <input
                      value={newMName}
                      onChange={e => setNewMName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addMember()}
                      placeholder="Имя сотрудника..."
                      autoFocus
                      className="flex-1 border border-[#e8e8e8] rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-brand transition-colors"
                    />
                    <select
                      value={newMRole}
                      onChange={e => setNewMRole(e.target.value)}
                      className="border border-[#e8e8e8] rounded-[8px] px-3 py-2 text-[12px] text-[#4b4b4b] outline-none focus:border-brand transition-colors"
                    >
                      {Object.entries(ROLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <button onClick={() => setShowAddM(false)} className="px-3 py-2 text-[12px] text-[#9b9b9b] border border-[#e8e8e8] rounded-[8px] hover:border-[#c0c0c0] transition-colors">✕</button>
                    <button
                      onClick={addMember}
                      disabled={!newMName.trim() || savingM}
                      className="px-4 py-2 text-[12px] font-semibold bg-brand text-white rounded-[8px] hover:bg-brand-hover disabled:opacity-40 transition-colors"
                    >
                      {savingM ? "..." : "Добавить"}
                    </button>
                  </div>
                </div>
              )}

              {/* Таблица сотрудников */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {["Сотрудник", "Роль", "Статус", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-[#b5b5b5]">
                        Нет сотрудников — добавьте первого
                      </td>
                    </tr>
                  )}
                  {members.map((m, i) => (
                    <tr key={m.id} className={`transition-colors hover:bg-[#fafafa] ${i < members.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-[#6b6b6b]">
                              {m.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[13px] font-medium text-[#1a1a1a]">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-semibold bg-brand-light text-brand px-2.5 py-1 rounded-full">
                          {ROLE_LABELS[m.role] ?? m.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          m.active ? "bg-green-100 text-green-700" : "bg-[#f4f4f4] text-[#9b9b9b]"
                        }`}>
                          {m.active ? "Активен" : "Отключён"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => toggleMember(m)}
                          className={`text-[11px] font-medium px-3 py-1.5 rounded-[7px] border transition-colors ${
                            m.active
                              ? "border-[#e8e8e8] text-[#9b9b9b] hover:border-red-200 hover:text-red-500"
                              : "border-[#e8e8e8] text-[#9b9b9b] hover:border-green-200 hover:text-green-600"
                          }`}
                        >
                          {m.active ? "Отключить" : "Включить"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
