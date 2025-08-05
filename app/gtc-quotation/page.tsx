"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { amountInWords } from "../utils/numberToWords";
import { formatDate, parseDate } from "../utils/dateFormatter";
import { formatIndianNumber } from "../utils/numberFormatter";

// Dynamic import for PDF components to prevent SSR issues
const PDFPreviewModal = dynamic(() => import("../components/PDFPreviewModal"), {
  ssr: false,
  loading: () => <div>Loading PDF...</div>
});

// Define types
interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  amount: number;
  [key: string]: any;
}

interface CustomColumn {
  id: string;
  name: string;
  width: string;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerGST: string;
  customerPhone: string;
  subject: string;
  items: QuotationItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  notes: string;
  terms: string;
  customColumns: CustomColumn[];
}

export default function GTCQuotation() {
  // Initialize with Global Trading Corporation details
  const [quotation, setQuotation] = useState<QuotationData>({
    quotationNumber: `GTC-Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: "",
    customerAddress: "",
    customerGST: "",
    customerPhone: "",
    subject: "",
    items: [
      {
        id: "1",
        serial_no: "1",
        description: "",
        qty: "",
        price: "",
        amount: 0,
      },
    ],
    subtotal: 0,
    gstRate: 18,
    gstAmount: 0,
    total: 0,
    amountInWords: "Zero Rupees Only",
    notes: "",
    terms: "Terms and conditions apply.",
    customColumns: [
      { id: "qty", name: "Qty", width: "10%" },
      { id: "price", name: "Price", width: "12%" },
    ],
  });

  // State for PDF preview modal
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);

  // State for custom columns
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Add a new item row
  const addItem = () => {
    const newItem: QuotationItem = {
      id: (quotation.items.length + 1).toString(),
      serial_no: (quotation.items.length + 1).toString(),
      description: "",
      amount: 0,
    };
    setQuotation({ ...quotation, items: [...quotation.items, newItem] });
  };

  // Remove an item row
  const removeItem = (id: string) => {
    if (quotation.items.length > 1) {
      const updatedItems = quotation.items.filter(item => item.id !== id);
      const updatedQuotation = { ...quotation, items: updatedItems };
      recalculateTotals(updatedQuotation);
    }
  };

  // Update item details and recalculate
  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    const updatedItems = quotation.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    const updatedQuotation = { ...quotation, items: updatedItems };
    recalculateTotals(updatedQuotation);
  };

  // Recalculate subtotal, GST, and total
  const recalculateTotals = (updatedQuotation: QuotationData) => {
    const subtotal = updatedQuotation.items.reduce((sum, item) => {
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
  const handleGstRateChange = (gstRate: number) => {
    const updatedQuotation = { ...quotation, gstRate };
    recalculateTotals(updatedQuotation);
  };

  // Add a new custom column
  const addCustomColumn = () => {
    if (!newColumnName.trim()) return;

    const columnId = newColumnName.toLowerCase().replace(/\s+/g, '_');

    // Check if column already exists
    if (quotation.customColumns.some(col => col.id === columnId)) {
      alert("A column with this name already exists");
      return;
    }

    // Calculate appropriate width based on column name length
    const nameLength = newColumnName.length;
    let columnWidth = "12%";
    if (nameLength > 10) {
      columnWidth = "15%";
    }
    if (nameLength > 15) {
      columnWidth = "18%";
    }

    const newColumn: CustomColumn = {
      id: columnId,
      name: newColumnName,
      width: columnWidth,
    };

    // Add this field to all existing items
    const updatedItems = quotation.items.map(item => ({
      ...item,
      [columnId]: "",
    }));

    setQuotation({
      ...quotation,
      customColumns: [...quotation.customColumns, newColumn],
      items: updatedItems,
    });

    setNewColumnName("");
    setShowAddColumn(false);
  };

  // Remove a custom column
  const removeCustomColumn = (columnId: string) => {
    const updatedColumns = quotation.customColumns.filter(col => col.id !== columnId);
    const updatedItems = quotation.items.map(item => {
      const { [columnId]: removed, ...rest } = item;
      return rest;
    });

    setQuotation({
      ...quotation,
      customColumns: updatedColumns,
      items: updatedItems,
    });
  };

  // Show PDF preview
  const generatePDF = () => {
    // Override company details for GTC
    const gtcQuotation = {
      ...quotation,
      companyName: "Global Trading Corporation",
      companyAddress: "G-607 Golchaa Enclave, Near Maturi Residency, Amlidih Raipur 492006",
      companyPhone: "6232555558",
      companyEmail: "mail.gtcglobal@gmail.com",
      companyGST: "22AOLPK1034M1Z2",
      headerImage: "/gtc-header.jpg",
      footerImage: "/gtc-footer.jpg",
    };
    setIsPDFPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 p-4 md:p-6">
      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        documentType="quotation"
        data={{
          ...quotation,
          companyName: "Global Trading Corporation",
          companyAddress: "G-607 Golchaa Enclave, Near Maturi Residency, Amlidih Raipur 492006",
          companyPhone: "6232555558",
          companyEmail: "mail.gtcglobal@gmail.com",
          companyGST: "22AOLPK1034M1Z2",
          headerImage: "/gtc-header.jpg",
          footerImage: "/gtc-footer.jpg",
          signatureImage: "/gtc-signature.jpg",
        }}
      />

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-red-600 text-white p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Global Trading Corporation</h1>
              <p className="text-red-600 font-semibold mt-1">Quotation System</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generatePDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center shadow-md"
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
              Back to Home
            </Link>
          </div>
        </div>

        {/* Quotation Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-red-50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-red-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Quotation Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                <input
                  type="text"
                  value={quotation.quotationNumber}
                  onChange={(e) => setQuotation({ ...quotation, quotationNumber: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={parseDate(quotation.date)}
                  onChange={(e) => setQuotation({ ...quotation, date: formatDate(e.target.value) })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={parseDate(quotation.validUntil)}
                  onChange={(e) => setQuotation({ ...quotation, validUntil: formatDate(e.target.value) })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
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
                    value={quotation.customerGST}
                    onChange={(e) => setQuotation({ ...quotation, customerGST: e.target.value })}
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

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-800">Quotation Items</h2>
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {quotation.items.length} {quotation.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowAddColumn(!showAddColumn)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 ${
                  showAddColumn
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {showAddColumn ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Custom Column
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={addItem}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
            </div>
          </div>

          {showAddColumn && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
              <h3 className="text-sm font-medium text-red-800 mb-3">Add a Custom Column</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Enter column name (e.g. Size, Color, Material)"
                    className="w-full border border-red-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCustomColumn}
                  disabled={!newColumnName.trim()}
                  className={`whitespace-nowrap px-4 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 ${
                    newColumnName.trim()
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Column
                  </span>
                </button>
              </div>
              <p className="text-xs text-red-600 mt-2">
                Custom columns will appear before the Amount column. Each custom column will maintain its position.
              </p>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-16">
                    S. No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Description
                  </th>
                  {/* Render custom column headers */}
                  {quotation.customColumns.map((column) => (
                    <th key={column.id} className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider relative group">
                      <div className="flex items-center justify-between">
                        <span>{column.name}</span>
                        <button
                          onClick={() => removeCustomColumn(column.id)}
                          className="ml-2 text-red-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove column"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-32">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotation.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        placeholder="Enter description"
                      />
                    </td>
                    {/* Render custom column inputs */}
                    {quotation.customColumns.map((column) => (
                      <td key={`${item.id}-${column.id}`} className="px-4 py-3">
                        <input
                          type="text"
                          value={item[column.id] || ""}
                          onChange={(e) => updateItem(item.id, column.id, e.target.value)}
                          className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          placeholder={`Enter ${column.name.toLowerCase()}`}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.amount || ""}
                        onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-right"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={quotation.items.length === 1}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          quotation.items.length === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-900 hover:bg-red-50"
                        }`}
                        title="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary and Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Summary</h3>
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
                    onChange={(e) => handleGstRateChange(parseFloat(e.target.value) || 0)}
                    className="w-16 border border-gray-300 rounded p-1 mr-2 text-center focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-600 mr-2">%</span>
                  <span className="text-gray-800 font-medium">₹{formatIndianNumber(quotation.gstAmount || 0)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-red-600">₹{formatIndianNumber(quotation.total || 0)}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-200">
                <p className="text-gray-600 italic text-sm">
                  <span className="font-semibold">Amount in words:</span> {quotation.amountInWords}
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="space-y-6">
            <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <textarea
                value={quotation.terms}
                onChange={(e) => setQuotation({ ...quotation, terms: e.target.value })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                rows={4}
                placeholder="Terms and conditions for this quotation"
              />
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={quotation.notes}
                onChange={(e) => setQuotation({ ...quotation, notes: e.target.value })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                rows={4}
                placeholder="Additional notes for the customer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
