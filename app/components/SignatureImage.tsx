"use client";

import React from 'react';
import { View, Image, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  signatureContainer: {
    position: 'absolute',
    bottom: 100, // Position above the footer
    right: 30,
    width: '25%',
  }
});

// Signature component
interface SignatureImageProps {
  signatureImage?: string;
}

const SignatureImage: React.FC<SignatureImageProps> = ({ signatureImage = "/signature.jpg" }) => {
  return (
    <View style={styles.signatureContainer}>
      <Image
        src={signatureImage}
        style={{ width: '100%', height: 'auto' }}
      />
    </View>
  );
};

export default SignatureImage;
