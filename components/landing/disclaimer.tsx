import { Card, CardContent } from "@/components/ui/card";
import { APP_DISCLAIMER } from "@/data/constants";

export function LandingDisclaimer() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
      <Card className="bg-secondary text-secondary-foreground">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary-foreground/70">
              Trust & disclaimer
            </p>
            <h3 className="mt-3 font-serif text-3xl font-semibold">
              Not a law firm, not a substitute for review.
            </h3>
          </div>
          <div className="space-y-3 text-sm text-secondary-foreground/85">
            <p>{APP_DISCLAIMER}</p>
            <p>
              State-law wording is configurable through maintained mappings. Where statute names are intentionally generalized, the agreement falls back to safe configurable wording instead of hardcoded legal claims.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
