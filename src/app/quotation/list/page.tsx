"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function QuotationList() {
  // This would typically come from an API or database
  const [quotations, setQuotations] = useState([
    {
      id: 1,
      quotationNumber: 'QT-001',
      date: '2025-05-01',
      customerName: 'ABC Company',
      total: 5900,
    },
    {
      id: 2,
      quotationNumber: 'QT-002',
      date: '2025-05-05',
      customerName: 'XYZ Corporation',
      total: 8750,
    },
  ]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <Link 
          href="/quotation/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Create New Quotation
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quotation Number
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {quotation.quotationNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(quotation.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quotation.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quotation.total.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-green-600 hover:text-green-900">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
