"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { invoiceService, TaxableInvoice } from "../../lib/supabase";

// Dynamic import for PDF generation
const TaxableInvoicePDF = dynamic(() => import("../../components/TaxableInvoicePDF"), {
  ssr: false
});

interface TaxableInvoiceWithCustomer extends TaxableInvoice {
  customer?: {
    name: string;
    address: string;
    gst_number?: string;
  };
}

export default function TaxableInvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<TaxableInvoiceWithCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<any>(null);

  // Load invoices from database
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getTaxableInvoices();
      setInvoices(data as TaxableInvoiceWithCustomer[]);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (id: string, status: TaxableInvoice['status']) => {
    try {
      await invoiceService.updateInvoiceStatus(id, status);
      // Refresh the list
      await loadInvoices();
    } catch (err) {
      console.error('Error updating invoice status:', err);
      alert('Failed to update invoice status. Please try again.');
    }
  };

  // Action handlers
  const viewInvoice = (invoiceId: string) => {
    router.push(`/taxable-invoice/view/${invoiceId}`);
  };

  const editInvoice = (invoiceId: string) => {
    router.push(`/taxable-invoice/edit/${invoiceId}`);
  };

  const deleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await invoiceService.deleteInvoice(invoiceId);
      alert(`Invoice ${invoiceNumber} deleted successfully.`);
      await loadInvoices(); // Refresh the list
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  const downloadInvoicePDF = async (invoice: TaxableInvoiceWithCustomer) => {
    try {
      // Get full invoice data with items and custom columns
      const fullInvoiceData = await invoiceService.getTaxableInvoiceById(invoice.id!);

      if (!fullInvoiceData) {
        alert('Failed to load invoice data for PDF generation.');
        return;
      }

      // Prepare data for PDF component
      const pdfData = {
        companyName: fullInvoiceData.invoice.company_name,
        invoiceNumber: fullInvoiceData.invoice.invoice_number,
        invoiceDate: fullInvoiceData.invoice.invoice_date,
        poReference: fullInvoiceData.invoice.po_reference || '',
        poDate: fullInvoiceData.invoice.po_date || '',
        billTo: {
          name: fullInvoiceData.invoice.bill_to_name,
          address: fullInvoiceData.invoice.bill_to_address,
          gst: fullInvoiceData.invoice.bill_to_gst || ''
        },
        shipTo: {
          name: fullInvoiceData.invoice.ship_to_name,
          address: fullInvoiceData.invoice.ship_to_address,
          gst: fullInvoiceData.invoice.ship_to_gst || ''
        },
        items: fullInvoiceData.items.map(item => ({
          id: item.id!,
          description: item.description,
          hsn_sac_code: item.hsn_sac_code,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          ...item.custom_columns // Spread custom column data
        })),
        customColumns: fullInvoiceData.customColumns.map(col => col.column_name),
        customColumnsMap: fullInvoiceData.customColumns.reduce((acc, col) => {
          acc[col.column_name] = col.column_display_name;
          return acc;
        }, {} as Record<string, string>),
        taxRates: {
          igst: fullInvoiceData.invoice.igst_rate,
          cgst: fullInvoiceData.invoice.cgst_rate,
          sgst: fullInvoiceData.invoice.sgst_rate
        },
        taxType: fullInvoiceData.invoice.tax_type,
        subtotal: fullInvoiceData.invoice.subtotal,
        taxAmount: fullInvoiceData.invoice.tax_amount,
        cgstAmount: fullInvoiceData.invoice.cgst_amount,
        sgstAmount: fullInvoiceData.invoice.sgst_amount,
        igstAmount: fullInvoiceData.invoice.igst_amount,
        total: fullInvoiceData.invoice.total,
        termsAndConditions: fullInvoiceData.invoice.terms_and_conditions || '',
        fitToOnePage: fullInvoiceData.invoice.fit_to_one_page,
        hindiMode: fullInvoiceData.invoice.hindi_mode,
        roundOff: fullInvoiceData.invoice.round_off
      };

      setSelectedInvoiceForPDF(pdfData);

      // Trigger PDF download after a short delay to ensure component is ready
      setTimeout(() => {
        const pdfElement = document.getElementById('hidden-pdf-component');
        if (pdfElement) {
          const downloadButton = pdfElement.querySelector('button');
          if (downloadButton) {
            downloadButton.click();
          }
        }
      }, 500);

    } catch (err) {
      console.error('Error preparing PDF download:', err);
      alert('Failed to prepare PDF download. Please try again.');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const customerName = invoice.customer?.name || invoice.bill_to_name || '';
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800"
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.draft;
  };

  const getTaxTypeBadge = (taxType: 'igst' | 'cgst_sgst') => {
    return taxType === 'igst' 
      ? "bg-purple-100 text-purple-800" 
      : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Taxable Invoices</h1>
              <p className="text-gray-600 mt-1">Manage your taxable invoices with GST calculations</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/taxable-invoice/create"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Invoice
              </Link>
              <Link
                href="/"
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Invoices
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by invoice number or customer name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg text-gray-600">Loading invoices...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center text-red-600">
              <svg className="h-8 w-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span className="text-lg">{error}</span>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={loadInvoices}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No invoices found</p>
                        <p className="text-sm">Create your first taxable invoice to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                          </div>
                          {invoice.po_reference && (
                            <div className="text-xs text-gray-400">
                              PO: {invoice.po_reference}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {invoice.customer?.name || invoice.bill_to_name}
                        </div>
                        {invoice.customer?.gst_number && (
                          <div className="text-xs text-gray-500">
                            GST: {invoice.customer.gst_number}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaxTypeBadge(invoice.tax_type)}`}>
                          {invoice.tax_type === 'igst' ? 'IGST' : 'CGST+SGST'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Tax: ₹{invoice.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={invoice.status}
                          onChange={(e) => updateInvoiceStatus(invoice.id!, e.target.value as TaxableInvoice['status'])}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusBadge(invoice.status)}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewInvoice(invoice.id!)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Invoice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => editInvoice(invoice.id!)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Invoice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => downloadInvoicePDF(invoice)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="Download PDF"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id!, invoice.invoice_number)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Invoice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Refresh Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={loadInvoices}
              disabled={loading}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <svg className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
        )}

        {/* Summary Stats */}
        {filteredInvoices.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500">Total Invoices</div>
              <div className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500">Paid Invoices</div>
              <div className="text-2xl font-bold text-green-600">
                {filteredInvoices.filter(inv => inv.status === 'paid').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500">Pending Amount</div>
              <div className="text-2xl font-bold text-orange-600">
                ₹{filteredInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* Hidden PDF Component for Download */}
        {selectedInvoiceForPDF && (
          <div id="hidden-pdf-component" style={{ display: 'none' }}>
            <TaxableInvoicePDF {...selectedInvoiceForPDF} />
          </div>
        )}
      </div>
    </div>
  );
}
