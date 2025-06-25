"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer, pdf } from "@react-pdf/renderer";
import { formatDate } from "../utils/dateFormatter";
import { formatCurrency } from "../utils/numberFormatter";
import { numberToWords } from "../utils/numberToWords";
import { getSignatureImage, getSealImage } from "../utils/letterheadImages";
import ClientOnlyPDFViewer from "./ClientOnlyPDFViewer";

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
  customerName: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 3,
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

interface TaxableInvoicePDFProps {
  invoiceNumber: string;
  invoiceDate: string;
  poReference?: string;
  poDate?: string;
  fitToOnePage?: boolean;
  billTo: {
    name: string;
    address: string;
    gst?: string;
  };
  shipTo: {
    name: string;
    address: string;
    gst?: string;
  };
  items: Array<{
    id: string;
    description: string;
    hsn_sac_code: string;
    quantity: number;
    rate: number;
    amount: number;
    [key: string]: any;
  }>;
  customColumns: string[];
  taxRates: {
    igst: number;
    cgst: number;
    sgst: number;
  };
  taxType: 'igst' | 'cgst_sgst';
  subtotal: number;
  taxAmount: number;
  total: number;
  termsAndConditions?: string;
}

// Document component
const TaxableInvoiceDocument = ({
  invoiceNumber,
  invoiceDate,
  poReference,
  poDate,
  fitToOnePage = false,
  billTo,
  shipTo,
  items,
  customColumns,
  taxRates,
  taxType,
  subtotal,
  taxAmount,
  total,
  termsAndConditions,
}: TaxableInvoicePDFProps) => {
  const calculateTaxBreakdown = () => {
    if (taxType === 'igst') {
      return {
        igst: (subtotal * taxRates.igst) / 100,
        cgst: 0,
        sgst: 0,
      };
    } else {
      return {
        igst: 0,
        cgst: (subtotal * taxRates.cgst) / 100,
        sgst: (subtotal * taxRates.sgst) / 100,
      };
    }
  };

  const taxBreakdown = calculateTaxBreakdown();

  // Calculate items per page based on available space
  const getItemsPerPage = () => {
    if (fitToOnePage) return items.length; // Show all items on one page if compact mode

    // Estimate available space for items
    // Page height minus header, invoice details, addresses, tax section, footer
    const estimatedSpaceForItems = 600; // Approximate pixels
    const itemHeight = 25; // Approximate height per item row
    return Math.floor(estimatedSpaceForItems / itemHeight);
  };

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Split items into pages
  const getItemsForPage = (pageNumber: number) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    return items.slice(startIndex, endIndex);
  };

  // Header component (reusable for all pages)
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.companyName}>Global Digital Connect</Text>
      <Text style={styles.companyDetails}>
        320, Regus, Magnato Mall, VIP Chowk, Raipur- 492006
      </Text>
      <Text style={styles.companyDetails}>
        Phone: 9685047519 | Email: prateek@globaldigitalconnect.com
      </Text>
      <Text style={styles.companyDetails}>
        GST No: 22AABCG1234N1Z5
      </Text>
    </View>
  );

  // Table header component (reusable for all pages)
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.serialCol}>S.No.</Text>
      <Text style={styles.descriptionCol}>Description</Text>
      <Text style={styles.hsnCol}>HSN/SAC Code</Text>
      {customColumns.map((col, index) => (
        <Text key={index} style={styles.customCol}>{col}</Text>
      ))}
      <Text style={styles.quantityCol}>Qty</Text>
      <Text style={styles.rateCol}>Taxable Value</Text>
      <Text style={styles.amountCol}>Amount</Text>
    </View>
  );

  // Generate all pages
  const renderAllPages = () => {
    const pages = [];

    // First Page
    pages.push(
      <Page key={1} size="A4" style={fitToOnePage ? styles.pageCompact : styles.page}>
        {/* Header */}
        {renderHeader()}

        {/* Invoice Title */}
        <View style={styles.invoiceTitle}>
          <Text>TAX INVOICE</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceInfo}>
            <Text>Invoice No: {invoiceNumber}</Text>
            <Text>Invoice Date: {formatDate(invoiceDate)}</Text>
            {poReference && <Text>PO Reference: {poReference}</Text>}
            {poDate && <Text>PO Date: {formatDate(poDate)}</Text>}
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
            <Text style={styles.customerName}>{billTo.name}</Text>
            <Text>{billTo.address}</Text>
            {billTo.gst && <Text>GST No: {billTo.gst}</Text>}
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Ship To:</Text>
            <Text style={styles.customerName}>{shipTo.name}</Text>
            <Text>{shipTo.address}</Text>
            {shipTo.gst && <Text>GST No: {shipTo.gst}</Text>}
          </View>
        </View>

        {/* Items Table - First Page */}
        <View style={styles.table}>
          {renderTableHeader()}

          {/* Table Rows for First Page */}
          {getItemsForPage(1).map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.serialCol}>{index + 1}</Text>
              <Text style={styles.descriptionCol}>{item.description}</Text>
              <Text style={styles.hsnCol}>{item.hsn_sac_code || ""}</Text>
              {customColumns.map((col, colIndex) => (
                <Text key={colIndex} style={styles.customCol}>
                  {item[col] || ""}
                </Text>
              ))}
              <Text style={styles.quantityCol}>{item.quantity}</Text>
              <Text style={styles.rateCol}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.amountCol}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Show totals only on the last page or if single page */}
        {(totalPages === 1 || fitToOnePage) && (
          <>
            {/* Tax Calculation */}
            <View style={styles.taxSection}>
              <View style={styles.taxRow}>
                <Text>Subtotal:</Text>
                <Text>{formatCurrency(subtotal)}</Text>
              </View>

              {taxType === 'igst' ? (
                <View style={styles.taxRow}>
                  <Text>IGST ({taxRates.igst}%):</Text>
                  <Text>{formatCurrency(taxBreakdown.igst)}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.taxRow}>
                    <Text>CGST ({taxRates.cgst}%):</Text>
                    <Text>{formatCurrency(taxBreakdown.cgst)}</Text>
                  </View>
                  <View style={styles.taxRow}>
                    <Text>SGST ({taxRates.sgst}%):</Text>
                    <Text>{formatCurrency(taxBreakdown.sgst)}</Text>
                  </View>
                </>
              )}

              <View style={styles.totalRow}>
                <Text>Total Amount:</Text>
                <Text>{formatCurrency(total)}</Text>
              </View>
            </View>

            {/* Amount in Words */}
            <View style={styles.amountInWords}>
              <Text style={{ fontWeight: "bold", marginBottom: 3 }}>Total Amount in Words:</Text>
              <Text>{numberToWords(total)} Only</Text>
            </View>

            {/* Terms and Conditions */}
            {termsAndConditions && (
              <View style={styles.termsSection}>
                <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Terms and Conditions:</Text>
                <Text>{termsAndConditions}</Text>
              </View>
            )}

            {/* Bank Details */}
            <View style={styles.bankDetails}>
              <Text style={styles.bankTitle}>Company's Bank Details</Text>
              <Text style={styles.bankInfo}>A/c Holder's Name: Global Digital Connect</Text>
              <Text style={styles.bankInfo}>Bank Name: HDFC Bank Limited</Text>
              <Text style={styles.bankInfo}>A/c No.: 50200072078516</Text>
              <Text style={styles.bankInfo}>Branch & IFS Code: Telibanda & HDFC0005083</Text>
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
                    src={getSignatureImage()}
                  />
                  <Text style={{ fontSize: 10, fontWeight: "bold" }}>Authorized Signatory</Text>
                  <Text style={{ fontSize: 9 }}>Global Digital Connect</Text>
                </View>
              </View>
            </View>

            {/* Declaration */}
            <View style={styles.declaration}>
              <Text style={styles.declarationText}>
                Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </Text>
            </View>
          </>
        )}

      </Page>
    );

    // Additional Pages for remaining items
    if (totalPages > 1 && !fitToOnePage) {
      for (let pageIndex = 0; pageIndex < totalPages - 1; pageIndex++) {
        const pageNumber = pageIndex + 2;
        const isLastPage = pageNumber === totalPages;

        pages.push(
          <Page key={pageNumber} size="A4" style={styles.page}>
            {/* Header on each page */}
            {renderHeader()}

            {/* Invoice Title */}
            <View style={styles.invoiceTitle}>
              <Text>TAX INVOICE (Continued - Page {pageNumber})</Text>
            </View>

            {/* Items Table for this page */}
            <View style={styles.table}>
              {renderTableHeader()}

              {/* Table Rows for this page */}
              {getItemsForPage(pageNumber).map((item, index) => {
                const globalIndex = (pageNumber - 1) * itemsPerPage + index;
                return (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={styles.serialCol}>{globalIndex + 1}</Text>
                    <Text style={styles.descriptionCol}>{item.description}</Text>
                    <Text style={styles.hsnCol}>{item.hsn_sac_code || ""}</Text>
                    {customColumns.map((col, colIndex) => (
                      <Text key={colIndex} style={styles.customCol}>
                        {item[col] || ""}
                      </Text>
                    ))}
                    <Text style={styles.quantityCol}>{item.quantity}</Text>
                    <Text style={styles.rateCol}>{formatCurrency(item.rate)}</Text>
                    <Text style={styles.amountCol}>{formatCurrency(item.amount)}</Text>
                  </View>
                );
              })}
            </View>

            {/* Show totals and footer only on the last page */}
            {isLastPage && (
              <>
                {/* Tax Calculation */}
                <View style={styles.taxSection}>
                  <View style={styles.taxRow}>
                    <Text>Subtotal:</Text>
                    <Text>{formatCurrency(subtotal)}</Text>
                  </View>

                  {taxType === 'igst' ? (
                    <View style={styles.taxRow}>
                      <Text>IGST ({taxRates.igst}%):</Text>
                      <Text>{formatCurrency(taxBreakdown.igst)}</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.taxRow}>
                        <Text>CGST ({taxRates.cgst}%):</Text>
                        <Text>{formatCurrency(taxBreakdown.cgst)}</Text>
                      </View>
                      <View style={styles.taxRow}>
                        <Text>SGST ({taxRates.sgst}%):</Text>
                        <Text>{formatCurrency(taxBreakdown.sgst)}</Text>
                      </View>
                    </>
                  )}

                  <View style={styles.totalRow}>
                    <Text>Total Amount:</Text>
                    <Text>{formatCurrency(total)}</Text>
                  </View>
                </View>

                {/* Amount in Words */}
                <View style={styles.amountInWords}>
                  <Text style={{ fontWeight: "bold", marginBottom: 3 }}>Total Amount in Words:</Text>
                  <Text>{numberToWords(total)} Only</Text>
                </View>

                {/* Terms and Conditions */}
                {termsAndConditions && (
                  <View style={styles.termsSection}>
                    <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Terms and Conditions:</Text>
                    <Text>{termsAndConditions}</Text>
                  </View>
                )}

                {/* Bank Details */}
                <View style={styles.bankDetails}>
                  <Text style={styles.bankTitle}>Company's Bank Details</Text>
                  <Text style={styles.bankInfo}>A/c Holder's Name: Global Digital Connect</Text>
                  <Text style={styles.bankInfo}>Bank Name: HDFC Bank Limited</Text>
                  <Text style={styles.bankInfo}>A/c No.: 50200072078516</Text>
                  <Text style={styles.bankInfo}>Branch & IFS Code: Telibanda & HDFC0005083</Text>
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
                        src={getSignatureImage()}
                      />
                      <Text style={{ fontSize: 10, fontWeight: "bold" }}>Authorized Signatory</Text>
                      <Text style={{ fontSize: 9 }}>Global Digital Connect</Text>
                    </View>
                  </View>
                </View>

                {/* Declaration */}
                <View style={styles.declaration}>
                  <Text style={styles.declarationText}>
                    Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                  </Text>
                </View>
              </>
            )}
          </Page>
        );
      }
    }

    return pages;
  };

  return (
    <Document>
      {renderAllPages()}
    </Document>
  );
};

// Main component with forwardRef
const TaxableInvoicePDF = forwardRef<{ downloadPDF: () => Promise<void> }, TaxableInvoicePDFProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      const blob = await pdf(<TaxableInvoiceDocument {...props} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `taxable-invoice-${props.invoiceNumber || 'draft'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    },
  }));

  return (
    <ClientOnlyPDFViewer>
      <PDFViewer style={{ width: '100%', height: '600px' }}>
        <TaxableInvoiceDocument {...props} />
      </PDFViewer>
    </ClientOnlyPDFViewer>
  );
});

TaxableInvoicePDF.displayName = 'TaxableInvoicePDF';

export default TaxableInvoicePDF;
