import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';
import { HEADER_IMAGE_FALLBACK, FOOTER_IMAGE_FALLBACK } from '../utils/letterheadImages';
import { formatDate } from '../utils/dateFormatter';
import SignatureImage from './SignatureImage';
import { formatIndianNumber } from '../utils/numberFormatter';

// Define types
interface ChallanItem {
  id: string;
  serial_no: string;
  description: string;
  quantity: number;
  [key: string]: any;
}

interface ChallanData {
  challanNumber: string;
  date: string;
  deliveryDate: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  items: ChallanItem[];
  notes: string;
  terms: string;
  totalQuantity: number;
}

interface ChallanPDFRef {
  downloadPDF: () => Promise<void>;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  header: {
    height: 120,
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    alignItems: 'flex-start',
    minHeight: 28,
    fontSize: 10,
    fontWeight: 'normal',
    padding: '8px 0',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    padding: '8px 0',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    borderBottomStyle: 'solid',
  },
  serialNo: {
    width: '8%',
    paddingRight: 8,
    textAlign: 'center',
    whiteSpace: 'normal',
  },
  description: {
    width: '60%',
    paddingRight: 8,
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
  },
  quantity: {
    width: '15%',
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontVariant: 'normal',
    paddingRight: 15,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    width: '48%',
    padding: 10,
    border: '1px solid #EEEEEE',
    borderRadius: 5,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FF6B35',
  },
  infoText: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 20,
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsBox: {
    width: '40%',
    padding: 10,
    border: '1px solid #EEEEEE',
    borderRadius: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
  },
  totalLabel: {
    fontWeight: 'normal',
  },
  totalValue: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    borderTopStyle: 'solid',
    paddingTop: 5,
    marginTop: 5,
  },
  amountInWords: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    border: '1px solid #EEEEEE',
    borderRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  footerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  signatureSection: {
    position: 'absolute',
    bottom: 110,
    right: 30,
    width: 150,
    height: 60,
  },
});

// Create Document Component
const ChallanPDF = forwardRef<ChallanPDFRef, { challan: ChallanData }>(({ challan }, ref) => {
  
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      const blob = await pdf(<ChallanDocument challan={challan} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `challan-${challan.challanNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    },
  }));

  return (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      <ChallanDocument challan={challan} />
    </PDFViewer>
  );
});

ChallanPDF.displayName = 'ChallanPDF';

// Document component
const ChallanDocument = ({ challan }: { challan: ChallanData }) => {
  // Safety check for challan data
  if (!challan) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <Text>Error: Challan data not found</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Additional safety checks for required fields
  if (!challan.challanNumber && !challan.customerName) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <Text>Error: Challan data incomplete - missing challan number or customer name</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Image style={styles.headerImage} src={HEADER_IMAGE_FALLBACK} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Copy Information - Right Aligned */}
        <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' }}>
              Copy for Customer
            </Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' }}>
              Copy for Transporter
            </Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 8, textAlign: 'right' }}>
              Copy for Consignee
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Delivery Challan</Text>

        {/* Challan and Customer Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Challan Details</Text>
            <Text style={styles.infoText}>Challan No: {challan.challanNumber || 'N/A'}</Text>
            <Text style={styles.infoText}>Date: {challan.date ? formatDate(challan.date) : 'N/A'}</Text>
            <Text style={styles.infoText}>Delivery Date: {challan.deliveryDate ? formatDate(challan.deliveryDate) : 'N/A'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Customer Information</Text>
            <Text style={styles.infoText}>Name: {challan.customerName || 'N/A'}</Text>
            <Text style={styles.infoText}>Address: {challan.customerAddress || 'N/A'}</Text>
            <Text style={styles.infoText}>GST No: {challan.customerEmail || 'N/A'}</Text>
            <Text style={styles.infoText}>Phone: {challan.customerPhone || 'N/A'}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.headerRow}>
            <Text style={styles.serialNo}>S. No.</Text>
            <Text style={styles.description}>Description</Text>
            {/* Dynamic custom columns headers - always before quantity */}
            {challan.items && challan.items.length > 0 && Object.keys(challan.items[0])
              .filter(key => !['id', 'serial_no', 'description', 'quantity'].includes(key))
              .map(key => (
              <Text key={key} style={{width: '10%', paddingRight: 8, fontSize: 9, textOverflow: 'ellipsis', whiteSpace: 'normal'}}>
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
            ))}
            {/* Quantity column always at the end */}
            <Text style={styles.quantity}>Qty/Units/Nos.</Text>
          </View>

          {/* Table Rows */}
          {(challan.items || []).map((item, index) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.serialNo}>{index + 1}</Text>
              <Text style={styles.description}>{item.description}</Text>
              {/* Dynamic custom columns values - always before quantity */}
              {Object.keys(item)
                .filter(key => !['id', 'serial_no', 'description', 'quantity'].includes(key))
                .map(key => (
                <Text key={key} style={{width: '10%', paddingRight: 8, fontSize: 9, textOverflow: 'ellipsis', whiteSpace: 'normal'}}>
                  {item[key] || ""}
                </Text>
              ))}
              {/* Quantity value always at the end */}
              <Text style={{...styles.quantity, fontFeatureSettings: 'tnum'}}>{item.quantity || ""}</Text>
            </View>
          ))}
        </View>

        {/* Total Quantity Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Quantity:</Text>
              <Text style={{...styles.totalValue, fontFeatureSettings: 'tnum'}}>{challan.totalQuantity || 0}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Notes */}
        {(challan.terms || challan.notes) && (
          <View style={styles.section}>
            {challan.terms && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Terms & Conditions:</Text>
                <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{challan.terms}</Text>
              </View>
            )}
            {challan.notes && (
              <View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Notes:</Text>
                <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{challan.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bank Details */}
        <View style={{
          marginTop: 20,
          padding: 10,
          border: "1 solid #000000",
          backgroundColor: "#f9f9f9",
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: "bold",
            marginBottom: 5,
            textAlign: "center",
          }}>Company's Bank Details</Text>
          <Text style={{ fontSize: 9, marginBottom: 2 }}>A/c Holder's Name: Global Digital Connect</Text>
          <Text style={{ fontSize: 9, marginBottom: 2 }}>Bank Name: HDFC Bank Limited</Text>
          <Text style={{ fontSize: 9, marginBottom: 2 }}>A/c No.: 50200072078516</Text>
          <Text style={{ fontSize: 9, marginBottom: 2 }}>Branch & IFS Code: Telibanda & HDFC0005083</Text>
        </View>
      </View>

      {/* Signature */}
      <View style={styles.signatureSection}>
        <SignatureImage />
      </View>

      {/* Declaration */}
      <View style={{
        position: 'absolute',
        bottom: 120,
        left: 30,
        right: 30,
      }}>
        <Text style={{
          fontSize: 9,
          lineHeight: 1.3,
          textAlign: "left",
          fontStyle: "italic",
        }}>
          Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Image style={styles.footerImage} src={FOOTER_IMAGE_FALLBACK} />
      </View>
    </Page>
  </Document>
  );
};

export default ChallanPDF;
