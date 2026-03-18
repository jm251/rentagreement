import { FORM_STEPS } from "@/data/constants";
import { cn } from "@/lib/utils";

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-secondary">
          Step {currentStep} of {FORM_STEPS.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {Math.round((currentStep / FORM_STEPS.length) * 100)}% complete
        </p>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${(currentStep / FORM_STEPS.length) * 100}%` }}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        {FORM_STEPS.map((step) => (
          <div
            key={step.id}
            className={cn(
              "rounded-2xl border p-4",
              step.id === currentStep && "border-primary bg-primary/5",
              step.id < currentStep && "border-secondary/20 bg-secondary/5",
              step.id > currentStep && "border-border bg-white",
            )}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {step.id < 10 ? `0${step.id}` : step.id}
            </div>
            <div className="mt-2 font-semibold">{step.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
