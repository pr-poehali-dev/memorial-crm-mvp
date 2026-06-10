import { useState, useEffect } from "react";
import { authApi } from "@/api/client";
import { useAuth } from "@/store/authStore";
import Icon from "@/components/ui/icon";

const ROLE_LABELS: Record<string, string> = {
  owner:      "Владелец",
  manager:    "Менеджер",
  production: "Производство",
  estimator:  "Сметчик",
  accountant: "Бухгалтер",
};

type Member = { id: number; name: string; role: string; active: boolean };

export default function EmployeesPage() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [newName,  setNewName]  = useState("");
  const [newRole,  setNewRole]  = useState("manager");
  const [saving,   setSaving]   = useState(false);

  const load = () => {
    if (!companyId) return;
    setLoading(true);
    authApi.adminMembers(companyId)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [companyId]);

  const addMember = async () => {
    if (!companyId || !newName.trim()) return;
    setSaving(true);
    await authApi.adminAddMember(companyId, newName.trim(), newRole).catch(console.error);
    setNewName(""); setNewRole("manager"); setShowAdd(false); setSaving(false);
    load();
  };

  const toggleMember = async (m: Member) => {
    await authApi.adminUpdateMember(m.id, { active: !m.active }).catch(console.error);
    load();
  };

  const changeRole = async (m: Member, role: string) => {
    await authApi.adminUpdateMember(m.id, { role }).catch(console.error);
    load();
  };

  return (
    <div className="p-7 max-w-[760px] mx-auto w-full space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Сотрудники</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">Управление доступом и ролями</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[10px] hover:bg-[#333] transition-colors"
        >
          <Icon name="UserPlus" size={15} />
          Добавить сотрудника
        </button>
      </div>

      {/* Форма добавления */}
      {showAdd && (
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-4 space-y-3">
          <p className="text-[12px] font-semibold text-[#1a1a1a]">Новый сотрудник</p>
          <div className="flex gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addMember()}
              placeholder="Имя сотрудника..."
              autoFocus
              className="flex-1 border border-[#e8e8e8] rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-brand transition-colors"
            />
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="border border-[#e8e8e8] rounded-[9px] px-3 py-2 text-[13px] text-[#4b4b4b] outline-none focus:border-brand transition-colors"
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-[9px] border border-[#e8e8e8] text-[12px] text-[#6b6b6b] hover:border-[#c0c0c0] transition-colors">Отмена</button>
            <button
              onClick={addMember}
              disabled={!newName.trim() || saving}
              className="flex-1 py-2 rounded-[9px] bg-brand text-white text-[12px] font-semibold hover:bg-brand-hover disabled:opacity-40 transition-colors"
            >
              {saving ? "Добавляем..." : "Добавить"}
            </button>
          </div>
        </div>
      )}

      {/* Список */}
      <div className="bg-white border border-[#ebebeb] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[13px] text-[#b5b5b5]">Загрузка...</div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-3">
              <Icon name="Users" size={20} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[14px] text-[#b0b0b0]">Нет сотрудников</p>
            <p className="text-[12px] text-[#c5c5c5] mt-1">Добавьте первого сотрудника</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                {["Сотрудник", "Роль", "Статус", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} className={`hover:bg-[#fafafa] transition-colors ${i < members.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>

                  {/* Имя */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.active ? "bg-brand-light" : "bg-[#f0f0f0]"}`}>
                        <span className={`text-[12px] font-bold ${m.active ? "text-brand" : "text-[#9b9b9b]"}`}>
                          {m.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-[13px] font-medium ${m.active ? "text-[#1a1a1a]" : "text-[#9b9b9b] line-through"}`}>
                        {m.name}
                      </span>
                    </div>
                  </td>

                  {/* Роль — inline select */}
                  <td className="px-5 py-3">
                    <select
                      value={m.role}
                      onChange={e => changeRole(m, e.target.value)}
                      disabled={!m.active}
                      className="border border-[#e8e8e8] rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#4b4b4b] outline-none focus:border-brand transition-colors disabled:opacity-40 bg-white"
                    >
                      {Object.entries(ROLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>

                  {/* Статус */}
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      m.active ? "bg-green-100 text-green-700" : "bg-[#f4f4f4] text-[#9b9b9b]"
                    }`}>
                      {m.active ? "Активен" : "Отключён"}
                    </span>
                  </td>

                  {/* Действие */}
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleMember(m)}
                      className={`text-[11px] font-medium px-3 py-1.5 rounded-[8px] border transition-colors ${
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
        )}
      </div>

      {/* Подсказка о входе */}
      <div className="bg-brand-subtle border border-brand-border rounded-xl px-4 py-3 flex items-start gap-3">
        <Icon name="Info" size={15} className="text-brand shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-semibold text-brand">Как сотрудники входят в систему?</p>
          <p className="text-[12px] text-[#6b6b6b] mt-0.5">
            Каждый сотрудник переходит по ссылке вашей компании и выбирает себя из списка.
            Ссылку можно скопировать в разделе <b>Администратор</b> (<code>/?admin</code>).
          </p>
        </div>
      </div>
    </div>
  );
}
