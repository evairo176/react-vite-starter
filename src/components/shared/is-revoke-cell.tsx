// IsRevokedCell.tsx
import { Ban, CheckCircle } from "lucide-react";

export default function IsRevokedCell({ value }: { value: boolean }) {
  const revoked = Boolean(value);

  if (revoked) {
    return (
      <div className="flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-600" />
        <span className="text-sm font-medium text-red-700">Revoked</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-emerald-600" />
      <span className="text-sm text-emerald-700">Active</span>
    </div>
  );
}
