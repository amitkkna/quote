import React from "react";
import EditTaxableInvoiceClient from "./EditTaxableInvoiceClient";

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

export default function EditTaxableInvoicePage({ params }: PageProps) {
  return <EditTaxableInvoiceClient invoiceId={params.id} />;
}

