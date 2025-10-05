'use client';

import { useState, useRef } from 'react';
import GTCTablePDF, { GTCTablePDFRef } from '../components/GTCTablePDF';

interface ImageItem {
  id: string;
  data: string;
  width: number;
  height: number;
  caption?: string;
}

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

export default function GTCTablePage() {
  const [tableData, setTableData] = useState<TableData>({
    title: 'GTC Table Document',
    headers: ['S.No.', 'Description', 'Amount'],
    rows: [],
    fontSize: 9,
    showBorders: true,
    contentType: 'table',
    imageWidth: 90,
    imageHeight: 70,
    imageQuality: 95,
    images: []
  });

  const [showPreview, setShowPreview] = useState(false);
  const pdfRef = useRef<GTCTablePDFRef>(null);

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDownloadPDF = async () => {
    if (pdfRef.current) {
      await pdfRef.current.downloadPDF();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GTC Table Document</h1>
          <p className="text-gray-600">Create professional documents with Global Trading Corporation letterhead</p>
        </div>

        {!showPreview ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={tableData.title}
                  onChange={(e) => setTableData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePreview}
                  className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Preview PDF
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Document Preview</h2>
              <div className="flex gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>

            <GTCTablePDF ref={pdfRef} tableData={tableData} />
          </div>
        )}
      </div>
    </div>
  );
}
