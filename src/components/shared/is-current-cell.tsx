import { CheckCircle, Circle } from "lucide-react";

export default function IsCurrentCell({ value }: { value: boolean }) {
  const isCurrent = Boolean(value);

  return (
    <div className="flex items-center gap-2">
      {isCurrent ? (
        <>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Current</span>
        </>
      ) : (
        <>
          <Circle className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">Not Current</span>
        </>
      )}
    </div>
  );
}
