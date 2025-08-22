"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import { formatDate } from '../utils/dateFormatter';
import { formatIndianNumber } from '../utils/numberFormatter';
import ClientOnlyPDFViewer from './ClientOnlyPDFViewer';

// Define types for our quotation
interface QuotationItem {
  id: string;
  description: string;
  amount: number;
  [key: string]: any;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerEmail?: string;
  customerPhone: string;
  subject?: string;
  items: QuotationItem[];
  notes: string;
  terms: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  // Company-specific fields
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGST?: string;
  headerImage?: string;
  footerImage?: string;
  signatureImage?: string;
  fitInOnePage?: boolean;
}

export interface QuotationPDFRef {
  downloadPDF: () => Promise<void>;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#666'
  },
  infoSection: {
    marginBottom: 20
  },
  infoText: {
    fontSize: 12,
    marginBottom: 5,
    color: '#333'
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottom: '1 solid #ccc',
    paddingBottom: 5
  },
  serialCell: {
    fontSize: 10,
    flex: 1
  },
  descriptionCell: {
    fontSize: 10,
    flex: 4
  },
  amountCell: {
    fontSize: 10,
    flex: 1,
    textAlign: 'right'
  },
  totalsSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '2 solid #333'
  },
  totalText: {
    fontSize: 12,
    marginBottom: 5
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10
  }
});

// Create Document Component
const QuotationPDF = forwardRef<QuotationPDFRef, { quotation: QuotationData }>(({ quotation }, ref) => {
  // Enhanced debug logging
  console.log('=== QuotationPDF Debug ===');
  console.log('QuotationPDF received data:', quotation);
  console.log('Items array:', quotation?.items);
  console.log('Items length:', quotation?.items?.length);
  console.log('Customer name:', quotation?.customerName);
  console.log('Quotation number:', quotation?.quotationNumber);

  // Check if quotation data exists
  if (!quotation) {
    console.error('No quotation data provided!');
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600">No quotation data provided</p>
        </div>
      </div>
    );
  }

  // Use company-specific details or fallback to defaults
  const companyName = quotation.companyName || "Global Digital Connect";
  const companyAddress = quotation.companyAddress || "320, Regus, Magnato Mall, VIP Chowk, Raipur- 492006";
  const companyPhone = quotation.companyPhone || "9685047519";
  const companyEmail = quotation.companyEmail || "prateek@globaldigitalconnect.com";

  // Create a simple test document first
  const QuotationDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          {/* Simple Test Header */}
          <Text style={styles.header}>
            TEST QUOTATION
          </Text>
          <Text style={styles.subHeader}>
            Global Digital Connect
          </Text>

          {/* Basic Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Customer: {quotation?.customerName || 'Test Customer'}
            </Text>
            <Text style={styles.infoText}>
              Quotation No: {quotation?.quotationNumber || 'TEST-001'}
            </Text>
            <Text style={styles.infoText}>
              Date: {quotation?.date || new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Simple Items */}
          <View style={styles.infoSection}>
            <Text style={styles.tableHeader}>Items:</Text>
            <Text style={styles.infoText}>Test Item 1 - ₹1,000</Text>
            <Text style={styles.infoText}>Test Item 2 - ₹2,000</Text>
          </View>

          {/* Simple Totals */}
          <View style={styles.totalsSection}>
            <Text style={styles.totalText}>Subtotal: ₹3,000</Text>
            <Text style={styles.totalText}>GST (18%): ₹540</Text>
            <Text style={styles.grandTotal}>Total: ₹3,540</Text>
          </View>

          {/* Simple Footer */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>Thank you for your business!</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  // Expose the download function to the parent component
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      try {
        console.log('Starting PDF generation for quotation:', quotation.quotationNumber);
        const blob = await pdf(QuotationDocument).toBlob();
        console.log('PDF blob generated successfully, size:', blob.size);

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Create custom filename: CustomerName_Date_QuotationNumber
        const customerName = (quotation.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
        const date = (quotation.date || '').replace(/[^0-9]/g, '');
        const quotationNumber = (quotation.quotationNumber || 'Quote').replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `${customerName}_${date}_${quotationNumber}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('PDF download initiated successfully');
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please check the console for details.');
      }
    }
  }));

  // Add error boundary and debugging
  try {
    return (
      <ClientOnlyPDFViewer>
        <PDFViewer style={{ width: '100%', height: '600px' }}>
          {QuotationDocument}
        </PDFViewer>
      </ClientOnlyPDFViewer>
    );
  } catch (error) {
    console.error('Error rendering PDF:', error);
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600">Error loading PDF preview</p>
          <p className="text-sm text-gray-500">Check console for details</p>
        </div>
      </div>
    );
  }
});

QuotationPDF.displayName = 'QuotationPDF';

export default QuotationPDF;
