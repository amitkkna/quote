"use client";

import React, { useState } from "react";
import TaxableInvoiceItemsTable from "../components/TaxableInvoiceItemsTable";

interface InvoiceItem {
  id: string;
  description: string;
  hsn_sac_code: string;
  quantity: string;
  rate: number;
  amount: number;
  [key: string]: any;
}

export default function TestCustomColumns() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Test Item", hsn_sac_code: "1234", quantity: "1", rate: 100, amount: 100 }
  ]);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [customColumnsMap, setCustomColumnsMap] = useState<{[key: string]: string}>({});

  const handleItemsChange = (newItems: InvoiceItem[]) => {
    console.log("Items changed:", newItems);
    setItems(newItems);
  };

  const handleCustomColumnsChange = (newCustomColumns: string[]) => {
    console.log("Custom columns changed:", newCustomColumns);
    setCustomColumns(newCustomColumns);
  };

  const handleCustomColumnsMapChange = (newCustomColumnsMap: {[key: string]: string}) => {
    console.log("Custom columns map changed:", newCustomColumnsMap);
    setCustomColumnsMap(newCustomColumnsMap);
  };

  const testSaveData = () => {
    console.log("=== TEST SAVE DATA ===");
    console.log("Items:", items);
    console.log("Custom Columns:", customColumns);
    console.log("Custom Columns Map:", customColumnsMap);
    
    // Test data extraction for database
    const itemsData = items.map((item) => {
      const baseData = {
        description: item.description,
        hsn_sac_code: item.hsn_sac_code,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      };

      // Add custom column values
      const customData = customColumns.reduce((acc, col) => {
        const columnKey = customColumnsMap[col] || col;
        if (item[columnKey] !== undefined) {
          acc[columnKey] = item[columnKey];
        }
        return acc;
      }, {} as Record<string, any>);

      return { ...baseData, ...customData };
    });

    console.log("Processed items for database:", itemsData);
    alert("Check console for test data output");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Custom Columns</h1>
          <p className="text-gray-600 mb-6">
            This page tests the custom columns functionality. Add custom columns and items to see how data flows.
          </p>

          {/* Debug Info */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div className="text-sm space-y-1">
              <div><strong>Items Count:</strong> {items.length}</div>
              <div><strong>Custom Columns:</strong> {JSON.stringify(customColumns)}</div>
              <div><strong>Custom Columns Map:</strong> {JSON.stringify(customColumnsMap)}</div>
            </div>
          </div>

          <button
            onClick={testSaveData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-6"
          >
            Test Save Data (Check Console)
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <TaxableInvoiceItemsTable
            initialItems={items}
            onItemsChange={handleItemsChange}
            onCustomColumnsChange={handleCustomColumnsChange}
            onCustomColumnsMapChange={handleCustomColumnsMapChange}
          />
        </div>

        {/* Raw Data Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Raw Data (for debugging)</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Items:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Custom Columns:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs">
                {JSON.stringify(customColumns, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Custom Columns Map:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs">
                {JSON.stringify(customColumnsMap, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
