import {
  format,
  formatDistanceToNow,
  isPast,
  differenceInDays,
} from "date-fns";
import { id } from "date-fns/locale";

export default function ExpiredAtCell({ value }: { value?: string | null }) {
  if (!value) return <div className="text-slate-400 text-sm">—</div>;

  const date = new Date(value);

  const isExpired = isPast(date);
  const diffDays = differenceInDays(date, new Date());
  const relative = formatDistanceToNow(date, { locale: id, addSuffix: true });

  // Warna status
  let chipColor = "bg-emerald-100 text-emerald-700 border-emerald-200";

  if (isExpired) chipColor = "bg-red-100 text-red-700 border-red-200";
  else if (diffDays <= 3)
    chipColor = "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 text-xs border rounded-full ${chipColor}`}
        >
          {isExpired ? "Expired" : "Active"}
        </span>

        <span className="text-sm font-medium">
          {format(date, "dd MMM yyyy — HH:mm", { locale: id })}
        </span>
      </div>

      <div className="text-xs text-slate-400">{relative}</div>
    </div>
  );
}
