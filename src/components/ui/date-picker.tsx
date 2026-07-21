"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;          // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disablePast?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className, disablePast }: DatePickerProps) {
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const selected = value ? new Date(value + "T12:00:00") : undefined;

  const display = selected
    ? selected.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(date.toLocaleDateString("en-CA")); // YYYY-MM-DD in local time
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex w-full items-center gap-2.5 rounded-2xl border border-[var(--vf-surface-2)] bg-[var(--vf-surface)] px-4 py-3 text-left text-base outline-none transition-colors hover:border-[var(--vf-accent)]",
          display ? "text-[var(--vf-text)]" : "text-[var(--vf-muted)]",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-[var(--vf-accent)]" />
        <span className="flex-1">{display ?? placeholder}</span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto border-[var(--vf-border)] bg-[var(--vf-panel)] p-3 shadow-xl"
      >
        <div style={{ "--primary": "var(--vf-accent)", "--primary-foreground": "#ffffff" } as React.CSSProperties}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? (disablePast ? today : undefined)}
            disabled={disablePast ? { before: today } : undefined}
            captionLayout="label"
            className="[--cell-size:--spacing(10)]"
            classNames={{
              root: "font-sans",
              month_caption: "flex items-center justify-center px-8 text-sm font-semibold text-[var(--vf-text)]",
              caption_label: "text-[var(--vf-text)] font-semibold",
              button_previous: "text-[var(--vf-muted)] hover:text-[var(--vf-text)] hover:bg-[var(--vf-surface)]",
              button_next: "text-[var(--vf-muted)] hover:text-[var(--vf-text)] hover:bg-[var(--vf-surface)]",
              weekday: "flex-1 text-center text-[var(--vf-muted)] text-xs font-medium",
              day: "text-[var(--vf-text)]",
              day_button:
                "rounded-lg text-[var(--vf-text)] transition-colors enabled:hover:bg-[var(--vf-surface-2)] enabled:hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--vf-accent)] data-[selected-single=true]:bg-[var(--vf-accent)] data-[selected-single=true]:font-semibold data-[selected-single=true]:text-white data-[selected-single=true]:shadow-[0_0_0_3px_rgba(241,80,37,0.22)]",
              today: "rounded-lg bg-[var(--vf-surface)] font-semibold text-[var(--vf-text)]",
              outside: "text-[var(--vf-muted)] opacity-30",
              disabled: "text-[var(--vf-muted)] opacity-20",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
