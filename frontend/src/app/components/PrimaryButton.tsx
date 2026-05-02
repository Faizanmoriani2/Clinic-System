import { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "whatsapp";
}

export function PrimaryButton({ children, variant = "primary", className = "", ...props }: PrimaryButtonProps) {
  const bgColor = variant === "whatsapp" ? "bg-[#25D366]" : "bg-[#16A34A]";
  const hoverColor = variant === "whatsapp" ? "hover:bg-[#20bd5a]" : "hover:bg-[#15803D]";

  return (
    <button
      className={`${bgColor} ${hoverColor} text-white px-5 py-3 rounded-xl transition-all duration-200 active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
