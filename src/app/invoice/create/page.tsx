"use client";

import { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';

export default function CreateInvoice() {
  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    date: '',
    dueDate: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    items: [
      {
        id: 1,
        serial_no: 1,
        description: '',
        quantity: 0,
        rate: 0,
        amount: 0
      }
    ],
    subtotal: 0,
    gstRate: 18,
    gstAmount: 0,
    total: 0,
    amountInWords: '',
    terms: '',
    notes: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (id: number, field: string, value: string | number) => {
    setInvoice(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate amount if quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            const quantity = field === 'quantity' ? Number(value) : item.quantity;
            const rate = field === 'rate' ? Number(value) : item.rate;
            updatedItem.amount = quantity * rate;
          }
          
          return updatedItem;
        }
        return item;
      });
      
      // Recalculate subtotal, GST, and total
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const gstAmount = subtotal * (prev.gstRate / 100);
      const total = subtotal + gstAmount;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        gstAmount,
        total,
        amountInWords: `${total.toFixed(2)} Rupees Only` // This should be replaced with a proper number-to-words function
      };
    });
  };

  const addItem = () => {
    setInvoice(prev => {
      const newId = Math.max(0, ...prev.items.map(item => item.id)) + 1;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: newId,
            serial_no: prev.items.length + 1,
            description: '',
            quantity: 0,
            rate: 0,
            amount: 0
          }
        ]
      };
    });
  };

  const removeItem = (id: number) => {
    setInvoice(prev => {
      const updatedItems = prev.items.filter(item => item.id !== id).map((item, index) => ({
        ...item,
        serial_no: index + 1
      }));
      
      // Recalculate subtotal, GST, and total
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const gstAmount = subtotal * (prev.gstRate / 100);
      const total = subtotal + gstAmount;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        gstAmount,
        total,
        amountInWords: `${total.toFixed(2)} Rupees Only` // This should be replaced with a proper number-to-words function
      };
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Performa Invoice</h1>
      
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              value={invoice.invoiceNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={invoice.date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={invoice.dueDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={invoice.customerName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Address</label>
            <input
              type="text"
              name="customerAddress"
              value={invoice.customerAddress}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
            <input
              type="text"
              name="customerPhone"
              value={invoice.customerPhone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Email</label>
            <input
              type="email"
              name="customerEmail"
              value={invoice.customerEmail}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S. No.</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.serial_no}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={invoice.items.length === 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <button
            onClick={addItem}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Item
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
            <textarea
              name="terms"
              value={invoice.terms}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={invoice.notes}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setShowPreview(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Preview PDF
        </button>
      </div>
      
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl max-h-screen overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">PDF Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="h-[600px]">
              <InvoicePDF invoice={invoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
