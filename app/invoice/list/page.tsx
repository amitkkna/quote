"use client";

import { useState } from "react";
import Link from "next/link";

// Sample invoice data
const sampleInvoices = [
  {
    id: "INV-2023-1001",
    customerName: "ABC Corporation",
    date: "2023-10-15",
    total: 12500.00,
    status: "Paid"
  },
  {
    id: "INV-2023-1002",
    customerName: "XYZ Enterprises",
    date: "2023-10-20",
    total: 8750.50,
    status: "Pending"
  },
  {
    id: "INV-2023-1003",
    customerName: "Global Solutions Ltd",
    date: "2023-10-25",
    total: 15000.00,
    status: "Overdue"
  },
  {
    id: "INV-2023-1004",
    customerName: "Tech Innovators Inc",
    date: "2023-11-01",
    total: 5250.75,
    status: "Draft"
  },
  {
    id: "INV-2023-1005",
    customerName: "Sunrise Retailers",
    date: "2023-11-05",
    total: 9800.25,
    status: "Pending"
  }
];

export default function InvoiceList() {
  const [invoices, setInvoices] = useState(sampleInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Link 
            href="/invoice/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New Invoice
          </Link>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices by ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 pl-10"
            />
            <div className="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{invoice.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/invoice/view/${invoice.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      <Link href={`/invoice/edit/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No invoices found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (placeholder) */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredInvoices.length}</span> of{" "}
            <span className="font-medium">{filteredInvoices.length}</span> results
          </div>
          <div className="flex-1 flex justify-end">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Previous
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Next
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
