import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-[#E5E7EB] hover:shadow-lg transition-shadow">
      <div className="bg-[#F8FAFC] w-12 h-12 rounded-xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-[#16A34A]" />
      </div>
      <h3 className="text-[#111827] mb-2">{title}</h3>
      <p className="text-[#6B7280] text-sm">{description}</p>
    </div>
  );
}
