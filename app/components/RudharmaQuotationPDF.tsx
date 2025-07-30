"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';
import { formatDate } from '../utils/dateFormatter';
import SignatureImage from './SignatureImage';
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
  customerGST: string;
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

export interface RudharmaQuotationPDFRef {
  downloadPDF: () => Promise<void>;
}

// Rudharma Traditional Style - Clean and elegant
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
    padding: 35,
    paddingTop: 120,
    paddingBottom: 120,
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
  // Traditional header with sky blue accent
  header: {
    fontSize: 20,
    marginBottom: 25,
    textAlign: 'center',
    color: '#0369A1', // Sky-700
    fontWeight: 'bold',
    textDecoration: 'underline',
    textDecorationColor: '#0369A1',
  },
  // Traditional business card style layout
  businessCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#F0F9FF', // Sky-50
    border: '2 solid #0369A1',
    borderRadius: 8,
  },
  cardLeft: {
    width: '45%',
  },
  cardRight: {
    width: '45%',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 8,
    textDecoration: 'underline',
  },
  cardText: {
    fontSize: 9,
    marginBottom: 3,
    color: '#1E40AF',
  },
  // Simple table with traditional borders
  tableContainer: {
    marginBottom: 25,
    border: '2 solid #0369A1',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0369A1',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #BAE6FD',
    padding: 8,
    minHeight: 30,
    alignItems: 'center',
  },
  tableRowEven: {
    flexDirection: 'row',
    borderBottom: '1 solid #BAE6FD',
    backgroundColor: '#F0F9FF',
    padding: 8,
    minHeight: 30,
    alignItems: 'center',
  },
  serialColumn: {
    width: '10%',
    textAlign: 'center',
    fontSize: 10,
  },
  descriptionColumn: {
    width: '45%',
    fontSize: 10,
    paddingLeft: 5,
  },
  amountColumn: {
    width: '25%',
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Traditional summary box
  summarySection: {
    marginTop: 20,
    alignItems: 'flex-end',
    wrap: false,
  },
  summaryTable: {
    width: '50%',
    border: '2 solid #0369A1',
    wrap: false,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0369A1',
    color: '#FFFFFF',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 11,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1 solid #BAE6FD',
    fontSize: 10,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#0369A1',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Traditional amount in words box
  amountWordsBox: {
    marginTop: 25,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F0F9FF',
    border: '2 solid #0369A1',
    borderRadius: 5,
    wrap: false,
  },
  amountWordsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 5,
  },
  amountWordsText: {
    fontSize: 10,
    color: '#1E40AF',
    fontStyle: 'italic',
  },
  // Traditional sections
  traditionalSection: {
    marginTop: 25,
    marginBottom: 15,
    padding: 12,
    border: '1 solid #0369A1',
    borderRadius: 4,
    wrap: false,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 6,
    textDecoration: 'underline',
  },
  sectionText: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#374151',
  },
  // Traditional signature layout
  signatureArea: {
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '40%',
    textAlign: 'center',
  },
  signatureSpace: {
    height: 50,
    borderBottom: '1 solid #0369A1',
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#0369A1',
    fontWeight: 'bold',
  },
  companyStamp: {
    marginTop: 10,
    padding: 8,
    border: '1 solid #0369A1',
    borderRadius: 4,
    backgroundColor: '#F0F9FF',
  },
  stampText: {
    fontSize: 8,
    color: '#0369A1',
    textAlign: 'center',
  },
});

