"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { invoiceService, TaxableInvoice, TaxableInvoiceItem, TaxableInvoiceCustomColumn, Customer } from "../../../lib/supabase";

// Dynamic import for PDF component
const TaxableInvoicePDF = dynamic(() => import("../../../components/TaxableInvoicePDF"), {
  ssr: false
});

interface InvoiceData {
  invoice: TaxableInvoice;
  items: TaxableInvoiceItem[];
  customer: Customer;
  customColumns: TaxableInvoiceCustomColumn[];
}

interface ViewTaxableInvoiceClientProps {
  invoiceId: string;
}

export default function ViewTaxableInvoiceClient({ invoiceId }: ViewTaxableInvoiceClientProps) {
  const router = useRouter();
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData();
    }
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getTaxableInvoiceById(invoiceId);
      
      if (!data) {
        setError('Invoice not found');
        return;
      }
      
      setInvoiceData(data);
    } catch (err) {
      console.error('Error loading invoice:', err);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: TaxableInvoice['status']) => {
    if (!invoiceData) return;
    
    try {
      await invoiceService.updateInvoiceStatus(invoiceId, newStatus);
      setInvoiceData({
        ...invoiceData,
        invoice: { ...invoiceData.invoice, status: newStatus }
      });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update invoice status');
    }
  };

  const deleteInvoice = async () => {
    if (!invoiceData) return;
    
    if (!confirm(`Are you sure you want to delete invoice ${invoiceData.invoice.invoice_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      await invoiceService.deleteInvoice(invoiceId);
      alert('Invoice deleted successfully');
      router.push('/taxable-invoice/list');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Failed to delete invoice');
    }
  };

  const preparePDFData = () => {
    if (!invoiceData) return null;

    return {
      companyName: invoiceData.invoice.company_name,
      invoiceNumber: invoiceData.invoice.invoice_number,
      invoiceDate: invoiceData.invoice.invoice_date,
      poReference: invoiceData.invoice.po_reference || '',
      poDate: invoiceData.invoice.po_date || '',
      billTo: {
        name: invoiceData.invoice.bill_to_name,
        address: invoiceData.invoice.bill_to_address,
        gst: invoiceData.invoice.bill_to_gst || ''
      },
      shipTo: {
        name: invoiceData.invoice.ship_to_name,
        address: invoiceData.invoice.ship_to_address,
        gst: invoiceData.invoice.ship_to_gst || ''
      },
      items: invoiceData.items.map(item => ({
        id: item.id!,
        description: item.description,
        hsn_sac_code: item.hsn_sac_code,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        ...item.custom_columns
      })),
      customColumns: invoiceData.customColumns.map(col => col.column_name),
      customColumnsMap: invoiceData.customColumns.reduce((acc, col) => {
        acc[col.column_name] = col.column_display_name;
        return acc;
      }, {} as Record<string, string>),
      taxRates: {
        igst: invoiceData.invoice.igst_rate,
        cgst: invoiceData.invoice.cgst_rate,
        sgst: invoiceData.invoice.sgst_rate
      },
      taxType: invoiceData.invoice.tax_type,
      subtotal: invoiceData.invoice.subtotal,
      taxAmount: invoiceData.invoice.tax_amount,
      cgstAmount: invoiceData.invoice.cgst_amount,
      sgstAmount: invoiceData.invoice.sgst_amount,
      igstAmount: invoiceData.invoice.igst_amount,
      total: invoiceData.invoice.total,
      termsAndConditions: invoiceData.invoice.terms_and_conditions || '',
      fitToOnePage: invoiceData.invoice.fit_to_one_page,
      hindiMode: invoiceData.invoice.hindi_mode,
      roundOff: invoiceData.invoice.round_off
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600 mt-4">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested invoice could not be found.'}</p>
          <Link
            href="/taxable-invoice/list"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Invoice List
          </Link>
        </div>
      </div>
    );
  }

  const pdfData = preparePDFData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice {invoiceData.invoice.invoice_number}
              </h1>
              <p className="text-gray-600 mt-1">
                {invoiceData.invoice.company_name} • {new Date(invoiceData.invoice.invoice_date).toLocaleDateString('en-IN')}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <select
                value={invoiceData.invoice.status}
                onChange={(e) => updateStatus(e.target.value as TaxableInvoice['status'])}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <button
                onClick={() => setShowPDF(!showPDF)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {showPDF ? 'Hide PDF' : 'Show PDF'}
              </button>
              
              <Link
                href={`/taxable-invoice/edit/${invoiceId}`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              
              <button
                onClick={deleteInvoice}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              
              <Link
                href="/taxable-invoice/list"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        {showPDF && pdfData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">PDF Preview</h2>
            <TaxableInvoicePDF {...pdfData} />
          </div>
        )}

        {/* Invoice Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Bill To:</label>
                <p className="text-gray-900">{invoiceData.invoice.bill_to_name}</p>
                <p className="text-gray-600 text-sm">{invoiceData.invoice.bill_to_address}</p>
                {invoiceData.invoice.bill_to_gst && (
                  <p className="text-gray-600 text-sm">GST: {invoiceData.invoice.bill_to_gst}</p>
                )}
              </div>
              
              {invoiceData.invoice.ship_to_name !== invoiceData.invoice.bill_to_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ship To:</label>
                  <p className="text-gray-900">{invoiceData.invoice.ship_to_name}</p>
                  <p className="text-gray-600 text-sm">{invoiceData.invoice.ship_to_address}</p>
                  {invoiceData.invoice.ship_to_gst && (
                    <p className="text-gray-600 text-sm">GST: {invoiceData.invoice.ship_to_gst}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{invoiceData.invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {invoiceData.invoice.tax_type === 'igst' ? (
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST ({invoiceData.invoice.igst_rate}%):</span>
                  <span className="font-medium">₹{invoiceData.invoice.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST ({invoiceData.invoice.cgst_rate}%):</span>
                    <span className="font-medium">₹{invoiceData.invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST ({invoiceData.invoice.sgst_rate}%):</span>
                    <span className="font-medium">₹{invoiceData.invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>₹{invoiceData.invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN/SAC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  {invoiceData.customColumns.map(col => (
                    <th key={col.column_name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {col.column_display_name}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceData.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.hsn_sac_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    {invoiceData.customColumns.map(col => (
                      <td key={col.column_name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.custom_columns?.[col.column_name] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms and Conditions */}
        {invoiceData.invoice.terms_and_conditions && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{invoiceData.invoice.terms_and_conditions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
