import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export type SearchOption = {
  label: string;
  meta?: string;
};

type SearchSelectProps = {
  id: string;
  label: string;
  placeholder: string;
  options: SearchOption[];
  value: SearchOption | null;
  onChange: (value: SearchOption | null) => void;
};

export function SearchSelect({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return options.slice(0, 60);
    const starts: SearchOption[] = [];
    const contains: SearchOption[] = [];
    for (const option of options) {
      const haystack = `${option.label} ${option.meta ?? ""}`.toLocaleLowerCase();
      if (option.label.toLocaleLowerCase().startsWith(term)) starts.push(option);
      else if (haystack.includes(term)) contains.push(option);
      if (starts.length + contains.length >= 80) break;
    }
    return [...starts, ...contains].slice(0, 60);
  }, [options, query]);

  const choose = (option: SearchOption) => {
    onChange(option);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          autoComplete="off"
          value={open ? query : value?.label ?? ""}
          placeholder={placeholder}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && open && results[0]) {
              event.preventDefault();
              choose(results[0]);
            }
          }}
          className="h-14 w-full truncate rounded-md border border-input bg-background pl-11 pr-20 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/15"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Clear ${label}`}
            onClick={() => {
              onChange(null);
              setQuery("");
              setOpen(true);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X />
          </Button>
        ) : (
          <ChevronDown aria-hidden="true" className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>

      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          className="absolute z-40 mt-2 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-xl"
        >
          {results.length ? (
            results.map((option) => (
              <button
                key={`${option.label}-${option.meta ?? ""}`}
                type="button"
                role="option"
                aria-selected={value?.label === option.label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-popover-foreground">{option.label}</span>
                  {option.meta && <span className="block truncate text-xs text-muted-foreground">{option.meta}</span>}
                </span>
                {value?.label === option.label && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matching result</p>
          )}
        </div>
      )}
    </div>
  );
}