// Letterhead image paths
export const HEADER_IMAGE = 'https://raw.githubusercontent.com/user/repo/main/letterhead-header.jpg';
export const FOOTER_IMAGE = 'https://raw.githubusercontent.com/user/repo/main/letterhead-footer.jpg';

// Fallback images (use direct paths)
export const HEADER_IMAGE_FALLBACK = '/letterhead-header.jpg';
export const FOOTER_IMAGE_FALLBACK = '/letterhead-footer.jpg';

// Signature and seal images
export const SIGNATURE_IMAGE = '/signature.jpg';
export const SEAL_IMAGE = '/seal.jpg';

// Function to get signature image
export const getSignatureImage = (): string => {
  return SIGNATURE_IMAGE;
};

// Function to get seal image
export const getSealImage = (): string => {
  return SEAL_IMAGE;
};
