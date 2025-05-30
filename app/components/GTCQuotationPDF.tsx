"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';
import { formatDate } from '../utils/dateFormatter';
import SignatureImage from './SignatureImage';
import { formatIndianNumber } from '../utils/numberFormatter';

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
  customerGST: string;
  customerPhone: string;
  items: QuotationItem[];
  notes: string;
  terms: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  customColumns?: any[];
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGST?: string;
  headerImage?: string;
  footerImage?: string;
  signatureImage?: string;
}

export interface GTCQuotationPDFRef {
  downloadPDF: () => Promise<void>;
}

// GTC Corporate Style - Professional and formal
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    position: 'relative',
    fontFamily: 'Helvetica',
    paddingTop: 40,
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 40,
    paddingTop: 130,
    paddingBottom: 130,
    flexGrow: 1,
    position: 'relative',
    zIndex: 2,
    minHeight: 'auto',
  },
  headerImage: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: '100%',
    height: 'auto',
    zIndex: 1,
  },
  footerImage: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    width: '100%',
    height: 'auto',
    zIndex: 1,
  },
  // Corporate header with red accent
  header: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    color: '#B91C1C', // Red-700
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    borderBottom: '3 solid #B91C1C',
    paddingBottom: 8,
  },
  // Two-column layout for details
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    borderTop: '1 solid #E5E7EB',
    borderBottom: '1 solid #E5E7EB',
    paddingVertical: 15,
  },
  detailsLeft: {
    width: '48%',
  },
  detailsRight: {
    width: '48%',
    textAlign: 'right',
  },
  subheader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Professional table styling
  table: {
    marginBottom: 20,
    border: '2 solid #B91C1C',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#B91C1C',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    minHeight: 35,
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    backgroundColor: '#F9FAFB',
    minHeight: 35,
    alignItems: 'center',
  },
  serialCell: {
    width: '8%',
    padding: 8,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },
  descriptionCell: {
    width: '52%',
    padding: 8,
    fontSize: 10,
  },
  amountCell: {
    width: '20%',
    padding: 8,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Summary section with corporate styling
  summaryContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    wrap: false,
  },
  summaryBox: {
    width: '40%',
    border: '2 solid #B91C1C',
    backgroundColor: '#FEF2F2',
    wrap: false,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1 solid #FECACA',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#B91C1C',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Corporate footer sections
  corporateSection: {
    marginTop: 30,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F9FAFB',
    border: '1 solid #E5E7EB',
    borderRadius: 4,
    wrap: false,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#374151',
  },
  // Signature area
  signatureContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1 solid #6B7280',
    marginTop: 40,
    paddingTop: 5,
  },
  signatureText: {
    fontSize: 9,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

// Create Document Component
const GTCQuotationPDF = forwardRef<GTCQuotationPDFRef, { quotation: QuotationData }>(({ quotation }, ref) => {
  const companyName = quotation.companyName || "Global Trading Corporation";
  const companyAddress = quotation.companyAddress || "G-607 Golchaa Enclave, Near Maturi Residency, Amlidih Raipur 492006";
  const companyPhone = quotation.companyPhone || "6232555558";
  const companyEmail = quotation.companyEmail || "mail.gtcglobal@gmail.com";
  const headerImage = quotation.headerImage || "/gtc-header.jpg";
  const footerImage = quotation.footerImage || "/gtc-footer.jpg";
  const signatureImage = quotation.signatureImage || "/gtc-signature.jpg";

  const QuotationDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead Header */}
        <Image src={headerImage} style={styles.headerImage} />

        <View style={styles.contentContainer}>
          <Text style={styles.header}>Commercial Quotation</Text>

          {/* Corporate Details Section */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailsLeft}>
              <Text style={styles.subheader}>Quotation Details</Text>
              <Text style={{fontSize: 10, marginBottom: 3}}>Quote No: {quotation.quotationNumber}</Text>
              <Text style={{fontSize: 10, marginBottom: 3}}>Date: {formatDate(quotation.date)}</Text>
              <Text style={{fontSize: 10}}>Valid Until: {formatDate(quotation.validUntil)}</Text>
            </View>
            <View style={styles.detailsRight}>
              <Text style={styles.subheader}>Client Information</Text>
              <Text style={{fontSize: 10, marginBottom: 3}}>{quotation.customerName}</Text>
              <Text style={{fontSize: 10, marginBottom: 3}}>{quotation.customerAddress}</Text>
              {quotation.customerGST && (
                <Text style={{fontSize: 10, marginBottom: 3}}>GST: {quotation.customerGST}</Text>
              )}
              {quotation.customerPhone && (
                <Text style={{fontSize: 10}}>Phone: {quotation.customerPhone}</Text>
              )}
            </View>
          </View>

          {/* Professional Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.serialCell}>Sr.</Text>
              <Text style={styles.descriptionCell}>Description of Goods/Services</Text>

              {/* Render custom column headers */}
              {quotation.items[0] && Object.keys(quotation.items[0]).map(key => {
                // Skip standard columns
                if (["id", "serial_no", "description", "amount"].includes(key)) {
                  return null;
                }
                return (
                  <Text key={key} style={{width: '10%', padding: 8, fontSize: 9, textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'}}>
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                );
              })}

              <Text style={styles.amountCell}>Amount</Text>
            </View>

            {quotation.items.map((item, index) => (
              <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.serialCell}>{index + 1}</Text>
                <Text style={styles.descriptionCell}>{item.description}</Text>

                {/* Render custom column values */}
                {Object.keys(item).map(key => {
                  // Skip standard columns
                  if (["id", "serial_no", "description", "amount"].includes(key)) {
                    return null;
                  }
                  return (
                    <Text key={key} style={{width: '10%', padding: 8, fontSize: 9, textAlign: 'center'}}>
                      {item[key] || ""}
                    </Text>
                  );
                })}

                <Text style={styles.amountCell}>{formatIndianNumber(item.amount || 0)}</Text>
              </View>
            ))}
          </View>

          {/* Corporate Summary - Wrapped to prevent page breaks */}
          <View style={{...styles.summaryContainer, minHeight: 120}}>
            <View style={{...styles.summaryBox, minHeight: 120}}>
              <View style={styles.summaryRow}>
                <Text style={{fontSize: 10}}>Subtotal:</Text>
                <Text style={{fontSize: 10, fontWeight: 'bold'}}>{formatIndianNumber(quotation.subtotal || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{fontSize: 10}}>GST ({quotation.gstRate}%):</Text>
                <Text style={{fontSize: 10, fontWeight: 'bold'}}>{formatIndianNumber(quotation.gstAmount || 0)}</Text>
              </View>
              <View style={styles.summaryRowTotal}>
                <Text>TOTAL AMOUNT:</Text>
                <Text>{formatIndianNumber(quotation.total || 0)}</Text>
              </View>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={{marginTop: 20, marginBottom: 15, padding: 10, backgroundColor: '#FEF2F2', border: '1 solid #FECACA', wrap: false}}>
            <Text style={{fontSize: 10, fontWeight: 'bold', color: '#B91C1C'}}>
              Amount in Words: {quotation.amountInWords}
            </Text>
          </View>

          {/* Terms & Conditions */}
          {quotation.terms && (
            <View style={styles.corporateSection}>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
              <Text style={styles.sectionContent}>{quotation.terms}</Text>
            </View>
          )}

          {/* Notes */}
          {quotation.notes && (
            <View style={styles.corporateSection}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.sectionContent}>{quotation.notes}</Text>
            </View>
          )}

          {/* Corporate Signature Section */}
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureText}>Customer Signature</Text>
              </View>
            </View>
            <View style={styles.signatureBox}>
              <SignatureImage
                signatureImage={signatureImage}
                style={{width: 80, height: 40, marginBottom: 5}}
              />
              <View style={styles.signatureLine}>
                <Text style={styles.signatureText}>Authorized Signatory</Text>
                <Text style={{fontSize: 8, color: '#6B7280', marginTop: 2}}>{companyName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Letterhead Footer */}
        <Image src={footerImage} style={styles.footerImage} />
      </Page>
    </Document>
  );

  // Expose the download function to the parent component
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      const blob = await pdf(QuotationDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GTC-Quotation-${quotation.quotationNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }));

  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      {QuotationDocument}
    </PDFViewer>
  );
});

GTCQuotationPDF.displayName = 'GTCQuotationPDF';

export default GTCQuotationPDF;
