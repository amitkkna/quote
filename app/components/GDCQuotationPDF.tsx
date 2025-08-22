"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';
import { formatDate } from '../utils/dateFormatter';
import { formatIndianNumber } from '../utils/numberFormatter';
import { HEADER_IMAGE_FALLBACK, FOOTER_IMAGE_FALLBACK, SIGNATURE_IMAGE } from '../utils/letterheadImages';
import ClientOnlyPDFViewer from './ClientOnlyPDFViewer';

// Define types for our quotation
interface QuotationItem {
  id: string;
  description: string;
  amount: number;
  qty?: number;
  [key: string]: any;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerGST?: string;
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
  fitInOnePage?: boolean; // Add fit to one page option
}

export interface GDCQuotationPDFRef {
  downloadPDF: () => Promise<void>;
}

// GDC Professional Style - Blue theme
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
    paddingTop: 65, // Further reduced from 90 to better utilize space
    paddingBottom: 80,
    flexGrow: 1,
    position: 'relative',
    zIndex: 2,
    minHeight: 'auto',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 80,
    zIndex: 1,
  },
  footerImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 60,
    zIndex: 1,
  },
  // Professional header with blue accent
  header: {
    fontSize: 22,
    marginBottom: 15, // Reduced from 20 to bring content closer
    textAlign: 'center',
    color: '#1E40AF', // Blue-700
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    borderBottom: '3 solid #1E40AF',
    paddingBottom: 8,
  },
  // Customer and quotation info section
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    border: '1 solid #1E40AF',
  },
  infoLeft: {
    width: '50%',
    padding: 10,
    borderRight: '1 solid #1E40AF',
  },
  infoRight: {
    width: '50%',
    padding: 10,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 8,
  },
  // Subject section
  subjectContainer: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#EFF6FF',
    border: '1 solid #BFDBFE',
  },
  subjectText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  // Professional table styling
  table: {
    marginBottom: 20,
    border: '2 solid #1E40AF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderBottom: '1 solid #E5E7EB',
    minHeight: 25,
    alignItems: 'center',
  },
  serialCell: {
    width: '8%',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  particularsCell: {
    width: '62%',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  qtyCell: {
    width: '10%',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  amountCell: {
    width: '20%',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  customColumnCell: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Data row styles
  serialCellData: {
    width: '8%',
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
  },
  particularsCellData: {
    width: '62%',
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.3,
  },
  qtyCellData: {
    width: '10%',
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
  },
  amountCellData: {
    width: '20%',
    fontSize: 9,
    color: '#374151',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  customColumnCellData: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
  },
  // Totals section
  totalsContainer: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottom: '1 solid #E5E7EB',
  },
  totalLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EFF6FF',
    border: '1 solid #1E40AF',
  },
  grandTotalLabel: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  // Amount in words
  amountInWords: {
    marginBottom: 20,
    padding: 10,
    border: '1 solid #1E40AF',
  },
  amountInWordsLabel: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  amountInWordsText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  // Terms section
  termsContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F9FAFB',
    border: '1 solid #E5E7EB',
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 5,
  },
  termsText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  // Signature section
  signatureContainer: {
    marginTop: 30,
    alignItems: 'flex-end',
  },
  signatureText: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    marginTop: 5,
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});

