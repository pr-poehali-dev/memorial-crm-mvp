import { createPortal } from "react-dom";

export default function LoadingScreen({ text }: { text?: string }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 select-none"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
    >
      {/* Спиннер */}
      <div className="relative w-12 h-12">
        <svg
          className="w-12 h-12 animate-spin"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle
            cx="24" cy="24" r="20"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
          />
          <path
            d="M24 4 a20 20 0 0 1 20 20"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Подпись */}
      {text && (
        <p className="text-white text-[14px] font-medium tracking-wide opacity-90">
          {text}
        </p>
      )}
    </div>,
    document.body,
  );
}
