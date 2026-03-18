import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
  description?: string;
};

export function OptionGrid({
  value,
  options,
  onChange,
  columns = 2,
}: {
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-3",
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              active
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-white hover:border-secondary/40 hover:bg-muted/60",
            )}
          >
            <div className="font-semibold">{option.label}</div>
            {option.description ? (
              <div className="mt-1 text-sm text-muted-foreground">
                {option.description}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
