import React from "react";
import ViewTaxableInvoiceClient from "./ViewTaxableInvoiceClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ViewTaxableInvoicePage({ params }: PageProps) {
  return <ViewTaxableInvoiceClient invoiceId={params.id} />;
}



