"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, PDFViewer, Image } from '@react-pdf/renderer';
import ClientOnlyPDFViewer from './ClientOnlyPDFViewer';

interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  qty?: string;
  price?: string;
  amount: number;
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
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  notes?: string;
  terms?: string;
  fitInOnePage?: boolean;
}

interface SAPromotionsPDFProps {
  quotation: QuotationData;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica'
  },
  headerImage: {
    width: '100%',
    height: 120,
    marginBottom: 15,
    objectFit: 'contain'
  },
  quotationTitle: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  quotationTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  quotationSubtitle: {
    fontSize: 10,
    color: '#E5E7EB',
    textAlign: 'center',
    marginTop: 3,
    fontStyle: 'italic',
  },
  consolidatedInfoSection: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FF',
    padding: 6,
    borderRadius: 5,
    marginBottom: 8,
    border: '1 solid #8B5CF6'
  },
  leftColumn: {
    flex: 1,
    paddingRight: 15
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 15
  },
  compactLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6B21A8',
    marginBottom: 1
  },
  compactValue: {
    fontSize: 8,
    color: '#5B21B6',
    fontWeight: 'normal'
  },
  subjectBox: {
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 5,
    marginBottom: 8,
    borderLeft: '3 solid #F59E0B',
  },
  subjectLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400E',
    textTransform: 'uppercase'
  },
  subjectText: {
    fontSize: 9,
    color: '#78350F',
    lineHeight: 1.3
  },
  itemsTable: {
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#7C3AED'
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 5,
    minHeight: 32,
    backgroundColor: '#FFFFFF'
  },
  tableRowEven: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 5,
    minHeight: 32,
    backgroundColor: '#F8F9FF'
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'left',
    paddingHorizontal: 3,
    display: 'flex',
    justifyContent: 'center'
  },
  tableCellRight: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'right',
    paddingHorizontal: 3,
    display: 'flex',
    justifyContent: 'center'
  },
  summarySection: {
    marginTop: 15,
    marginBottom: 15
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10
  },
  summaryLabel: {
    fontSize: 11,
    color: '#374151'
  },
  summaryValue: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    marginTop: 10
  },
  totalLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  totalValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  wordsSection: {
    marginBottom: 15,
    backgroundColor: '#EDE9FE',
    padding: 10,
    borderRadius: 8,
    border: '1 solid #8B5CF6'
  },
  wordsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B21A8',
    marginBottom: 5
  },
  wordsText: {
    fontSize: 10,
    color: '#5B21B6',
    lineHeight: 1.4
  },
  footerImage: {
    width: '100%',
    height: 80,
    marginTop: 15,
    objectFit: 'contain'
  },
  sealImage: {
    width: 60,
    height: 60,
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 20
  }
});

