"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';
import { HEADER_IMAGE_FALLBACK, FOOTER_IMAGE_FALLBACK, SIGNATURE_IMAGE } from '../utils/letterheadImages';
import { formatDate } from '../utils/dateFormatter';

import { formatIndianNumber } from '../utils/numberFormatter';
import ClientOnlyPDFViewer from './ClientOnlyPDFViewer';

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
  subject?: string;
  forOption?: string; // New field for "For" option
  items: QuotationItem[];
  notes: string;
  terms: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  fitInOnePage?: boolean; // New field for one page option
  // Company-specific fields
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGST?: string;
  headerImage?: string;
  footerImage?: string;
  signatureImage?: string;
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
    paddingTop: 150,
    paddingBottom: 180,
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
  // New quotation title
  quotationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textDecoration: 'underline',
  },
  // Customer and quotation info section
  infoSection: {
    flexDirection: 'row',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  customerInfo: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 8,
    justifyContent: 'flex-start',
  },
  quotationInfo: {
    width: '50%',
    padding: 8,
    justifyContent: 'flex-start',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  // Table styles
  tableContainer: {
    marginBottom: 20,
    width: '100%',
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    minHeight: 25,
  },
  tableHeaderCell: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 3,
    minHeight: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    minHeight: 25,
  },
  tableCell: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 3,
    minHeight: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
    wordWrap: 'break-word',
  },
  slColumn: {
    width: '8%',
    minWidth: '8%',
    maxWidth: '8%',
    textAlign: 'center',
  },
  particularsColumn: {
    width: '62%',
    minWidth: '62%',
    maxWidth: '62%',
    textAlign: 'left',
  },
  unitsColumn: {
    width: '15%',
    minWidth: '15%',
    maxWidth: '15%',
    textAlign: 'center',
  },
  amountColumn: {
    width: '15%',
    minWidth: '15%',
    maxWidth: '15%',
    textAlign: 'right',
  },
  // Total section
  totalSection: {
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 120,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 10,
    width: 80,
    textAlign: 'right',
  },
  // Amount in words section
  amountInWordsSection: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  amountInWordsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  amountInWords: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Terms and conditions
  termsSection: {
    marginTop: 20,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  termsList: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  // Signature section
  signatureSection: {
    alignItems: 'flex-end',
    paddingRight: 30,
    position: 'relative',
    width: '100%',
    flexDirection: 'column',
  },
  signatureImage: {
    width: 40,  // 50% of original 80px
    height: 20, // 50% of original 40px
    marginTop: 5,
    marginRight: 0,
  },
  signatureText: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 2,
  },
});

// Define ref type
export interface QuotationPDFRef {
  downloadPDF: () => Promise<void>;
}

