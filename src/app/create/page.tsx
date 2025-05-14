"use client";

import { useState } from "react";
import Link from "next/link";
import DynamicItemsTable from "@/components/DynamicItemsTable";
import { amountInWords } from "@/utils/numberToWords";
import PDFPreviewModal from "@/components/PDFPreviewModal";

// Define types for our invoice
interface InvoiceItem {
  id: string;
  serial_no: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
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
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
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
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoice({
      ...invoice,
      items: [...invoice.items, newItem],
    });
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

        // Recalculate amount if quantity or rate changes
        if (field === "quantity" || field === "rate") {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }

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
    const subtotal = updatedInvoice.items.reduce((sum, item) => sum + item.amount, 0);
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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        documentType="invoice"
        data={invoice}
      />

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Performa Invoice</h1>
          <div className="space-x-2">
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Preview PDF
            </button>
            <Link
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Your Company</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Customer Details</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  value={invoice.customerName}
                  onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={invoice.customerAddress}
                  onChange={(e) => setInvoice({ ...invoice, customerAddress: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={invoice.customerEmail}
                    onChange={(e) => setInvoice({ ...invoice, customerEmail: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={invoice.customerPhone}
                    onChange={(e) => setInvoice({ ...invoice, customerPhone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items - Dynamic Table */}
        <DynamicItemsTable
          initialItems={invoice.items}
          onItemsChange={(updatedItems) => {
            const updatedInvoice = { ...invoice, items: updatedItems };
            recalculateTotals(updatedInvoice);
          }}
          calculateAmount={(item) => item.quantity * item.rate}
        />

        {/* Invoice Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-2/3">
            <div className="border rounded-md p-4 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST ({invoice.gstRate}%):</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={invoice.gstRate}
                    onChange={handleGstRateChange}
                    className="w-16 border border-gray-300 rounded p-1 mr-2"
                    min="0"
                    max="100"
                  />
                  <span>₹{invoice.gstAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{invoice.total.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-700 italic">
                  <span className="font-semibold">Amount in words:</span> {invoice.amountInWords}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows={3}
            placeholder="Payment terms, delivery information, etc."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={generatePDF}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Preview PDF
          </button>
          <button
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Save Performa Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