const SAPromotionsPDFDocument = ({ quotation }: SAPromotionsPDFProps) => {
  // Get custom columns dynamically from the first item
  const getCustomColumns = () => {
    if (!quotation.items || quotation.items.length === 0) return [];
    const firstItem = quotation.items[0];
    return Object.keys(firstItem).filter(key => 
      !['id', 'serial_no', 'description', 'amount'].includes(key)
    );
  };

  const customColumns = getCustomColumns();
  const numCustomColumns = customColumns.length;

  // Dynamic styles based on fitInOnePage option
  const dynamicStyles = {
    headerImageHeight: quotation.fitInOnePage ? 70 : 120,
    titleFontSize: quotation.fitInOnePage ? 12 : 18,
    titlePadding: quotation.fitInOnePage ? 8 : 15,
    titleMargin: quotation.fitInOnePage ? 8 : 15,
    infoSectionMargin: quotation.fitInOnePage ? 5 : 8,
    infoSectionPadding: quotation.fitInOnePage ? 4 : 6,
    infoFontSize: quotation.fitInOnePage ? 7 : 8,
    subjectMargin: quotation.fitInOnePage ? 5 : 8,
    subjectPadding: quotation.fitInOnePage ? 4 : 6,
    tableFontSize: quotation.fitInOnePage ? 7 : 9,
    tableHeaderFontSize: quotation.fitInOnePage ? 8 : 9,
    tableMinHeight: quotation.fitInOnePage ? 22 : 32,
    summaryFontSize: quotation.fitInOnePage ? 9 : 11,
    totalFontSize: quotation.fitInOnePage ? 10 : 13,
    wordsFontSize: quotation.fitInOnePage ? 8 : 10,
    footerImageHeight: quotation.fitInOnePage ? 50 : 80,
    sealSize: quotation.fitInOnePage ? 40 : 60
  };

  // Calculate dynamic column widths
  const getColumnWidths = () => {
    let serialWidth = 8;
    let descriptionWidth = 35;
    let amountWidth = 15;
    
    if (numCustomColumns === 0) {
      descriptionWidth = 77;
    } else if (numCustomColumns === 1) {
      descriptionWidth = 62;
    } else if (numCustomColumns === 2) {
      descriptionWidth = 47;
    } else {
      descriptionWidth = 32;
    }
    
    const customColumnWidth = numCustomColumns > 0 ? 
      (100 - serialWidth - descriptionWidth - amountWidth) / numCustomColumns : 0;
    
    return {
      serial: `${serialWidth}%`,
      description: `${descriptionWidth}%`,
      custom: `${customColumnWidth}%`,
      amount: `${amountWidth}%`
    };
  };

  const columnWidths = getColumnWidths();

  // Helper function to format proper case
  const formatProperCase = (text: string) => {
    if (!text) return '';
    return text.toString().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with SA Promotions Image */}
        <Image
          src="/sapromtion-header.jpg"
          style={[styles.headerImage, {height: dynamicStyles.headerImageHeight}]}
        />

        {/* Special SA Promotions Quotation Title */}
        <View style={[styles.quotationTitle, {padding: dynamicStyles.titlePadding, marginBottom: dynamicStyles.titleMargin}]}>
          <Text style={[styles.quotationTitleText, {fontSize: dynamicStyles.titleFontSize}]}>QUOTATION</Text>
          <Text style={styles.quotationSubtitle}>Professional Services Proposal</Text>
        </View>

        {/* Consolidated Quotation & Customer Info Strip */}
        <View style={[styles.consolidatedInfoSection, {marginBottom: dynamicStyles.infoSectionMargin, padding: dynamicStyles.infoSectionPadding}]}>
          {/* Left Column - Quotation Details */}
          <View style={styles.leftColumn}>
            <Text style={[styles.compactLabel, {fontSize: dynamicStyles.infoFontSize}]}>Quote No: <Text style={styles.compactValue}>{quotation.quotationNumber}</Text></Text>
            <Text style={[styles.compactLabel, {fontSize: dynamicStyles.infoFontSize}]}>Date: <Text style={styles.compactValue}>{quotation.date}</Text></Text>
            <Text style={[styles.compactLabel, {fontSize: dynamicStyles.infoFontSize}]}>Valid Until: <Text style={styles.compactValue}>{quotation.validUntil}</Text></Text>
          </View>

          {/* Right Column - Customer Details */}
          <View style={styles.rightColumn}>
            <Text style={[styles.compactLabel, {fontSize: dynamicStyles.infoFontSize}]}>Client Information:</Text>
            <Text style={[styles.compactValue, {fontSize: dynamicStyles.infoFontSize}]}>{quotation.customerName}</Text>
            <Text style={[styles.compactValue, {fontSize: dynamicStyles.infoFontSize}]}>{quotation.customerAddress}</Text>
            {quotation.customerPhone && (
              <Text style={[styles.compactValue, {fontSize: dynamicStyles.infoFontSize}]}>Phone: {quotation.customerPhone}</Text>
            )}
            {quotation.customerGST && (
              <Text style={[styles.compactValue, {fontSize: dynamicStyles.infoFontSize}]}>GST: {quotation.customerGST}</Text>
            )}
          </View>
        </View>

        {/* Subject Section - Special SA Promotions styling */}
        {quotation.subject && (
          <View style={[styles.subjectBox, {marginBottom: dynamicStyles.subjectMargin, padding: dynamicStyles.subjectPadding}]}>
            <Text style={styles.subjectText}>
              <Text style={styles.subjectLabel}>PROJECT SUBJECT : </Text>
              <Text style={[styles.subjectText, {fontWeight: 'bold'}]}>{quotation.subject}</Text>
            </Text>
          </View>
        )}

        {/* Items Table with SA Promotions styling */}
        <View style={styles.itemsTable}>
          <View style={[styles.tableHeader, {minHeight: dynamicStyles.tableMinHeight}]}>
            <Text style={[styles.tableHeaderCell, {width: columnWidths.serial, fontSize: dynamicStyles.tableHeaderFontSize, textAlign: 'left'}]}>S.no</Text>
            <Text style={[styles.tableHeaderCell, {width: columnWidths.description, fontSize: dynamicStyles.tableHeaderFontSize, textAlign: 'left'}]}>Service Description</Text>
            {customColumns.map((column) => (
              <Text key={column} style={[styles.tableHeaderCell, {width: columnWidths.custom, fontSize: dynamicStyles.tableHeaderFontSize}]}>
                {formatProperCase(column)}
              </Text>
            ))}
            <Text style={[styles.tableHeaderCell, {width: columnWidths.amount, fontSize: dynamicStyles.tableHeaderFontSize}]}>Amount (rs.)</Text>
          </View>
          
          {quotation.items.map((item, index) => (
            <View key={item.id} style={[index % 2 === 0 ? styles.tableRow : styles.tableRowEven, {minHeight: dynamicStyles.tableMinHeight}]}>
              <Text style={[styles.tableCell, {width: columnWidths.serial, fontSize: dynamicStyles.tableFontSize, textAlign: 'left'}]}>{item.serial_no}</Text>
              <Text style={[styles.tableCell, {width: columnWidths.description, fontSize: dynamicStyles.tableFontSize, textAlign: 'left'}]}>{formatProperCase(item.description)}</Text>
              {customColumns.map((column) => (
                <Text key={column} style={[styles.tableCell, {width: columnWidths.custom, textAlign: 'center', fontSize: dynamicStyles.tableFontSize}]}>
                  {formatProperCase(item[column] || '')}
                </Text>
              ))}
              <Text style={[styles.tableCellRight, {width: columnWidths.amount, fontSize: dynamicStyles.tableFontSize}]}>Rs. {Number(item.amount).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Summary with SA Promotions styling */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {fontSize: dynamicStyles.summaryFontSize}]}>Total without tax:</Text>
            <Text style={[styles.summaryValue, {fontSize: dynamicStyles.summaryFontSize}]}>Rs. {Number(quotation.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {fontSize: dynamicStyles.summaryFontSize}]}>Taxes ({quotation.gstRate}%):</Text>
            <Text style={[styles.summaryValue, {fontSize: dynamicStyles.summaryFontSize}]}>Rs. {Number(quotation.gstAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, {fontSize: dynamicStyles.totalFontSize}]}>Total Investment</Text>
            <Text style={[styles.totalValue, {fontSize: dynamicStyles.totalFontSize}]}>Rs. {Number(quotation.total).toFixed(2)}</Text>
          </View>
        </View>

        {/* Amount in Words with SA Promotions styling */}
        <View style={styles.wordsSection}>
          <Text style={[styles.wordsLabel, {fontSize: dynamicStyles.wordsFontSize}]}>Amount Chargeable (in words):</Text>
          <Text style={[styles.wordsText, {fontSize: dynamicStyles.wordsFontSize}]}>{quotation.amountInWords}</Text>
        </View>

        {/* Notes and Terms */}
        {quotation.notes && (
          <View style={[styles.wordsSection, {marginBottom: 10}]}>
            <Text style={[styles.wordsLabel, {fontSize: dynamicStyles.wordsFontSize}]}>Notes:</Text>
            <Text style={[styles.wordsText, {fontSize: dynamicStyles.wordsFontSize}]}>{quotation.notes}</Text>
          </View>
        )}

        {quotation.terms && (
          <View style={[styles.wordsSection, {marginBottom: 10}]}>
            <Text style={[styles.wordsLabel, {fontSize: dynamicStyles.wordsFontSize}]}>Terms & Conditions:</Text>
            <Text style={[styles.wordsText, {fontSize: dynamicStyles.wordsFontSize}]}>{quotation.terms}</Text>
          </View>
        )}

        {/* SA Promotions Seal/Signature */}
        <Image
          src="/sapromtion-seal.jpg"
          style={[styles.sealImage, {width: dynamicStyles.sealSize, height: dynamicStyles.sealSize}]}
        />

        {/* Footer with SA Promotions Image */}
        <Image
          src="/sapromotion-footer.jpg"
          style={[styles.footerImage, {height: dynamicStyles.footerImageHeight}]}
        />
      </Page>
    </Document>
  );
};

const SAPromotionsPDF = forwardRef<any, SAPromotionsPDFProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      try {
        const blob = await pdf(<SAPromotionsPDFDocument {...props} />).toBlob();
        
        // Create custom filename
        const customerName = props.quotation.customerName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
        const date = props.quotation.date?.replace(/[^0-9]/g, '') || new Date().toISOString().split('T')[0].replace(/[^0-9]/g, '');
        const quotationNumber = props.quotation.quotationNumber?.replace(/[^a-zA-Z0-9]/g, '_') || 'Quote';
        const filename = `${customerName}_${date}_${quotationNumber}.pdf`;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
      }
    }
  }));

  return (
    <ClientOnlyPDFViewer>
      <PDFViewer style={{ width: '100%', height: '600px' }}>
        <SAPromotionsPDFDocument {...props} />
      </PDFViewer>
    </ClientOnlyPDFViewer>
  );
});

SAPromotionsPDF.displayName = 'SAPromotionsPDF';

export default SAPromotionsPDF;
