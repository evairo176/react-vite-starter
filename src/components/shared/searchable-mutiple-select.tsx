import { useState, useMemo, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { X, Check, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Option {
  label: string;
  value: string;
}

interface SearchableMultiSelectProps {
  label: string;
  options: Option[];
  placeholder?: string;
  width?: string;
  onChange: (values: string[]) => void;
  value?: string[]; // array of selected values
  disable?: boolean;
  maxHeight?: string; // optional styling for dropdown max height
}

const SearchableMultiSelect = ({
  label,
  options,
  placeholder = "Select items",
  width = "w-full",
  onChange,
  value = [],
  disable = false,
  maxHeight = "max-h-60",
}: SearchableMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = debouncedTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, debouncedTerm]);

  const isSelected = (val: string) => value.includes(val);

  const toggleValue = (val: string) => {
    if (disable) return;
    let next: string[];
    if (isSelected(val)) {
      next = value.filter((v) => v !== val);
    } else {
      next = [...value, val];
    }
    onChange(next);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange([]);
    setSearchTerm("");
    setDebouncedTerm("");
  };

  // ==============================================================================

  return (
    <div className="grid gap-2 relative" ref={containerRef}>
      <Label>{label}</Label>
      <div className={`relative`}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disable && setOpen((s) => !s)}
          className={`w-full text-left pr-8 bg-white border border-gray-100 shadow-sm px-3 py-2 rounded-md flex items-center justify-between ${
            disable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {value?.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate text-sm">
                  {value?.length === 0
                    ? placeholder
                    : `${value?.length} selected`}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{JSON.stringify(value)}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {value?.length === 0 && (
            <span className="truncate text-sm">{placeholder}</span>
          )}

          <div className="flex items-center gap-2">
            {value && value.length > 0 && !disable && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Clear selections"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </button>

        {open && !disable && (
          <div
            className={`absolute z-40 left-0 mt-2 w-full bg-white border rounded-md shadow-lg overflow-hidden ${maxHeight}`}
            style={{ minWidth: "220px" }}
          >
            <div className="p-2 border-b sticky top-0 z-10 bg-white">
              <input
                type="text"
                placeholder={`Cari ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none"
                autoFocus
              />
            </div>

            <div className="overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const checked = isSelected(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleValue(opt.value)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 flex items-center justify-center border rounded-sm ${
                            checked ? "bg-gray-900 text-white" : "bg-white"
                          }`}
                          aria-hidden
                        >
                          {checked ? <Check size={14} /> : null}
                        </span>
                        <span className="text-sm">{opt.label}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-2 px-3 text-sm text-gray-500">
                  Tidak ditemukan
                </div>
              )}
            </div>

            <div className="p-2 border-t flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const allVals = filteredOptions.map((o) => o.value);
                  const merged = Array.from(new Set([...value, ...allVals]));
                  onChange(merged);
                }}
                className="text-sm px-2 py-1 rounded hover:bg-gray-100"
              >
                Pilih semua
              </button>

              <button
                type="button"
                onClick={() => {
                  const filteredVals = new Set(
                    filteredOptions.map((o) => o.value)
                  );
                  const next = value.filter((v) => !filteredVals.has(v));
                  onChange(next);
                }}
                className="text-sm px-2 py-1 rounded hover:bg-gray-100"
              >
                Hapus terpilih
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableMultiSelect;
