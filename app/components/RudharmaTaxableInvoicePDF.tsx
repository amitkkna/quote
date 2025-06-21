"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer, pdf } from "@react-pdf/renderer";
import { formatDate } from "../utils/dateFormatter";
import { formatCurrency } from "../utils/numberFormatter";
import { numberToWords } from "../utils/numberToWords";
import { getRudharmaSignatureImage, getSealImage } from "../utils/letterheadImages";
import ClientOnlyPDFViewer from './ClientOnlyPDFViewer';

// Rudharma Company Details
const RUDHARMA_COMPANY_DETAILS = {
  name: "Rudharma Enterprises",
  address: "133 Metro Green Society, Saddu Raipur",
  gst: "22APMPR8089K1Z3"
};

// Define styles for Rudharma (same as Global Digital Connect structure)
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  pageCompact: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 15,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #000000",
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 3,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
    padding: 8,
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  invoiceInfo: {
    width: "48%",
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  addressBox: {
    width: "48%",
    border: "1 solid #000000",
    padding: 8,
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    padding: 3,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "1 solid #000000",
    borderTop: "1 solid #000000",
    borderLeft: "1 solid #000000",
    borderRight: "1 solid #000000",
    padding: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000000",
    borderLeft: "1 solid #000000",
    borderRight: "1 solid #000000",
    padding: 5,
    minHeight: 25,
  },
  serialCol: { width: "8%", textAlign: "center" },
  descriptionCol: { width: "30%", paddingLeft: 5 },
  hsnCol: { width: "12%", textAlign: "center" },
  quantityCol: { width: "10%", textAlign: "center" },
  rateCol: { width: "12%", textAlign: "right", paddingRight: 5 },
  amountCol: { width: "13%", textAlign: "right", paddingRight: 5 },
  customCol: { width: "10%", textAlign: "center" },
  taxSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  taxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    paddingHorizontal: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "2 solid #000000",
    paddingTop: 5,
    paddingHorizontal: 10,
    fontWeight: "bold",
    fontSize: 12,
  },
  amountInWords: {
    marginTop: 15,
    padding: 8,
    border: "1 solid #000000",
    backgroundColor: "#f9f9f9",
  },
  termsSection: {
    marginTop: 20,
    padding: 8,
    border: "1 solid #000000",
  },
  signature: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    textAlign: "center",
    borderTop: "1 solid #000000",
    paddingTop: 5,
  },
  bankDetails: {
    marginTop: 20,
    padding: 10,
    border: "1 solid #000000",
    backgroundColor: "#f9f9f9",
  },
  bankTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  bankInfo: {
    fontSize: 9,
    marginBottom: 2,
  },
  declaration: {
    marginTop: 10,
    marginBottom: 5,
  },
  declarationText: {
    fontSize: 9,
    lineHeight: 1.3,
    textAlign: "left",
    fontStyle: "italic",
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  leftSignature: {
    width: "30%",
    textAlign: "center",
  },
  rightSignature: {
    width: "30%",
    textAlign: "center",
    alignItems: "center",
  },
  signatureImage: {
    width: 80,
    height: 40,
    marginBottom: 5,
  },
  sealImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
});

interface RudharmaTaxableInvoicePDFProps {
  companyName: string;
  invoiceNumber: string;
  invoiceDate: string;
  poReference: string;
  poDate: string;
  billTo: {
    name: string;
    address: string;
    gst: string;
  };
  shipTo: {
    name: string;
    address: string;
    gst: string;
  };
  items: any[];
  taxRates: any;
  taxType: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  termsAndConditions: string;
  fitToOnePage: boolean;
}

