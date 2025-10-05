"use client";

import React, { useEffect, useRef, useState } from 'react';
import InvoicePDF from './InvoicePDF';
import QuotationPDF from './QuotationPDF';
import GTCQuotationPDF from './GTCQuotationPDF';
import GDCQuotationPDF from './GDCQuotationPDF';
import RudharmaQuotationPDF from './RudharmaQuotationPDF';
import SAPromotionsPDF from './SAPromotionsPDF';
import SanghiStationersPDF from './SanghiStationersPDF';
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
  const invoicePdfRef = useRef<any>(null);
  const quotationPdfRef = useRef<any>(null);
  const gtcQuotationPdfRef = useRef<any>(null);
  const gdcQuotationPdfRef = useRef<any>(null);
  const rudharmaQuotationPdfRef = useRef<any>(null);
  const saPromotionsPdfRef = useRef<any>(null);
  const sanghiStationersPdfRef = useRef<any>(null);
  const challanPdfRef = useRef<any>(null);
  const taxableInvoicePdfRef = useRef<any>(null);
  const gtcTaxableInvoicePdfRef = useRef<any>(null);
  const rudharmaTaxableInvoicePdfRef = useRef<any>(null);

  // State to track if components are loaded
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pdfComponentMounted, setPdfComponentMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // More aggressive component loading detection with continuous monitoring
  useEffect(() => {
    if (isClient && isOpen) {
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds total

      const checkComponents = () => {
        attempts++;
        console.log(`=== Component check attempt ${attempts}/${maxAttempts} ===`);

        // Check all refs regardless of document type
        const refStatus = {
          gtcQuotation: !!gtcQuotationPdfRef.current?.downloadPDF,
          gdcQuotation: !!gdcQuotationPdfRef.current?.downloadPDF,
          rudharmaQuotation: !!rudharmaQuotationPdfRef.current?.downloadPDF,
          quotation: !!quotationPdfRef.current?.downloadPDF,
          invoice: !!invoicePdfRef.current?.downloadPDF,
          challan: !!challanPdfRef.current?.downloadPDF,
          taxableInvoice: !!taxableInvoicePdfRef.current?.downloadPDF,
          gtcTaxableInvoice: !!gtcTaxableInvoicePdfRef.current?.downloadPDF,
          rudharmaTaxableInvoice: !!rudharmaTaxableInvoicePdfRef.current?.downloadPDF
        };

        console.log('Ref status:', refStatus);

        const hasAnyValidRef = Object.values(refStatus).some(status => status);

        if (hasAnyValidRef) {
          console.log('✅ Found working refs! Components ready.');
          setComponentsLoaded(true);
          setPdfComponentMounted(true);
        } else if (attempts >= maxAttempts) {
          console.log('⚠️ Max attempts reached, marking as loaded anyway');
          setComponentsLoaded(true);
          setPdfComponentMounted(true);
        } else {
          // Try again in 1 second
          setTimeout(checkComponents, 1000);
        }
      };

      // Start checking immediately
      checkComponents();

      return () => {
        // Cleanup handled by the recursive setTimeout
      };
    }
  }, [isClient, isOpen]);

  // Debug ref status
  useEffect(() => {
    if (isClient && isOpen) {
      const checkRefs = () => {
        console.log('=== REF STATUS CHECK ===');
        console.log('Document type:', documentType);
        console.log('Company name:', data.companyName);
        console.log('Refs available:', {
          gtcQuotation: !!gtcQuotationPdfRef.current,
          rudharmaQuotation: !!rudharmaQuotationPdfRef.current,
          quotation: !!quotationPdfRef.current,
          invoice: !!invoicePdfRef.current,
          challan: !!challanPdfRef.current,
          taxableInvoice: !!taxableInvoicePdfRef.current,
          gtcTaxableInvoice: !!gtcTaxableInvoicePdfRef.current,
          rudharmaTaxableInvoice: !!rudharmaTaxableInvoicePdfRef.current
        });
        console.log('Download methods available:', {
          gtcQuotation: !!gtcQuotationPdfRef.current?.downloadPDF,
          gdcQuotation: !!gdcQuotationPdfRef.current?.downloadPDF,
          rudharmaQuotation: !!rudharmaQuotationPdfRef.current?.downloadPDF,
          quotation: !!quotationPdfRef.current?.downloadPDF,
          invoice: !!invoicePdfRef.current?.downloadPDF,
          challan: !!challanPdfRef.current?.downloadPDF,
          taxableInvoice: !!taxableInvoicePdfRef.current?.downloadPDF,
          gtcTaxableInvoice: !!gtcTaxableInvoicePdfRef.current?.downloadPDF,
          rudharmaTaxableInvoice: !!rudharmaTaxableInvoicePdfRef.current?.downloadPDF
        });
      };

      // Check refs every 2 seconds for debugging
      const interval = setInterval(checkRefs, 2000);

      return () => clearInterval(interval);
    }
  }, [isClient, isOpen, documentType, data]);

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

  // Direct download function that doesn't rely on refs
  const directDownload = async () => {
    console.log('Direct download approach');

    try {
      // Dynamic import React and PDF generation function to avoid ES Module issues
      const React = await import('react');
      const reactPdfModule = await import('@react-pdf/renderer');
      const { pdf, Document, Page, Text, View, StyleSheet } = reactPdfModule;

      let filename = 'document.pdf';

      if (documentType === 'quotation') {
        const companyName = data.companyName || '';

        // Create custom filename
        const customerName = data.customerName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
        const date = data.date?.replace(/[^0-9]/g, '') || new Date().toISOString().split('T')[0].replace(/[^0-9]/g, '');
        const quotationNumber = data.quotationNumber?.replace(/[^a-zA-Z0-9]/g, '_') || 'Quote';
        filename = `${customerName}_${date}_${quotationNumber}.pdf`;

        // Create a properly formatted PDF document
        const styles = StyleSheet.create({
          page: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            padding: 30,
            fontFamily: 'Helvetica'
          },
          header: {
            fontSize: 24,
            marginBottom: 20,
            textAlign: 'center',
            color: '#1f2937',
            fontWeight: 'bold'
          },
          title: {
            fontSize: 18,
            marginBottom: 20,
            textAlign: 'center',
            color: '#374151',
            fontWeight: 'bold'
          },
          section: {
            margin: 10,
            padding: 10,
            flexGrow: 1
          },
          row: {
            flexDirection: 'row',
            marginBottom: 5
          },
          label: {
            fontSize: 12,
            fontWeight: 'bold',
            width: 100,
            color: '#374151'
          },
          value: {
            fontSize: 12,
            flex: 1,
            color: '#1f2937'
          },
          sectionTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 15,
            marginBottom: 10,
            color: '#1f2937',
            borderBottom: '1 solid #e5e7eb',
            paddingBottom: 5
          },
          itemRow: {
            flexDirection: 'row',
            paddingVertical: 5,
            borderBottom: '1 solid #f3f4f6'
          },
          itemSerial: {
            width: 40,
            fontSize: 11
          },
          itemDesc: {
            flex: 1,
            fontSize: 11,
            paddingRight: 10
          },
          itemAmount: {
            width: 80,
            fontSize: 11,
            textAlign: 'right'
          },
          totalSection: {
            marginTop: 20,
            paddingTop: 10,
            borderTop: '2 solid #374151'
          },
          totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 5
          },
          totalLabel: {
            fontSize: 14,
            fontWeight: 'bold'
          },
          totalValue: {
            fontSize: 14,
            fontWeight: 'bold'
          },
          footer: {
            marginTop: 30,
            fontSize: 10,
            color: '#6b7280',
            textAlign: 'center'
          }
        });

        const MyDocument = () => (
          React.createElement(Document, null,
            React.createElement(Page, { size: 'A4', style: styles.page },
              // Header
              React.createElement(Text, { style: styles.header },
                companyName.includes('Global Trading Corporation') ? 'Global Trading Corporation' :
                companyName.includes('Rudharma') ? 'Rudharma Enterprises' : 'Global Digital Connect'
              ),
              React.createElement(Text, { style: styles.title }, 'QUOTATION'),

              // Quotation Details
              React.createElement(View, { style: styles.section },
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'Quote No:'),
                  React.createElement(Text, { style: styles.value }, data.quotationNumber)
                ),
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'Date:'),
                  React.createElement(Text, { style: styles.value }, data.date)
                ),
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'Valid Until:'),
                  React.createElement(Text, { style: styles.value }, data.validUntil)
                )
              ),

              // Customer Details
              React.createElement(Text, { style: styles.sectionTitle }, 'Customer Details'),
              React.createElement(View, { style: styles.section },
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'Name:'),
                  React.createElement(Text, { style: styles.value }, data.customerName)
                ),
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'Address:'),
                  React.createElement(Text, { style: styles.value }, data.customerAddress)
                ),
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'Phone:'),
                  React.createElement(Text, { style: styles.value }, data.customerPhone)
                ),
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'GST:'),
                  React.createElement(Text, { style: styles.value }, data.customerGST || 'N/A')
                )
              ),

              // Subject (if provided)
              data.subject ? React.createElement(View, { style: styles.section },
                React.createElement(View, { style: styles.row },
                  React.createElement(Text, { style: styles.label }, 'Subject:'),
                  React.createElement(Text, { style: styles.value }, data.subject)
                )
              ) : null,

              // Items
              React.createElement(Text, { style: styles.sectionTitle }, 'Items'),
              React.createElement(View, { style: styles.section },
                // Header row
                React.createElement(View, { style: [styles.itemRow, { backgroundColor: '#f9fafb', fontWeight: 'bold' }] },
                  React.createElement(Text, { style: styles.itemSerial }, 'S.No'),
                  React.createElement(Text, { style: styles.itemDesc }, 'Description'),
                  React.createElement(Text, { style: styles.itemAmount }, 'Amount')
                ),
                // Item rows
                ...data.items.map((item, index) =>
                  React.createElement(View, { key: index, style: styles.itemRow },
                    React.createElement(Text, { style: styles.itemSerial }, item.serial_no),
                    React.createElement(Text, { style: styles.itemDesc }, item.description),
                    React.createElement(Text, { style: styles.itemAmount }, `₹${item.amount}`)
                  )
                )
              ),

              // Total
              React.createElement(View, { style: styles.totalSection },
                React.createElement(View, { style: styles.totalRow },
                  React.createElement(Text, { style: styles.totalLabel }, 'Total Amount:'),
                  React.createElement(Text, { style: styles.totalValue }, `₹${data.total || 0}`)
                ),
                React.createElement(Text, { style: { fontSize: 12, marginTop: 10, fontStyle: 'italic' } },
                  `Amount in Words: ${data.amountInWords || 'Zero Rupees Only'}`
                )
              ),

              // Footer
              React.createElement(Text, { style: styles.footer },
                'Thank you for your business!'
              )
            )
          )
        );

        console.log('Generating simple PDF directly...');
        const blob = await pdf(React.createElement(MyDocument)).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Direct download successful!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Direct download failed:', error);
      return false;
    }
  };

  // Handle download button click
  const handleDownload = async () => {
    console.log('Download button clicked');
    setIsDownloading(true);

    try {
      // Skip direct download and focus on getting the exact preview PDF
      console.log('Trying to get exact preview PDF using refs...');

      // Wait for components to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to find any working ref with multiple attempts
      for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`Attempt ${attempt} to find working refs...`);

        const allRefs = [
          { name: 'gtcQuotation', ref: gtcQuotationPdfRef },
          { name: 'gdcQuotation', ref: gdcQuotationPdfRef },
          { name: 'rudharmaQuotation', ref: rudharmaQuotationPdfRef },
          { name: 'saPromotions', ref: saPromotionsPdfRef },
          { name: 'sanghiStationers', ref: sanghiStationersPdfRef },
          { name: 'quotation', ref: quotationPdfRef },
          { name: 'invoice', ref: invoicePdfRef },
          { name: 'challan', ref: challanPdfRef },
          { name: 'taxableInvoice', ref: taxableInvoicePdfRef },
          { name: 'gtcTaxableInvoice', ref: gtcTaxableInvoicePdfRef },
          { name: 'rudharmaTaxableInvoice', ref: rudharmaTaxableInvoicePdfRef }
        ];

        console.log(`Attempt ${attempt} - Checking all refs:`, allRefs.map(r => ({
          name: r.name,
          exists: !!r.ref.current,
          hasDownload: !!r.ref.current?.downloadPDF
        })));

        // Find the first working ref
        let workingRef = null;
        for (const refInfo of allRefs) {
          if (refInfo.ref.current?.downloadPDF) {
            workingRef = refInfo;
            break;
          }
        }

        if (workingRef) {
          console.log(`Found working ref: ${workingRef.name}`);
          try {
            await workingRef.ref.current.downloadPDF();
            console.log('Styled PDF download successful!');
            return;
          } catch (error) {
            console.error(`Error with ${workingRef.name}:`, error);
          }
        }

        // Wait before next attempt
        if (attempt < 5) {
          console.log(`Attempt ${attempt} failed, waiting 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // If all ref attempts fail, use direct download as last resort
      console.log('All ref attempts failed, using direct download as fallback...');
      const directSuccess = await directDownload();
      if (directSuccess) {
        console.log('Fallback direct download successful!');
        return;
      }

      // If everything fails
      alert('Unable to generate PDF. Please try again in a moment.');
      return;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    } finally {
      setIsDownloading(false);
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
              data.companyName?.includes('Global Trading Corporation') ? (
                <GTCQuotationPDF ref={gtcQuotationPdfRef} quotation={data} />
              ) : data.companyName?.includes('Global Digital Connect') ? (
                <GDCQuotationPDF ref={gdcQuotationPdfRef} quotation={data} />
              ) : data.companyName?.includes('Rudharma') ? (
                <RudharmaQuotationPDF ref={rudharmaQuotationPdfRef} quotation={data} />
              ) : data.companyName?.includes('SA Promotions') ? (
                <SAPromotionsPDF ref={saPromotionsPdfRef} quotation={data} />
              ) : data.companyName?.includes('Sanghi Stationers') ? (
                <SanghiStationersPDF ref={sanghiStationersPdfRef} quotation={data} />
              ) : (
                <QuotationPDF ref={quotationPdfRef} quotation={data} />
              )
            ) : documentType === 'taxable-invoice' ? (
              // Render appropriate taxable invoice PDF based on company
              data.companyName?.includes('Global Trading Corporation') ? (
                <GTCTaxableInvoicePDF ref={gtcTaxableInvoicePdfRef} {...data} />
              ) : data.companyName?.includes('Rudharma') ? (
                <RudharmaTaxableInvoicePDF ref={rudharmaTaxableInvoicePdfRef} {...data} />
              ) : (
                <TaxableInvoicePDF ref={taxableInvoicePdfRef} {...data} />
              )
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
            disabled={isDownloading}
            className={`px-5 py-2 rounded-lg transition-colors duration-200 flex items-center shadow-sm ${
              isDownloading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
