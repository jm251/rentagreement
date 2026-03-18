import { FileCheck2, Landmark, LayoutPanelTop, ShieldEllipsis } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: LayoutPanelTop,
    title: "Guided multi-step flow",
    description:
      "Collect landlord, tenant, property, and financial details with inline validation and a legal-tech oriented UX.",
  },
  {
    icon: FileCheck2,
    title: "Full agreement preview",
    description:
      "Render a complete HTML agreement before payment so the user can review the exact content going into the PDF.",
  },
  {
    icon: Landmark,
    title: "Configurable state-law mapping",
    description:
      "Resolve state from pincode and inject governing-law wording from one maintained mapping file.",
  },
  {
    icon: ShieldEllipsis,
    title: "Server-side payment verification",
    description:
      "Draft records are saved in Supabase, Stripe checkout sessions are verified securely on the server, and PDFs are stored server-side.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Why this build
        </p>
        <h2 className="mt-3 font-serif text-4xl font-semibold">
          Built for document trust, not generic form filling.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-white">
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