// Create Document Component
const RudharmaQuotationPDF = forwardRef<RudharmaQuotationPDFRef, { quotation: QuotationData }>(({ quotation }, ref) => {
  const companyName = quotation.companyName || "Rudharma Enterprises";
  const companyAddress = quotation.companyAddress || "133 Metro Green Society, Saddu Raipur - 492113";
  const companyPhone = quotation.companyPhone || "+91-9981122131";
  const companyEmail = quotation.companyEmail || "rudharmaaenterprises@gmail.com";
  const headerImage = quotation.headerImage || "/rudharma-header.jpg";
  const footerImage = quotation.footerImage || "/rudharma-footer.jpg";
  const signatureImage = quotation.signatureImage || "/rudharma-signature.jpg";

  const QuotationDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead Header */}
        <Image src={headerImage} style={styles.headerImage} />

        <View style={styles.contentContainer}>
          <Text style={styles.header}>PRICE QUOTATION</Text>

          {/* Traditional Business Card Layout */}
          <View style={styles.businessCard}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>Quotation Reference</Text>
              <Text style={styles.cardText}>Quote No.: {quotation.quotationNumber}</Text>
              <Text style={styles.cardText}>Date: {formatDate(quotation.date)}</Text>
              <Text style={styles.cardText}>Valid Till: {formatDate(quotation.validUntil)}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardTitle}>Esteemed Customer</Text>
              <Text style={styles.cardText}>{quotation.customerName}</Text>
              <Text style={styles.cardText}>{quotation.customerAddress}</Text>
              {quotation.customerGST && (
                <Text style={styles.cardText}>GST No.: {quotation.customerGST}</Text>
              )}
              {quotation.customerPhone && (
                <Text style={styles.cardText}>Contact: {quotation.customerPhone}</Text>
              )}
            </View>
          </View>

          {/* Subject Section */}
          {quotation.subject && (
            <View style={{marginTop: 15, marginBottom: 10}}>
              <Text style={{fontSize: 11, lineHeight: 1.4}}>
                <Text style={{fontWeight: 'bold'}}>Subject: </Text>
                <Text style={{fontWeight: 'normal'}}>{quotation.subject}</Text>
              </Text>
            </View>
          )}

          {/* Traditional Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.serialColumn}>S.No.</Text>
              <Text style={styles.descriptionColumn}>Particulars</Text>

              {/* Render custom column headers */}
              {quotation.items[0] && Object.keys(quotation.items[0]).map(key => {
                // Skip standard columns
                if (["id", "serial_no", "description", "amount"].includes(key)) {
                  return null;
                }
                return (
                  <Text key={key} style={{width: '12%', padding: 8, fontSize: 9, textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'}}>
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                );
              })}

              <Text style={styles.amountColumn}>Amount (Rs.)</Text>
            </View>

            {quotation.items.map((item, index) => (
              <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                <Text style={styles.serialColumn}>{index + 1}.</Text>
                <Text style={styles.descriptionColumn}>{item.description}</Text>

                {/* Render custom column values */}
                {Object.keys(item).map(key => {
                  // Skip standard columns
                  if (["id", "serial_no", "description", "amount"].includes(key)) {
                    return null;
                  }
                  return (
                    <Text key={key} style={{width: '12%', padding: 8, fontSize: 9, textAlign: 'center'}}>
                      {item[key] || ""}
                    </Text>
                  );
                })}

                <Text style={styles.amountColumn}>{formatIndianNumber(item.amount || 0)}/-</Text>
              </View>
            ))}
          </View>

          {/* Traditional Summary - Wrapped to prevent page breaks */}
          <View style={{...styles.summarySection, minHeight: 120}}>
            <View style={{...styles.summaryTable, minHeight: 120}}>
              <View style={styles.summaryHeaderRow}>
                <Text style={{width: '100%', textAlign: 'center'}}>QUOTATION SUMMARY</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Sub Total:</Text>
                <Text>Rs. {formatIndianNumber(quotation.subtotal || 0)}/-</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>GST @ {quotation.gstRate}%:</Text>
                <Text>Rs. {formatIndianNumber(quotation.gstAmount || 0)}/-</Text>
              </View>
              <View style={styles.summaryTotalRow}>
                <Text>GRAND TOTAL:</Text>
                <Text>Rs. {formatIndianNumber(quotation.total || 0)}/-</Text>
              </View>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={styles.amountWordsBox}>
            <Text style={styles.amountWordsTitle}>Amount in Words:</Text>
            <Text style={styles.amountWordsText}>{quotation.amountInWords}</Text>
          </View>

          {/* Terms & Conditions */}
          {quotation.terms && (
            <View style={styles.traditionalSection}>
              <Text style={styles.sectionHeader}>Terms & Conditions:</Text>
              <Text style={styles.sectionText}>{quotation.terms}</Text>
            </View>
          )}

          {/* Special Notes */}
          {quotation.notes && (
            <View style={styles.traditionalSection}>
              <Text style={styles.sectionHeader}>Special Notes:</Text>
              <Text style={styles.sectionText}>{quotation.notes}</Text>
            </View>
          )}

          {/* Traditional Signature Area */}
          <View style={styles.signatureArea}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureSpace}></View>
              <Text style={styles.signatureLabel}>Customer's Acceptance</Text>
              <Text style={{fontSize: 8, color: '#6B7280', marginTop: 3}}>
                (Signature & Date)
              </Text>
            </View>
            <View style={styles.signatureBlock}>
              <SignatureImage
                signatureImage={signatureImage}
                style={{width: 70, height: 35, marginBottom: 8}}
              />
              <Text style={styles.signatureLabel}>For {companyName}</Text>
              <View style={styles.companyStamp}>
                <Text style={styles.stampText}>Authorized Signatory</Text>
              </View>
            </View>
          </View>

          {/* Traditional closing */}
          <View style={{marginTop: 25, textAlign: 'center'}}>
            <Text style={{fontSize: 9, color: '#0369A1', fontStyle: 'italic'}}>
              Thank you for your valued business. We look forward to serving you.
            </Text>
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
      link.download = `Rudharma-Quotation-${quotation.quotationNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }));

  return (
    <ClientOnlyPDFViewer>
      <PDFViewer style={{ width: '100%', height: '600px' }}>
        {QuotationDocument}
      </PDFViewer>
    </ClientOnlyPDFViewer>
  );
});

RudharmaQuotationPDF.displayName = 'RudharmaQuotationPDF';

export default RudharmaQuotationPDF;
