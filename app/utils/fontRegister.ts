"use client";

import { Font } from '@react-pdf/renderer';

// Register the standard fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
    { src: 'Helvetica-Oblique', fontStyle: 'italic' },
    { src: 'Helvetica-BoldOblique', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// Register Noto Sans for Hindi support
Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v30/o-0IIpQlx3QUlC5A4PNb4g.ttf',
});

// Register Noto Sans Devanagari for Hindi support
Font.register({
  family: 'NotoSansDevanagari',
  src: 'https://fonts.gstatic.com/s/notosansdevanagari/v25/TuGOUUNzXI-MHsbX18krSF8-TJvAmwlcGGQCNg.ttf',
});
