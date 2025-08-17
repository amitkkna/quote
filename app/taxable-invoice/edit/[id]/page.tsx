import React from "react";
import EditTaxableInvoiceClient from "./EditTaxableInvoiceClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditTaxableInvoicePage({ params }: PageProps) {
  return <EditTaxableInvoiceClient invoiceId={params.id} />;
}

