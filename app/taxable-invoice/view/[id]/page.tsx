import React from "react";
import ViewTaxableInvoiceClient from "./ViewTaxableInvoiceClient";

// Required for dynamic routes
export async function generateStaticParams() {
  // Return empty array to allow dynamic generation at runtime
  return [];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function ViewTaxableInvoicePage({ params }: PageProps) {
  return <ViewTaxableInvoiceClient invoiceId={params.id} />;
}



