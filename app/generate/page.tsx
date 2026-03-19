import { AgreementWizard } from "@/components/forms/agreement-wizard";

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <div className="mb-8 max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Generator
        </p>
        <h1 className="font-serif text-4xl font-semibold">
          Build the agreement step by step.
        </h1>
        <p className="text-muted-foreground">
          Complete the guided wizard, generate AI-assisted special clauses, and review the final agreement before payment.
        </p>
      </div>
      <AgreementWizard />
    </main>
  );
}
