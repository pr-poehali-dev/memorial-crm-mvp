export default function LoadingScreen({ text = "Грузим..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-20 select-none">
      <div className="relative w-[220px] h-[160px] mb-4">
        <img
          src="https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/1cf840b9-aa25-4d99-8935-38ce419990d9.jpg"
          alt="загрузка"
          className="w-full h-full object-contain"
          style={{ imageRendering: "auto" }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-semibold text-[#4b4b4b]">{text}</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] inline-block"
              style={{ animation: `bounce 1s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
        </span>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
