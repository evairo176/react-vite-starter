import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  placeholder?: string;
  width?: string;
  onChange: (value: string) => void;
  value?: string;
  disable?: boolean;
}

const SearchableSelect = ({
  label,
  options,
  placeholder = "Select item",
  width = "w-full",
  onChange,
  value = "",
  disable = false,
}: SearchableSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(debouncedTerm.toLowerCase())
    );
  }, [options, debouncedTerm]);

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    setDebouncedTerm("");
  };

  return (
    <div className="grid gap-2 relative">
      <Label>{label}</Label>

      <div className="relative">
        <Select onValueChange={onChange} value={value} disabled={disable}>
          <SelectTrigger
            className={`${width} pr-8 bg-white border border-gray-100 shadow-sm `}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          {value && !disable && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}

          <SelectContent>
            {value && !filteredOptions.find((o) => o.value === value) && (
              <SelectItem value={value} className="hidden">
                {options.find((o) => o.value === value)?.label || value}
              </SelectItem>
            )}

            {/* Search */}
            <div className="p-2 border-b bg-white sticky top-0 z-10">
              <input
                type="text"
                placeholder={`Cari ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={disable}
                className="w-full px-2 py-1 text-sm border rounded-md disabled:bg-gray-100"
              />
            </div>

            {/* Items */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={disable}
                >
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <div className="py-2 px-3 text-sm text-gray-500">
                Tidak ditemukan
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchableSelect;
