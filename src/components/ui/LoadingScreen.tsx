export default function LoadingScreen({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-20 gap-4 select-none">
      <svg className="w-10 h-10 animate-spin" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#e5e5e5" strokeWidth="4" />
        <path
          d="M24 4 a20 20 0 0 1 20 20"
          stroke="#1a1a1a"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {text && (
        <p className="text-[13px] text-[#9b9b9b]">{text}</p>
      )}
    </div>
  );
}