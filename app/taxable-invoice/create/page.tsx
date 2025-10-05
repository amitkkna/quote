"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import TaxableInvoiceItemsTable from "../../components/TaxableInvoiceItemsTable";
import ClientOnlyPDFModal from "../../components/ClientOnlyPDFModal";
import { customerService, invoiceService, Customer, TaxableInvoice, isSupabaseConfigured } from "../../lib/supabase";

// Dynamic import for direct PDF download
const TaxableInvoicePDF = dynamic(() => import("../../components/TaxableInvoicePDF"), {
  ssr: false
});

const GTCTaxableInvoicePDF = dynamic(() => import("../../components/GTCTaxableInvoicePDF"), {
  ssr: false
});

const RudharmaTaxableInvoicePDF = dynamic(() => import("../../components/RudharmaTaxableInvoicePDF"), {
  ssr: false
});

interface InvoiceItem {
  id: string;
  description: string;
  hsn_sac_code: string;
  quantity: string; // Changed to string to allow units like "5 pcs", "2 kg"
  rate: number;
  amount: number;
  [key: string]: any;
}

interface TaxRates {
  igst: number;
  cgst: number;
  sgst: number;
}

function CreateTaxableInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we're in edit mode
  const isEditMode = searchParams.get('edit') === 'true';
  const editInvoiceId = searchParams.get('invoiceId');

  const [companyName, setCompanyName] = useState("Global Digital Connect");
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
    { id: "1", description: "", hsn_sac_code: "", quantity: "1", rate: 0, amount: 0 }
  ]);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [customColumnsMap, setCustomColumnsMap] = useState<{[key: string]: string}>({});
  
  // Tax Configuration
  const [taxRates, setTaxRates] = useState<TaxRates>({
    igst: 0,
    cgst: 0,
    sgst: 0
  });
  const [taxType, setTaxType] = useState<'igst' | 'cgst_sgst'>('cgst_sgst');

  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [fitToOnePage, setFitToOnePage] = useState(false);
  const [hindiMode, setHindiMode] = useState(false);
  const [roundOff, setRoundOff] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Database state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);

  // Direct PDF download refs for different companies
  const taxableInvoicePdfRef = useRef<any>(null);
  const gtcTaxableInvoicePdfRef = useRef<any>(null);
  const rudharmaTaxableInvoicePdfRef = useRef<any>(null);
  const [pdfComponentReady, setPdfComponentReady] = useState(false);

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
    // Calculate precise subtotal with decimals
    const preciseSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
    return roundOff ? Math.round(preciseSubtotal) : Math.round(preciseSubtotal * 100) / 100;
  };

  const calculateTaxAmount = () => {
    // Use precise subtotal for tax calculations
    const preciseSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
    if (taxType === 'igst') {
      const igstAmount = (preciseSubtotal * taxRates.igst) / 100;
      return roundOff ? Math.round(igstAmount) : Math.round(igstAmount * 100) / 100;
    } else {
      const cgstAmount = (preciseSubtotal * taxRates.cgst) / 100;
      const sgstAmount = (preciseSubtotal * taxRates.sgst) / 100;
      const totalTax = cgstAmount + sgstAmount;
      return roundOff ? Math.round(totalTax) : Math.round(totalTax * 100) / 100;
    }
  };

  const calculateCGSTAmount = () => {
    const preciseSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const cgstAmount = (preciseSubtotal * taxRates.cgst) / 100;
    return roundOff ? Math.round(cgstAmount) : Math.round(cgstAmount * 100) / 100;
  };

  const calculateSGSTAmount = () => {
    const preciseSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const sgstAmount = (preciseSubtotal * taxRates.sgst) / 100;
    return roundOff ? Math.round(sgstAmount) : Math.round(sgstAmount * 100) / 100;
  };

  const calculateIGSTAmount = () => {
    const preciseSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const igstAmount = (preciseSubtotal * taxRates.igst) / 100;
    return roundOff ? Math.round(igstAmount) : Math.round(igstAmount * 100) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount();
    const total = subtotal + taxAmount;
    return roundOff ? Math.round(total) : Math.round(total * 100) / 100;
  };

  const handlePreview = () => {
    if (!invoiceNumber || !billToName || items.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    setShowPreview(true);
  };

  // Save invoice to database
  const saveInvoiceToDatabase = async () => {
    if (!invoiceNumber || !billToName || items.length === 0) {
      alert("Please fill in all required fields before saving");
      return;
    }

    if (!isSupabaseConfigured()) {
      alert("Database not configured. Please set up Supabase environment variables.");
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // First, create or update customer
      const customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'> = {
        name: billToName,
        address: billToAddress,
        gst_number: billToGST || undefined,
      };

      const customer = await customerService.upsertCustomer(customerData);

      // Prepare invoice data
      const invoiceData: Omit<TaxableInvoice, 'id' | 'created_at' | 'updated_at'> = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        po_reference: poReference || undefined,
        po_date: poDate || undefined,
        customer_id: customer.id!,
        company_name: companyName,
        bill_to_name: billToName,
        bill_to_address: billToAddress,
        bill_to_gst: billToGST || undefined,
        ship_to_name: shipToName,
        ship_to_address: shipToAddress,
        ship_to_gst: shipToGST || undefined,
        subtotal: calculateSubtotal(),
        tax_type: taxType,
        igst_rate: taxRates.igst,
        cgst_rate: taxRates.cgst,
        sgst_rate: taxRates.sgst,
        igst_amount: calculateIGSTAmount(),
        cgst_amount: calculateCGSTAmount(),
        sgst_amount: calculateSGSTAmount(),
        tax_amount: calculateTaxAmount(),
        total: calculateTotal(),
        terms_and_conditions: termsAndConditions || undefined,
        round_off: roundOff,
        hindi_mode: hindiMode,
        fit_to_one_page: fitToOnePage,
        status: 'draft'
      };

      // Prepare items data - include all item properties for custom columns
      const itemsData = items.map((item) => {
        const baseData = {
          description: item.description,
          description_hindi: item.description_hindi,
          hsn_sac_code: item.hsn_sac_code,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        };

        // Include all custom column values using the column IDs as keys
        const customData = customColumns.reduce((acc, colId) => {
          if (item[colId] !== undefined && item[colId] !== '') {
            acc[colId] = item[colId];
          }
          return acc;
        }, {} as Record<string, any>);

        return { ...baseData, ...customData };
      });

      // Debug logging
      console.log("=== SAVING INVOICE DEBUG ===");
      console.log("Custom Columns:", customColumns);
      console.log("Custom Columns Map:", customColumnsMap);
      console.log("Items Data:", itemsData);
      console.log("Raw Items:", items);

      // Save to database with custom columns
      let result;
      if (isEditMode && editInvoiceId) {
        // Update existing invoice
        result = await invoiceService.updateTaxableInvoice(
          editInvoiceId,
          invoiceData,
          itemsData,
          customColumns.length > 0 ? customColumns : undefined,
          customColumns.length > 0 ? customColumnsMap : undefined
        );
      } else {
        // Create new invoice
        result = await invoiceService.saveTaxableInvoice(
          invoiceData,
          itemsData,
          customColumns.length > 0 ? customColumns : undefined,
          customColumns.length > 0 ? customColumnsMap : undefined
        );
      }

      setSavedInvoiceId(result.invoice?.id || result.invoiceId);
      setSaveStatus('saved');

      // Show success message and handle navigation
      if (isEditMode) {
        alert(`Invoice ${invoiceNumber} updated successfully!`);
        // Redirect to view page after successful update
        router.push(`/taxable-invoice/view/${editInvoiceId}`);
      } else {
        alert(`Invoice ${invoiceNumber} saved successfully!`);
      }

    } catch (error) {
      console.error('Error saving invoice:', error);
      setSaveStatus('error');
      alert('Error saving invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };



  // Direct download function
  const directDownloadPDF = async () => {
    try {
      console.log('Direct taxable invoice download clicked, PDF ready:', pdfComponentReady);

      if (!pdfComponentReady) {
        alert('PDF component is still loading. Please wait a moment and try again.');
        return;
      }

      // Determine which PDF component to use based on company name
      let pdfRef = null;
      if (companyName.includes('Global Trading Corporation')) {
        pdfRef = gtcTaxableInvoicePdfRef.current;
        console.log('Using GTC PDF component');
      } else if (companyName.includes('Rudharma')) {
        pdfRef = rudharmaTaxableInvoicePdfRef.current;
        console.log('Using Rudharma PDF component');
      } else {
        pdfRef = taxableInvoicePdfRef.current;
        console.log('Using default PDF component');
      }

      if (pdfRef?.downloadPDF) {
        console.log('Calling direct taxable invoice download');
        await pdfRef.downloadPDF();
      } else {
        console.log('Direct taxable invoice PDF ref not ready');
        alert('PDF component not ready. Please wait a moment and try again.');
      }
    } catch (error) {
      console.error('Direct taxable invoice download error:', error);
      alert('Error downloading PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const invoiceData = {
    companyName,
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
    customColumnsMap,
    taxRates,
    taxType,
    subtotal: calculateSubtotal(),
    taxAmount: calculateTaxAmount(),
    cgstAmount: calculateCGSTAmount(),
    sgstAmount: calculateSGSTAmount(),
    igstAmount: calculateIGSTAmount(),
    total: calculateTotal(),
    termsAndConditions,
    fitToOnePage,
    hindiMode,
    roundOff
  };

  // Load edit data if in edit mode
  useEffect(() => {
    if (isEditMode && searchParams) {
      loadEditData();
    }
  }, [isEditMode, searchParams]);

  const loadEditData = () => {
    try {
      // Load basic invoice data from URL parameters
      setCompanyName(searchParams.get('companyName') || 'Global Digital Connect');
      setInvoiceNumber(searchParams.get('invoiceNumber') || '');
      setInvoiceDate(searchParams.get('invoiceDate') || new Date().toISOString().split('T')[0]);
      setPOReference(searchParams.get('poReference') || '');
      setPODate(searchParams.get('poDate') || '');

      setBillToName(searchParams.get('billToName') || '');
      setBillToAddress(searchParams.get('billToAddress') || '');
      setBillToGST(searchParams.get('billToGST') || '');

      setShipToName(searchParams.get('shipToName') || '');
      setShipToAddress(searchParams.get('shipToAddress') || '');
      setShipToGST(searchParams.get('shipToGST') || '');

      setTaxType(searchParams.get('taxType') as 'igst' | 'cgst_sgst' || 'cgst_sgst');
      setTaxRates({
        igst: parseFloat(searchParams.get('igstRate') || '0'),
        cgst: parseFloat(searchParams.get('cgstRate') || '9'),
        sgst: parseFloat(searchParams.get('sgstRate') || '9')
      });

      setTermsAndConditions(searchParams.get('termsAndConditions') || '');
      setFitToOnePage(searchParams.get('fitToOnePage') === 'true');
      setHindiMode(searchParams.get('hindiMode') === 'true');
      setRoundOff(searchParams.get('roundOff') === 'true');

      // Load items and custom columns from JSON
      const itemsJson = searchParams.get('items');
      const customColumnsJson = searchParams.get('customColumns');

      if (itemsJson) {
        const parsedItems = JSON.parse(itemsJson);
        setItems(parsedItems.map((item: any) => ({
          id: item.id,
          description: item.description,
          hsn_sac_code: item.hsn_sac_code,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          ...item.custom_columns // Spread custom column data
        })));
      }

      if (customColumnsJson) {
        const parsedCustomColumns = JSON.parse(customColumnsJson);
        setCustomColumns(parsedCustomColumns.map((col: any) => col.column_name));
        setCustomColumnsMap(parsedCustomColumns.reduce((acc: any, col: any) => {
          acc[col.column_name] = col.column_display_name;
          return acc;
        }, {}));
      }

      console.log('Edit mode loaded successfully');
    } catch (error) {
      console.error('Error loading edit data:', error);
      alert('Error loading invoice data for editing. Please try again.');
    }
  };

  // Debug logging for PDF data
  console.log('=== PDF DATA DEBUG ===');
  console.log('Custom Columns:', customColumns);
  console.log('Custom Columns Map:', customColumnsMap);
  console.log('Items with custom data:', items);
  console.log('Invoice Data:', invoiceData);

  // Check if PDF component is ready
  useEffect(() => {
    const checkPdfReady = () => {
      // Check the appropriate PDF component based on company name
      let pdfRef = null;
      if (companyName.includes('Global Trading Corporation')) {
        pdfRef = gtcTaxableInvoicePdfRef.current;
      } else if (companyName.includes('Rudharma')) {
        pdfRef = rudharmaTaxableInvoicePdfRef.current;
      } else {
        pdfRef = taxableInvoicePdfRef.current;
      }

      if (pdfRef?.downloadPDF) {
        setPdfComponentReady(true);
        console.log('Taxable invoice PDF component is ready for:', companyName);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkPdfReady()) return;

    // Check every 500ms for up to 10 seconds
    const interval = setInterval(() => {
      if (checkPdfReady()) {
        clearInterval(interval);
      }
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.log('Taxable invoice PDF component check timeout');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [invoiceData]); // Re-check when invoice data changes

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit Taxable Invoice' : 'Create Taxable Invoice'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? `Editing invoice ${invoiceNumber} - Update invoice details and items`
                  : 'Generate professional taxable invoices with GST calculations'
                }
              </p>
              {isEditMode && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Edit Mode:</strong> You are editing an existing invoice.
                    Changes will update the current invoice data.
                  </p>
                </div>
              )}
            </div>
            <Link
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Company Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Company *
              </label>
              <select
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Global Digital Connect">Global Digital Connect</option>
                <option value="Global Trading Corporation">Global Trading Corporation</option>
                <option value="Rudharma Enterprises">Rudharma Enterprises</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Selected Company Details:</p>
                {companyName === "Global Digital Connect" && (
                  <div className="mt-1">
                    <p>320, Regus, Magnato Mall, VIP Chowk, Raipur- 492006</p>
                    <p>Phone: 9685047519</p>
                    <p>Email: prateek@globaldigitalconnect.com</p>
                  </div>
                )}
                {companyName === "Global Trading Corporation" && (
                  <div className="mt-1">
                    <p>G-607 Golchaa Enclave, Amlidih Raipur</p>
                    <p>GST: 22AOLPK1034M1Z2</p>
                    <p>Proprietor: Amit Khera</p>
                  </div>
                )}
                {companyName === "Rudharma Enterprises" && (
                  <div className="mt-1">
                    <p>133 Metro Green Society, Saddu Raipur</p>
                    <p>GST: 22APMPR8089K1Z3</p>
                  </div>
                )}
              </div>
            </div>
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
            onCustomColumnsChange={setCustomColumns}
            onCustomColumnsMapChange={setCustomColumnsMap}
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

          {/* Round Off Option */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Round Off
                </label>
                <p className="text-xs text-gray-500">
                  Round amounts to whole numbers (0 decimal places)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={roundOff}
                  onChange={(e) => setRoundOff(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold">₹{calculateSubtotal().toLocaleString('en-IN', {
                minimumFractionDigits: roundOff ? 0 : 2,
                maximumFractionDigits: roundOff ? 0 : 2
              })}</span>
            </div>

            {taxType === 'igst' ? (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">IGST ({taxRates.igst}%):</span>
                <span className="font-semibold">₹{calculateIGSTAmount().toLocaleString('en-IN', {
                  minimumFractionDigits: roundOff ? 0 : 2,
                  maximumFractionDigits: roundOff ? 0 : 2
                })}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">CGST ({taxRates.cgst}%):</span>
                  <span className="font-semibold">₹{calculateCGSTAmount().toLocaleString('en-IN', {
                    minimumFractionDigits: roundOff ? 0 : 2,
                    maximumFractionDigits: roundOff ? 0 : 2
                  })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">SGST ({taxRates.sgst}%):</span>
                  <span className="font-semibold">₹{calculateSGSTAmount().toLocaleString('en-IN', {
                    minimumFractionDigits: roundOff ? 0 : 2,
                    maximumFractionDigits: roundOff ? 0 : 2
                  })}</span>
                </div>
              </>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">₹{calculateTotal().toLocaleString('en-IN', {
                  minimumFractionDigits: roundOff ? 0 : 2,
                  maximumFractionDigits: roundOff ? 0 : 2
                })}</span>
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
          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div className="mb-4">
              {saveStatus === 'saving' && (
                <div className="flex items-center text-blue-600">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving invoice to database...
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center text-green-600">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                  Invoice saved successfully! ID: {savedInvoiceId}
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Error saving invoice. Please try again.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={saveInvoiceToDatabase}
              disabled={isSaving}
              className={`${isSaving ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {isSaving
                ? (isEditMode ? 'Updating...' : 'Saving...')
                : (isEditMode ? 'Update Invoice' : 'Save Invoice')
              }
            </button>
            <button
              onClick={handlePreview}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Preview & Download PDF
            </button>
            <button
              onClick={directDownloadPDF}
              className={`${pdfComponentReady ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'} text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center`}
              disabled={!pdfComponentReady}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pdfComponentReady ? 'Direct Download PDF' : 'Loading PDF...'}
            </button>
          </div>
        </div>

        {/* Hidden PDF components for direct download */}
        <div style={{ display: 'none' }}>
          <TaxableInvoicePDF ref={taxableInvoicePdfRef} {...invoiceData} />
          <GTCTaxableInvoicePDF ref={gtcTaxableInvoicePdfRef} {...invoiceData} />
          <RudharmaTaxableInvoicePDF ref={rudharmaTaxableInvoicePdfRef} {...invoiceData} />
        </div>

        {/* PDF Preview Modal */}
        {showPreview && (
          <ClientOnlyPDFModal
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

export default function CreateTaxableInvoice() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600 mt-4">Loading invoice form...</p>
        </div>
      </div>
    }>
      <CreateTaxableInvoiceContent />
    </Suspense>
  );
}
