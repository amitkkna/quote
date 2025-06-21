'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';

// Letter Data Interface
interface LetterData {
  date: string;
  letterContent: string;
  fontSize: number;
  pageLayout: 'single' | 'multi';
}

// Component Props
interface GTCLetterPDFProps {
  letterData: LetterData;
}

// Ref Interface
export interface GTCLetterPDFRef {
  downloadPDF: () => Promise<void>;
}

// Date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// GTC Letter Styles - Professional and formal
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
    padding: 30,
    paddingTop: 100,
    paddingBottom: 80,
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
  // Letter header section
  letterHeader: {
    marginBottom: 30,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 20,
  },
  // Recipient section
  recipientSection: {
    marginBottom: 25,
  },
  recipientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  recipientAddress: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.4,
  },
  // Subject section
  subjectSection: {
    marginBottom: 25,
    paddingBottom: 10,
    borderBottom: '1 solid #E5E7EB',
  },
  subjectLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 5,
  },
  subjectText: {
    fontSize: 11,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  // Salutation
  salutation: {
    fontSize: 11,
    color: '#1F2937',
    marginBottom: 20,
  },
  // Letter content
  letterContent: {
    fontSize: 10,
    color: '#1F2937',
    lineHeight: 1.5,
    marginBottom: 40,
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  },
  // Closing section
  closingSection: {
    marginTop: 30,
  },
  closingText: {
    fontSize: 11,
    color: '#1F2937',
    marginBottom: 40,
  },
  // Signature section
  signatureSection: {
    alignItems: 'flex-start',
  },
  signatureImage: {
    width: 80,
    height: 40,
    marginBottom: 5,
  },
  senderName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  senderDesignation: {
    fontSize: 10,
    color: '#6B7280',
  },
  companyName: {
    fontSize: 10,
    color: '#B91C1C',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

// Create Document Component
const GTCLetterPDF = forwardRef<GTCLetterPDFRef, GTCLetterPDFProps>(({ letterData }, ref) => {
  const companyName = "Global Trading Corporation";
  const headerImage = "/gtc-header.jpg";
  const footerImage = "/gtc-footer.jpg";
  const signatureImage = "/gtc-signature.jpg";

  // Dynamic styles based on letterData
  const dynamicStyles = StyleSheet.create({
    contentContainer: {
      padding: letterData.pageLayout === 'single' ? 20 : 30,
      paddingTop: letterData.pageLayout === 'single' ? 80 : 100,
      paddingBottom: letterData.pageLayout === 'single' ? 60 : 80,
      flexGrow: 1,
      position: 'relative',
      zIndex: 2,
      minHeight: 'auto',
    },
    letterContent: {
      fontSize: letterData.fontSize,
      color: '#1F2937',
      lineHeight: letterData.pageLayout === 'single' ? 1.3 : 1.5,
      marginBottom: letterData.pageLayout === 'single' ? 20 : 40,
      textAlign: 'left',
      whiteSpace: 'pre-wrap',
    },
    dateText: {
      fontSize: letterData.fontSize,
      color: '#374151',
      marginBottom: letterData.pageLayout === 'single' ? 15 : 20,
    },
  });

  const LetterDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead Header */}
        <Image src={headerImage} style={styles.headerImage} />

        <View style={dynamicStyles.contentContainer}>
          {/* Date */}
          <View style={styles.letterHeader}>
            <Text style={dynamicStyles.dateText}>Date: {formatDate(letterData.date)}</Text>
          </View>

          {/* Letter Content */}
          <Text style={dynamicStyles.letterContent}>{letterData.letterContent}</Text>

          {/* Signature Section */}
          <View style={styles.closingSection}>
            <View style={styles.signatureSection}>
              <Image src={signatureImage} style={styles.signatureImage} />
              <Text style={styles.senderName}>Amit Khera</Text>
              <Text style={styles.senderDesignation}>Proprietor</Text>
              <Text style={styles.companyName}>{companyName}</Text>
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
      const blob = await pdf(LetterDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GTC-Letter-${letterData.date}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }));

  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      {LetterDocument}
    </PDFViewer>
  );
});

GTCLetterPDF.displayName = 'GTCLetterPDF';

export default GTCLetterPDF;
