"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';
import { HEADER_IMAGE_FALLBACK, FOOTER_IMAGE_FALLBACK } from '../utils/letterheadImages';
import { formatDate } from '../utils/dateFormatter';
import SignatureImage from './SignatureImage';

// Define types for our quotation
interface QuotationItem {
  id: string;
  description: string;
  amount: number;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  items: QuotationItem[];
  notes: string;
  terms: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    position: 'relative',
  },
  contentContainer: {
    padding: 30,
    paddingTop: 150, // Space for the header - adjusted for the actual header image
    paddingBottom: 150, // Space for the footer - adjusted for the actual footer image
    flexGrow: 1,
    position: 'relative',
    zIndex: 2,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 'auto',
    zIndex: 1,
  },
  footerImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 'auto',
    zIndex: 1,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 12,
    marginBottom: 6,
    color: '#555',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 28,
    fontSize: 10,
    fontWeight: 'normal',
    padding: '4px 0',
  },
  serialNo: {
    width: '10%',
    paddingRight: 8,
    textAlign: 'center',
  },
  description: {
    width: '60%',
    paddingRight: 8,
  },
  amount: {
    width: '20%',
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontVariant: 'normal',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 30,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    backgroundColor: '#f5f5f5',
    padding: '4px 0',
  },
  tableFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
    alignItems: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailsLeft: {
    width: '50%',
  },
  detailsRight: {
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
    alignItems: 'center',
    height: 30,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    backgroundColor: '#f9f9f9',
    padding: '4px 0',
  },
  totalAmount: {
    width: '15%',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    fontVariant: 'normal',
  },
  amountInWords: {
    marginTop: 10,
    fontSize: 11,
    fontStyle: 'italic',
    color: '#333',
  },
  notes: {
    marginTop: 20,
    fontSize: 10,
    color: '#333',
  },
  terms: {
    marginTop: 20,
    fontSize: 10,
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  validUntil: {
    marginTop: 10,
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
});

// Define ref type
export interface QuotationPDFRef {
  downloadPDF: () => Promise<void>;
}

