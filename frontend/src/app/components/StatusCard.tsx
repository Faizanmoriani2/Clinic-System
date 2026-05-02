import { MapPin, Clock } from "lucide-react";

interface StatusCardProps {
  city: string;
  hours: string;
  isToday?: boolean;
}

export function StatusCard({ city, hours, isToday = true }: StatusCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-[#E5E7EB]">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-[#16A34A]" />
        <span className="text-[#111827]">
          {isToday ? "Today: " : ""}{city}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#6B7280]" />
        <span className="text-[#6B7280]">{hours}</span>
      </div>
    </div>
  );
}
