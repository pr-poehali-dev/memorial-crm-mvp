import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useNav } from "@/store/navStore";
import { Client } from "../ClientsPage";
import { clientsApi } from "@/api/client";

export default function ClientOverlay({ client, onClose, onUpdate }: {
  client: Client;
  onClose: () => void;
  onUpdate?: (updated: Partial<Client>) => void;
}) {
  const { openOrder } = useNav();
  const [newComment, setNewComment] = useState("");

  /* Редактируемые поля */
  const [editing, setEditing]   = useState(false);
  const [eName,    setEName]    = useState(client.name);
  const [ePhone,   setEPhone]   = useState(client.phone);
  const [eCity,    setECity]    = useState(client.city);
  const [eComment, setEComment] = useState(client.comment);
  const [saving,   setSaving]   = useState(false);

  const debt    = client.total - client.paid;
  const paidPct = client.total > 0 ? Math.round((client.paid / client.total) * 100) : 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = () => {
    setSaving(true);
    clientsApi.update(client.id, {
      name:    eName.trim(),
      phone:   ePhone.trim(),
      city:    eCity.trim(),
      comment: eComment.trim(),
    }).then(() => {
      onUpdate?.({ name: eName.trim(), phone: ePhone.trim(), city: eCity.trim(), comment: eComment.trim() });
      setEditing(false);
    }).catch(console.error)
      .finally(() => setSaving(false));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setEComment(prev => {
      const updated = prev ? `${prev}\n${newComment.trim()}` : newComment.trim();
      clientsApi.update(client.id, { comment: updated }).catch(console.error);
      return updated;
    });
    setNewComment("");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px]" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-[380px] bg-white border-l border-[#ebebeb] shadow-2xl flex flex-col overflow-hidden">

        {/* Шапка */}
        <div className="shrink-0 px-5 py-4 border-b border-[#f0f0f0]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0
                ${client.active ? "bg-[#f0f0f0] text-[#6b6b6b]" : "bg-[#f8f8f8] text-[#b5b5b5]"}`}>
                {(eName || client.name)[0]}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={eName}
                    onChange={e => setEName(e.target.value)}
                    className="w-full text-[15px] font-semibold text-[#1a1a1a] border-b border-[#2563eb] outline-none bg-transparent pb-0.5"
                    placeholder="ФИО заказчика"
                  />
                ) : (
                  <p className="text-[15px] font-semibold text-[#1a1a1a] leading-tight truncate">{client.name}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                    ${client.active ? "bg-green-100 text-green-600" : "bg-[#f0f0f0] text-[#9b9b9b]"}`}>
                    <span className={`w-1 h-1 rounded-full ${client.active ? "bg-green-500" : "bg-[#c0c0c0]"}`} />
                    {client.active ? "Активный" : "Неактивный"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#b5b5b5] hover:text-[#2563eb] hover:bg-[#f0f0f0] transition-colors"
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={13} />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] disabled:opacity-50 transition-colors"
                  >
                    {saving ? "..." : "Сохранить"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEName(client.name); setEPhone(client.phone); setECity(client.city); setEComment(client.comment); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#b5b5b5] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] transition-colors"
                  >
                    <Icon name="X" size={13} />
                  </button>
                </>
              )}
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#b5b5b5] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] transition-colors">
                <Icon name="X" size={15} />
              </button>
            </div>
          </div>

          {/* Контакты */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#f5f5f5]">
            {editing ? (
              <div className="flex gap-2 flex-1">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Icon name="Phone" size={12} className="text-[#b5b5b5] shrink-0" />
                  <input
                    value={ePhone}
                    onChange={e => setEPhone(e.target.value)}
                    className="flex-1 text-[12px] text-[#1a1a1a] border-b border-[#2563eb] outline-none bg-transparent"
                    placeholder="Телефон"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Icon name="MapPin" size={12} className="text-[#b5b5b5] shrink-0" />
                  <input
                    value={eCity}
                    onChange={e => setECity(e.target.value)}
                    className="flex-1 text-[12px] text-[#1a1a1a] border-b border-[#2563eb] outline-none bg-transparent"
                    placeholder="Город"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="Phone" size={12} className="text-[#b5b5b5]" />
                  {client.phone || <span className="text-[#c0c0c0]">не указан</span>}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="MapPin" size={12} className="text-[#b5b5b5]" />
                  {client.city || <span className="text-[#c0c0c0]">не указан</span>}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="User" size={12} className="text-[#b5b5b5]" />
                  {client.manager}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Скроллируемое тело */}
        <div className="flex-1 overflow-y-auto">

          {/* Финансы */}
          <div className="px-5 py-4 border-b border-[#f5f5f5]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Финансы</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">Заказов</p>
                <p className="text-[18px] font-bold text-[#1a1a1a]">{client.orders}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">Оплачено</p>
                <p className="text-[18px] font-bold text-[#16a34a]">{(client.paid / 1000).toFixed(0)} тыс.</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">Долг</p>
                {debt > 0
                  ? <p className="text-[18px] font-bold text-red-500">{(debt / 1000).toFixed(0)} тыс.</p>
                  : <p className="text-[15px] font-semibold text-[#16a34a]">Нет</p>
                }
              </div>
            </div>
            {client.total > 0 && (
              <div>
                <div className="flex justify-between text-[10px] text-[#c0c0c0] mb-1">
                  <span>Оплата</span>
                  <span>{paidPct}%</span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${paidPct}%`, backgroundColor: paidPct >= 100 ? "#16a34a" : "#2563eb" }} />
                </div>
              </div>
            )}
          </div>

          {/* Заметка */}
          <div className="px-5 py-4 border-b border-[#f5f5f5]">
            <NoteBlock
              comment={eComment}
              newComment={newComment}
              onNewCommentChange={setNewComment}
              onAdd={addComment}
              onEdit={(text) => {
                setEComment(text);
                clientsApi.update(client.id, { comment: text }).catch(console.error);
              }}
              onDelete={() => {
                setEComment("");
                clientsApi.update(client.id, { comment: "" }).catch(console.error);
              }}
            />
          </div>

          {/* Заказы */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5]">Заказы</p>
            </div>
            {client.orders === 0 ? (
              <p className="text-[12px] text-[#c0c0c0] py-1">Заказов нет</p>
            ) : (
              <p className="text-[12px] text-[#9b9b9b] py-1">
                {client.orders} заказов на сумму {client.total.toLocaleString("ru")} ₽
              </p>
            )}
          </div>

        </div>

        {/* Кнопка */}
        <div className="shrink-0 px-5 py-4 border-t border-[#f0f0f0]">
          <button className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[13px] font-semibold py-2.5 rounded-[9px] hover:bg-[#333] transition-colors">
            <Icon name="Plus" size={14} />
            Создать заказ
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Блок заметки с редактированием и удалением ─── */
function NoteBlock({ comment, newComment, onNewCommentChange, onAdd, onEdit, onDelete }: {
  comment: string;
  newComment: string;
  onNewCommentChange: (v: string) => void;
  onAdd: () => void;
  onEdit: (text: string) => void;
  onDelete: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment);

  const handleSaveEdit = () => {
    onEdit(editText.trim());
    setEditMode(false);
  };

  const handleDelete = () => {
    onDelete();
    setEditMode(false);
    setEditText("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5]">Заметка</p>
        {comment && !editMode && (
          <div className="flex gap-1">
            <button
              onClick={() => { setEditText(comment); setEditMode(true); }}
              className="w-6 h-6 flex items-center justify-center rounded text-[#c5c5c5] hover:text-[#2563eb] hover:bg-[#f0f0f0] transition-all"
              title="Редактировать заметку"
            >
              <Icon name="Pencil" size={11} />
            </button>
            <button
              onClick={handleDelete}
              className="w-6 h-6 flex items-center justify-center rounded text-[#c5c5c5] hover:text-red-400 hover:bg-red-50 transition-all"
              title="Удалить заметку"
            >
              <Icon name="Trash2" size={11} />
            </button>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-[12px] text-[#1a1a1a] bg-[#fafafa] border border-[#2563eb] rounded-lg px-3 py-2.5 outline-none resize-none placeholder:text-[#c5c5c5]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-1.5 text-[12px] font-semibold bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-3 py-1.5 text-[12px] text-[#6b6b6b] border border-[#e5e5e5] rounded-lg hover:border-[#c5c5c5] transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : comment ? (
        <>
          <p className="text-[12px] text-[#6b6b6b] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
            {comment}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={newComment}
              onChange={e => onNewCommentChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onAdd()}
              placeholder="Дополнить заметку..."
              className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-[8px] px-3 py-1.5 text-[12px] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]"
            />
            <button
              onClick={onAdd}
              disabled={!newComment.trim()}
              className="px-2.5 py-1.5 bg-[#1a1a1a] text-white rounded-[8px] hover:bg-[#333] disabled:opacity-30 transition-colors"
            >
              <Icon name="Plus" size={12} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={newComment}
            onChange={e => onNewCommentChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onAdd()}
            placeholder="Добавить заметку..."
            className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[12px] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]"
          />
          <button
            onClick={onAdd}
            disabled={!newComment.trim()}
            className="px-3 py-2 bg-[#1a1a1a] text-white rounded-[8px] hover:bg-[#333] disabled:opacity-30 transition-colors"
          >
            <Icon name="Send" size={12} />
          </button>
        </div>
      )}
    </div>
  );
}