'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';

// Image Item Interface
interface ImageItem {
  id: string;
  data: string;
  width: number;
  height: number;
  caption?: string;
}

// Table Data Interface
interface TableData {
  title: string;
  headers: string[];
  rows: string[][];
  fontSize: number;
  showBorders: boolean;
  contentType: 'table' | 'image' | 'mixed';
  imageData?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageQuality?: number;
  images: ImageItem[];
}

// Component Props
interface GTCTablePDFProps {
  tableData: TableData;
}

// Ref Interface
export interface GTCTablePDFRef {
  downloadPDF: () => Promise<void>;
}

// Date formatting function
const formatDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// GTC Table Styles - Professional table formatting
const createStyles = (tableData: TableData) => StyleSheet.create({
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
    padding: tableData.contentType === 'image' ? 20 : 25,
    paddingTop: tableData.contentType === 'image' ? 80 : 90,
    paddingBottom: tableData.contentType === 'image' ? 60 : 70,
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
  // Document header
  documentHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: tableData.fontSize + 2,
    fontWeight: 'bold',
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: tableData.fontSize,
    color: '#374151',
    textAlign: 'right',
    marginBottom: 15,
  },
  // Table styles
  table: {
    marginBottom: 20,
    border: tableData.showBorders ? '1 solid #374151' : 'none',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#B91C1C',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: tableData.fontSize,
    minHeight: 25,
    alignItems: 'center',
    borderBottom: tableData.showBorders ? '1 solid #374151' : 'none',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 20,
    alignItems: 'center',
    borderBottom: tableData.showBorders ? '0.5 solid #E5E7EB' : 'none',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    minHeight: 20,
    alignItems: 'center',
    borderBottom: tableData.showBorders ? '0.5 solid #E5E7EB' : 'none',
  },
  // Dynamic cell styles based on number of columns
  tableCell: {
    padding: 4,
    fontSize: tableData.fontSize,
    textAlign: 'left',
    borderRight: tableData.showBorders ? '0.5 solid #E5E7EB' : 'none',
  },
  tableCellHeader: {
    padding: 4,
    fontSize: tableData.fontSize,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    borderRight: tableData.showBorders ? '0.5 solid #FFFFFF' : 'none',
  },
  // Signature section
  signatureSection: {
    marginTop: 30,
    alignItems: 'flex-end',
  },
  signatureImage: {
    width: 70,
    height: 35,
    marginBottom: 5,
  },
  senderName: {
    fontSize: tableData.fontSize,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  senderDesignation: {
    fontSize: tableData.fontSize - 1,
    color: '#6B7280',
  },
  companyName: {
    fontSize: tableData.fontSize - 1,
    color: '#B91C1C',
    fontWeight: 'bold',
    marginTop: 3,
  },
});

// Create Document Component
const GTCTablePDF = forwardRef<GTCTablePDFRef, GTCTablePDFProps>(({ tableData }, ref) => {
  const companyName = "Global Trading Corporation";
  const headerImage = "/gtc-header.jpg";
  const footerImage = "/gtc-footer.jpg";
  const signatureImage = "/gtc-signature.jpg";

  const styles = createStyles(tableData);

  // Calculate column widths based on content
  const calculateColumnWidths = () => {
    const numColumns = tableData.headers.length;
    if (numColumns <= 3) return Array(numColumns).fill(`${100/numColumns}%`);
    if (numColumns <= 5) return Array(numColumns).fill(`${100/numColumns}%`);
    if (numColumns <= 8) return Array(numColumns).fill(`${100/numColumns}%`);
    return Array(numColumns).fill(`${100/numColumns}%`);
  };

  const columnWidths = calculateColumnWidths();

  const TableDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead Header */}
        <Image src={headerImage} style={styles.headerImage} />

        <View style={styles.contentContainer}>
          {/* Document Header */}
          <View style={styles.documentHeader}>
            <Text style={styles.documentTitle}>{tableData.title}</Text>
            <Text style={styles.dateText}>Date: {formatDate()}</Text>
          </View>

          {/* Content Area - Table, Images, or Mixed */}

          {/* Table Content */}
          {(tableData.contentType === 'table' || tableData.contentType === 'mixed') && tableData.rows.length > 0 && (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                {tableData.headers.map((header, index) => (
                  <Text
                    key={index}
                    style={{
                      ...styles.tableCellHeader,
                      width: columnWidths[index],
                    }}
                  >
                    {header}
                  </Text>
                ))}
              </View>

              {/* Table Rows */}
              {tableData.rows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={rowIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  {row.map((cell, cellIndex) => (
                    <Text
                      key={cellIndex}
                      style={{
                        ...styles.tableCell,
                        width: columnWidths[cellIndex] || columnWidths[0],
                        textAlign: cellIndex === 0 ? 'center' :
                                 (cellIndex >= tableData.headers.length - 2) ? 'right' : 'left',
                      }}
                    >
                      {cell || ''}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Multiple Images Content */}
          {(tableData.contentType === 'image' || tableData.contentType === 'mixed') && tableData.images.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              {tableData.images.map((image, index) => (
                <View key={image.id} style={{ marginBottom: 15, alignItems: 'center' }}>
                  {/* Image Caption */}
                  {image.caption && (
                    <Text style={{
                      fontSize: tableData.fontSize,
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: 5,
                      textAlign: 'center'
                    }}>
                      {image.caption}
                    </Text>
                  )}

                  {/* Image */}
                  <Image
                    src={image.data}
                    style={{
                      width: `${image.width}%`,
                      height: 'auto',
                      maxHeight: 400,
                      objectFit: 'contain',
                      marginBottom: 10
                    }}
                    cache={false}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Backward compatibility - Single image */}
          {tableData.contentType === 'image' && tableData.images.length === 0 && tableData.imageData && (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image
                src={tableData.imageData}
                style={{
                  width: `${tableData.imageWidth || 80}%`,
                  height: 'auto',
                  maxHeight: 500,
                  objectFit: 'contain',
                }}
                cache={false}
              />
            </View>
          )}

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <Image src={signatureImage} style={styles.signatureImage} />
            <Text style={styles.senderName}>Amit Khera</Text>
            <Text style={styles.senderDesignation}>Proprietor</Text>
            <Text style={styles.companyName}>{companyName}</Text>
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
      const blob = await pdf(TableDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GTC-Table-${tableData.title.replace(/[^a-zA-Z0-9]/g, '-')}-${formatDate()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }));

  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      {TableDocument}
    </PDFViewer>
  );
});

GTCTablePDF.displayName = 'GTCTablePDF';

export default GTCTablePDF;
