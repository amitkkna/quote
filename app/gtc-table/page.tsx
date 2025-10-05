'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for PDF component to avoid SSR issues
const GTCTablePDF = dynamic(() => import('../components/GTCTablePDF'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading PDF viewer...</p>
      </div>
    </div>
  )
});

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

  const [rawData, setRawData] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const pdfRef = useRef<any>(null);

  const parseTableData = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return;

    // First line is usually the title
    const title = lines[0].trim();

    // Find header line (usually contains column names)
    let headerIndex = 1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].includes('S.No') || lines[i].includes('Type') || lines[i].includes('Brand')) {
        headerIndex = i;
        break;
      }
    }

    // Parse headers
    const headerLine = lines[headerIndex];
    const headers = headerLine.split(/\s{2,}|\t/).filter(h => h.trim()).map(h => h.trim());

    // Parse data rows
    const rows: string[][] = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Split by multiple spaces or tabs
        const cells = line.split(/\s{2,}|\t/).filter(c => c.trim()).map(c => c.trim());
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
    }

    setTableData(prev => ({
      ...prev,
      title,
      headers,
      rows
    }));
  };

  const handleRawDataChange = (value: string) => {
    setRawData(value);
    if (value.trim()) {
      parseTableData(value);
    }
  };

  const compressImage = (file: File, quality: number = 0.95): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions to maintain aspect ratio
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: ImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const compressedImage = await compressImage(file, (tableData.imageQuality || 95) / 100);
          newImages.push({
            id: Date.now().toString() + i,
            data: compressedImage,
            width: tableData.imageWidth || 90,
            height: tableData.imageHeight || 70,
            caption: file.name.replace(/\.[^/.]+$/, "")
          });
        } catch (error) {
          console.error('Error compressing image:', error);
        }
      }

      setTableData(prev => ({
        ...prev,
        contentType: 'image',
        images: [...prev.images, ...newImages],
        imageData: newImages[0]?.data
      }));
    }
  };

  const handleImagePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              const newImage: ImageItem = {
                id: Date.now().toString(),
                data: result,
                width: tableData.imageWidth || 90,
                height: tableData.imageHeight || 70,
                caption: `Pasted Image ${tableData.images.length + 1}`
              };

              setTableData(prev => ({
                ...prev,
                contentType: 'image',
                images: [...prev.images, newImage],
                imageData: result
              }));
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      alert('No image found in clipboard. Please copy an image first.');
    } catch (err) {
      alert('Unable to access clipboard. Please use the file upload option instead.');
    }
  };

  const removeImage = (imageId: string) => {
    setTableData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const updateImageCaption = (imageId: string, caption: string) => {
    setTableData(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === imageId ? { ...img, caption } : img
      )
    }));
  };

  const updateImageSize = (imageId: string, width: number, height: number) => {
    setTableData(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === imageId ? { ...img, width, height } : img
      )
    }));
  };

  const handlePreview = () => {
    if (tableData.contentType === 'table' && tableData.rows.length === 0) {
      alert('Please paste your table data first');
      return;
    }
    if (tableData.contentType === 'image' && tableData.images.length === 0) {
      alert('Please upload or paste an image first');
      return;
    }
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
          <p className="text-gray-600">Create professional table documents, image documents, or mixed content with Global Trading Corporation letterhead. Support for multiple images, quality control, and table data parsing.</p>
        </div>

        {!showPreview ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Content Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="table"
                      checked={tableData.contentType === 'table'}
                      onChange={(e) => setTableData(prev => ({ ...prev, contentType: e.target.value as 'table' | 'image' | 'mixed' }))}
                      className="mr-2"
                    />
                    Table Data
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="image"
                      checked={tableData.contentType === 'image'}
                      onChange={(e) => setTableData(prev => ({ ...prev, contentType: e.target.value as 'table' | 'image' | 'mixed' }))}
                      className="mr-2"
                    />
                    Images Only
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="mixed"
                      checked={tableData.contentType === 'mixed'}
                      onChange={(e) => setTableData(prev => ({ ...prev, contentType: e.target.value as 'table' | 'image' | 'mixed' }))}
                      className="mr-2"
                    />
                    Table + Images
                  </label>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <select
                    value={tableData.fontSize}
                    onChange={(e) => setTableData(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value={7}>7pt (Very Small)</option>
                    <option value={8}>8pt (Small)</option>
                    <option value={9}>9pt (Normal)</option>
                    <option value={10}>10pt (Medium)</option>
                    <option value={11}>11pt (Large)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Style
                  </label>
                  <div className="flex items-center space-x-4 mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tableData.showBorders}
                        onChange={(e) => setTableData(prev => ({ ...prev, showBorders: e.target.checked }))}
                        className="mr-2"
                      />
                      Show Borders
                    </label>
                  </div>
                </div>
              </div>

              {/* Table Input Section */}
              {(tableData.contentType === 'table' || tableData.contentType === 'mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste Your Table Data {tableData.contentType === 'mixed' ? '(Optional)' : '*'}
                  </label>
                  <textarea
                    value={rawData}
                    onChange={(e) => handleRawDataChange(e.target.value)}
                    placeholder="Paste your table data here (copy directly from Excel, Word, or any source)..."
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Copy and paste your table data directly from Excel, Word, or any source. The system will automatically detect columns and format them properly.
                  </p>
                </div>
              )}

              {/* Image Upload Section */}
              {(tableData.contentType === 'image' || tableData.contentType === 'mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload or Paste Images {tableData.contentType === 'mixed' ? '(Optional)' : '*'}
                  </label>
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Select multiple images by holding Ctrl (Windows) or Cmd (Mac)
                      </p>
                    </div>

                    {/* Paste from Clipboard */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleImagePaste}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Paste Image from Clipboard
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Copy an image (Ctrl+C) and click this button to paste it directly
                      </p>
                    </div>

                    {/* Image Quality and Size Controls */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Width (%)
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="100"
                          value={tableData.imageWidth}
                          onChange={(e) => setTableData(prev => ({ ...prev, imageWidth: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (%)
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="100"
                          value={tableData.imageHeight}
                          onChange={(e) => setTableData(prev => ({ ...prev, imageHeight: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quality (%)
                        </label>
                        <select
                          value={tableData.imageQuality}
                          onChange={(e) => setTableData(prev => ({ ...prev, imageQuality: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value={70}>70% (Small file)</option>
                          <option value={80}>80% (Good)</option>
                          <option value={90}>90% (High)</option>
                          <option value={95}>95% (Very High)</option>
                          <option value={100}>100% (Maximum)</option>
                        </select>
                      </div>
                    </div>

                    {/* Multiple Images Management */}
                    {tableData.images.length > 0 && (
                      <div className="border border-gray-200 rounded-md p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Uploaded Images ({tableData.images.length})
                        </h4>
                        <div className="space-y-4">
                          {tableData.images.map((image, index) => (
                            <div key={image.id} className="border border-gray-100 rounded-md p-3">
                              <div className="flex items-start space-x-3">
                                {/* Image Preview */}
                                <img
                                  src={image.data}
                                  alt={image.caption || `Image ${index + 1}`}
                                  className="w-20 h-20 object-cover border border-gray-300 rounded"
                                />

                                {/* Image Controls */}
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Caption
                                    </label>
                                    <input
                                      type="text"
                                      value={image.caption || ''}
                                      onChange={(e) => updateImageCaption(image.id, e.target.value)}
                                      placeholder={`Image ${index + 1}`}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Width (%)
                                      </label>
                                      <input
                                        type="number"
                                        min="20"
                                        max="100"
                                        value={image.width}
                                        onChange={(e) => updateImageSize(image.id, parseInt(e.target.value), image.height)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Height (%)
                                      </label>
                                      <input
                                        type="number"
                                        min="20"
                                        max="100"
                                        value={image.height}
                                        onChange={(e) => updateImageSize(image.id, image.width, parseInt(e.target.value))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  title="Remove image"
                                >
                                  ✕
                                </button>
                              </div>

                              <p className="text-xs text-gray-500 mt-2">
                                Size: {Math.round(image.data.length * 0.75 / 1024)} KB
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Table Preview */}
              {(tableData.contentType === 'table' || tableData.contentType === 'mixed') && tableData.rows.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Parsed Table Preview</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {tableData.headers.map((header, index) => (
                            <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.rows.slice(0, 10).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {tableData.rows.length > 10 && (
                      <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
                        ... and {tableData.rows.length - 10} more rows
                      </div>
                    )}
                  </div>
                </div>
              )}

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
