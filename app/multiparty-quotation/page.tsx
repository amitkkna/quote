"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import EnhancedItemsTable from "../components/EnhancedItemsTable";
import { amountInWords } from "../utils/numberToWords";
import { formatDate, parseDate } from "../utils/dateFormatter";
import { formatIndianNumber } from "../utils/numberFormatter";

// Dynamic import for PDF components to prevent SSR issues
const MultipartyQuotationPDF = dynamic(() => import("../components/MultipartyQuotationPDF"), {
  ssr: false,
  loading: () => <div>Loading PDF...</div>
});

// Define types
interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  baseAmount: number;
  percentageIncrease: number;
  finalAmount: number;
  [key: string]: any;
}

interface Party {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  subject: string;
  parties: Party[];
  items: QuotationItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  notes: string;
  terms: string;
  globalPercentageIncrease: number;
}

export default function MultipartyQuotation() {
  // Initialize with default values
  const [quotation, setQuotation] = useState<QuotationData>({
    quotationNumber: `MPQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subject: "",
    parties: [
      {
        id: "1",
        name: "",
        address: "",
        phone: "",
        email: "",
        gst: "",
      },
    ],
    items: [
      {
        id: "1",
        serial_no: "1",
        description: "",
        baseAmount: 0,
        percentageIncrease: 0,
        finalAmount: 0,
      },
    ],
    subtotal: 0,
    gstRate: 18,
    gstAmount: 0,
    total: 0,
    amountInWords: "Zero Rupees Only",
    notes: "",
    terms: "This quotation is valid for 30 days from the date of issue.",
    globalPercentageIncrease: 0,
  });



  // Add a new party
  const addParty = () => {
    const newParty: Party = {
      id: (quotation.parties.length + 1).toString(),
      name: "",
      address: "",
      phone: "",
      email: "",
      gst: "",
    };
    setQuotation({ ...quotation, parties: [...quotation.parties, newParty] });
  };

  // Remove a party
  const removeParty = (id: string) => {
    if (quotation.parties.length > 1) {
      const updatedParties = quotation.parties.filter(party => party.id !== id);
      setQuotation({ ...quotation, parties: updatedParties });
    }
  };

  // Update party details
  const updateParty = (id: string, field: keyof Party, value: string) => {
    const updatedParties = quotation.parties.map(party => {
      if (party.id === id) {
        return { ...party, [field]: value };
      }
      return party;
    });
    setQuotation({ ...quotation, parties: updatedParties });
  };

  // Add a new item row
  const addItem = () => {
    const newItem: QuotationItem = {
      id: (quotation.items.length + 1).toString(),
      serial_no: (quotation.items.length + 1).toString(),
      description: "",
      baseAmount: 0,
      percentageIncrease: quotation.globalPercentageIncrease,
      finalAmount: 0,
    };
    const updatedQuotation = { ...quotation, items: [...quotation.items, newItem] };
    recalculateTotals(updatedQuotation);
  };

  // Remove an item row
  const removeItem = (id: string) => {
    if (quotation.items.length > 1) {
      const updatedItems = quotation.items.filter(item => item.id !== id);
      const updatedQuotation = { ...quotation, items: updatedItems };
      recalculateTotals(updatedQuotation);
    }
  };

  // Calculate final amount based on base amount and percentage increase
  const calculateFinalAmount = (baseAmount: number, percentageIncrease: number): number => {
    return baseAmount + (baseAmount * percentageIncrease / 100);
  };

  // Update item details and recalculate
  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    const updatedItems = quotation.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate final amount when base amount or percentage changes
        if (field === 'baseAmount' || field === 'percentageIncrease') {
          const baseAmount = field === 'baseAmount' ? Number(value) : item.baseAmount;
          const percentageIncrease = field === 'percentageIncrease' ? Number(value) : item.percentageIncrease;
          updatedItem.finalAmount = calculateFinalAmount(baseAmount, percentageIncrease);
        }
        
        return updatedItem;
      }
      return item;
    });
    const updatedQuotation = { ...quotation, items: updatedItems };
    recalculateTotals(updatedQuotation);
  };

  // Apply global percentage increase to all items
  const applyGlobalPercentageIncrease = (globalPercentage: number) => {
    const updatedItems = quotation.items.map(item => ({
      ...item,
      percentageIncrease: globalPercentage,
      finalAmount: calculateFinalAmount(item.baseAmount, globalPercentage),
    }));
    const updatedQuotation = { 
      ...quotation, 
      items: updatedItems, 
      globalPercentageIncrease: globalPercentage 
    };
    recalculateTotals(updatedQuotation);
  };

  // Recalculate subtotal, GST, and total
  const recalculateTotals = (updatedQuotation: QuotationData) => {
    const subtotal = updatedQuotation.items.reduce((sum, item) => {
      const amount = item.finalAmount === "" || item.finalAmount === undefined ? 0 : Number(item.finalAmount);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-indigo-600 text-white p-4 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Multiparty Quotation</h1>
                <p className="text-gray-500 mt-1">Create quotations for multiple parties with percentage-based pricing</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <MultipartyQuotationPDF quotationData={quotation} />
            </div>
          </div>
        </header>

        {/* Quotation Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Quotation Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
              <input
                type="text"
                value={quotation.quotationNumber}
                onChange={(e) => setQuotation({ ...quotation, quotationNumber: e.target.value })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="e.g., MPQ-2025-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={parseDate(quotation.date)}
                onChange={(e) => setQuotation({ ...quotation, date: formatDate(e.target.value) })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={parseDate(quotation.validUntil)}
                onChange={(e) => setQuotation({ ...quotation, validUntil: formatDate(e.target.value) })}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
              <input
                type="number"
                value={quotation.gstRate}
                onChange={(e) => handleGstRateChange(parseFloat(e.target.value) || 0)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          {/* Subject Field */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={quotation.subject}
              onChange={(e) => setQuotation({ ...quotation, subject: e.target.value })}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="e.g., Quotation for Software Development Services"
            />
          </div>
        </div>

        {/* Global Percentage Increase */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Global Percentage Increase
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Apply percentage increase to all items</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={quotation.globalPercentageIncrease}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    setQuotation({ ...quotation, globalPercentageIncrease: percentage });
                  }}
                  className="block w-32 border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  min="0"
                  max="1000"
                  step="0.01"
                  placeholder="0.00"
                />
                <span className="text-gray-500">%</span>
                <button
                  onClick={() => applyGlobalPercentageIncrease(quotation.globalPercentageIncrease)}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Apply to All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Parties Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Parties ({quotation.parties.length})
            </h2>
            <button
              onClick={addParty}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Party
            </button>
          </div>

          <div className="space-y-6">
            {quotation.parties.map((party, index) => (
              <div key={party.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-800">Party {index + 1}</h3>
                  {quotation.parties.length > 1 && (
                    <button
                      onClick={() => removeParty(party.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-2 transition-colors duration-200"
                      title="Remove party"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={party.name}
                      onChange={(e) => updateParty(party.id, 'name', e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Party name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={party.phone}
                      onChange={(e) => updateParty(party.id, 'phone', e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={party.email}
                      onChange={(e) => updateParty(party.id, 'email', e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={party.gst}
                      onChange={(e) => updateParty(party.id, 'gst', e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="GST number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={party.address}
                      onChange={(e) => updateParty(party.id, 'address', e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      rows={2}
                      placeholder="Complete address"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quotation Items */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Quotation Items
          </h2>
          <EnhancedItemsTable
            initialItems={quotation.items}
            onItemsChange={(updatedItems) => {
              const updatedQuotation = { ...quotation, items: updatedItems };
              recalculateTotals(updatedQuotation);
            }}
            enablePercentageCalculation={true}
            globalPercentageIncrease={quotation.globalPercentageIncrease}
            onGlobalPercentageApply={applyGlobalPercentageIncrease}
          />
        </div>

        {/* Totals Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Totals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span className="font-bold text-lg text-gray-900">₹ {formatIndianNumber(quotation.subtotal, 2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">GST ({quotation.gstRate}%):</span>
                <span className="font-bold text-lg text-gray-900">₹ {formatIndianNumber(quotation.gstAmount, 2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-indigo-100 rounded-lg border-2 border-indigo-200">
                <span className="font-bold text-gray-800">Total Amount:</span>
                <span className="font-bold text-xl text-indigo-700">₹ {formatIndianNumber(quotation.total, 2)}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Amount in Words:</h3>
              <p className="text-gray-900 font-medium italic">{quotation.amountInWords}</p>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="space-y-6">
          <div className="bg-indigo-50 rounded-xl p-4 shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
            <textarea
              value={quotation.terms}
              onChange={(e) => setQuotation({ ...quotation, terms: e.target.value })}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
              rows={3}
              placeholder="Additional notes or comments"
            />
          </div>
        </div>


      </div>
    </div>
  );
}
