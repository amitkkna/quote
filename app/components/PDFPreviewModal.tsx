"use client";

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for all PDF components to avoid SSR issues
const InvoicePDF = dynamic(() => import('./InvoicePDF'), { ssr: false });
const QuotationPDF = dynamic(() => import('./QuotationPDF'), { ssr: false });
const GTCQuotationPDF = dynamic(() => import('./GTCQuotationPDF'), { ssr: false });
const RudharmaQuotationPDF = dynamic(() => import('./RudharmaQuotationPDF'), { ssr: false });
const ChallanPDF = dynamic(() => import('./ChallanPDF'), { ssr: false });
const TaxableInvoicePDF = dynamic(() => import('./TaxableInvoicePDF'), { ssr: false });
const GTCTaxableInvoicePDF = dynamic(() => import('./GTCTaxableInvoicePDF'), { ssr: false });
const RudharmaTaxableInvoicePDF = dynamic(() => import('./RudharmaTaxableInvoicePDF'), { ssr: false });

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
  const invoicePdfRef = useRef<any>(null);
  const quotationPdfRef = useRef<any>(null);
  const gtcQuotationPdfRef = useRef<any>(null);
  const rudharmaQuotationPdfRef = useRef<any>(null);
  const challanPdfRef = useRef<any>(null);
  const taxableInvoicePdfRef = useRef<any>(null);
  const gtcTaxableInvoicePdfRef = useRef<any>(null);
  const rudharmaTaxableInvoicePdfRef = useRef<any>(null);

  // State to track if components are loaded
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pdfComponentMounted, setPdfComponentMounted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple loading approach - wait for components to load
  useEffect(() => {
    if (isClient && isOpen) {
      // Give components time to mount and set refs
      const timer = setTimeout(() => {
        setComponentsLoaded(true);
        setPdfComponentMounted(true);
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [isClient, isOpen]);

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
    console.log('Download button clicked');
    console.log('Components loaded:', componentsLoaded);
    console.log('PDF component mounted:', pdfComponentMounted);

    try {
      console.log('Download clicked for document type:', documentType);
      console.log('Data:', data);

      // Add a small delay to ensure refs are properly set
      await new Promise(resolve => setTimeout(resolve, 500));

      if (documentType === 'invoice' && invoicePdfRef.current?.downloadPDF) {
        console.log('Downloading invoice PDF');
        await invoicePdfRef.current.downloadPDF();
      } else if (documentType === 'quotation') {
        // Determine which quotation PDF to use based on company
        const companyName = data.companyName || '';
        console.log('Quotation company:', companyName);
        if (companyName.includes('Global Trading Corporation') && gtcQuotationPdfRef.current?.downloadPDF) {
          console.log('Downloading GTC quotation PDF');
          await gtcQuotationPdfRef.current.downloadPDF();
        } else if (companyName.includes('Rudharma') && rudharmaQuotationPdfRef.current?.downloadPDF) {
          console.log('Downloading Rudharma quotation PDF');
          await rudharmaQuotationPdfRef.current.downloadPDF();
        } else if (quotationPdfRef.current?.downloadPDF) {
          console.log('Downloading standard quotation PDF');
          console.log('Quotation PDF ref exists:', !!quotationPdfRef.current);
          await quotationPdfRef.current.downloadPDF();
        } else {
          console.log('No quotation PDF ref found, trying anyway...');
          console.log('Available refs:', {
            quotation: !!quotationPdfRef.current,
            gtc: !!gtcQuotationPdfRef.current,
            rudharma: !!rudharmaQuotationPdfRef.current
          });

          // Try to call download anyway - sometimes the ref exists but the check fails
          try {
            if (quotationPdfRef.current?.downloadPDF) {
              console.log('Found quotation ref on retry, downloading...');
              await quotationPdfRef.current.downloadPDF();
            } else {
              alert('PDF component not ready. Please wait a moment and try again.');
            }
          } catch (error) {
            console.error('Error in fallback download:', error);
            alert('PDF component not ready. Please wait a moment and try again.');
          }
        }
      } else if (documentType === 'challan' && challanPdfRef.current?.downloadPDF) {
        console.log('Downloading challan PDF');
        await challanPdfRef.current.downloadPDF();
      } else if (documentType === 'taxable-invoice') {
        // Determine which taxable invoice PDF to use based on company
        const companyName = data.companyName || '';
        console.log('Taxable invoice company:', companyName);
        console.log('Available refs:', {
          gtc: !!gtcTaxableInvoicePdfRef.current?.downloadPDF,
          rudharma: !!rudharmaTaxableInvoicePdfRef.current?.downloadPDF,
          standard: !!taxableInvoicePdfRef.current?.downloadPDF
        });

        if (companyName.includes('Global Trading Corporation') && gtcTaxableInvoicePdfRef.current?.downloadPDF) {
          console.log('Downloading GTC taxable invoice PDF');
          await gtcTaxableInvoicePdfRef.current.downloadPDF();
        } else if (companyName.includes('Rudharma') && rudharmaTaxableInvoicePdfRef.current?.downloadPDF) {
          console.log('Downloading Rudharma taxable invoice PDF');
          await rudharmaTaxableInvoicePdfRef.current.downloadPDF();
        } else if (taxableInvoicePdfRef.current?.downloadPDF) {
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
            disabled={!componentsLoaded}
            className={`px-5 py-2 rounded-lg transition-colors duration-200 flex items-center shadow-sm ${
              componentsLoaded
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {componentsLoaded ? 'Download PDF' : 'Loading PDF...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
