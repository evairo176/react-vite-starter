// UserAgentCell.tsx
import React from "react";
import { UAParser } from "ua-parser-js";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  value?: string | null;
  modal?: boolean;
}

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${
      className ?? "border-slate-200"
    }`}
  >
    {children}
  </span>
);

const UserAgentCell: React.FC<Props> = ({ value, modal = false }) => {
  const uaString = value ?? "";
  if (!uaString) return <div className="text-sm text-slate-500">—</div>;

  const parser = UAParser(uaString);
  const browser = parser.browser;
  const os = parser.os;
  const device = parser.device;
  const engine = parser.engine;

  const deviceLabel = device.type ? device.type : "desktop";
  const deviceModel = device.model ? ` • ${device.model}` : "";
  const osLabel = os.name
    ? `${os.name}${os.version ? " " + os.version : ""}`
    : "Unknown OS";
  const browserLabel = browser.name
    ? `${browser.name}${browser.version ? " " + browser.version : ""}`
    : "Unknown Browser";

  return (
    <div className="flex flex-col gap-1">
      {!modal && (
        <Tooltip>
          <TooltipTrigger>
            {" "}
            <div className="flex items-center gap-3">
              {/* Left: simple circle/icon with initials (bisa ganti ke svg/icon library) */}
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border">
                <span className="text-sm font-semibold text-slate-700">
                  {browser.name ? browser.name.slice(0, 2).toUpperCase() : "UA"}
                </span>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium truncate">
                    {browserLabel}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    · {osLabel}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white">{deviceLabel}</Badge>
                  {device.vendor && (
                    <Badge className="bg-white">{device.vendor}</Badge>
                  )}
                  {device.model && (
                    <Badge className="bg-white">{device.model}</Badge>
                  )}
                  {engine.name && (
                    <Badge className="bg-white">{engine.name}</Badge>
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {/* Optional: lihat full UA di tooltip / kecil untuk debugging */}
            <div className="text-xs text-slate-400 break-words max-w-full">
              {uaString}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {modal && (
        <div>
          <div className="flex items-center gap-3">
            {/* Left: simple circle/icon with initials (bisa ganti ke svg/icon library) */}
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border">
              <span className="text-sm font-semibold text-slate-700">
                {browser.name ? browser.name.slice(0, 2).toUpperCase() : "UA"}
              </span>
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium truncate">
                  {browserLabel}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  · {osLabel}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white">{deviceLabel}</Badge>
                {device.vendor && (
                  <Badge className="bg-white">{device.vendor}</Badge>
                )}
                {device.model && (
                  <Badge className="bg-white">{device.model}</Badge>
                )}
                {engine.name && (
                  <Badge className="bg-white">{engine.name}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 break-words max-w-full">
            {uaString}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAgentCell;
