"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { formatIndianNumber } from "../utils/numberFormatter";
import { formatDate } from "../utils/dateFormatter";

// Define types
interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  baseAmount: number;
  percentageIncrease: number;
  finalAmount: number;
  [key: string]: any;
}

interface Party {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  subject: string;
  parties: Party[];
  items: QuotationItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  notes: string;
  terms: string;
  globalPercentageIncrease: number;
  // Company-specific fields
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGST?: string;
}

export interface MultipartyQuotationPDFRef {
  downloadPDF: () => Promise<void>;
}

interface MultipartyQuotationPDFProps {
  quotationData: QuotationData;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
  },
  companyDetails: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#1f2937',
    textDecoration: 'underline',
  },
  quotationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailsColumn: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontWeight: 'bold',
    width: 80,
    color: '#374151',
  },
  value: {
    flex: 1,
    color: '#1f2937',
  },
  subject: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  subjectLabel: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#374151',
  },
  subjectText: {
    color: '#1f2937',
    fontStyle: 'italic',
  },
  partiesSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    borderBottom: '1 solid #d1d5db',
    paddingBottom: 2,
  },
  partyContainer: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  partyTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#374151',
  },
  partyDetails: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 1,
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: '1 solid #d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '0.5 solid #e5e7eb',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '0.5 solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  serialCol: { width: '8%', textAlign: 'center' },
  descCol: { width: '35%' },
  baseAmountCol: { width: '15%', textAlign: 'right' },
  percentageCol: { width: '12%', textAlign: 'right' },
  finalAmountCol: { width: '15%', textAlign: 'right' },
  headerText: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#374151',
  },
  cellText: {
    fontSize: 9,
    color: '#1f2937',
  },
  totalsSection: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsTable: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    borderBottom: '0.5 solid #e5e7eb',
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    borderTop: '1 solid #d1d5db',
  },
  amountInWords: {
    marginTop: 15,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  amountInWordsLabel: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#374151',
  },
  amountInWordsText: {
    fontStyle: 'italic',
    color: '#1f2937',
  },
  termsSection: {
    marginTop: 15,
  },
  termsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#374151',
  },
  termsText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  notesSection: {
    marginTop: 10,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#374151',
  },
  notesText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '0.5 solid #e5e7eb',
    paddingTop: 10,
  },
});

// PDF Document Component
const MultipartyQuotationDocument = ({ quotationData }: { quotationData: QuotationData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>
          {quotationData.companyName || "Global Digital Connect"}
        </Text>
        <Text style={styles.companyDetails}>
          {quotationData.companyAddress || "320, Regus, Magnato Mall, VIP Chowk, Raipur- 492006"}
        </Text>
        <Text style={styles.companyDetails}>
          Phone: {quotationData.companyPhone || "9685047519"} | Email: {quotationData.companyEmail || "prateek@globaldigitalconnect.com"}
        </Text>
        {quotationData.companyGST && (
          <Text style={styles.companyDetails}>GST: {quotationData.companyGST}</Text>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>MULTIPARTY QUOTATION</Text>

      {/* Quotation Details */}
      <View style={styles.quotationDetails}>
        <View style={styles.detailsColumn}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Quotation No:</Text>
            <Text style={styles.value}>{quotationData.quotationNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(quotationData.date)}</Text>
          </View>
        </View>
        <View style={styles.detailsColumn}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Valid Until:</Text>
            <Text style={styles.value}>{formatDate(quotationData.validUntil)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>GST Rate:</Text>
            <Text style={styles.value}>{quotationData.gstRate}%</Text>
          </View>
        </View>
      </View>

      {/* Subject */}
      {quotationData.subject && (
        <View style={styles.subject}>
          <Text style={styles.subjectLabel}>Subject:</Text>
          <Text style={styles.subjectText}>{quotationData.subject}</Text>
        </View>
      )}

      {/* Parties Section */}
      <View style={styles.partiesSection}>
        <Text style={styles.sectionTitle}>Parties ({quotationData.parties.length})</Text>
        {quotationData.parties.map((party, index) => (
          <View key={party.id} style={styles.partyContainer}>
            <Text style={styles.partyTitle}>Party {index + 1}: {party.name}</Text>
            {party.address && <Text style={styles.partyDetails}>Address: {party.address}</Text>}
            {party.phone && <Text style={styles.partyDetails}>Phone: {party.phone}</Text>}
            {party.email && <Text style={styles.partyDetails}>Email: {party.email}</Text>}
            {party.gst && <Text style={styles.partyDetails}>GST: {party.gst}</Text>}
          </View>
        ))}
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <Text style={styles.sectionTitle}>Quotation Items</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.serialCol]}>S.No.</Text>
          <Text style={[styles.headerText, styles.descCol]}>Description</Text>
          <Text style={[styles.headerText, styles.baseAmountCol]}>Base Amount (₹)</Text>
          <Text style={[styles.headerText, styles.percentageCol]}>Increase (%)</Text>
          <Text style={[styles.headerText, styles.finalAmountCol]}>Final Amount (₹)</Text>
        </View>

        {/* Table Rows */}
        {quotationData.items.map((item, index) => (
          <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.cellText, styles.serialCol]}>{index + 1}</Text>
            <Text style={[styles.cellText, styles.descCol]}>{item.description}</Text>
            <Text style={[styles.cellText, styles.baseAmountCol]}>
              {formatIndianNumber(item.baseAmount, 2)}
            </Text>
            <Text style={[styles.cellText, styles.percentageCol]}>
              {item.percentageIncrease}%
            </Text>
            <Text style={[styles.cellText, styles.finalAmountCol]}>
              {formatIndianNumber(item.finalAmount, 2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals Section */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsTable}>
          <View style={styles.totalRow}>
            <Text style={styles.cellText}>Subtotal:</Text>
            <Text style={styles.cellText}>₹ {formatIndianNumber(quotationData.subtotal, 2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.cellText}>GST ({quotationData.gstRate}%):</Text>
            <Text style={styles.cellText}>₹ {formatIndianNumber(quotationData.gstAmount, 2)}</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.cellText}>Total Amount:</Text>
            <Text style={styles.cellText}>₹ {formatIndianNumber(quotationData.total, 2)}</Text>
          </View>
        </View>
      </View>

      {/* Amount in Words */}
      <View style={styles.amountInWords}>
        <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
        <Text style={styles.amountInWordsText}>{quotationData.amountInWords}</Text>
      </View>

      {/* Terms and Conditions */}
      {quotationData.terms && (
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions:</Text>
          <Text style={styles.termsText}>{quotationData.terms}</Text>
        </View>
      )}

      {/* Notes */}
      {quotationData.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{quotationData.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} | Global Digital Connect</Text>
      </View>
    </Page>
  </Document>
);

// Main Component
const MultipartyQuotationPDF = forwardRef<MultipartyQuotationPDFRef, MultipartyQuotationPDFProps>(
  ({ quotationData }, ref) => {
    useImperativeHandle(ref, () => ({
      downloadPDF: async () => {
        const blob = await pdf(<MultipartyQuotationDocument quotationData={quotationData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${quotationData.quotationNumber}_multiparty_quotation.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
    }));

    return (
      <PDFDownloadLink
        document={<MultipartyQuotationDocument quotationData={quotationData} />}
        fileName={`${quotationData.quotationNumber}_multiparty_quotation.pdf`}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center shadow-md"
      >
        {({ blob, url, loading, error }) => (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </>
        )}
      </PDFDownloadLink>
    );
  }
);

MultipartyQuotationPDF.displayName = 'MultipartyQuotationPDF';

export default MultipartyQuotationPDF;