// Create Document Component
const QuotationPDF = forwardRef<QuotationPDFRef, { quotation: QuotationData }>(({ quotation }, ref) => {
  // Use company-specific details or fallback to defaults
  const companyName = quotation.companyName || "Global Digital Connect";
  const companyAddress = quotation.companyAddress || "320, Regus, Magnato Mall, VIP Chowk, Raipur- 492006";
  const companyPhone = quotation.companyPhone || "9685047519";
  const companyEmail = quotation.companyEmail || "prateek@globaldigitalconnect.com";
  const headerImage = quotation.headerImage || HEADER_IMAGE_FALLBACK;
  const footerImage = quotation.footerImage || FOOTER_IMAGE_FALLBACK;
  const signatureImage = quotation.signatureImage || SIGNATURE_IMAGE;

  // Calculate dynamic column widths based on number of custom columns
  const getColumnWidths = () => {
    const customColumns = quotation.items[0] ?
      Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k)) : [];

    const numCustomColumns = Math.max(customColumns.length, 1); // At least 1 for default Units column

    // Fixed widths for consistent layout
    const slWidth = 6; // Reduced SL column
    const amountWidth = 15; // Reduced Amount column

    // Calculate available width for particulars and custom columns
    const availableWidth = 100 - slWidth - amountWidth; // 79%

    // Distribute width more evenly
    let particularsWidth, customColumnWidth;

    if (numCustomColumns === 1) {
      particularsWidth = 64; // 64%
      customColumnWidth = 15; // 15%
    } else if (numCustomColumns === 2) {
      particularsWidth = 55; // 55%
      customColumnWidth = 12; // 12% each (24% total)
    } else if (numCustomColumns === 3) {
      particularsWidth = 49; // 49%
      customColumnWidth = 10; // 10% each (30% total)
    } else if (numCustomColumns === 4) {
      particularsWidth = 43; // 43%
      customColumnWidth = 9; // 9% each (36% total)
    } else {
      // For 5+ columns, distribute evenly
      particularsWidth = 35; // 35%
      customColumnWidth = Math.floor(44 / numCustomColumns); // Distribute remaining 44%
    }

    return {
      slColumn: `${slWidth}%`,
      particularsColumn: `${particularsWidth}%`,
      customColumn: `${customColumnWidth}%`,
      amountColumn: `${amountWidth}%`
    };
  };

  const columnWidths = getColumnWidths();

  // Dynamic styles based on fitInOnePage option
  const getDynamicStyles = () => {
    const isCompact = quotation.fitInOnePage;

    return {
      contentPadding: isCompact ? 20 : 30,
      contentPaddingTop: isCompact ? 130 : 120, // Increased to prevent header overlap
      contentPaddingBottom: isCompact ? 80 : 180, // Reduced to fit more content
      headerFontSize: isCompact ? 16 : 18, // Slightly smaller header font
      infoFontSize: isCompact ? 8 : 9,
      tableFontSize: isCompact ? 8 : 9, // More readable table font
      tableHeaderFontSize: isCompact ? 9 : 10, // More readable header font
      tableMinHeight: isCompact ? 20 : 25, // Slightly smaller row height
      amountWordsMargin: isCompact ? 5 : 15, // Reduced margin to save space
      signatureMargin: isCompact ? 25 : 50, // Adequate signature margin to prevent overlap
      quotationTitleMargin: isCompact ? 10 : 15, // Smaller title margin
      infoSectionMargin: isCompact ? 10 : 15, // Smaller info margin
    };
  };

  const dynamicStyles = getDynamicStyles();

  // Create a document that can be used for both viewing and downloading
  const QuotationDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead Header */}
        <Image
          src={headerImage}
          style={styles.headerImage}
        />

        <View style={[styles.contentContainer, {
          padding: dynamicStyles.contentPadding,
          paddingTop: dynamicStyles.contentPaddingTop,
          paddingBottom: dynamicStyles.contentPaddingBottom,
        }]}>
          {/* Quotation Title */}
          <Text style={[styles.quotationTitle, {fontSize: dynamicStyles.headerFontSize, marginBottom: dynamicStyles.quotationTitleMargin}]}>QUOTATION</Text>

          {/* Customer and Quotation Info Section */}
          <View style={[styles.infoSection, {marginBottom: dynamicStyles.infoSectionMargin}]}>
            <View style={styles.customerInfo}>
              <Text style={styles.infoLabel}>Customer Name: <Text style={styles.customerName}>{quotation.customerName}</Text></Text>
              <Text style={styles.infoLabel}>Customer Address: <Text style={styles.infoValue}>{quotation.customerAddress}</Text></Text>
            </View>
            <View style={styles.quotationInfo}>
              <Text style={styles.infoLabel}>Quotation No.: <Text style={styles.infoValue}>{quotation.quotationNumber}</Text></Text>
              <Text style={styles.infoLabel}>Date: <Text style={styles.infoValue}>{formatDate(quotation.date)}</Text></Text>
              {quotation.forOption && (
                <Text style={styles.infoLabel}>For: <Text style={styles.infoValue}>{quotation.forOption}</Text></Text>
              )}
            </View>
          </View>

          {/* Subject Section */}
          {quotation.subject && (
            <View style={{marginTop: 10, marginBottom: 10}}>
              <Text style={{fontSize: 11, lineHeight: 1.4}}>
                <Text style={{fontWeight: 'bold'}}>Subject: </Text>
                <Text style={{fontWeight: 'normal'}}>{quotation.subject}</Text>
              </Text>
            </View>
          )}

          {/* Table Container */}
          <View style={styles.tableContainer}>
            <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableHeader, {minHeight: dynamicStyles.tableMinHeight}]}>
              <View style={[styles.tableHeaderCell, {width: columnWidths.slColumn}]}>
                <Text style={{fontSize: dynamicStyles.tableHeaderFontSize, fontWeight: 'bold', textAlign: 'center'}}>SL</Text>
              </View>
              <View style={[styles.tableHeaderCell, {width: columnWidths.particularsColumn, alignItems: 'flex-start'}]}>
                <Text style={{fontSize: dynamicStyles.tableHeaderFontSize, fontWeight: 'bold', textAlign: 'left'}}>Particulars</Text>
              </View>

              {/* Render custom column headers or default Units column */}
              {quotation.items[0] && Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k)).length > 0 ? (
                // Render custom columns
                Object.keys(quotation.items[0]).map((key, index) => {
                  // Skip standard columns
                  if (["id", "serial_no", "description", "amount"].includes(key)) {
                    return null;
                  }

                  return (
                    <View key={key} style={[styles.tableHeaderCell, {width: columnWidths.customColumn}]}>
                      <Text style={{fontSize: Math.max(dynamicStyles.tableHeaderFontSize - 1, 8), fontWeight: 'bold', textAlign: 'center', width: '100%'}}>
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Text>
                    </View>
                  );
                })
              ) : (
                // Default Units column when no custom columns
                <View style={[styles.tableHeaderCell, {width: columnWidths.customColumn}]}>
                  <Text style={{fontSize: dynamicStyles.tableHeaderFontSize, fontWeight: 'bold', textAlign: 'center'}}>Units</Text>
                </View>
              )}

              <View style={[styles.tableHeaderCell, {width: columnWidths.amountColumn, borderRightWidth: 0}]}>
                <Text style={{fontSize: dynamicStyles.tableHeaderFontSize, fontWeight: 'bold', textAlign: 'center'}}>Amount (Rs.)</Text>
              </View>
            </View>

            {/* Table Rows */}
            {quotation.items.map((item, index) => (
              <View key={item.id} style={[styles.tableRow, {minHeight: dynamicStyles.tableMinHeight}]}>
                <View style={[styles.tableCell, {width: columnWidths.slColumn}]}>
                  <Text style={{fontSize: dynamicStyles.tableFontSize, textAlign: 'center'}}>{index + 1}</Text>
                </View>
                <View style={[styles.tableCell, {width: columnWidths.particularsColumn, alignItems: 'flex-start'}]}>
                  <Text style={{fontSize: dynamicStyles.tableFontSize, textAlign: 'left'}}>{item.description}</Text>
                </View>

                {/* Render custom column values or default Units column */}
                {Object.keys(item).filter(k => !["id", "serial_no", "description", "amount"].includes(k)).length > 0 ? (
                  // Render custom columns
                  Object.keys(item).map((key) => {
                    // Skip standard columns
                    if (["id", "serial_no", "description", "amount"].includes(key)) {
                      return null;
                    }

                    return (
                      <View key={key} style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                        <Text style={{fontSize: Math.max(dynamicStyles.tableFontSize - 1, 7), textAlign: 'center', width: '100%'}}>
                          {item[key] || ""}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  // Default Units column when no custom columns
                  <View style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                    <Text style={{fontSize: dynamicStyles.tableFontSize, textAlign: 'center'}}>1</Text>
                  </View>
                )}

                <View style={[styles.tableCell, {width: columnWidths.amountColumn, borderRightWidth: 0}]}>
                  <Text style={{fontSize: dynamicStyles.tableFontSize, textAlign: 'right'}}>
                    {formatIndianNumber(item.amount)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Total Without Tax Row */}
            <View style={[styles.tableRow, {minHeight: dynamicStyles.tableMinHeight}]}>
              <View style={[styles.tableCell, {width: columnWidths.slColumn}]}></View>
              <View style={[styles.tableCell, {width: columnWidths.particularsColumn}]}></View>

              {/* Handle custom columns or default Units column */}
              {quotation.items[0] && Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k)).length > 0 ? (
                // Custom columns exist
                Object.keys(quotation.items[0]).map((key, index) => {
                  if (["id", "serial_no", "description", "amount"].includes(key)) {
                    return null;
                  }

                  const customKeys = Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k));
                  const isLastCustomColumn = key === customKeys[customKeys.length - 1];

                  return (
                    <View key={key} style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                      {isLastCustomColumn ? (
                        <Text style={{fontSize: Math.max(dynamicStyles.tableFontSize - 1, 7), fontWeight: 'bold', textAlign: 'center'}}>Total Without Tax</Text>
                      ) : null}
                    </View>
                  );
                })
              ) : (
                // Default Units column
                <View style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                  <Text style={{fontSize: dynamicStyles.tableFontSize, fontWeight: 'bold', textAlign: 'center'}}>Total Without Tax</Text>
                </View>
              )}

              <View style={[styles.tableCell, {width: columnWidths.amountColumn, borderRightWidth: 0}]}>
                <Text style={{fontSize: 9, fontWeight: 'bold', textAlign: 'right'}}>
                  {formatIndianNumber(quotation.subtotal)}
                </Text>
              </View>
            </View>

            {/* Tax Row */}
            <View style={[styles.tableRow, {minHeight: dynamicStyles.tableMinHeight}]}>
              <View style={[styles.tableCell, {width: columnWidths.slColumn}]}></View>
              <View style={[styles.tableCell, {width: columnWidths.particularsColumn}]}></View>

              {/* Handle custom columns or default Units column */}
              {quotation.items[0] && Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k)).length > 0 ? (
                // Custom columns exist
                Object.keys(quotation.items[0]).map((key, index) => {
                  if (["id", "serial_no", "description", "amount"].includes(key)) {
                    return null;
                  }

                  const customKeys = Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k));
                  const isLastCustomColumn = key === customKeys[customKeys.length - 1];

                  return (
                    <View key={key} style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                      {isLastCustomColumn ? (
                        <Text style={{fontSize: Math.max(dynamicStyles.tableFontSize - 1, 7), fontWeight: 'bold', textAlign: 'center'}}>Taxes ({quotation.gstRate}%)</Text>
                      ) : null}
                    </View>
                  );
                })
              ) : (
                // Default Units column
                <View style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                  <Text style={{fontSize: dynamicStyles.tableFontSize, fontWeight: 'bold', textAlign: 'center'}}>Taxes ({quotation.gstRate}%)</Text>
                </View>
              )}

              <View style={[styles.tableCell, {width: columnWidths.amountColumn, borderRightWidth: 0}]}>
                <Text style={{fontSize: 9, fontWeight: 'bold', textAlign: 'right'}}>
                  {formatIndianNumber(quotation.gstAmount)}
                </Text>
              </View>
            </View>

            {/* Final Total Row */}
            <View style={[styles.tableRow, {borderBottomWidth: 2, minHeight: dynamicStyles.tableMinHeight}]}>
              <View style={[styles.tableCell, {width: columnWidths.slColumn}]}></View>
              <View style={[styles.tableCell, {width: columnWidths.particularsColumn}]}></View>

              {/* Handle custom columns or default Units column */}
              {quotation.items[0] && Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k)).length > 0 ? (
                // Custom columns exist
                Object.keys(quotation.items[0]).map((key, index) => {
                  if (["id", "serial_no", "description", "amount"].includes(key)) {
                    return null;
                  }

                  const customKeys = Object.keys(quotation.items[0]).filter(k => !["id", "serial_no", "description", "amount"].includes(k));
                  const isLastCustomColumn = key === customKeys[customKeys.length - 1];

                  return (
                    <View key={key} style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                      {isLastCustomColumn ? (
                        <Text style={{fontSize: Math.max(dynamicStyles.tableFontSize - 1, 7), fontWeight: 'bold', textAlign: 'center'}}>TOTAL (Rs.)</Text>
                      ) : null}
                    </View>
                  );
                })
              ) : (
                // Default Units column
                <View style={[styles.tableCell, {width: columnWidths.customColumn}]}>
                  <Text style={{fontSize: dynamicStyles.tableFontSize, fontWeight: 'bold', textAlign: 'center'}}>TOTAL (Rs.)</Text>
                </View>
              )}

              <View style={[styles.tableCell, {width: columnWidths.amountColumn, borderRightWidth: 0}]}>
                <Text style={{fontSize: 9, fontWeight: 'bold', textAlign: 'right'}}>
                  {formatIndianNumber(quotation.total)}
                </Text>
              </View>
            </View>
          </View>
          </View>

          {/* Clear separation after table */}
          <View style={{height: 20, width: '100%'}}></View>

          {/* Amount in Words */}
          <View style={[styles.amountInWordsSection, {marginBottom: dynamicStyles.amountWordsMargin}]}>
            <Text style={styles.amountInWordsLabel}>Amount Chargeable (in words):</Text>
            <Text style={styles.amountInWords}>{quotation.amountInWords}</Text>
          </View>

          {/* Terms and Conditions - Only show if user has entered terms */}
          {quotation.terms && (
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>Terms and Conditions:</Text>
              <Text style={styles.termsList}>{quotation.terms}</Text>
            </View>
          )}

          {/* Notes - Only show if user has entered notes */}
          {quotation.notes && (
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>Notes:</Text>
              <Text style={styles.termsList}>{quotation.notes}</Text>
            </View>
          )}

          {/* Clear separation before signature */}
          <View style={{height: quotation.fitInOnePage ? 20 : dynamicStyles.signatureMargin, width: '100%', borderBottom: '1px solid transparent'}}></View>

          {/* Signature Section - At the very end */}
          <View style={[styles.signatureSection, {marginTop: dynamicStyles.signatureMargin}]}>
            <Text style={[styles.signatureText, {fontSize: quotation.fitInOnePage ? 8 : 9}]}>For Global Digital Connect</Text>
            <Text style={[styles.signatureText, {fontSize: quotation.fitInOnePage ? 8 : 9}]}>Authorized Signatory</Text>
            <Image
              src={signatureImage}
              style={styles.signatureImage}
            />
          </View>

          {/* Computer Generated Quotation Text */}
          <View style={{marginTop: 20, alignItems: 'center'}}>
            <Text style={{fontSize: 8, color: '#666', fontStyle: 'italic'}}>
              This is a Computer Generated Quotation
            </Text>
          </View>
        </View>

        {/* Letterhead Footer */}
        <Image
          src={footerImage}
          style={styles.footerImage}
        />
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
        const customerName = quotation.customerName.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
        const date = quotation.date.replace(/[^0-9]/g, '');
        const quotationNumber = quotation.quotationNumber.replace(/[^a-zA-Z0-9]/g, '_');
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

  return (
    <ClientOnlyPDFViewer>
      <PDFViewer style={{ width: '100%', height: '600px' }}>
        {QuotationDocument}
      </PDFViewer>
    </ClientOnlyPDFViewer>
  );
});

QuotationPDF.displayName = 'QuotationPDF';

export default QuotationPDF;
