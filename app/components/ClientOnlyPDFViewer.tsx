"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface ClientOnlyPDFViewerProps {
  children: React.ReactNode;
}

const ClientOnlyPDFViewer: React.FC<ClientOnlyPDFViewerProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PDF viewer...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ClientOnlyPDFViewer;