// Document component for Rudharma
const RudharmaTaxableInvoiceDocument = (props: RudharmaTaxableInvoicePDFProps) => {
  const calculateTaxBreakdown = () => {
    if (props.taxType === 'igst') {
      return {
        igst: (props.subtotal * props.taxRates.igst) / 100,
        cgst: 0,
        sgst: 0,
      };
    } else {
      return {
        igst: 0,
        cgst: (props.subtotal * props.taxRates.cgst) / 100,
        sgst: (props.subtotal * props.taxRates.sgst) / 100,
      };
    }
  };

  const taxBreakdown = calculateTaxBreakdown();

  return (
    <Document>
      <Page size="A4" style={props.fitToOnePage ? styles.pageCompact : styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{RUDHARMA_COMPANY_DETAILS.name}</Text>
          <Text style={styles.companyDetails}>
            {RUDHARMA_COMPANY_DETAILS.address}
          </Text>
          <Text style={styles.companyDetails}>
            GST: {RUDHARMA_COMPANY_DETAILS.gst}
          </Text>
        </View>

        {/* Invoice Title */}
        <View style={styles.invoiceTitle}>
          <Text>TAX INVOICE</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceInfo}>
            <Text>Invoice No: {props.invoiceNumber}</Text>
            <Text>Invoice Date: {formatDate(props.invoiceDate)}</Text>
            {props.poReference && <Text>PO Reference: {props.poReference}</Text>}
            {props.poDate && <Text>PO Date: {formatDate(props.poDate)}</Text>}
          </View>
          <View style={styles.invoiceInfo}>
            <Text>Place of Supply: Chhattisgarh</Text>
            <Text>State Code: 22</Text>
          </View>
        </View>

        {/* Bill To & Ship To */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Bill To:</Text>
            <Text>{props.billTo.name}</Text>
            <Text>{props.billTo.address}</Text>
            {props.billTo.gst && <Text>GST No: {props.billTo.gst}</Text>}
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Ship To:</Text>
            <Text>{props.shipTo.name}</Text>
            <Text>{props.shipTo.address}</Text>
            {props.shipTo.gst && <Text>GST No: {props.shipTo.gst}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.serialCol}>S.No.</Text>
            <Text style={styles.descriptionCol}>Description</Text>
            <Text style={styles.hsnCol}>HSN/SAC Code</Text>
            <Text style={styles.quantityCol}>Qty</Text>
            <Text style={styles.rateCol}>Taxable Value</Text>
            <Text style={styles.amountCol}>Amount</Text>
          </View>

          {/* Table Rows */}
          {props.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.serialCol}>{index + 1}</Text>
              <Text style={styles.descriptionCol}>{item.description}</Text>
              <Text style={styles.hsnCol}>{item.hsnSac || ""}</Text>
              <Text style={styles.quantityCol}>{item.quantity || 1}</Text>
              <Text style={styles.rateCol}>{formatCurrency(item.rate || item.amount || 0)}</Text>
              <Text style={styles.amountCol}>{formatCurrency(item.amount || 0)}</Text>
            </View>
          ))}
        </View>

        {/* Tax Calculation */}
        <View style={styles.taxSection}>
          <View style={styles.taxRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(props.subtotal)}</Text>
          </View>

          {props.taxType === 'igst' ? (
            <View style={styles.taxRow}>
              <Text>IGST ({props.taxRates.igst}%):</Text>
              <Text>{formatCurrency(taxBreakdown.igst)}</Text>
            </View>
          ) : (
            <>
              <View style={styles.taxRow}>
                <Text>CGST ({props.taxRates.cgst}%):</Text>
                <Text>{formatCurrency(taxBreakdown.cgst)}</Text>
              </View>
              <View style={styles.taxRow}>
                <Text>SGST ({props.taxRates.sgst}%):</Text>
                <Text>{formatCurrency(taxBreakdown.sgst)}</Text>
              </View>
            </>
          )}

          <View style={styles.totalRow}>
            <Text>Total Amount:</Text>
            <Text>{formatCurrency(props.total)}</Text>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountInWords}>
          <Text style={{ fontWeight: "bold", marginBottom: 3 }}>Total Amount in Words:</Text>
          <Text>{numberToWords(props.total)} Only</Text>
        </View>

        {/* Terms and Conditions */}
        {props.termsAndConditions && (
          <View style={styles.termsSection}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Terms and Conditions:</Text>
            <Text>{props.termsAndConditions}</Text>
          </View>
        )}

        {/* Bank Details - Rudharma specific */}
        <View style={styles.bankDetails}>
          <Text style={styles.bankTitle}>Company's Bank Details</Text>
          <Text style={styles.bankInfo}>A/c Holder's Name: {RUDHARMA_COMPANY_DETAILS.name}</Text>
          <Text style={styles.bankInfo}>Bank Name: [Bank Name]</Text>
          <Text style={styles.bankInfo}>A/c No.: [Account Number]</Text>
          <Text style={styles.bankInfo}>Branch & IFS Code: [Branch & IFS Code]</Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.leftSignature}>
            <Text style={{ fontSize: 10, marginBottom: 30 }}>Customer Signature</Text>
            <Text style={{ borderTop: "1 solid #000000", paddingTop: 5, fontSize: 9 }}>
              Signature & Date
            </Text>
          </View>

          <View style={styles.rightSignature}>
            <View style={{ alignItems: "center" }}>
              {/* Seal */}
              <Image
                style={styles.sealImage}
                src={getSealImage()}
              />
              {/* Signature */}
              <Image
                style={styles.signatureImage}
                src={getRudharmaSignatureImage()}
              />
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>Authorized Signatory</Text>
              <Text style={{ fontSize: 9 }}>{RUDHARMA_COMPANY_DETAILS.name}</Text>
            </View>
          </View>
        </View>

        {/* Declaration */}
        <View style={styles.declaration}>
          <Text style={styles.declarationText}>
            Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Main component with forwardRef
const RudharmaTaxableInvoicePDF = forwardRef<{ downloadPDF: () => Promise<void> }, RudharmaTaxableInvoicePDFProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      const blob = await pdf(<RudharmaTaxableInvoiceDocument {...props} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rudharma-taxable-invoice-${props.invoiceNumber || 'draft'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    },
  }));

  return (
    <ClientOnlyPDFViewer>
      <PDFViewer style={{ width: '100%', height: '600px' }}>
        <RudharmaTaxableInvoiceDocument {...props} />
      </PDFViewer>
    </ClientOnlyPDFViewer>
  );
});

RudharmaTaxableInvoicePDF.displayName = 'RudharmaTaxableInvoicePDF';

export default RudharmaTaxableInvoicePDF;
