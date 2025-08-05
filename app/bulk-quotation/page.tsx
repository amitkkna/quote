"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DynamicItemsTable from "../components/DynamicItemsTable";
import { amountInWords } from "../utils/numberToWords";
import { formatDate, parseDate } from "../utils/dateFormatter";
import { formatIndianNumber } from "../utils/numberFormatter";

// Dynamic import for PDF components to prevent SSR issues
const GTCQuotationPDF = dynamic(() => import("../components/GTCQuotationPDF"), {
  ssr: false,
  loading: () => <div>Loading PDF...</div>
});

const QuotationPDF = dynamic(() => import("../components/QuotationPDF"), {
  ssr: false,
  loading: () => <div>Loading PDF...</div>
});

const RudharmaQuotationPDF = dynamic(() => import("../components/RudharmaQuotationPDF"), {
  ssr: false,
  loading: () => <div>Loading PDF...</div>
});

// Define types
interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  amount: number;
  [key: string]: any;
}

interface CompanyQuotation {
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  customerGST: string;
  subject: string;
  items: QuotationItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  notes: string;
  terms: string;
}

interface BulkQuotationData {
  gtc: CompanyQuotation;
  gdc: CompanyQuotation;
  rudharma: CompanyQuotation;
}

export default function BulkQuotation() {
  // Company configurations
  const companyConfigs = {
    gtc: {
      name: "Global Trading Corporation",
      prefix: "GTC-Q",
      color: "red",
      defaultTerms: "Terms and conditions apply.",
    },
    gdc: {
      name: "Global Digital Connect",
      prefix: "GDC",
      color: "purple",
      defaultTerms: "This quotation is valid for 30 days from the date of issue.",
    },
    rudharma: {
      name: "Rudharma Enterprises",
      prefix: "RE-Q",
      color: "sky",
      defaultTerms: "Terms and conditions apply.",
    },
  };

  // Initialize with default values
  const createDefaultQuotation = (companyKey: keyof typeof companyConfigs): CompanyQuotation => ({
    quotationNumber: `${companyConfigs[companyKey].prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerEmail: "",
    customerGST: "",
    subject: "",
    items: [],
    subtotal: 0,
    gstRate: 18,
    gstAmount: 0,
    total: 0,
    amountInWords: "Zero Rupees Only",
    notes: "",
    terms: companyConfigs[companyKey].defaultTerms,
  });

  const [bulkQuotation, setBulkQuotation] = useState<BulkQuotationData>({
    gtc: createDefaultQuotation('gtc'),
    gdc: createDefaultQuotation('gdc'),
    rudharma: createDefaultQuotation('rudharma'),
  });

  const [activeTab, setActiveTab] = useState<keyof typeof companyConfigs>('gtc');
  const [autoSyncFromGTC, setAutoSyncFromGTC] = useState(true);

  // Track which fields have been manually edited for each company
  const [manuallyEdited, setManuallyEdited] = useState({
    gdc: {
      customerFields: new Set<string>(),
      items: false,
    },
    rudharma: {
      customerFields: new Set<string>(),
      items: false,
    }
  });

  // Shared columns state for synchronization
  const [sharedColumns, setSharedColumns] = useState<any[]>([]);

  // Price adjustment percentages
  const [priceAdjustments, setPriceAdjustments] = useState({
    gdc: 0, // Percentage higher than GTC
    rudharma: 0, // Percentage higher than GTC
  });

  // Check if qty and price columns exist for auto-calculation
  const hasQtyAndPriceColumns = (columns: any[]) => {
    const hasQty = columns.some(col => ['qty', 'quantity'].includes(col.id.toLowerCase()));
    const hasPrice = columns.some(col => ['price', 'rate'].includes(col.id.toLowerCase()));
    return hasQty && hasPrice;
  };

  // Recalculate totals for a specific company
  const recalculateTotals = (companyKey: keyof typeof companyConfigs, updatedQuotation: CompanyQuotation) => {
    const subtotal = updatedQuotation.items.reduce((sum, item) => {
      const amount = item.amount === "" || item.amount === undefined ? 0 : Number(item.amount);
      return sum + amount;
    }, 0);
    const gstAmount = (subtotal * updatedQuotation.gstRate) / 100;
    const total = subtotal + gstAmount;
    const totalInWords = amountInWords(total);

    const finalQuotation = {
      ...updatedQuotation,
      subtotal,
      gstAmount,
      total,
      amountInWords: totalInWords,
    };

    setBulkQuotation(prev => ({
      ...prev,
      [companyKey]: finalQuotation,
    }));
  };

  // Update company quotation
  const updateCompanyQuotation = (companyKey: keyof typeof companyConfigs, field: keyof CompanyQuotation, value: any) => {
    const updatedQuotation = { ...bulkQuotation[companyKey], [field]: value };

    // Customer data fields
    const customerFields = ['customerName', 'customerAddress', 'customerPhone', 'customerEmail', 'customerGST', 'subject'];

    if (customerFields.includes(field)) {
      if (companyKey === 'gtc' && autoSyncFromGTC) {
        // If updating GTC and auto-sync is enabled, update all companies that haven't been manually edited
        const updates: any = { gtc: { ...bulkQuotation.gtc, [field]: value } };

        // Only update GDC if this field hasn't been manually edited
        if (!manuallyEdited.gdc.customerFields.has(field)) {
          updates.gdc = { ...bulkQuotation.gdc, [field]: value };
        }

        // Only update Rudharma if this field hasn't been manually edited
        if (!manuallyEdited.rudharma.customerFields.has(field)) {
          updates.rudharma = { ...bulkQuotation.rudharma, [field]: value };
        }

        setBulkQuotation(prev => ({ ...prev, ...updates }));
      } else if (companyKey !== 'gtc') {
        // If updating GDC or Rudharma, mark this field as manually edited
        setManuallyEdited(prev => ({
          ...prev,
          [companyKey]: {
            ...prev[companyKey],
            customerFields: new Set([...prev[companyKey].customerFields, field])
          }
        }));

        setBulkQuotation(prev => ({
          ...prev,
          [companyKey]: updatedQuotation,
        }));
      } else {
        // Just update GTC without syncing
        setBulkQuotation(prev => ({
          ...prev,
          [companyKey]: updatedQuotation,
        }));
      }
    } else {
      // For non-customer fields, just update the specific company
      setBulkQuotation(prev => ({
        ...prev,
        [companyKey]: updatedQuotation,
      }));
    }

    // Recalculate if it's a field that affects totals
    if (field === 'gstRate') {
      recalculateTotals(companyKey, updatedQuotation);
    }
  };

  // Apply price adjustments to other companies based on GTC prices
  const applyPriceAdjustments = (gtcItems: QuotationItem[]) => {
    if (!autoSyncFromGTC) return;

    setBulkQuotation(prev => {
      const updated = { ...prev };

      // Update GDC prices
      if (!manuallyEdited.gdc.items) {
        updated.gdc.items = gtcItems.map(gtcItem => {
          const gdcItem = { ...gtcItem };
          if (gdcItem.price && !isNaN(parseFloat(gdcItem.price))) {
            const basePrice = parseFloat(gdcItem.price);
            const adjustedPrice = basePrice * (1 + priceAdjustments.gdc / 100);
            gdcItem.price = adjustedPrice.toFixed(2);

            // Recalculate amount if qty exists
            if (gdcItem.qty && !isNaN(parseFloat(gdcItem.qty))) {
              const qty = parseFloat(gdcItem.qty);
              gdcItem.amount = qty * adjustedPrice;
            }
          }
          return gdcItem;
        });
      }

      // Update Rudharma prices
      if (!manuallyEdited.rudharma.items) {
        updated.rudharma.items = gtcItems.map(gtcItem => {
          const rudharmaItem = { ...gtcItem };
          if (rudharmaItem.price && !isNaN(parseFloat(rudharmaItem.price))) {
            const basePrice = parseFloat(rudharmaItem.price);
            const adjustedPrice = basePrice * (1 + priceAdjustments.rudharma / 100);
            rudharmaItem.price = adjustedPrice.toFixed(2);

            // Recalculate amount if qty exists
            if (rudharmaItem.qty && !isNaN(parseFloat(rudharmaItem.qty))) {
              const qty = parseFloat(rudharmaItem.qty);
              rudharmaItem.amount = qty * adjustedPrice;
            }
          }
          return rudharmaItem;
        });
      }

      return updated;
    });
  };

  // Handle price adjustment percentage changes
  const handlePriceAdjustmentChange = (company: 'gdc' | 'rudharma', percentage: number) => {
    setPriceAdjustments(prev => {
      const newAdjustments = {
        ...prev,
        [company]: percentage
      };

      // Apply the new percentage immediately to existing items
      if (autoSyncFromGTC) {
        setBulkQuotation(prevBulk => {
          const updated = { ...prevBulk };

          // Update the specific company's items with new percentage
          if (company === 'gdc' && !manuallyEdited.gdc.items) {
            updated.gdc.items = prevBulk.gtc.items.map(gtcItem => {
              const gdcItem = { ...gtcItem };
              if (gdcItem.price && !isNaN(parseFloat(gdcItem.price))) {
                const basePrice = parseFloat(gdcItem.price);
                const adjustedPrice = basePrice * (1 + percentage / 100);
                gdcItem.price = adjustedPrice.toFixed(2);

                // Recalculate amount if qty exists
                if (gdcItem.qty && !isNaN(parseFloat(gdcItem.qty))) {
                  const qty = parseFloat(gdcItem.qty);
                  gdcItem.amount = qty * adjustedPrice;
                }
              }
              return gdcItem;
            });

            // Recalculate totals for GDC
            setTimeout(() => {
              recalculateTotals('gdc', updated.gdc);
            }, 0);
          }

          if (company === 'rudharma' && !manuallyEdited.rudharma.items) {
            updated.rudharma.items = prevBulk.gtc.items.map(gtcItem => {
              const rudharmaItem = { ...gtcItem };
              if (rudharmaItem.price && !isNaN(parseFloat(rudharmaItem.price))) {
                const basePrice = parseFloat(rudharmaItem.price);
                const adjustedPrice = basePrice * (1 + percentage / 100);
                rudharmaItem.price = adjustedPrice.toFixed(2);

                // Recalculate amount if qty exists
                if (rudharmaItem.qty && !isNaN(parseFloat(rudharmaItem.qty))) {
                  const qty = parseFloat(rudharmaItem.qty);
                  rudharmaItem.amount = qty * adjustedPrice;
                }
              }
              return rudharmaItem;
            });

            // Recalculate totals for Rudharma
            setTimeout(() => {
              recalculateTotals('rudharma', updated.rudharma);
            }, 0);
          }

          return updated;
        });
      }

      return newAdjustments;
    });
  };

  // Handle column changes and synchronize across all companies
  const handleColumnChange = (sourceCompany: keyof typeof companyConfigs, newColumns: any[]) => {
    console.log(`Column change from ${sourceCompany}:`, newColumns);

    // If auto-sync is enabled and source is GTC, sync to other companies
    if (autoSyncFromGTC && sourceCompany === 'gtc') {
      setBulkQuotation(prev => {
        const updated = { ...prev };

        // Update all companies with the new column structure
        Object.keys(updated).forEach(companyKey => {
          const company = updated[companyKey as keyof typeof updated];
          const updatedItems = company.items.map(item => {
            const newItem = { ...item };

            // Add new columns with empty values
            newColumns.forEach(col => {
              if (!(col.id in newItem)) {
                if (col.id === 'qty' || col.id === 'price') {
                  newItem[col.id] = '';
                } else if (col.id === 'amount') {
                  newItem[col.id] = 0;
                } else {
                  newItem[col.id] = '';
                }
              }
            });

            // Remove columns that no longer exist (except required ones)
            Object.keys(newItem).forEach(key => {
              if (!newColumns.some(col => col.id === key) &&
                  !['id', 'serial_no', 'description', 'amount'].includes(key)) {
                delete newItem[key];
              }
            });

            return newItem;
          });

          updated[companyKey as keyof typeof updated] = {
            ...company,
            items: updatedItems
          };
        });

        return updated;
      });
    }
  };

  // Handle individual company items change
  const handleCompanyItemsChange = (companyKey: keyof typeof companyConfigs, updatedItems: QuotationItem[]) => {
    if (companyKey === 'gtc' && autoSyncFromGTC) {
      // If updating GTC items and auto-sync is enabled, update companies that haven't been manually edited
      const updates: any = { gtc: { ...bulkQuotation.gtc, items: updatedItems } };

      // Only update GDC if items haven't been manually edited
      if (!manuallyEdited.gdc.items) {
        const gdcItems = updatedItems.map(gtcItem => {
          const gdcItem = { ...gtcItem };
          if (gdcItem.price && !isNaN(parseFloat(gdcItem.price)) && priceAdjustments.gdc !== 0) {
            const basePrice = parseFloat(gdcItem.price);
            const adjustedPrice = basePrice * (1 + priceAdjustments.gdc / 100);
            gdcItem.price = adjustedPrice.toFixed(2);

            // Recalculate amount if qty exists
            if (gdcItem.qty && !isNaN(parseFloat(gdcItem.qty))) {
              const qty = parseFloat(gdcItem.qty);
              gdcItem.amount = qty * adjustedPrice;
            }
          }
          return gdcItem;
        });
        updates.gdc = { ...bulkQuotation.gdc, items: gdcItems };
      }

      // Only update Rudharma if items haven't been manually edited
      if (!manuallyEdited.rudharma.items) {
        const rudharmaItems = updatedItems.map(gtcItem => {
          const rudharmaItem = { ...gtcItem };
          if (rudharmaItem.price && !isNaN(parseFloat(rudharmaItem.price)) && priceAdjustments.rudharma !== 0) {
            const basePrice = parseFloat(rudharmaItem.price);
            const adjustedPrice = basePrice * (1 + priceAdjustments.rudharma / 100);
            rudharmaItem.price = adjustedPrice.toFixed(2);

            // Recalculate amount if qty exists
            if (rudharmaItem.qty && !isNaN(parseFloat(rudharmaItem.qty))) {
              const qty = parseFloat(rudharmaItem.qty);
              rudharmaItem.amount = qty * adjustedPrice;
            }
          }
          return rudharmaItem;
        });
        updates.rudharma = { ...bulkQuotation.rudharma, items: rudharmaItems };
      }

      setBulkQuotation(prev => ({ ...prev, ...updates }));

      // Recalculate totals for updated companies
      setTimeout(() => {
        recalculateTotals('gtc', { ...bulkQuotation.gtc, items: updatedItems });
        if (!manuallyEdited.gdc.items) {
          recalculateTotals('gdc', { ...bulkQuotation.gdc, items: updatedItems });
        }
        if (!manuallyEdited.rudharma.items) {
          recalculateTotals('rudharma', { ...bulkQuotation.rudharma, items: updatedItems });
        }
      }, 0);
    } else if (companyKey !== 'gtc') {
      // If updating GDC or Rudharma, mark items as manually edited
      setManuallyEdited(prev => ({
        ...prev,
        [companyKey]: {
          ...prev[companyKey],
          items: true
        }
      }));

      // Update only the specific company
      const updatedQuotation = { ...bulkQuotation[companyKey], items: updatedItems };
      recalculateTotals(companyKey, updatedQuotation);
    } else {
      // Just update GTC without syncing
      const updatedQuotation = { ...bulkQuotation[companyKey], items: updatedItems };
      recalculateTotals(companyKey, updatedQuotation);
    }
  };

  // Copy customer data to all companies
  const copyCustomerDataToAll = () => {
    const sourceData = bulkQuotation[activeTab];
    setBulkQuotation(prev => ({
      ...prev,
      gtc: {
        ...prev.gtc,
        customerName: sourceData.customerName,
        customerAddress: sourceData.customerAddress,
        customerPhone: sourceData.customerPhone,
        customerEmail: sourceData.customerEmail,
        customerGST: sourceData.customerGST,
        subject: sourceData.subject,
      },
      gdc: {
        ...prev.gdc,
        customerName: sourceData.customerName,
        customerAddress: sourceData.customerAddress,
        customerPhone: sourceData.customerPhone,
        customerEmail: sourceData.customerEmail,
        customerGST: sourceData.customerGST,
        subject: sourceData.subject,
      },
      rudharma: {
        ...prev.rudharma,
        customerName: sourceData.customerName,
        customerAddress: sourceData.customerAddress,
        customerPhone: sourceData.customerPhone,
        customerEmail: sourceData.customerEmail,
        customerGST: sourceData.customerGST,
        subject: sourceData.subject,
      },
    }));
  };

  // Copy items to all companies
  const copyItemsToAll = () => {
    const sourceItems = bulkQuotation[activeTab].items;
    setBulkQuotation(prev => ({
      ...prev,
      gtc: { ...prev.gtc, items: sourceItems },
      gdc: { ...prev.gdc, items: sourceItems },
      rudharma: { ...prev.rudharma, items: sourceItems },
    }));

    // Recalculate totals for all companies
    setTimeout(() => {
      recalculateTotals('gtc', { ...bulkQuotation.gtc, items: sourceItems });
      recalculateTotals('gdc', { ...bulkQuotation.gdc, items: sourceItems });
      recalculateTotals('rudharma', { ...bulkQuotation.rudharma, items: sourceItems });
    }, 0);
  };

  const getColorClasses = (companyKey: keyof typeof companyConfigs) => {
    const colorMap = {
      gtc: {
        bg: 'bg-red-600',
        hover: 'hover:bg-red-700',
        ring: 'focus:ring-red-500',
        border: 'focus:border-red-500',
        text: 'text-red-600',
        bgLight: 'bg-red-50',
        borderLight: 'border-red-200',
      },
      gdc: {
        bg: 'bg-purple-600',
        hover: 'hover:bg-purple-700',
        ring: 'focus:ring-purple-500',
        border: 'focus:border-purple-500',
        text: 'text-purple-600',
        bgLight: 'bg-purple-50',
        borderLight: 'border-purple-200',
      },
      rudharma: {
        bg: 'bg-sky-600',
        hover: 'hover:bg-sky-700',
        ring: 'focus:ring-sky-500',
        border: 'focus:border-sky-500',
        text: 'text-sky-600',
        bgLight: 'bg-sky-50',
        borderLight: 'border-sky-200',
      },
    };
    return colorMap[companyKey];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-red-500 via-purple-500 to-sky-500 text-white p-4 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Bulk Company Quotations</h1>
                <p className="text-gray-500 mt-1">Create quotations for all three companies in one go</p>
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
            </div>
          </div>
        </header>

        {/* Auto-Sync Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Auto-Sync from GTC
          </h2>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="autoSyncFromGTC"
                checked={autoSyncFromGTC}
                onChange={(e) => setAutoSyncFromGTC(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div>
                <label htmlFor="autoSyncFromGTC" className="text-sm font-medium text-gray-700">
                  Auto-copy data from GTC to other companies
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  When enabled, data entered in GTC automatically copies to GDC and Rudharma.
                  Once you manually edit any field in GDC or Rudharma, that field becomes independent.
                </p>
              </div>
            </div>
          </div>

          {/* Manual Edit Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">GDC Status</h4>
              <div className="text-xs space-y-1">
                <div>Customer Fields: {manuallyEdited.gdc.customerFields.size > 0 ?
                  <span className="text-orange-600">Manually edited ({manuallyEdited.gdc.customerFields.size} fields)</span> :
                  <span className="text-green-600">Auto-syncing from GTC</span>}
                </div>
                <div>Items: {manuallyEdited.gdc.items ?
                  <span className="text-orange-600">Manually edited</span> :
                  <span className="text-green-600">Auto-syncing from GTC</span>}
                </div>
              </div>
            </div>

            <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
              <h4 className="font-medium text-sky-800 mb-2">Rudharma Status</h4>
              <div className="text-xs space-y-1">
                <div>Customer Fields: {manuallyEdited.rudharma.customerFields.size > 0 ?
                  <span className="text-orange-600">Manually edited ({manuallyEdited.rudharma.customerFields.size} fields)</span> :
                  <span className="text-green-600">Auto-syncing from GTC</span>}
                </div>
                <div>Items: {manuallyEdited.rudharma.items ?
                  <span className="text-orange-600">Manually edited</span> :
                  <span className="text-green-600">Auto-syncing from GTC</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={copyCustomerDataToAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Customer Data to All
            </button>
            <button
              onClick={copyItemsToAll}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Items to All
            </button>
            <button
              onClick={() => setManuallyEdited({
                gdc: { customerFields: new Set(), items: false },
                rudharma: { customerFields: new Set(), items: false }
              })}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Auto-Sync Status
            </button>
          </div>
        </div>

        {/* Price Adjustment Controls */}
        {autoSyncFromGTC && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Price Adjustments
            </h2>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
              <p className="text-sm text-gray-700 mb-4">
                Set percentage adjustments for GDC and Rudharma prices compared to GTC base prices.
                When you enter prices in GTC, other companies will automatically get adjusted prices.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GDC Price Adjustment */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <label className="text-sm font-medium text-gray-700">GDC Price Adjustment:</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceAdjustments.gdc}
                      onChange={(e) => handlePriceAdjustmentChange('gdc', parseFloat(e.target.value) || 0)}
                      className="w-20 border border-gray-300 rounded-lg shadow-sm p-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      min="-100"
                      max="1000"
                      step="0.1"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-600">% higher than GTC</span>
                  </div>
                </div>

                {/* Rudharma Price Adjustment */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <label className="text-sm font-medium text-gray-700">Rudharma Price Adjustment:</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceAdjustments.rudharma}
                      onChange={(e) => handlePriceAdjustmentChange('rudharma', parseFloat(e.target.value) || 0)}
                      className="w-20 border border-gray-300 rounded-lg shadow-sm p-2 text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      min="-100"
                      max="1000"
                      step="0.1"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-600">% higher than GTC</span>
                  </div>
                </div>
              </div>

              {/* Example Display */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-gray-600">Example: If GTC price is ₹100</p>
                  <button
                    onClick={() => {
                      // Apply current percentages to all existing items
                      handlePriceAdjustmentChange('gdc', priceAdjustments.gdc);
                      handlePriceAdjustmentChange('rudharma', priceAdjustments.rudharma);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors duration-200"
                  >
                    Apply to Existing Items
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-700">GTC</div>
                    <div className="text-green-600">₹100.00</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">GDC</div>
                    <div className="text-blue-600">₹{(100 * (1 + priceAdjustments.gdc / 100)).toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700">Rudharma</div>
                    <div className="text-orange-600">₹{(100 * (1 + priceAdjustments.rudharma / 100)).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8 border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {Object.entries(companyConfigs).map(([key, config]) => {
                const companyKey = key as keyof typeof companyConfigs;
                const colors = getColorClasses(companyKey);
                const isActive = activeTab === companyKey;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(companyKey)}
                    className={`${
                      isActive
                        ? `border-${config.color}-500 ${colors.text}`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                  >
                    {config.name}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive ? colors.bgLight : 'bg-gray-100'
                    } ${isActive ? colors.text : 'text-gray-800'}`}>
                      ₹{formatIndianNumber(bulkQuotation[companyKey].total, 0)}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Company Content */}
          <div className="p-6">
            {Object.entries(companyConfigs).map(([key, config]) => {
              const companyKey = key as keyof typeof companyConfigs;
              const colors = getColorClasses(companyKey);
              const quotation = bulkQuotation[companyKey];

              if (activeTab !== companyKey) return null;

              return (
                <div key={key} className="space-y-6">
                  {/* Company Header */}
                  <div className={`${colors.bgLight} rounded-lg p-4 ${colors.borderLight} border`}>
                    <h3 className={`text-xl font-bold ${colors.text} mb-2`}>{config.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                        <input
                          type="text"
                          value={quotation.quotationNumber}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'quotationNumber', e.target.value)}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={parseDate(quotation.date)}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'date', formatDate(e.target.value))}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                        <input
                          type="date"
                          value={parseDate(quotation.validUntil)}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'validUntil', formatDate(e.target.value))}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Customer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                          type="text"
                          value={quotation.customerName}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'customerName', e.target.value)}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={quotation.customerPhone}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'customerPhone', e.target.value)}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={quotation.customerEmail}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'customerEmail', e.target.value)}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                        <input
                          type="text"
                          value={quotation.customerGST}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'customerGST', e.target.value)}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                          placeholder="Enter GST number"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          value={quotation.customerAddress}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'customerAddress', e.target.value)}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                          rows={3}
                          placeholder="Enter complete address"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-gray-500 text-xs">(Optional)</span></label>
                        <input
                          type="text"
                          value={quotation.subject}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'subject', e.target.value)}
                          className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                          placeholder="Enter subject for the quotation (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold text-gray-800">Quotation Items</h4>
                      <div className="flex items-center space-x-2">
                        <label className="block text-sm font-medium text-gray-700">GST Rate (%)</label>
                        <input
                          type="number"
                          value={quotation.gstRate}
                          onChange={(e) => updateCompanyQuotation(companyKey, 'gstRate', parseFloat(e.target.value) || 0)}
                          className={`w-20 border border-gray-300 rounded-lg shadow-sm p-2 ${colors.ring} ${colors.border} transition-all duration-200`}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <DynamicItemsTable
                      initialItems={quotation.items}
                      onItemsChange={(items) => handleCompanyItemsChange(companyKey, items)}
                      onColumnsChange={(columns) => handleColumnChange(companyKey, columns)}
                      autoCalculateAmount={true}
                    />
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Totals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <span className="font-medium text-gray-700">Subtotal:</span>
                          <span className="font-bold text-lg text-gray-900">₹ {formatIndianNumber(quotation.subtotal, 2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <span className="font-medium text-gray-700">GST ({quotation.gstRate}%):</span>
                          <span className="font-bold text-lg text-gray-900">₹ {formatIndianNumber(quotation.gstAmount, 2)}</span>
                        </div>
                        <div className={`flex justify-between items-center p-4 ${colors.bgLight} rounded-lg border-2 ${colors.borderLight}`}>
                          <span className="font-bold text-gray-800">Total Amount:</span>
                          <span className={`font-bold text-xl ${colors.text}`}>₹ {formatIndianNumber(quotation.total, 2)}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-medium text-gray-700 mb-2">Amount in Words:</h5>
                        <p className="text-gray-900 font-medium italic">{quotation.amountInWords}</p>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`${colors.bgLight} rounded-lg p-4 border ${colors.borderLight}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                      <textarea
                        value={quotation.terms}
                        onChange={(e) => updateCompanyQuotation(companyKey, 'terms', e.target.value)}
                        className={`block w-full border border-gray-300 rounded-lg shadow-sm p-3 ${colors.ring} ${colors.border} transition-all duration-200`}
                        rows={4}
                        placeholder="Terms and conditions for this quotation"
                      />
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={quotation.notes}
                        onChange={(e) => updateCompanyQuotation(companyKey, 'notes', e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        rows={4}
                        placeholder="Additional notes or comments"
                      />
                    </div>
                  </div>

                  {/* PDF Download */}
                  <div className="flex justify-center">
                    {companyKey === 'gtc' && <GTCQuotationPDF quotation={quotation} />}
                    {companyKey === 'gdc' && <QuotationPDF quotation={quotation} />}
                    {companyKey === 'rudharma' && <RudharmaQuotationPDF quotation={quotation} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Bulk Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h3 className="font-semibold text-red-700 mb-2">Global Trading Corporation</h3>
              <p className="text-sm text-gray-600 mb-3">Total: ₹{formatIndianNumber(bulkQuotation.gtc.total, 2)}</p>
              <GTCQuotationPDF quotation={bulkQuotation.gtc} />
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-700 mb-2">Global Digital Connect</h3>
              <p className="text-sm text-gray-600 mb-3">Total: ₹{formatIndianNumber(bulkQuotation.gdc.total, 2)}</p>
              <QuotationPDF quotation={bulkQuotation.gdc} />
            </div>

            <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
              <h3 className="font-semibold text-sky-700 mb-2">Rudharma Enterprises</h3>
              <p className="text-sm text-gray-600 mb-3">Total: ₹{formatIndianNumber(bulkQuotation.rudharma.total, 2)}</p>
              <RudharmaQuotationPDF quotation={bulkQuotation.rudharma} />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">Summary</h4>
                <p className="text-sm text-gray-600">
                  Customer: {bulkQuotation.gtc.customerName || 'Not specified'} |
                  Items: GTC({bulkQuotation.gtc.items.length}), GDC({bulkQuotation.gdc.items.length}), Rudharma({bulkQuotation.rudharma.items.length}) |
                  Combined Total: ₹{formatIndianNumber(
                    bulkQuotation.gtc.total + bulkQuotation.gdc.total + bulkQuotation.rudharma.total,
                    2
                  )}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Download all PDFs (this would need to be implemented with a zip library)
                    alert('Bulk PDF download feature coming soon!');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download All PDFs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
