import { useState } from "react";
import StoneCalculator from "./StoneCalculator";
import { LineItem } from "./estimate.types";
import OrderDetailHeader from "./order-detail/OrderDetailHeader";
import OrderDetailLeft from "./order-detail/OrderDetailLeft";
import OrderDetailSidebar from "./order-detail/OrderDetailSidebar";

type OrderItem = { id: string; name: string; qty: number; unit: string; price: number; approved: boolean | null; hasCalc: boolean };

const ORDER = {
  id:           "МП-0041",
  client:       "Смирнова Алла Васильевна",
  phone:        "+7 912 345-67-89",
  stone:        "Гранит чёрный",
  size:         "100×50×8 см",
  design:       "Портрет + орнамент",
  inscription:  "Иванов Пётр Семёнович\n1945–2021",
  deadline:     "28 апреля 2026",
  currentStage: 1,
  status:       "Производство",
  statusColor:  "#f59e0b",
  amount:       38500,
  paid:         15000,
  manager:      "Олег Краснов",
  production:   "Игорь Верещагин",
  estimator:    "Анна Морозова",
  clientComment: "Клиент просил сделать надпись крупнее, портрет — черно-белый, без цветной обработки.",
};

const ITEMS: OrderItem[] = [
  { id: "i1", name: "Изготовление памятника", qty: 1, unit: "шт.", price: 22000, approved: true,  hasCalc: true  },
  { id: "i2", name: "Гравировка надписи",     qty: 1, unit: "шт.", price: 6500,  approved: true,  hasCalc: true  },
  { id: "i3", name: "Портретное фото",        qty: 1, unit: "шт.", price: 5000,  approved: null,  hasCalc: false },
  { id: "i4", name: "Доставка и установка",   qty: 1, unit: "шт.", price: 5000,  approved: false, hasCalc: false },
];

const MATERIALS = [
  { name: "Гранит чёрный (габбро)", qty: 0.42, unit: "м²",  written: false },
  { name: "Абразивный диск 230мм",  qty: 2,    unit: "шт.", written: true  },
  { name: "Алмазная фреза",         qty: 1,    unit: "шт.", written: false },
];

const COMMENTS = [
  { author: "Анна М.",  date: "12 апр., 14:32", text: "Эскиз согласован с клиентом, приступаем к распилу." },
  { author: "Игорь В.", date: "15 апр., 09:10", text: "Материал заготовлен, начали обработку. Срок — 3 дня." },
  { author: "Олег К.",  date: "18 апр., 17:45", text: "Клиент звонил, просит успеть к 25 апреля. Уточнил размер надписи." },
];

export default function OrderDetailPage({ onBack }: { onBack: () => void }) {
  const [newComment, setNewComment]   = useState("");
  const [comments, setComments]       = useState(COMMENTS);
  const [activeStage, setActiveStage] = useState(ORDER.currentStage);
  const [orderItems, setOrderItems]   = useState<OrderItem[]>(ITEMS);
  const [showCalc, setShowCalc]       = useState(false);
  const [calcItemId, setCalcItemId]   = useState<string | null>(null);

  const openCalcFor = (id: string) => { setCalcItemId(id); setShowCalc(true); };

  const handleCalcResult = (result: LineItem) => {
    if (calcItemId) {
      setOrderItems(prev => prev.map(it =>
        it.id === calcItemId
          ? { ...it, price: result.price, hasCalc: true, approved: null }
          : it
      ));
    }
    setShowCalc(false);
    setCalcItemId(null);
  };

  const debt    = ORDER.amount - ORDER.paid;
  const paidPct = Math.round((ORDER.paid / ORDER.amount) * 100);

  const totalApproved   = orderItems.filter(i => i.approved === true).reduce((s, i) => s + i.qty * i.price, 0);
  const totalUnapproved = orderItems.filter(i => i.approved === false).reduce((s, i) => s + i.qty * i.price, 0);
  const totalPending    = orderItems.filter(i => i.approved === null).reduce((s, i) => s + i.qty * i.price, 0);
  const allApproved     = orderItems.every(i => i.approved === true);

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { author: "Олег К.", date: "сейчас", text: newComment.trim() }]);
    setNewComment("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      {showCalc && (
        <StoneCalculator
          onClose={() => { setShowCalc(false); setCalcItemId(null); }}
          onAdd={handleCalcResult}
        />
      )}
      <div className="max-w-[1100px] mx-auto px-6 py-5">

        <OrderDetailHeader
          id={ORDER.id}
          client={ORDER.client}
          phone={ORDER.phone}
          status={ORDER.status}
          statusColor={ORDER.statusColor}
          deadline={ORDER.deadline}
          manager={ORDER.manager}
          onBack={onBack}
        />

        <div className="flex gap-5 items-start mt-4">

          <OrderDetailLeft
            client={ORDER.client}
            phone={ORDER.phone}
            clientComment={ORDER.clientComment}
            orderAmount={ORDER.amount}
            orderItems={orderItems}
            materials={MATERIALS}
            comments={comments}
            newComment={newComment}
            totalApproved={totalApproved}
            totalUnapproved={totalUnapproved}
            totalPending={totalPending}
            allApproved={allApproved}
            onOpenCalcFor={openCalcFor}
            onNewCommentChange={setNewComment}
            onAddComment={addComment}
          />

          <OrderDetailSidebar
            activeStage={activeStage}
            amount={ORDER.amount}
            paid={ORDER.paid}
            debt={debt}
            paidPct={paidPct}
            manager={ORDER.manager}
            production={ORDER.production}
            estimator={ORDER.estimator}
            onStageBack={() => setActiveStage(Math.max(0, activeStage - 1))}
            onStageNext={() => setActiveStage(Math.min(5, activeStage + 1))}
          />

        </div>
      </div>
    </div>
  );
}
