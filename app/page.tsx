import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeatureGrid } from "@/components/landing/feature-grid";
import { LandingDisclaimer } from "@/components/landing/disclaimer";
import { LandingHero } from "@/components/landing/hero";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      <LandingHero />
      <FeatureGrid />
      <LandingDisclaimer />
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8 lg:pb-24">
        <div className="rounded-[32px] border border-border bg-white p-8 text-center shadow-legal">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Start the generator
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold">
            Launch the 8-step agreement wizard.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Step through the form, generate AI-assisted special clauses, preview the agreement, and wire it into the payment flow.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/generate">
              Generate agreement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
