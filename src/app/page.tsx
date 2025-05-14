import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Performa Invoice & Quotation System</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Create Performa Invoice</h2>
            <p className="text-gray-600 mb-4">Generate professional performa invoices with customizable fields, automatic calculations, and GST support.</p>
            <Link
              href="/invoice/create"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Create New Performa Invoice
            </Link>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Create Quotation</h2>
            <p className="text-gray-600 mb-4">Create detailed quotations with item descriptions, pricing, and terms that can be converted to invoices.</p>
            <Link
              href="/quotation/create"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Create New Quotation
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Manage Performa Invoices</h2>
            <p className="text-gray-600 mb-4">View, edit, and track all your created performa invoices in one place.</p>
            <Link
              href="/invoice/list"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              View All Performa Invoices
            </Link>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Manage Quotations</h2>
            <p className="text-gray-600 mb-4">Access and manage all your quotations with easy conversion to invoices.</p>
            <Link
              href="/quotation/list"
              className="inline-block bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
            >
              View All Quotations
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500">
        <p>Performa Invoice & Quotation System</p>
      </footer>
    </div>
  );
}