// Create Document Component
const QuotationPDF = forwardRef<QuotationPDFRef, { quotation: QuotationData }>(({ quotation }, ref) => {
  // Create a document that can be used for both viewing and downloading
  const QuotationDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
          {/* Letterhead Header */}
          <Image
            src={HEADER_IMAGE_FALLBACK}
            style={styles.headerImage}
          />

        <View style={styles.contentContainer}>
          <Text style={styles.header}>QUOTATION</Text>

          {/* Quotation Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailsLeft}>
              <Text style={{...styles.subheader, fontSize: 11, marginBottom: 4}}>From:</Text>
              <Text style={{fontSize: 10, marginBottom: 2}}>Global Digital Connect</Text>
              <Text style={{fontSize: 10, marginBottom: 2}}>320, Regus, Magnato Mall</Text>
              <Text style={{fontSize: 10, marginBottom: 2}}>VIP Chowk, Raipur- 492006</Text>
              <Text style={{fontSize: 10, marginBottom: 2}}>Phone: 9685047519</Text>
              <Text style={{fontSize: 10}}>Email: prateek@globaldigitalconnect.com</Text>
            </View>
            <View style={styles.detailsRight}>
              <Text style={{...styles.subheader, fontSize: 11, marginBottom: 4}}>To:</Text>
              <Text style={{fontSize: 10, marginBottom: 2}}>{quotation.customerName}</Text>
              <Text style={{fontSize: 10, marginBottom: 2}}>{quotation.customerAddress}</Text>
              <Text style={{fontSize: 10, marginBottom: 2}}>Phone: {quotation.customerPhone}</Text>
              <Text style={{fontSize: 10}}>GST No.: {quotation.customerEmail}</Text>
            </View>
          </View>

        <View style={{...styles.detailsContainer, marginTop: 5, marginBottom: 10, borderTop: '1px solid #eee', paddingTop: 8}}>
          <View style={styles.detailsLeft}>
            <Text style={{fontSize: 10, marginBottom: 3}}><Text style={{fontWeight: 'bold'}}>Quotation Number:</Text> {quotation.quotationNumber}</Text>
            <Text style={{fontSize: 10, marginBottom: 3}}><Text style={{fontWeight: 'bold'}}>Date:</Text> {formatDate(quotation.date)}</Text>
            <Text style={{fontSize: 10, fontWeight: 'bold'}}><Text style={{fontWeight: 'bold'}}>Valid Until:</Text> {formatDate(quotation.validUntil)}</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.serialNo}>S. No.</Text>
          <Text style={styles.description}>Description</Text>

          {/* Render custom column headers */}
          {quotation.items[0] && Object.keys(quotation.items[0]).map(key => {
            // Skip standard columns
            if (["id", "serial_no", "description", "amount"].includes(key)) {
              return null;
            }
            return (
              <Text key={key} style={{width: '20%', paddingRight: 8, fontSize: 9}}>
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
            );
          })}

          <Text style={styles.amount}>Amount</Text>
        </View>

        {/* Table Rows */}
        {quotation.items.map((item) => (
          <View style={styles.row} key={item.id}>
            <Text style={styles.serialNo}>{item.serial_no || item.id}</Text>
            <Text style={styles.description}>{item.description || "-"}</Text>

            {/* Render custom column values */}
            {Object.keys(item).map(key => {
              // Skip standard columns
              if (["id", "serial_no", "description", "amount"].includes(key)) {
                return null;
              }
              return (
                <Text key={key} style={{width: '20%', paddingRight: 8, fontSize: 9}}>
                  {item[key] || ""}
                </Text>
              );
            })}

            <Text style={{...styles.amount, fontFeatureSettings: 'tnum'}}>{item.amount ? item.amount.toFixed(2) : "0.00"}</Text>
          </View>
        ))}

        {/* Table Footer - Totals */}
        <View style={{ marginTop: 20, alignSelf: 'flex-end', width: '40%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Subtotal:</Text>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', fontVariant: 'normal', fontFeatureSettings: 'tnum' }}>
              {quotation.subtotal ? quotation.subtotal.toFixed(2) : "0.00"}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>GST ({quotation.gstRate || 0}%):</Text>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', fontVariant: 'normal', fontFeatureSettings: 'tnum' }}>
              {quotation.gstAmount ? quotation.gstAmount.toFixed(2) : "0.00"}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#000', paddingTop: 5 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Total:</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', fontFamily: 'Helvetica', fontVariant: 'normal', fontFeatureSettings: 'tnum' }}>
              {quotation.total ? quotation.total.toFixed(2) : "0.00"}
            </Text>
          </View>
        </View>

        <View style={{...styles.amountInWords, marginTop: 15, borderTop: '1px dashed #ccc', paddingTop: 8}}>
          <Text style={{fontSize: 10, fontStyle: 'italic'}}><Text style={{fontWeight: 'bold'}}>Amount in words:</Text> {quotation.amountInWords}</Text>
        </View>

        {/* Terms */}
        {quotation.terms && (
          <View style={{...styles.terms, marginTop: 15}}>
            <Text style={{fontSize: 11, fontWeight: 'bold', marginBottom: 4}}>Terms & Conditions:</Text>
            <Text style={{fontSize: 9}}>{quotation.terms}</Text>
          </View>
        )}

        {/* Notes */}
        {quotation.notes && (
          <View style={{...styles.notes, marginTop: 10}}>
            <Text style={{fontSize: 11, fontWeight: 'bold', marginBottom: 4}}>Notes:</Text>
            <Text style={{fontSize: 9}}>{quotation.notes}</Text>
          </View>
        )}

        {/* Signature is positioned absolutely */}
        </View>

        {/* Signature */}
        <SignatureImage />

        {/* Letterhead Footer */}
        <Image
          src={FOOTER_IMAGE_FALLBACK}
          style={styles.footerImage}
        />
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
      link.download = `Quotation-${quotation.quotationNumber}.pdf`;
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

QuotationPDF.displayName = 'QuotationPDF';

export default QuotationPDF;
