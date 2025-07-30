"use client";

import { useState } from "react";
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

// Define types for our invoice (compatible with DynamicItemsTable)
interface InvoiceItem {
  id: string;
  serial_no?: string;
  description?: string;
  amount?: number | string;
  [key: string]: any; // For dynamic custom columns
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  items: InvoiceItem[];
  notes: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
}

export default function CreateInvoice() {
  // Initialize with default values
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: "",
    customerAddress: "",
    customerEmail: "",
    customerPhone: "",
    items: [
      {
        id: "1",
        serial_no: "1",
        description: "",
        amount: 0,
      },
    ] as InvoiceItem[],
    notes: "",
    subtotal: 0,
    gstRate: 18, // Default GST rate in India
    gstAmount: 0,
    total: 0,
    amountInWords: "Zero Rupees Only",
  });

  // Add a new item row
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: (invoice.items.length + 1).toString(),
      serial_no: (invoice.items.length + 1).toString(),
      description: "",
      amount: 0,
    };
    const updatedInvoice = {
      ...invoice,
      items: [...invoice.items, newItem],
    };
    setInvoice(updatedInvoice);
    recalculateTotals(updatedInvoice);
  };

  // Remove an item row
  const removeItem = (id: string) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter((item) => item.id !== id),
    });
  };

  // Update item details and recalculate
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        return updatedItem;
      }
      return item;
    });

    // Update invoice with new items
    const updatedInvoice = { ...invoice, items: updatedItems };

    // Recalculate totals
    recalculateTotals(updatedInvoice);
  };

  // Recalculate subtotal, GST, and total
  const recalculateTotals = (updatedInvoice: InvoiceData) => {
    const subtotal = updatedInvoice.items.reduce((sum, item) => {
      // Convert empty strings or undefined to 0
      const amount = typeof item.amount === 'string' && item.amount === "" || item.amount === undefined ? 0 : Number(item.amount);
      return sum + amount;
    }, 0);
    const gstAmount = (subtotal * updatedInvoice.gstRate) / 100;
    const total = subtotal + gstAmount;
    const totalInWords = amountInWords(total);

    setInvoice({
      ...updatedInvoice,
      subtotal,
      gstAmount,
      total,
      amountInWords: totalInWords,
    });
  };

  // Handle GST rate change
  const handleGstRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gstRate = parseFloat(e.target.value) || 0;
    const gstAmount = (invoice.subtotal * gstRate) / 100;
    const total = invoice.subtotal + gstAmount;
    const totalInWords = amountInWords(total);

    setInvoice({
      ...invoice,
      gstRate,
      gstAmount,
      total,
      amountInWords: totalInWords,
    });
  };

  // State for PDF preview modal
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);

  // Show PDF preview
  const generatePDF = () => {
    setIsPDFPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        documentType="invoice"
        data={invoice}
      />

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8">
        {/* Header with Logo and Title */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create New Performa Invoice</h1>
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

        {/* Invoice Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Your Company
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={parseDate(invoice.date)}
                  onChange={(e) => setInvoice({ ...invoice, date: formatDate(e.target.value) })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={parseDate(invoice.dueDate)}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: formatDate(e.target.value) })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  value={invoice.customerName}
                  onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={invoice.customerAddress}
                  onChange={(e) => setInvoice({ ...invoice, customerAddress: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  rows={2}
                  placeholder="Enter customer address"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST No.</label>
                  <input
                    type="text"
                    value={invoice.customerEmail}
                    onChange={(e) => setInvoice({ ...invoice, customerEmail: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter GST Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={invoice.customerPhone}
                    onChange={(e) => setInvoice({ ...invoice, customerPhone: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items - Dynamic Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Invoice Items
          </h2>
          <DynamicItemsTable
            initialItems={invoice.items}
            onItemsChange={(updatedItems) => {
              const updatedInvoice = { ...invoice, items: updatedItems };
              recalculateTotals(updatedInvoice);
            }}
          />
        </div>

        {/* Invoice Totals */}
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
                  <span className="text-gray-800 font-medium">₹{formatIndianNumber(invoice.subtotal || 0)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-600">GST:</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={invoice.gstRate}
                      onChange={handleGstRateChange}
                      className="w-16 border border-gray-300 rounded p-1 mr-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                    />
                    <span className="text-gray-600 mr-2">%</span>
                    <span className="text-gray-800 font-medium">₹{formatIndianNumber(invoice.gstAmount || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-lg font-bold text-blue-600">₹{formatIndianNumber(invoice.total || 0)}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-200">
                  <p className="text-gray-600 italic text-sm">
                    <span className="font-semibold">Amount in words:</span> {invoice.amountInWords}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-yellow-50 rounded-xl p-6 shadow-md mb-8 border border-gray-200">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <label className="text-lg font-semibold text-gray-800">Notes</label>
          </div>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            className="block w-full border border-gray-300 rounded-lg shadow-sm p-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
            rows={3}
            placeholder="Payment terms, delivery information, etc."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 border-t pt-6">
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
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Performa Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
