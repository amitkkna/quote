"use client";

import React, { useState } from "react";
import Link from "next/link";
import TaxableInvoiceItemsTable from "../../components/TaxableInvoiceItemsTable";
import PDFPreviewModal from "../../components/PDFPreviewModal";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  [key: string]: any;
}

interface TaxRates {
  igst: number;
  cgst: number;
  sgst: number;
}

export default function CreateTaxableInvoice() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [poReference, setPOReference] = useState("");
  const [poDate, setPODate] = useState("");
  
  // Bill To Address
  const [billToName, setBillToName] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [billToGST, setBillToGST] = useState("");
  
  // Ship To Address
  const [shipToName, setShipToName] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [shipToGST, setShipToGST] = useState("");
  const [sameAsBillTo, setSameAsBillTo] = useState(true);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0, amount: 0 }
  ]);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  
  // Tax Configuration
  const [taxRates, setTaxRates] = useState<TaxRates>({
    igst: 0,
    cgst: 0,
    sgst: 0
  });
  const [taxType, setTaxType] = useState<'igst' | 'cgst_sgst'>('cgst_sgst');

  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [fitToOnePage, setFitToOnePage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSameAsBillToChange = (checked: boolean) => {
    setSameAsBillTo(checked);
    if (checked) {
      setShipToName(billToName);
      setShipToAddress(billToAddress);
      setShipToGST(billToGST);
    }
  };

  const handleTaxTypeChange = (type: 'igst' | 'cgst_sgst') => {
    setTaxType(type);
    if (type === 'igst') {
      setTaxRates({ igst: taxRates.igst, cgst: 0, sgst: 0 });
    } else {
      setTaxRates({ igst: 0, cgst: taxRates.cgst, sgst: taxRates.sgst });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    if (taxType === 'igst') {
      return (subtotal * taxRates.igst) / 100;
    } else {
      const cgstAmount = (subtotal * taxRates.cgst) / 100;
      const sgstAmount = (subtotal * taxRates.sgst) / 100;
      return cgstAmount + sgstAmount;
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const handlePreview = () => {
    if (!invoiceNumber || !billToName || items.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    setShowPreview(true);
  };

  const invoiceData = {
    invoiceNumber,
    invoiceDate,
    poReference,
    poDate,
    billTo: {
      name: billToName,
      address: billToAddress,
      gst: billToGST
    },
    shipTo: {
      name: shipToName,
      address: shipToAddress,
      gst: shipToGST
    },
    items,
    customColumns,
    taxRates,
    taxType,
    subtotal: calculateSubtotal(),
    taxAmount: calculateTaxAmount(),
    total: calculateTotal(),
    termsAndConditions,
    fitToOnePage
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Taxable Invoice</h1>
              <p className="text-gray-600 mt-1">Generate professional taxable invoices with GST calculations</p>
            </div>
            <Link
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number *
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Reference
              </label>
              <input
                type="text"
                value={poReference}
                onChange={(e) => setPOReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PO-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Date
              </label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPODate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bill To & Ship To Addresses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bill To */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bill To Address *</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={billToName}
                  onChange={(e) => {
                    setBillToName(e.target.value);
                    if (sameAsBillTo) setShipToName(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={billToAddress}
                  onChange={(e) => {
                    setBillToAddress(e.target.value);
                    if (sameAsBillTo) setShipToAddress(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Complete Address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={billToGST}
                  onChange={(e) => {
                    setBillToGST(e.target.value);
                    if (sameAsBillTo) setShipToGST(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="GST Number"
                />
              </div>
            </div>
          </div>

          {/* Ship To */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ship To Address</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sameAsBillTo}
                  onChange={(e) => handleSameAsBillToChange(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Same as Bill To</span>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={shipToName}
                  onChange={(e) => setShipToName(e.target.value)}
                  disabled={sameAsBillTo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={shipToAddress}
                  onChange={(e) => setShipToAddress(e.target.value)}
                  disabled={sameAsBillTo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  rows={3}
                  placeholder="Complete Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={shipToGST}
                  onChange={(e) => setShipToGST(e.target.value)}
                  disabled={sameAsBillTo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="GST Number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Items</h2>
          <TaxableInvoiceItemsTable
            initialItems={items}
            onItemsChange={setItems}
          />
        </div>

        {/* Tax Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Configuration</h2>

          {/* Tax Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Tax Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="taxType"
                  value="cgst_sgst"
                  checked={taxType === 'cgst_sgst'}
                  onChange={() => handleTaxTypeChange('cgst_sgst')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">CGST + SGST (Intra-state)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="taxType"
                  value="igst"
                  checked={taxType === 'igst'}
                  onChange={() => handleTaxTypeChange('igst')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">IGST (Inter-state)</span>
              </label>
            </div>
          </div>

          {/* Tax Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taxType === 'igst' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IGST Rate (%)
                </label>
                <input
                  type="number"
                  value={taxRates.igst}
                  onChange={(e) => setTaxRates({ ...taxRates, igst: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="18"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRates.cgst}
                    onChange={(e) => setTaxRates({ ...taxRates, cgst: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRates.sgst}
                    onChange={(e) => setTaxRates({ ...taxRates, sgst: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold">₹{calculateSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {taxType === 'igst' ? (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">IGST ({taxRates.igst}%):</span>
                <span className="font-semibold">₹{((calculateSubtotal() * taxRates.igst) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">CGST ({taxRates.cgst}%):</span>
                  <span className="font-semibold">₹{((calculateSubtotal() * taxRates.cgst) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">SGST ({taxRates.sgst}%):</span>
                  <span className="font-semibold">₹{((calculateSubtotal() * taxRates.sgst) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms and Conditions</h2>
          <textarea
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter terms and conditions..."
          />
        </div>

        {/* PDF Layout Options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">PDF Layout Options</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fitToOnePage"
              checked={fitToOnePage}
              onChange={(e) => setFitToOnePage(e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="fitToOnePage" className="text-sm text-gray-700">
              <span className="font-medium">Fit to One Page</span>
              <span className="block text-gray-500 text-xs mt-1">
                Compress content to fit in a single page (reduces font size and spacing)
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handlePreview}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Preview & Download PDF
            </button>
          </div>
        </div>

        {/* PDF Preview Modal */}
        {showPreview && (
          <PDFPreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            documentType="taxable-invoice"
            data={invoiceData}
          />
        )}
      </div>
    </div>
  );
}
