"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface MonthlySalesData {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  hsn_codes: string;
  total_taxable_value: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  total_amount: number;
  status: string;
}

interface HSNSummaryData {
  hsn_sac_code: string;
  description: string;
  total_quantity: string;
  total_taxable_value: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  total_amount: number;
  invoice_count: number;
}

export default function Reports() {
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [hsnSummary, setHSNSummary] = useState<HSNSummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadReportsData();
  }, [selectedYear, selectedMonth, statusFilter]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadMonthlySalesData(),
        loadHSNSummaryData(),
        loadAvailableYears()
      ]);
    } catch (err) {
      console.error('Error loading reports data:', err);
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlySalesData = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using empty data');
      setMonthlySales([]);
      return;
    }

    let query = supabase
      .from('taxable_invoices')
      .select(`
        invoice_number,
        invoice_date,
        bill_to_name,
        subtotal,
        cgst_amount,
        sgst_amount,
        igst_amount,
        total,
        status,
        taxable_invoice_items(hsn_sac_code)
      `)
      .order('invoice_date', { ascending: false });

    // Apply year filter
    if (selectedMonth === 'all') {
      // Show entire year
      query = query
        .gte('invoice_date', `${selectedYear}-01-01`)
        .lte('invoice_date', `${selectedYear}-12-31`);
    } else {
      // Show specific month
      const monthNum = String(selectedMonth).padStart(2, '0');
      const startDate = `${selectedYear}-${monthNum}-01`;
      const endDate = `${selectedYear}-${monthNum}-31`;
      query = query
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log('Monthly Sales Raw Data:', data);
    console.log('Query filters:', { selectedYear, statusFilter });

    // Transform data to include HSN codes
    const salesData: MonthlySalesData[] = data?.map(invoice => {
      // Get unique HSN codes for this invoice
      const hsnCodes = [...new Set(invoice.taxable_invoice_items?.map(item => item.hsn_sac_code) || [])];

      return {
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        customer_name: invoice.bill_to_name,
        hsn_codes: hsnCodes.join(', '),
        total_taxable_value: invoice.subtotal,
        total_cgst: invoice.cgst_amount,
        total_sgst: invoice.sgst_amount,
        total_igst: invoice.igst_amount,
        total_amount: invoice.total,
        status: invoice.status
      };
    }) || [];

    setMonthlySales(salesData);
  };

  const loadHSNSummaryData = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using empty data');
      setHsnSacData([]);
      return;
    }

    let query = supabase
      .from('taxable_invoice_items')
      .select(`
        hsn_sac_code,
        description,
        quantity,
        rate,
        amount,
        taxable_invoices!inner(
          invoice_date,
          cgst_amount,
          sgst_amount,
          igst_amount,
          subtotal,
          total,
          status
        )
      `);

    // Apply year and month filter
    if (selectedMonth === 'all') {
      // Show entire year
      query = query
        .gte('taxable_invoices.invoice_date', `${selectedYear}-01-01`)
        .lte('taxable_invoices.invoice_date', `${selectedYear}-12-31`);
    } else {
      // Show specific month
      const monthNum = String(selectedMonth).padStart(2, '0');
      const startDate = `${selectedYear}-${monthNum}-01`;
      const endDate = `${selectedYear}-${monthNum}-31`;
      query = query
        .gte('taxable_invoices.invoice_date', startDate)
        .lte('taxable_invoices.invoice_date', endDate);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('taxable_invoices.status', statusFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log('HSN Summary Raw Data:', data);

    // Group by HSN/SAC code
    const hsnData: { [key: string]: HSNSummaryData } = {};
    
    data?.forEach(item => {
      const invoice = item.taxable_invoices;
      if (!hsnData[item.hsn_sac_code]) {
        hsnData[item.hsn_sac_code] = {
          hsn_sac_code: item.hsn_sac_code,
          description: item.description,
          total_quantity: '',
          total_taxable_value: 0,
          total_cgst: 0,
          total_sgst: 0,
          total_igst: 0,
          total_amount: 0,
          invoice_count: 0
        };
      }
      
      // Calculate proportional tax amounts for this item
      const itemTaxableValue = item.amount;
      const invoiceTaxableValue = invoice.subtotal;
      const taxRatio = invoiceTaxableValue > 0 ? itemTaxableValue / invoiceTaxableValue : 0;
      
      hsnData[item.hsn_sac_code].total_taxable_value += itemTaxableValue;
      hsnData[item.hsn_sac_code].total_cgst += invoice.cgst_amount * taxRatio;
      hsnData[item.hsn_sac_code].total_sgst += invoice.sgst_amount * taxRatio;
      hsnData[item.hsn_sac_code].total_igst += invoice.igst_amount * taxRatio;
      hsnData[item.hsn_sac_code].total_amount += itemTaxableValue + (invoice.cgst_amount + invoice.sgst_amount + invoice.igst_amount) * taxRatio;
      hsnData[item.hsn_sac_code].invoice_count += 1;
      
      // Aggregate quantities (simplified - just count items)
      hsnData[item.hsn_sac_code].total_quantity = `${hsnData[item.hsn_sac_code].invoice_count} items`;
    });

    setHSNSummary(Object.values(hsnData).sort((a, b) => a.hsn_sac_code.localeCompare(b.hsn_sac_code)));
  };

  const loadAvailableYears = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using current year');
      setAvailableYears([new Date().getFullYear()]);
      return;
    }

    const { data, error } = await supabase
      .from('taxable_invoices')
      .select('invoice_date')
      .order('invoice_date', { ascending: false });

    if (error) throw error;

    const years = new Set<number>();
    data?.forEach(invoice => {
      years.add(new Date(invoice.invoice_date).getFullYear());
    });

    setAvailableYears(Array.from(years).sort((a, b) => b - a));
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Create filename with month if specific month is selected
    const monthSuffix = selectedMonth !== 'all' ? `_${String(selectedMonth).padStart(2, '0')}` : '';
    a.download = `${filename}_${selectedYear}${monthSuffix}.csv`;

    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600 mt-4">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
              <p className="text-gray-600 mt-1">Monthly sales data and HSN/SAC code wise summary</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Invoices</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <Link
                href="/taxable-invoice/list"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Back to Invoices
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Debug Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>Selected Year:</strong> {selectedYear}</div>
            <div><strong>Selected Month:</strong> {selectedMonth === 'all' ? 'All Months' : new Date(selectedYear, parseInt(selectedMonth) - 1).toLocaleDateString('en-IN', { month: 'long' })}</div>
            <div><strong>Status Filter:</strong> {statusFilter}</div>
            <div><strong>Invoice Records:</strong> {monthlySales.length}</div>
            <div><strong>HSN Summary Records:</strong> {hsnSummary.length}</div>
            <div><strong>Available Years:</strong> {availableYears.join(', ')}</div>
          </div>
        </div>

        {/* Invoice Details Report */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                Invoice Details Report - {selectedYear}
                {selectedMonth !== 'all' && ` - ${new Date(selectedYear, parseInt(selectedMonth) - 1).toLocaleDateString('en-IN', { month: 'long' })}`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Individual invoices with HSN codes •
                Period: {selectedMonth === 'all' ? 'Full Year' : new Date(selectedYear, parseInt(selectedMonth) - 1).toLocaleDateString('en-IN', { month: 'long' })} •
                Status: {statusFilter === 'all' ? 'All Invoices' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </p>
            </div>
            <button
              onClick={() => exportToCSV(monthlySales, 'invoice_details_report')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN Codes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxable Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlySales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      No sales data found for {selectedYear}
                    </td>
                  </tr>
                ) : (
                  monthlySales.map((invoice, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.hsn_codes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.total_taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.total_cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.total_sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.total_igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {monthlySales.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900" colSpan={4}>
                      Total ({monthlySales.length} invoices)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{monthlySales.reduce((sum, invoice) => sum + invoice.total_taxable_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{monthlySales.reduce((sum, invoice) => sum + invoice.total_cgst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{monthlySales.reduce((sum, invoice) => sum + invoice.total_sgst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{monthlySales.reduce((sum, invoice) => sum + invoice.total_igst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{monthlySales.reduce((sum, invoice) => sum + invoice.total_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">-</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* HSN/SAC Code Summary */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                HSN/SAC Code Summary - {selectedYear}
                {selectedMonth !== 'all' && ` - ${new Date(selectedYear, parseInt(selectedMonth) - 1).toLocaleDateString('en-IN', { month: 'long' })}`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Product-wise tax analysis •
                Period: {selectedMonth === 'all' ? 'Full Year' : new Date(selectedYear, parseInt(selectedMonth) - 1).toLocaleDateString('en-IN', { month: 'long' })} •
                Status: {statusFilter === 'all' ? 'All Invoices' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </p>
            </div>
            <button
              onClick={() => exportToCSV(hsnSummary, 'hsn_sac_summary')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN/SAC Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxable Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hsnSummary.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No HSN/SAC data found for {selectedYear}
                    </td>
                  </tr>
                ) : (
                  hsnSummary.map((hsn, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {hsn.hsn_sac_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {hsn.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hsn.total_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{hsn.total_taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{hsn.total_cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{hsn.total_sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{hsn.total_igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{hsn.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {hsnSummary.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900" colSpan={3}>Total</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{hsnSummary.reduce((sum, hsn) => sum + hsn.total_taxable_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{hsnSummary.reduce((sum, hsn) => sum + hsn.total_cgst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{hsnSummary.reduce((sum, hsn) => sum + hsn.total_sgst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{hsnSummary.reduce((sum, hsn) => sum + hsn.total_igst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{hsnSummary.reduce((sum, hsn) => sum + hsn.total_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
