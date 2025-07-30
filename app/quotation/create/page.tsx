"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DynamicItemsTable from "../../components/DynamicItemsTable";
import { amountInWords } from "../../utils/numberToWords";
import { formatDate, parseDate } from "../../utils/dateFormatter";
import { formatIndianNumber } from "../../utils/numberFormatter";

// Dynamic import for PDF components to prevent SSR issues
const PDFPreviewModal = dynamic(() => import("../../components/PDFPreviewModal"), {
  ssr: false,
  loading: () => <div>Loading PDF...</div>
});

const QuotationPDF = dynamic(() => import("../../components/QuotationPDF"), {
  ssr: false
});

// Define types for our quotation
interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  amount: number;
  [key: string]: any; // For dynamic custom columns
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  subject?: string;
  forOption?: string; // New field for "For" option
  items: QuotationItem[];
  notes: string;
  terms: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  fitInOnePage?: boolean; // New field for one page option
}

export default function CreateQuotation() {
  // Initialize with default values
  const [quotation, setQuotation] = useState<QuotationData>({
    quotationNumber: "GDC/25-26/",
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: "",
    customerAddress: "",
    customerEmail: "",
    customerPhone: "",
    subject: "",
    forOption: "", // New field for "For" option
    items: [
      {
        id: "1",
        serial_no: "1",
        description: "",
        amount: 0,
      },
    ],
    notes: "",
    terms: "This quotation is valid for 30 days from the date of issue.",
    subtotal: 0,
    gstRate: 18, // Default GST rate in India
    gstAmount: 0,
    total: 0,
    amountInWords: "Zero Rupees Only",
    fitInOnePage: false, // New field for one page option
  });

  // Add a new item row
  const addItem = () => {
    const newItem: QuotationItem = {
      id: (quotation.items.length + 1).toString(),
      serial_no: (quotation.items.length + 1).toString(),
      description: "",
      amount: 0,
    };
    setQuotation({
      ...quotation,
      items: [...quotation.items, newItem],
    });
  };

  // Remove an item row
  const removeItem = (id: string) => {
    setQuotation({
      ...quotation,
      items: quotation.items.filter((item) => item.id !== id),
    });
  };

  // Update item details and recalculate
  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    const updatedItems = quotation.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        return updatedItem;
      }
      return item;
    });

    // Update quotation with new items
    const updatedQuotation = { ...quotation, items: updatedItems };

    // Recalculate totals
    recalculateTotals(updatedQuotation);
  };

  // Recalculate subtotal, GST, and total
  const recalculateTotals = (updatedQuotation: QuotationData) => {
    const subtotal = updatedQuotation.items.reduce((sum, item) => {
      // Convert empty strings or undefined to 0
      const amount = item.amount === "" || item.amount === undefined ? 0 : Number(item.amount);
      return sum + amount;
    }, 0);
    const gstAmount = (subtotal * updatedQuotation.gstRate) / 100;
    const total = subtotal + gstAmount;
    const totalInWords = amountInWords(total);

    setQuotation({
      ...updatedQuotation,
      subtotal,
      gstAmount,
      total,
      amountInWords: totalInWords,
    });
  };

  // Handle GST rate change
  const handleGstRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gstRate = parseFloat(e.target.value) || 0;
    const gstAmount = (quotation.subtotal * gstRate) / 100;
    const total = quotation.subtotal + gstAmount;
    const totalInWords = amountInWords(total);

    setQuotation({
      ...quotation,
      gstRate,
      gstAmount,
      total,
      amountInWords: totalInWords,
    });
  };

  // State for PDF preview modal
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);

  // Ref for direct PDF download
  const quotationPdfRef = useRef<any>(null);
  const [pdfComponentReady, setPdfComponentReady] = useState(false);

  // Show PDF preview
  const generatePDF = () => {
    setIsPDFPreviewOpen(true);
  };

  // Direct download function
  const directDownloadPDF = async () => {
    try {
      console.log('Direct download clicked, PDF ready:', pdfComponentReady);

      if (!pdfComponentReady) {
        alert('PDF component is still loading. Please wait a moment and try again.');
        return;
      }

      if (quotationPdfRef.current?.downloadPDF) {
        console.log('Calling direct download');
        await quotationPdfRef.current.downloadPDF();
      } else {
        console.log('Direct PDF ref not ready');
        alert('PDF component not ready. Please wait a moment and try again.');
      }
    } catch (error) {
      console.error('Direct download error:', error);
      alert('Error downloading PDF: ' + error.message);
    }
  };

  // Convert to invoice (placeholder function)
  const convertToInvoice = () => {
    alert("This will convert the quotation to an invoice");
    // Implementation will be added later
  };

  // Check if PDF component is ready
  useEffect(() => {
    const checkPdfReady = () => {
      if (quotationPdfRef.current?.downloadPDF) {
        setPdfComponentReady(true);
        console.log('PDF component is ready');
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkPdfReady()) return;

    // Check every 500ms for up to 10 seconds
    const interval = setInterval(() => {
      if (checkPdfReady()) {
        clearInterval(interval);
      }
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.log('PDF component check timeout');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [quotation]); // Re-check when quotation data changes

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        documentType="quotation"
        data={quotation}
      />

      {/* Hidden PDF component for direct download */}
      <div style={{ display: 'none' }}>
        <QuotationPDF ref={quotationPdfRef} quotation={quotation} />
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8">
        {/* Header with Logo and Title */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-purple-600 text-white p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create New Quotation</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview PDF
            </button>
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Link>
          </div>
        </div>

        {/* Quotation Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-purple-50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-purple-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Your Company
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                <input
                  type="text"
                  value={quotation.quotationNumber}
                  onChange={(e) => setQuotation({ ...quotation, quotationNumber: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="e.g., GDC/25-26/001, GDC/24-25/ABC, etc."
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can customize the entire format (e.g., GDC/25-26/001, GDC/24-25/ABC, etc.)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={parseDate(quotation.date)}
                  onChange={(e) => setQuotation({ ...quotation, date: formatDate(e.target.value) })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={parseDate(quotation.validUntil)}
                  onChange={(e) => setQuotation({ ...quotation, validUntil: formatDate(e.target.value) })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">For</label>
                <input
                  type="text"
                  value={quotation.forOption || ""}
                  onChange={(e) => setQuotation({ ...quotation, forOption: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="e.g., Distributer Meet- CG, Annual Conference, etc."
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-green-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Customer Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={quotation.customerName}
                  onChange={(e) => setQuotation({ ...quotation, customerName: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={quotation.customerAddress}
                  onChange={(e) => setQuotation({ ...quotation, customerAddress: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  rows={2}
                  placeholder="Enter customer address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-gray-500 text-xs">(Optional)</span></label>
                <input
                  type="text"
                  value={quotation.subject}
                  onChange={(e) => setQuotation({ ...quotation, subject: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter subject for the quotation (optional)"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST No.</label>
                  <input
                    type="text"
                    value={quotation.customerEmail}
                    onChange={(e) => setQuotation({ ...quotation, customerEmail: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter GST Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={quotation.customerPhone}
                    onChange={(e) => setQuotation({ ...quotation, customerPhone: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Items - Dynamic Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Quotation Items
          </h2>
          <DynamicItemsTable
            initialItems={quotation.items}
            onItemsChange={(updatedItems) => {
              const updatedQuotation = { ...quotation, items: updatedItems };
              recalculateTotals(updatedQuotation);
            }}
          />
        </div>

        {/* Quotation Totals */}
        <div className="flex flex-col md:flex-row md:justify-end mb-8">
          <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-800 font-medium">₹{formatIndianNumber(quotation.subtotal || 0)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">GST:</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={quotation.gstRate}
                      onChange={handleGstRateChange}
                      className="w-16 border border-gray-300 rounded p-1 mr-2 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      min="0"
                      max="100"
                    />
                    <span className="text-gray-600 mr-2">%</span>
                    <span className="text-gray-800 font-medium">₹{formatIndianNumber(quotation.gstAmount || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-lg font-bold text-purple-600">₹{formatIndianNumber(quotation.total || 0)}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-200">
                  <p className="text-gray-600 italic text-sm">
                    <span className="font-semibold">Amount in words:</span> {quotation.amountInWords}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Options */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            PDF Options
          </h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fitInOnePage"
              checked={quotation.fitInOnePage || false}
              onChange={(e) => setQuotation({ ...quotation, fitInOnePage: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="fitInOnePage" className="ml-2 block text-sm text-gray-700">
              Fit quotation in one page (reduces font sizes and spacing)
            </label>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-indigo-50 rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <label className="text-lg font-semibold text-indigo-800">Terms & Conditions</label>
            </div>
            <textarea
              value={quotation.terms}
              onChange={(e) => setQuotation({ ...quotation, terms: e.target.value })}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              rows={3}
              placeholder="Terms and conditions for this quotation"
            />
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <label className="text-lg font-semibold text-yellow-800">Notes</label>
            </div>
            <textarea
              value={quotation.notes}
              onChange={(e) => setQuotation({ ...quotation, notes: e.target.value })}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
              rows={3}
              placeholder="Additional notes for the customer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 border-t pt-6">
          <button
            onClick={convertToInvoice}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Convert to Performa Invoice
          </button>
          <button
            onClick={generatePDF}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview PDF
          </button>
          <button
            onClick={directDownloadPDF}
            className={`${pdfComponentReady ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'} text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md`}
            disabled={!pdfComponentReady}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {pdfComponentReady ? 'Download PDF' : 'Loading PDF...'}
          </button>
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Quotation
          </button>
        </div>
      </div>
    </div>
  );
}