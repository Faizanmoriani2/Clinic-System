interface SlotButtonProps {
  time: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SlotButton({ time, selected, disabled, onClick }: SlotButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-3 rounded-xl border-2 transition-all duration-200
        ${selected
          ? "bg-[#16A34A] text-white border-[#16A34A]"
          : "bg-white text-[#111827] border-[#E5E7EB] hover:border-[#16A34A] hover:bg-[#F8FAFC]"
        }
        ${disabled
          ? "opacity-50 cursor-not-allowed line-through"
          : "cursor-pointer active:scale-95"
        }
      `}
    >
      {time}
    </button>
  );
}
