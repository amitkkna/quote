"use client";

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Import PDF components directly (they already have ClientOnlyPDFViewer wrapper)
import InvoicePDF from './InvoicePDF';
import QuotationPDF from './QuotationPDF';
import GTCQuotationPDF from './GTCQuotationPDF';
import RudharmaQuotationPDF from './RudharmaQuotationPDF';
import ChallanPDF from './ChallanPDF';
import TaxableInvoicePDF from './TaxableInvoicePDF';
import GTCTaxableInvoicePDF from './GTCTaxableInvoicePDF';
import RudharmaTaxableInvoicePDF from './RudharmaTaxableInvoicePDF';

interface ChallanPDFRef {
  downloadPDF: () => Promise<void>;
}

interface TaxableInvoicePDFRef {
  downloadPDF: () => Promise<void>;
}

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'invoice' | 'quotation' | 'challan' | 'taxable-invoice';
  data: any;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  documentType,
  data
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const invoicePdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const quotationPdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const gtcQuotationPdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const rudharmaQuotationPdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const challanPdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const taxableInvoicePdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const gtcTaxableInvoicePdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const rudharmaTaxableInvoicePdfRef = useRef<{ downloadPDF: () => Promise<void> }>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle download button click
  const handleDownload = async () => {
    try {
      console.log('Download clicked for document type:', documentType);
      console.log('Data:', data);

      if (documentType === 'invoice' && invoicePdfRef.current) {
        console.log('Downloading invoice PDF');
        await invoicePdfRef.current.downloadPDF();
      } else if (documentType === 'quotation') {
        // Determine which quotation PDF to use based on company
        const companyName = data.companyName || '';
        console.log('Quotation company:', companyName);
        if (companyName.includes('Global Trading Corporation') && gtcQuotationPdfRef.current) {
          console.log('Downloading GTC quotation PDF');
          await gtcQuotationPdfRef.current.downloadPDF();
        } else if (companyName.includes('Rudharma') && rudharmaQuotationPdfRef.current) {
          console.log('Downloading Rudharma quotation PDF');
          await rudharmaQuotationPdfRef.current.downloadPDF();
        } else if (quotationPdfRef.current) {
          console.log('Downloading standard quotation PDF');
          await quotationPdfRef.current.downloadPDF();
        }
      } else if (documentType === 'challan' && challanPdfRef.current) {
        console.log('Downloading challan PDF');
        await challanPdfRef.current.downloadPDF();
      } else if (documentType === 'taxable-invoice') {
        // Determine which taxable invoice PDF to use based on company
        const companyName = data.companyName || '';
        console.log('Taxable invoice company:', companyName);
        console.log('Available refs:', {
          gtc: !!gtcTaxableInvoicePdfRef.current,
          rudharma: !!rudharmaTaxableInvoicePdfRef.current,
          standard: !!taxableInvoicePdfRef.current
        });

        if (companyName.includes('Global Trading Corporation') && gtcTaxableInvoicePdfRef.current) {
          console.log('Downloading GTC taxable invoice PDF');
          await gtcTaxableInvoicePdfRef.current.downloadPDF();
        } else if (companyName.includes('Rudharma') && rudharmaTaxableInvoicePdfRef.current) {
          console.log('Downloading Rudharma taxable invoice PDF');
          await rudharmaTaxableInvoicePdfRef.current.downloadPDF();
        } else if (taxableInvoicePdfRef.current) {
          console.log('Downloading standard taxable invoice PDF');
          await taxableInvoicePdfRef.current.downloadPDF();
        } else {
          console.log('No valid PDF ref found for taxable invoice');
          alert('PDF component not ready. Please wait a moment and try again.');
        }
      } else {
        console.log('No matching document type or ref found');
        alert('PDF component not ready. Please wait a moment and try again.');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-11/12 h-5/6 max-w-6xl flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {documentType === 'invoice' ? 'Performa Invoice Preview' :
             documentType === 'quotation' ? 'Quotation Preview' :
             documentType === 'taxable-invoice' ? 'Taxable Invoice Preview' : 'Challan Preview'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-auto p-5 bg-gray-50">
          <div className="bg-white rounded-lg shadow-md p-2 h-full">
            {!isClient ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading PDF viewer...</p>
                </div>
              </div>
            ) : documentType === 'invoice' ? (
              <InvoicePDF ref={invoicePdfRef} invoice={data} />
            ) : documentType === 'quotation' ? (
              // Render appropriate quotation PDF based on company
              (() => {
                const companyName = data.companyName || '';
                if (companyName.includes('Global Trading Corporation')) {
                  return <GTCQuotationPDF ref={gtcQuotationPdfRef} quotation={data} />;
                } else if (companyName.includes('Rudharma')) {
                  return <RudharmaQuotationPDF ref={rudharmaQuotationPdfRef} quotation={data} />;
                } else {
                  return <QuotationPDF ref={quotationPdfRef} quotation={data} />;
                }
              })()
            ) : documentType === 'taxable-invoice' ? (
              // Render appropriate taxable invoice PDF based on company
              (() => {
                const companyName = data.companyName || '';
                if (companyName.includes('Global Trading Corporation')) {
                  return <GTCTaxableInvoicePDF ref={gtcTaxableInvoicePdfRef} {...data} />;
                } else if (companyName.includes('Rudharma')) {
                  return <RudharmaTaxableInvoicePDF ref={rudharmaTaxableInvoicePdfRef} {...data} />;
                } else {
                  return <TaxableInvoicePDF ref={taxableInvoicePdfRef} {...data} />;
                }
              })()
            ) : (
              <ChallanPDF ref={challanPdfRef} challan={data} />
            )}
          </div>
        </div>

        <div className="p-5 border-t flex justify-end space-x-3 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
