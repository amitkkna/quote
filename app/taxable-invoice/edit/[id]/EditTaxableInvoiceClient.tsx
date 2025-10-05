"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { invoiceService } from "../../../lib/supabase";

interface EditTaxableInvoiceClientProps {
  invoiceId: string;
}

export default function EditTaxableInvoiceClient({ invoiceId }: EditTaxableInvoiceClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceForEdit();
    }
  }, [invoiceId]);

  const loadInvoiceForEdit = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await invoiceService.getTaxableInvoiceById(invoiceId);

      if (!data) {
        setError('Invoice not found');
        return;
      }

      // Redirect to create page with pre-filled data via URL parameters
      const invoice = data.invoice;
      const items = data.items;
      const customColumns = data.customColumns;

      // Create URL with invoice data as query parameters
      const editParams = new URLSearchParams({
        edit: 'true',
        invoiceId: invoiceId,
        companyName: invoice.company_name,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        poReference: invoice.po_reference || '',
        poDate: invoice.po_date || '',
        billToName: invoice.bill_to_name,
        billToAddress: invoice.bill_to_address,
        billToGST: invoice.bill_to_gst || '',
        shipToName: invoice.ship_to_name,
        shipToAddress: invoice.ship_to_address,
        shipToGST: invoice.ship_to_gst || '',
        taxType: invoice.tax_type,
        igstRate: invoice.igst_rate.toString(),
        cgstRate: invoice.cgst_rate.toString(),
        sgstRate: invoice.sgst_rate.toString(),
        termsAndConditions: invoice.terms_and_conditions || '',
        fitToOnePage: invoice.fit_to_one_page.toString(),
        hindiMode: invoice.hindi_mode.toString(),
        roundOff: invoice.round_off.toString(),
        // Serialize items and custom columns as JSON
        items: JSON.stringify(items),
        customColumns: JSON.stringify(customColumns)
      });

      router.push(`/taxable-invoice/create?${editParams.toString()}`);

    } catch (err) {
      console.error('Error loading invoice for edit:', err);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600 mt-4">Loading invoice for editing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Invoice</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Link
              href={`/taxable-invoice/view/${invoiceId}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Invoice
            </Link>
            <Link
              href="/taxable-invoice/list"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <svg className="h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Invoice Feature</h1>
            <p className="text-gray-600 text-lg">Coming Soon!</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Feature Under Development</h3>
            <p className="text-blue-700">
              The edit invoice functionality is currently being developed. For now, you can:
            </p>
            <ul className="text-blue-700 mt-3 space-y-1">
              <li>• View existing invoices in detail</li>
              <li>• Update invoice status (Draft → Sent → Paid)</li>
              <li>• Download PDF copies</li>
              <li>• Create new invoices</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/taxable-invoice/view/${invoiceId}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View This Invoice
            </Link>
            
            <Link
              href="/taxable-invoice/create"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Invoice
            </Link>
            
            <Link
              href="/taxable-invoice/list"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Back to Invoice List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
