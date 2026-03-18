import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createAgreementPdfSignedUrl, listAgreements } from "@/lib/supabase/agreements";
import { formatCurrencyInr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const agreements = await listAgreements();
  const rows = await Promise.all(
    agreements.map(async (agreement) => ({
      ...agreement,
      downloadUrl: agreement.pdf_path
        ? await createAgreementPdfSignedUrl(agreement.pdf_path)
        : null,
    })),
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Admin
          </p>
          <CardTitle className="mt-3">Generated agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>ID / Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Landlord</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>City / State</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell>{new Date(agreement.created_at).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <div className="font-medium">{agreement.agreement_number || agreement.id}</div>
                    <div className="text-xs text-muted-foreground">{agreement.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge>{agreement.status}</Badge>
                  </TableCell>
                  <TableCell>{agreement.landlord_name}</TableCell>
                  <TableCell>{agreement.tenant_name}</TableCell>
                  <TableCell>
                    {agreement.city}, {agreement.state}
                  </TableCell>
                  <TableCell>{formatCurrencyInr(agreement.monthly_rent_amount)}</TableCell>
                  <TableCell>{agreement.contact_email}</TableCell>
                  <TableCell>{formatCurrencyInr(agreement.payment_amount_paise / 100)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Link
                        className="text-sm font-medium text-primary"
                        href={`/preview/${agreement.id}?token=${agreement.access_token}`}
                      >
                        Preview
                      </Link>
                      {agreement.downloadUrl ? (
                        <a
                          className="text-sm font-medium text-primary"
                          href={agreement.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No PDF</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
