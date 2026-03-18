import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgreementFormData } from "@/types/agreement";

export function SpecialClausesStep({
  form,
  isGenerating,
  generationError,
  onGenerate,
}: {
  form: UseFormReturn<AgreementFormData>;
  isGenerating: boolean;
  generationError: string | null;
  onGenerate: () => Promise<void>;
}) {
  const aiClauses = useFieldArray({
    control: form.control,
    name: "aiClauses",
  });

  return (
    <div className="space-y-6">
      <FormField
        id="specialConditions"
        label="Special conditions"
        hint="Examples: no pets, designated parking, maintenance responsibilities, visitor timing."
        error={form.formState.errors.specialConditions?.message}
      >
        <Textarea
          id="specialConditions"
          placeholder="List any special conditions you want reflected in the agreement."
          {...form.register("specialConditions")}
        />
      </FormField>

      <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold">AI clause generation</h3>
            <p className="text-sm text-muted-foreground">
              The configured FastRouter model will use your form data and special conditions to draft 3 to 5 formal clauses.
            </p>
          </div>
          <Button type="button" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating clauses
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate clauses
              </>
            )}
          </Button>
        </div>
        {generationError ? (
          <p className="mt-3 text-sm text-destructive">{generationError}</p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            If generation fails, you can continue without AI clauses or add your own manually.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Editable special clauses</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => aiClauses.append({ title: "", text: "" })}
          >
            Add clause manually
          </Button>
        </div>

        {aiClauses.fields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
            No AI clauses added yet.
          </div>
        ) : (
          aiClauses.fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-semibold">Clause {index + 1}</div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => aiClauses.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
              <div className="grid gap-4">
                <FormField
                  label="Clause title"
                  error={form.formState.errors.aiClauses?.[index]?.title?.message}
                >
                  <Input {...form.register(`aiClauses.${index}.title`)} />
                </FormField>
                <FormField
                  label="Clause text"
                  error={form.formState.errors.aiClauses?.[index]?.text?.message}
                >
                  <Textarea {...form.register(`aiClauses.${index}.text`)} />
                </FormField>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
