"use client";

// Utility functions for handling images in the PDF components

// Define the paths to the letterhead images
export const LETTERHEAD_HEADER = '/letterhead-header.jpg';
export const LETTERHEAD_FOOTER = '/letterhead-footer.jpg';

// Function to get the full path to an image
export const getImagePath = (relativePath: string): string => {
  // In the browser, we need to use the full URL
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${relativePath}`;
  }
  
  // For server-side rendering, just return the relative path
  return relativePath;
};
