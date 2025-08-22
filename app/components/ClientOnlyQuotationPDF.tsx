"use client";

import React, { useEffect, useState, forwardRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR
const QuotationPDF = dynamic(() => import('./QuotationPDF'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading PDF viewer...</p>
      </div>
    </div>
  )
});

interface ClientOnlyQuotationPDFProps {
  quotation: any;
}

const ClientOnlyQuotationPDF = forwardRef<any, ClientOnlyQuotationPDFProps>(({ quotation }, ref) => {
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  if (!isClient || !mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing PDF viewer...</p>
        </div>
      </div>
    );
  }

  return <QuotationPDF ref={ref} quotation={quotation} />;
});

ClientOnlyQuotationPDF.displayName = 'ClientOnlyQuotationPDF';

export default ClientOnlyQuotationPDF;
