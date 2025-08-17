'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PDFPreviewModal from '../components/PDFPreviewModal';
import DynamicItemsTable from '../components/DynamicItemsTable';

interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  qty: string;
  price: string;
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
  roundOff: boolean;
  fitInOnePage: boolean;
}

export default function SanghiStationersQuotation() {
  const [quotation, setQuotation] = useState<QuotationData>({
    quotationNumber: `SS-Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
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
    roundOff: false,
    fitInOnePage: false,
  });

  // State for PDF preview modal
  const [showPDFModal, setShowPDFModal] = useState(false);

  // Convert number to words
  const numberToWords = (num: number): string => {
    if (num === 0) return "Zero Rupees Only";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    const convertHundreds = (n: number): string => {
      let result = "";
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + " ";
        return result;
      }
      if (n > 0) {
        result += ones[n] + " ";
      }
      return result;
    };

    let crores = Math.floor(num / 10000000);
    let lakhs = Math.floor((num % 10000000) / 100000);
    let thousands = Math.floor((num % 100000) / 1000);
    let hundreds = num % 1000;

    let result = "";
    if (crores > 0) result += convertHundreds(crores) + "Crore ";
    if (lakhs > 0) result += convertHundreds(lakhs) + "Lakh ";
    if (thousands > 0) result += convertHundreds(thousands) + "Thousand ";
    if (hundreds > 0) result += convertHundreds(hundreds);

    return result.trim() + " Rupees Only";
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = quotation.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    let gstAmount = (subtotal * quotation.gstRate) / 100;
    let total = subtotal + gstAmount;

    // Apply rounding if enabled
    if (quotation.roundOff) {
      subtotal = Math.round(subtotal);
      gstAmount = Math.round(gstAmount);
      total = Math.round(total);
    }

    const amountInWords = numberToWords(Math.round(total));

    setQuotation(prev => ({
      ...prev,
      subtotal,
      gstAmount,
      total,
      amountInWords
    }));
  };

  // Recalculate all item amounts based on qty and price
  const recalculateAllItems = () => {
    const updatedItems = quotation.items.map(item => {
      const qty = parseFloat(item.qty || '0') || 0;
      const price = parseFloat(item.price || '0') || 0;
      let calculatedAmount = qty > 0 && price > 0 ? qty * price : 0;

      // Apply rounding to individual item amounts if enabled
      if (quotation.roundOff) {
        calculatedAmount = Math.round(calculatedAmount);
      }

      return {
        ...item,
        amount: calculatedAmount
      };
    });

    setQuotation(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Add new item
  const addItem = () => {
    const newItem: QuotationItem = {
      id: String(quotation.items.length + 1),
      serial_no: String(quotation.items.length + 1),
      description: "",
      qty: "",
      price: "",
      amount: 0,
    };

    // Add values for custom columns
    quotation.customColumns.forEach(column => {
      if (!['serial_no', 'description', 'amount'].includes(column.id)) {
        newItem[column.id] = "";
      }
    });

    setQuotation(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove item
  const removeItem = (id: string) => {
    if (quotation.items.length > 1) {
      setQuotation(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
      setTimeout(calculateTotals, 0);
    }
  };

  // Update item
  const updateItem = (id: string, field: string, value: any) => {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate amount if qty and price are provided
          if (field === 'qty' || field === 'price') {
            const qty = parseFloat(updatedItem.qty || '0') || 0;
            const price = parseFloat(updatedItem.price || '0') || 0;
            if (qty > 0 && price > 0) {
              updatedItem.amount = qty * price;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
    setTimeout(calculateTotals, 0);
  };

  // Add custom column
  const addCustomColumn = (columnName: string) => {
    if (!columnName.trim()) return;
    
    const columnId = columnName.toLowerCase().replace(/\s+/g, '_');
    const newColumn: CustomColumn = {
      id: columnId,
      name: columnName,
      width: "15%"
    };

    setQuotation(prev => ({
      ...prev,
      customColumns: [...prev.customColumns, newColumn],
      items: prev.items.map(item => ({
        ...item,
        [columnId]: ""
      }))
    }));
  };

  // Remove custom column
  const removeCustomColumn = (columnId: string) => {
    // Don't allow removal of required columns
    if (['serial_no', 'description', 'amount'].includes(columnId)) return;
    
    setQuotation(prev => ({
      ...prev,
      customColumns: prev.customColumns.filter(col => col.id !== columnId),
      items: prev.items.map(item => {
        const newItem = { ...item };
        delete newItem[columnId];
        return newItem;
      })
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Sanghi Stationers</h1>
                <p className="text-teal-600 mt-1">& Enterprises - Professional Quotations</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPDFModal(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview PDF
              </button>
              <Link
                href="/"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          {/* Quotation Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
              <input
                type="text"
                value={quotation.quotationNumber}
                onChange={(e) => setQuotation({ ...quotation, quotationNumber: e.target.value })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={quotation.date}
                onChange={(e) => setQuotation({ ...quotation, date: e.target.value })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={quotation.validUntil}
                onChange={(e) => setQuotation({ ...quotation, validUntil: e.target.value })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={quotation.customerName}
                  onChange={(e) => setQuotation({ ...quotation, customerName: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={quotation.customerPhone}
                  onChange={(e) => setQuotation({ ...quotation, customerPhone: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
              <textarea
                value={quotation.customerAddress}
                onChange={(e) => setQuotation({ ...quotation, customerAddress: e.target.value })}
                rows={3}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                placeholder="Enter customer address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={quotation.customerGST}
                  onChange={(e) => setQuotation({ ...quotation, customerGST: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              value={quotation.subject}
              onChange={(e) => setQuotation({ ...quotation, subject: e.target.value })}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              placeholder="Enter subject for the quotation (optional)"
            />
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Items</h3>
            <DynamicItemsTable
              initialColumns={quotation.customColumns}
              initialItems={quotation.items}
              onItemsChange={(items) => {
                setQuotation(prev => ({ ...prev, items }));
                setTimeout(calculateTotals, 0);
              }}
              onColumnsChange={(columns) => {
                setQuotation(prev => ({ ...prev, customColumns: columns }));
              }}
              autoCalculateAmount={true}
            />
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={quotation.notes}
                onChange={(e) => setQuotation({ ...quotation, notes: e.target.value })}
                rows={4}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                placeholder="Additional notes..."
              />
            </div>
            <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
              <div className="space-y-3">
                {/* Round Off Toggle */}
                <div className="flex justify-between items-center pb-3 border-b border-teal-200">
                  <span className="text-gray-700 font-medium">Round Off to Nearest Rupee:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quotation.roundOff}
                      onChange={(e) => {
                        setQuotation({ ...quotation, roundOff: e.target.checked });
                        setTimeout(() => {
                          recalculateAllItems();
                        }, 0);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* Fit in One Page Toggle */}
                <div className="flex justify-between items-center pb-3 border-b border-teal-200">
                  <span className="text-gray-700 font-medium">Fit in One Page:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quotation.fitInOnePage}
                      onChange={(e) => setQuotation({ ...quotation, fitInOnePage: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* See Calculation Button */}
                <div className="flex justify-center pb-3 border-b border-teal-200">
                  <button
                    onClick={() => {
                      recalculateAllItems();
                      setTimeout(calculateTotals, 0);
                    }}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    See Calculation
                  </button>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">₹{quotation.roundOff ? quotation.subtotal.toFixed(0) : quotation.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">GST Rate:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={quotation.gstRate}
                      onChange={(e) => {
                        setQuotation({ ...quotation, gstRate: parseFloat(e.target.value) || 0 });
                        setTimeout(calculateTotals, 0);
                      }}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-gray-700">%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">GST Amount:</span>
                  <span className="font-semibold">₹{quotation.roundOff ? quotation.gstAmount.toFixed(0) : quotation.gstAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-teal-300 pt-3">
                  <div className="flex justify-between text-lg font-bold text-teal-800">
                    <span>Total:</span>
                    <span>₹{quotation.roundOff ? quotation.total.toFixed(0) : quotation.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <strong>Amount in Words:</strong><br />
                  {quotation.amountInWords}
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
            <textarea
              value={quotation.terms}
              onChange={(e) => setQuotation({ ...quotation, terms: e.target.value })}
              rows={3}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              placeholder="Terms and conditions..."
            />
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPDFModal && (
        <PDFPreviewModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          data={{
            ...quotation,
            companyName: "Sanghi Stationers and Enterprises"
          }}
          documentType="quotation"
        />
      )}
    </div>
  );
}
