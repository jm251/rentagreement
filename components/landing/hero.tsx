import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="space-y-8">
          <Badge>Legal-tech MVP for India</Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Generate an Indian rent agreement in under 5 minutes.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Capture landlord, tenant, property, and payment terms in a guided flow. Review the agreement in HTML, pay through Stripe Checkout, and download a PDF stored in Supabase.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/generate">
                Start generating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Explore features</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeaturePill icon={ShieldCheck} label="Computer-generated with disclaimer" />
            <FeaturePill icon={Sparkles} label="AI-assisted special clauses" />
            <FeaturePill icon={Wallet} label="₹149 default checkout flow" />
          </div>
        </div>

        <Card className="overflow-hidden bg-white">
          <div className="border-b border-border px-6 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Sample preview
            </div>
            <div className="mt-2 font-serif text-2xl font-semibold">
              Leave &amp; License Agreement
            </div>
          </div>
          <div className="p-6">
            <Image
              src="/sample-preview.svg"
              alt="Sample rent agreement preview"
              width={700}
              height={900}
              className="h-auto w-full rounded-2xl border border-border"
              priority
            />
          </div>
        </Card>
      </div>
    </section>
  );
}

function FeaturePill({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/80 px-4 py-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