// Create Document Component
const GDCQuotationPDF = forwardRef<GDCQuotationPDFRef, { quotation: QuotationData }>(({ quotation }, ref) => {
  const companyName = quotation.companyName || "Global Digital Connect";
  const companyAddress = quotation.companyAddress || "320, Regus, Magnato Mall, VIP Chowk, Raipur- 492006";
  const companyPhone = quotation.companyPhone || "9685047519";
  const companyEmail = quotation.companyEmail || "prateek@globaldigitalconnect.com";
  const headerImage = quotation.headerImage || "/letterhead-header.jpg";
  const footerImage = quotation.footerImage || "/letterhead-footer.jpg";
  const signatureImage = quotation.signatureImage || "/signature.jpg";

  // Get custom columns from items, separated by position
  const getCustomColumns = () => {
    if (!quotation.items || quotation.items.length === 0) return { beforeQty: [], afterQty: [] };
    const firstItem = quotation.items[0];
    const allCustomColumns = Object.keys(firstItem).filter(key =>
      !['id', 'serial_no', 'description', 'amount', 'qty'].includes(key)
    );

    // Separate columns: price-related columns go after Qty, others go before
    const priceRelatedColumns = ['price', 'rate', 'unit_price', 'cost'];
    const beforeQty = allCustomColumns.filter(col =>
      !priceRelatedColumns.some(priceCol => col.toLowerCase().includes(priceCol))
    );
    const afterQty = allCustomColumns.filter(col =>
      priceRelatedColumns.some(priceCol => col.toLowerCase().includes(priceCol))
    );

    return { beforeQty, afterQty };
  };

  const customColumnsData = getCustomColumns();
  const customColumnsBeforeQty = customColumnsData.beforeQty;
  const customColumnsAfterQty = customColumnsData.afterQty;
  const hasCustomColumns = customColumnsBeforeQty.length > 0 || customColumnsAfterQty.length > 0;
  const fitInOnePage = quotation.fitInOnePage || false;

  // Calculate dynamic column widths based on number of custom columns
  const calculateColumnWidths = () => {
    const totalCustomColumns = customColumnsBeforeQty.length + customColumnsAfterQty.length;
    if (totalCustomColumns === 0) {
      return {
        serial: '8%',
        particulars: '62%', // Back to original width when no custom columns
        qty: '10%',
        amount: '20%' // Back to original width
      };
    }

    // Adjust widths when custom columns are present
    // Fixed columns: Serial(8%) + Qty(10%) + Amount(20%) = 38%
    // Remaining 62% for Particulars and Custom columns
    const fixedColumnsWidth = 38;
    const remainingWidth = 100 - fixedColumnsWidth;
    const customColumnWidth = Math.max(8, Math.min(15, remainingWidth / (totalCustomColumns + 2))); // +2 for particulars buffer
    const particularsWidth = remainingWidth - (totalCustomColumns * customColumnWidth);

    return {
      serial: '8%',
      particulars: `${Math.max(20, particularsWidth)}%`, // Minimum 20% for particulars
      qty: '10%',
      amount: '20%',
      custom: `${customColumnWidth}%`
    };
  };

  const columnWidths = calculateColumnWidths();

  // Dynamic styles based on fitInOnePage option
  const getDynamicStyles = () => {
    if (fitInOnePage) {
      return {
        fontSize: 8,
        headerFontSize: 18,
        titleFontSize: 10,
        labelFontSize: 8,
        textFontSize: 8,
        tableFontSize: 7,
        tableHeaderFontSize: 8,
        padding: 20,
        marginBottom: 8,
        tableRowHeight: 18,
        sectionSpacing: 10
      };
    }
    return {
      fontSize: 10,
      headerFontSize: 22,
      titleFontSize: 11,
      labelFontSize: 10,
      textFontSize: 10,
      tableFontSize: 9,
      tableHeaderFontSize: 9,
      padding: 40,
      marginBottom: 20,
      tableRowHeight: 25,
      sectionSpacing: 20
    };
  };

  const dynamicStyles = getDynamicStyles();

  const QuotationDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Image */}
        {headerImage && (
          <Image
            src={headerImage}
            style={styles.headerImage}
            cache={false}
          />
        )}

        <View style={[styles.contentContainer, {
          padding: dynamicStyles.padding,
          paddingTop: fitInOnePage ? 50 : 65 // Further reduced gap for better space utilization
        }]}>
          <Text style={[styles.header, { fontSize: dynamicStyles.headerFontSize, marginBottom: fitInOnePage ? 3 : 15 }]}>QUOTATION</Text>

          {/* Customer and Quotation Info */}
          <View style={[styles.infoContainer, { marginBottom: dynamicStyles.sectionSpacing }]}>
            <View style={styles.infoLeft}>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={[styles.infoLabel, { fontSize: dynamicStyles.labelFontSize }]}>Customer Name: </Text>
                <Text style={[styles.infoText, { fontSize: dynamicStyles.textFontSize, marginBottom: 0 }]}>{quotation.customerName}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={[styles.infoLabel, { fontSize: dynamicStyles.labelFontSize }]}>Customer Address: </Text>
                <Text style={[styles.infoText, { fontSize: dynamicStyles.textFontSize, marginBottom: 0, flex: 1 }]}>{quotation.customerAddress}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={[styles.infoLabel, { fontSize: dynamicStyles.labelFontSize }]}>GST No.: </Text>
                <Text style={[styles.infoText, { fontSize: dynamicStyles.textFontSize, marginBottom: 0 }]}>{quotation.customerGST || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRight}>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={[styles.infoLabel, { fontSize: dynamicStyles.labelFontSize }]}>Quotation No.: </Text>
                <Text style={[styles.infoText, { fontSize: dynamicStyles.textFontSize, marginBottom: 0 }]}>{quotation.quotationNumber}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={[styles.infoLabel, { fontSize: dynamicStyles.labelFontSize }]}>Date: </Text>
                <Text style={[styles.infoText, { fontSize: dynamicStyles.textFontSize, marginBottom: 0 }]}>{formatDate(quotation.date)}</Text>
              </View>
            </View>
          </View>

          {/* Subject */}
          {quotation.subject && (
            <View style={[styles.subjectContainer, { marginBottom: dynamicStyles.marginBottom }]}>
              <Text style={[styles.subjectText, { fontSize: dynamicStyles.titleFontSize }]}>Subject: {quotation.subject}</Text>
            </View>
          )}

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.serialCell, { width: columnWidths.serial, fontSize: dynamicStyles.tableHeaderFontSize }]}>SL</Text>
              <Text style={[styles.particularsCell, { width: columnWidths.particulars, fontSize: dynamicStyles.tableHeaderFontSize }]}>Particulars</Text>
              {/* Render custom columns that come before Qty */}
              {customColumnsBeforeQty.map((column, index) => (
                <Text key={`before-${index}`} style={[styles.customColumnCell, { width: columnWidths.custom, fontSize: dynamicStyles.tableHeaderFontSize }]}>
                  {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                </Text>
              ))}
              <Text style={[styles.qtyCell, { width: columnWidths.qty, fontSize: dynamicStyles.tableHeaderFontSize }]}>Qty</Text>
              {/* Render custom columns that come after Qty (like Price) */}
              {customColumnsAfterQty.map((column, index) => (
                <Text key={`after-${index}`} style={[styles.customColumnCell, { width: columnWidths.custom, fontSize: dynamicStyles.tableHeaderFontSize }]}>
                  {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                </Text>
              ))}
              <Text style={[styles.amountCell, { width: columnWidths.amount, fontSize: dynamicStyles.tableHeaderFontSize }]}>Amount (Rs.)</Text>
            </View>

            {quotation.items && quotation.items.length > 0 ? (
              quotation.items.map((item, index) => (
                <View key={index} style={[styles.tableRow, { minHeight: dynamicStyles.tableRowHeight }]}>
                  <Text style={[styles.serialCellData, { width: columnWidths.serial, fontSize: dynamicStyles.tableFontSize }]}>{index + 1}</Text>
                  <Text style={[styles.particularsCellData, { width: columnWidths.particulars, fontSize: dynamicStyles.tableFontSize }]}>{item.description || 'No description'}</Text>
                  {/* Render custom columns that come before Qty */}
                  {customColumnsBeforeQty.map((column, colIndex) => (
                    <Text key={`before-${colIndex}`} style={[styles.customColumnCellData, { width: columnWidths.custom, fontSize: dynamicStyles.tableFontSize }]}>
                      {item[column] || ""}
                    </Text>
                  ))}
                  <Text style={[styles.qtyCellData, { width: columnWidths.qty, fontSize: dynamicStyles.tableFontSize }]}>{item.qty || 1}</Text>
                  {/* Render custom columns that come after Qty (like Price) */}
                  {customColumnsAfterQty.map((column, colIndex) => (
                    <Text key={`after-${colIndex}`} style={[styles.customColumnCellData, { width: columnWidths.custom, fontSize: dynamicStyles.tableFontSize }]}>
                      {item[column] || ""}
                    </Text>
                  ))}
                  <Text style={[styles.amountCellData, { width: columnWidths.amount, fontSize: dynamicStyles.tableFontSize }]}>{formatIndianNumber(item.amount || 0)}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.tableRow, { minHeight: dynamicStyles.tableRowHeight }]}>
                <Text style={[styles.serialCellData, { width: columnWidths.serial, fontSize: dynamicStyles.tableFontSize }]}>1</Text>
                <Text style={[styles.particularsCellData, { width: columnWidths.particulars, fontSize: dynamicStyles.tableFontSize }]}>No items found</Text>
                {/* Empty custom columns for no items case */}
                {customColumnsBeforeQty.map((column, colIndex) => (
                  <Text key={`before-empty-${colIndex}`} style={[styles.customColumnCellData, { width: columnWidths.custom, fontSize: dynamicStyles.tableFontSize }]}>-</Text>
                ))}
                <Text style={[styles.qtyCellData, { width: columnWidths.qty, fontSize: dynamicStyles.tableFontSize }]}>1</Text>
                {customColumnsAfterQty.map((column, colIndex) => (
                  <Text key={`after-empty-${colIndex}`} style={[styles.customColumnCellData, { width: columnWidths.custom, fontSize: dynamicStyles.tableFontSize }]}>-</Text>
                ))}
                <Text style={[styles.amountCellData, { width: columnWidths.amount, fontSize: dynamicStyles.tableFontSize }]}>0</Text>
              </View>
            )}
          </View>

          {/* Totals */}
          <View style={[styles.totalsContainer, { marginBottom: dynamicStyles.sectionSpacing }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { fontSize: dynamicStyles.titleFontSize }]}>Total Without Tax</Text>
              <Text style={[styles.totalValue, { fontSize: dynamicStyles.titleFontSize }]}>{formatIndianNumber(quotation.subtotal || 0)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { fontSize: dynamicStyles.titleFontSize }]}>Taxes ({quotation.gstRate || 18}%)</Text>
              <Text style={[styles.totalValue, { fontSize: dynamicStyles.titleFontSize }]}>{formatIndianNumber(quotation.gstAmount || 0)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={[styles.grandTotalLabel, { fontSize: dynamicStyles.headerFontSize }]}>TOTAL (Rs.)</Text>
              <Text style={[styles.grandTotalValue, { fontSize: dynamicStyles.headerFontSize }]}>{formatIndianNumber(quotation.total || 0)}</Text>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={[styles.amountInWords, { marginBottom: dynamicStyles.sectionSpacing }]}>
            <Text style={[styles.amountInWordsLabel, { fontSize: dynamicStyles.labelFontSize }]}>Amount Chargeable (in words):</Text>
            <Text style={[styles.amountInWordsText, { fontSize: dynamicStyles.textFontSize }]}>{quotation.amountInWords || 'Zero Rupees Only'}</Text>
          </View>

          {/* Terms and Conditions */}
          <View style={[styles.termsContainer, { marginBottom: dynamicStyles.sectionSpacing }]}>
            <Text style={[styles.termsTitle, { fontSize: dynamicStyles.titleFontSize }]}>Terms and Conditions:</Text>
            {quotation.terms && (
              <Text style={[styles.termsText, { fontSize: dynamicStyles.textFontSize, marginBottom: 5 }]}>{quotation.terms}</Text>
            )}
            <Text style={[styles.termsText, { fontSize: dynamicStyles.textFontSize, fontStyle: 'italic' }]}>
              This is a Computer Generated Quotation
            </Text>
          </View>

          {/* Signature */}
          <View style={[styles.signatureContainer, { marginTop: fitInOnePage ? 15 : 30 }]}>
            <Text style={[styles.signatureText, { fontSize: dynamicStyles.textFontSize }]}>For Global Digital Connect</Text>
            <Text style={[styles.signatureText, { fontSize: dynamicStyles.textFontSize }]}>Authorized Signatory</Text>
            {signatureImage && (
              <Image
                src={signatureImage}
                style={{
                  width: fitInOnePage ? 80 : 100,
                  height: fitInOnePage ? 40 : 50,
                  marginTop: fitInOnePage ? 5 : 10
                }}
              />
            )}
          </View>
        </View>

        {/* Footer Image */}
        {footerImage && (
          <Image
            src={footerImage}
            style={styles.footerImage}
            cache={false}
          />
        )}
      </Page>
    </Document>
  );

  // Expose the download function to the parent component
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      try {
        console.log('Starting GDC PDF generation for quotation:', quotation.quotationNumber);
        const blob = await pdf(QuotationDocument).toBlob();
        console.log('GDC PDF blob generated successfully, size:', blob.size);

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
        console.log('GDC PDF download initiated successfully');
      } catch (error) {
        console.error('Error generating GDC PDF:', error);
        alert('Error generating PDF. Please check the console for details.');
      }
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

GDCQuotationPDF.displayName = 'GDCQuotationPDF';

export default GDCQuotationPDF;
