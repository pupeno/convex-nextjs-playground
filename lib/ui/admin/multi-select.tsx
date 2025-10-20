"use client";

import * as React from "react";
import { Checkbox } from "./checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export type MultiSelectOption<T extends string> = { value: T; label: string };

export function MultiSelect<T extends string>({
  options,
  value,
  onChange,
  label,
  placeholder = "Select...",
  disabled,
}: {
  options: Array<MultiSelectOption<T>>;
  value: T[];
  onChange: (next: T[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const allSelected = value.length > 0 && value.length === options.length;

  const valueToLabel = React.useMemo(() => {
    const map = new Map<T, string>();
    for (const o of options) map.set(o.value, o.label);
    return map;
  }, [options]);

  function toggleAll() {
    onChange(allSelected ? [] : options.map((o) => o.value));
  }

  function toggleOne(v: T) {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  }

  const hasSelection = value.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="w-full min-h-9 border rounded-md px-3 py-2 text-sm flex flex-wrap gap-1 items-center cursor-pointer bg-background"
          aria-disabled={disabled}
          data-disabled={disabled ? "true" : undefined}>
          {hasSelection ? (
            value.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 leading-none">
                <span className="truncate max-w-[10rem]">{valueToLabel.get(v) ?? String(v)}</span>
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(value.filter((x) => x !== v));
                  }}
                  aria-label="Remove">
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {label ? <DropdownMenuLabel>{label}</DropdownMenuLabel> : null}
        {label ? <DropdownMenuSeparator /> : null}
        <DropdownMenuCheckboxItem checked={allSelected} onCheckedChange={toggleAll}>
          <Checkbox checked={allSelected} className="mr-2" /> Select all
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.value}
            checked={value.includes(o.value)}
            onCheckedChange={() => toggleOne(o.value)}>
            <Checkbox checked={value.includes(o.value)} className="mr-2" /> {o.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
