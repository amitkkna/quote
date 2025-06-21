"use client";

import React, { useState, useRef, useEffect } from "react";

interface ClientOnlyPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  data: any;
}

const ClientOnlyPDFModal: React.FC<ClientOnlyPDFModalProps> = ({
  isOpen,
  onClose,
  documentType,
  data,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [PDFComponents, setPDFComponents] = useState<any>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // PDF refs
  const invoicePdfRef = useRef<any>(null);
  const quotationPdfRef = useRef<any>(null);
  const gtcQuotationPdfRef = useRef<any>(null);
  const rudharmaQuotationPdfRef = useRef<any>(null);
  const challanPdfRef = useRef<any>(null);
  const taxableInvoicePdfRef = useRef<any>(null);
  const gtcTaxableInvoicePdfRef = useRef<any>(null);
  const rudharmaTaxableInvoicePdfRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isOpen) {
      // Dynamically import PDF components only when modal is opened
      const loadComponents = async () => {
        try {
          const [
            InvoicePDF,
            QuotationPDF,
            GTCQuotationPDF,
            RudharmaQuotationPDF,
            ChallanPDF,
            TaxableInvoicePDF,
            GTCTaxableInvoicePDF,
            RudharmaTaxableInvoicePDF,
          ] = await Promise.all([
            import('./InvoicePDF'),
            import('./QuotationPDF'),
            import('./GTCQuotationPDF'),
            import('./RudharmaQuotationPDF'),
            import('./ChallanPDF'),
            import('./TaxableInvoicePDF'),
            import('./GTCTaxableInvoicePDF'),
            import('./RudharmaTaxableInvoicePDF'),
          ]);

          setPDFComponents({
            InvoicePDF: InvoicePDF.default,
            QuotationPDF: QuotationPDF.default,
            GTCQuotationPDF: GTCQuotationPDF.default,
            RudharmaQuotationPDF: RudharmaQuotationPDF.default,
            ChallanPDF: ChallanPDF.default,
            TaxableInvoicePDF: TaxableInvoicePDF.default,
            GTCTaxableInvoicePDF: GTCTaxableInvoicePDF.default,
            RudharmaTaxableInvoicePDF: RudharmaTaxableInvoicePDF.default,
          });

          setComponentsLoaded(true);
        } catch (error) {
          console.error('Error loading PDF components:', error);
        }
      };

      loadComponents();
    }
  }, [isClient, isOpen]);

  // Handle download button click
  const handleDownload = async () => {
    if (!componentsLoaded) {
      alert('PDF components are still loading. Please wait a moment and try again.');
      return;
    }

    try {
      console.log('Download clicked for document type:', documentType);
      
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
          await quotationPdfRef.current.downloadPDF();
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

  // Handle click outside modal
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

  if (!isClient || !isOpen) {
    return null;
  }

  const renderPDFComponent = () => {
    if (!componentsLoaded) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading PDF components...</p>
          </div>
        </div>
      );
    }

    const {
      InvoicePDF,
      QuotationPDF,
      GTCQuotationPDF,
      RudharmaQuotationPDF,
      ChallanPDF,
      TaxableInvoicePDF,
      GTCTaxableInvoicePDF,
      RudharmaTaxableInvoicePDF,
    } = PDFComponents;

    if (documentType === 'invoice' && InvoicePDF) {
      return <InvoicePDF ref={invoicePdfRef} {...data} />;
    } else if (documentType === 'quotation') {
      const companyName = data.companyName || '';
      if (companyName.includes('Global Trading Corporation') && GTCQuotationPDF) {
        return <GTCQuotationPDF ref={gtcQuotationPdfRef} {...data} />;
      } else if (companyName.includes('Rudharma') && RudharmaQuotationPDF) {
        return <RudharmaQuotationPDF ref={rudharmaQuotationPdfRef} {...data} />;
      } else if (QuotationPDF) {
        return <QuotationPDF ref={quotationPdfRef} {...data} />;
      }
    } else if (documentType === 'challan' && ChallanPDF) {
      return <ChallanPDF ref={challanPdfRef} {...data} />;
    } else if (documentType === 'taxable-invoice') {
      const companyName = data.companyName || '';
      if (companyName.includes('Global Trading Corporation') && GTCTaxableInvoicePDF) {
        return <GTCTaxableInvoicePDF ref={gtcTaxableInvoicePdfRef} {...data} />;
      } else if (companyName.includes('Rudharma') && RudharmaTaxableInvoicePDF) {
        return <RudharmaTaxableInvoicePDF ref={rudharmaTaxableInvoicePdfRef} {...data} />;
      } else if (TaxableInvoicePDF) {
        return <TaxableInvoicePDF ref={taxableInvoicePdfRef} {...data} />;
      }
    }

    return <div className="text-center text-gray-600">PDF component not available</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden mx-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900">PDF Preview</h2>
          <div className="flex items-center space-x-3">
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
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {renderPDFComponent()}
        </div>
      </div>
    </div>
  );
};

export default ClientOnlyPDFModal;
