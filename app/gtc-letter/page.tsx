'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for PDF component to avoid SSR issues
const GTCLetterPDF = dynamic(() => import('../components/GTCLetterPDF'), {
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

interface LetterData {
  date: string;
  letterContent: string;
  fontSize: number;
  pageLayout: 'single' | 'multi';
}

export default function GTCLetterPage() {
  const [letterData, setLetterData] = useState<LetterData>({
    date: new Date().toISOString().split('T')[0],
    fontSize: 10,
    pageLayout: 'single',
    letterContent: `Declaration cum Undertaking in favour of the Company

I, the undersigned Global Trading Corporation, formally declare that:
✔	I will treat confidentially any information and documents, in any form (i.e. paper or electronic), disclosed to me in writing or orally in relation to the proposed assignment and/or the performance of the contract with the Customer and will only use the document for the purpose it has been issued for to me by the company Matrix Comsec pvt. Ltd.

✔	I am fully aware of my obligations, inter alia in terms of maintaining confidentiality of the document, genuine use of the document including but not limited to the forging of the document or to use the same toward any illegal activity.

✔	Documents issued by the Company shall include the Authorisation Letters, approvals, declarations, bonds, quotations, specifications related to a particular project.

✔	I will undertake to observe strict confidentiality and genuity in relation to any issued document by the Company as follows:

▪	I will not use or disclose, directly or indirectly, confidential information or documents for any purpose other than fulfilling my obligations under the contract without prior written approval from the Company;

▪	I will not make any adverse use of information and the document and the authorisation given to me by the Company.

▪	I shall continue to be bound by these undertakings even after completion of my work unless revoked by the Company.

▪	If material/documents/reports/deliverable are made available to me either on paper or electronically, I agree to be held personally responsible for maintaining the confidentiality of the documents or electronic files sent and for returning, erasing or destroying all confidential documents or files on completing my work as instructed.

ü 	Company is at liberty to initiate any legal actions against me if found that the misuse of any information or document has resulted from my end.

ü Any dispute arising out of the said undertaking shall be subject to the jurisdiction of the courts at Vadodara.

Declared on this ____ date at _____________

________
Signature`
  });

  const [showPreview, setShowPreview] = useState(false);
  const pdfRef = useRef<any>(null);

  const handleInputChange = (field: keyof LetterData, value: string) => {
    setLetterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownloadPDF = async () => {
    if (pdfRef.current) {
      await pdfRef.current.downloadPDF();
    }
  };

  const handlePreview = () => {
    if (!letterData.letterContent.trim()) {
      alert('Please enter the letter content');
      return;
    }
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GTC Letter Generator</h1>
          <p className="text-gray-600">Create and print letters with Global Trading Corporation letterhead. Pre-filled with declaration text - just modify as needed and print.</p>
        </div>

        {!showPreview ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={letterData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <select
                    value={letterData.fontSize}
                    onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value={8}>8pt (Very Small)</option>
                    <option value={9}>9pt (Small)</option>
                    <option value={10}>10pt (Normal)</option>
                    <option value={11}>11pt (Medium)</option>
                    <option value={12}>12pt (Large)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Layout
                  </label>
                  <select
                    value={letterData.pageLayout}
                    onChange={(e) => handleInputChange('pageLayout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="single">Fit in Single Page</option>
                    <option value="multi">Allow Multiple Pages</option>
                  </select>
                </div>
              </div>

              {/* Letter Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Letter Content *
                </label>
                <textarea
                  value={letterData.letterContent}
                  onChange={(e) => handleInputChange('letterContent', e.target.value)}
                  placeholder="Type or paste your letter content here..."
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can type directly or paste content from another document. The declaration text is pre-filled for your convenience.
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Page Fitting Tips:</strong> If content doesn't fit on one page, try reducing font size or switch to "Allow Multiple Pages" mode.
                    The "Fit in Single Page" mode optimizes spacing for single-page documents.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handlePreview}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Preview & Print Letter
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Letter Preview</h2>
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
                  Edit Letter
                </button>
              </div>
            </div>

            <GTCLetterPDF ref={pdfRef} letterData={letterData} />
          </div>
        )}
      </div>
    </div>
  );
}
