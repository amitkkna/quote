"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Column {
  id: string;
  name: string;
  width: string;
  isRequired: boolean;
}

interface ItemRow {
  id: string;
  description: string;
  hsn_sac_code: string;
  quantity: string; // Changed to string to allow text like "5 pcs", "2 units"
  rate: number;
  amount: number;
  [key: string]: any; // Dynamic properties for custom columns
}

interface TaxableInvoiceItemsTableProps {
  initialItems?: ItemRow[];
  onItemsChange: (items: ItemRow[]) => void;
  onCustomColumnsChange?: (customColumns: string[]) => void;
  onCustomColumnsMapChange?: (customColumnsMap: {[key: string]: string}) => void;
}

const TaxableInvoiceItemsTable: React.FC<TaxableInvoiceItemsTableProps> = ({
  initialItems = [],
  onItemsChange,
  onCustomColumnsChange,
  onCustomColumnsMapChange,
}) => {
  // Default required columns for taxable invoice
  const defaultColumns: Column[] = [
    { id: "serial_no", name: "S. No.", width: "8%", isRequired: true },
    { id: "description", name: "Description", width: "30%", isRequired: true },
    { id: "hsn_sac_code", name: "HSN/SAC Code", width: "12%", isRequired: true },
    { id: "quantity", name: "Quantity", width: "10%", isRequired: true },
    { id: "rate", name: "Taxable Value", width: "12%", isRequired: true },
    { id: "amount", name: "Amount", width: "13%", isRequired: true },
  ];

  // State for columns and items
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [items, setItems] = useState<ItemRow[]>(
    initialItems.length > 0
      ? initialItems.map((item, index) => ({
          id: item.id || (index + 1).toString(),
          serial_no: item.serial_no || (index + 1).toString(),
          description: item.description || "",
          hsn_sac_code: item.hsn_sac_code || "",
          quantity: item.quantity || "1",
          rate: item.rate || 0,
          amount: item.amount || 0,
          // Copy any additional properties
          ...Object.keys(item).reduce((acc, key) => {
            if (!['id', 'serial_no', 'description', 'hsn_sac_code', 'quantity', 'rate', 'amount'].includes(key)) {
              acc[key] = item[key];
            }
            return acc;
          }, {} as any)
        }))
      : [
          {
            id: "1",
            serial_no: "1",
            description: "",
            hsn_sac_code: "",
            quantity: "1",
            rate: 0,
            amount: 0,
          },
        ]
  );

  // State for new column
  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);

  // Calculate amount based on quantity and taxable value
  const calculateAmount = (quantity: string | number, rate: number): number => {
    // Extract numeric value from quantity string (e.g., "5 pcs" -> 5, "2.5 kg" -> 2.5)
    const numericQuantity = typeof quantity === 'string'
      ? parseFloat(quantity.match(/^\d*\.?\d+/)?.[0] || '0') || 0
      : quantity;
    // Round to 2 decimal places to handle floating point precision
    return Math.round((numericQuantity * rate) * 100) / 100;
  };

  // Update parent component when items change
  const stableOnItemsChange = useCallback(onItemsChange, []);

  useEffect(() => {
    stableOnItemsChange(items);
  }, [items, stableOnItemsChange]);

  // Notify parent component when custom columns change
  useEffect(() => {
    const customCols = columns.filter(col => !col.isRequired);

    if (onCustomColumnsChange) {
      const customColumns = customCols.map(col => col.name); // Column names for display
      onCustomColumnsChange(customColumns);
    }

    if (onCustomColumnsMapChange) {
      const customColumnsMap = customCols.reduce((acc, col) => {
        acc[col.name] = col.id; // Map display name to data key
        return acc;
      }, {} as {[key: string]: string});
      onCustomColumnsMapChange(customColumnsMap);
    }
  }, [columns, onCustomColumnsChange, onCustomColumnsMapChange]);

  // Add a new item row
  const addItem = () => {
    const newItem: ItemRow = {
      id: Date.now().toString(), // Use timestamp for unique ID
      serial_no: (items.length + 1).toString(),
      description: "",
      hsn_sac_code: "",
      quantity: "1",
      rate: 0,
      amount: 0,
    };

    // Add default values for custom columns
    columns.forEach(column => {
      if (!defaultColumns.some(defCol => defCol.id === column.id)) {
        newItem[column.id] = "";
      }
    });

    // Create a deep copy of existing items to avoid reference sharing
    const updatedItems = [...items.map(item => ({ ...item })), newItem];
    setItems(updatedItems);
  };

  // Remove an item row
  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
  };

  // Update item value
  const updateItem = (id: string, field: string, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        // Create a deep copy of the item to avoid reference sharing
        const updatedItem = { ...item };

        // Capitalize first letter for text fields (except numeric fields and HSN/SAC code)
        if (typeof value === 'string' && value.length > 0 &&
            field !== 'rate' && field !== 'amount' && field !== 'hsn_sac_code' && field !== 'quantity') {
          value = value.charAt(0).toUpperCase() + value.slice(1);
        }

        updatedItem[field] = value;

        // Auto-calculate amount when quantity or taxable value changes
        if (field === 'quantity' || field === 'rate') {
          const quantity = field === 'quantity' ? value : updatedItem.quantity;
          const rate = field === 'rate' ? parseFloat(value) || 0 : updatedItem.rate;
          updatedItem.amount = calculateAmount(quantity, rate);
        }

        return updatedItem;
      }
      // Return a copy of the item to ensure no reference sharing
      return { ...item };
    });

    setItems(updatedItems);
  };

  // Add a new custom column
  const addColumn = () => {
    if (!newColumnName.trim()) return;

    const columnId = newColumnName.toLowerCase().replace(/\s+/g, '_');

    // Check if column already exists
    if (columns.some(col => col.id === columnId)) {
      alert("A column with this name already exists");
      return;
    }

    // Capitalize first letter of column name
    const capitalizedName = newColumnName.charAt(0).toUpperCase() + newColumnName.slice(1);

    const newColumn: Column = {
      id: columnId,
      name: capitalizedName,
      width: "15%",
      isRequired: false,
    };

    // Find the index of the amount column
    const amountIndex = columns.findIndex(col => col.id === "amount");

    // Insert the new column before the amount column
    const updatedColumns = [...columns];
    updatedColumns.splice(amountIndex, 0, newColumn);

    setColumns(updatedColumns);

    // Add this field to all existing items
    const updatedItems = items.map(item => ({
      ...item,
      [columnId]: "",
    }));

    setItems(updatedItems);
    setNewColumnName("");
    setShowAddColumn(false);
  };

  // Remove a custom column
  const removeColumn = (columnId: string) => {
    // Don't allow removing required columns
    const column = columns.find(col => col.id === columnId);
    if (column?.isRequired) return;

    // Remove the column
    setColumns(columns.filter(col => col.id !== columnId));

    // Remove this field from all items
    const updatedItems = items.map(item => {
      const newItem = { ...item };
      delete newItem[columnId];
      return newItem;
    });

    setItems(updatedItems);
  };

  // Handle Ctrl+Enter for multi-line description
  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, itemId: string) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '\n' + value.substring(end);

      updateItem(itemId, 'description', newValue);

      // Set cursor position after the new line
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">Invoice Items</h2>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowAddColumn(!showAddColumn)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 ${
              showAddColumn
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {showAddColumn ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Custom Column
              </>
            )}
          </button>
        </div>
      </div>

      {showAddColumn && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200 shadow-sm">
          <h3 className="text-sm font-medium text-purple-800 mb-3">Add a Custom Column</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name (e.g. HSN Code, Unit, Brand)"
                className="w-full border border-purple-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            </div>
            <button
              type="button"
              onClick={addColumn}
              disabled={!newColumnName.trim()}
              className={`whitespace-nowrap px-4 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 ${
                newColumnName.trim()
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Column
              </span>
            </button>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            Custom columns will appear before the Amount column. Amount is automatically calculated from Quantity × Taxable Value. You can add units to quantity (e.g., "5 pcs", "2 kg").
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 tracking-wider"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.name}</span>
                    {!column.isRequired && (
                      <button
                        type="button"
                        onClick={() => removeColumn(column.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors duration-200"
                        title="Remove column"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider" style={{ width: '80px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column) => (
                  <td key={`${item.id}-${column.id}`} className="px-4 py-3">
                    {column.id === "serial_no" ? (
                      // Serial number (read-only)
                      <div className="text-center font-medium text-gray-600">
                        {index + 1}
                      </div>
                    ) : column.id === "description" ? (
                      // Multi-line description with Ctrl+Enter support
                      <textarea
                        value={item[column.id] || ""}
                        onChange={(e) => updateItem(item.id, column.id, e.target.value)}
                        onKeyDown={(e) => handleDescriptionKeyDown(e, item.id)}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        rows={2}
                        placeholder="Enter description (Ctrl+Enter for new line)"
                      />
                    ) : column.id === "quantity" ? (
                      // Text input for quantity (allows units like "5 pcs", "2 kg")
                      <input
                        type="text"
                        value={item[column.id] || ""}
                        onChange={(e) => updateItem(item.id, column.id, e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center"
                        placeholder="e.g. 5 pcs, 2 kg"
                      />
                    ) : column.id === "rate" ? (
                      // Number input for taxable value (supports up to 2 decimal places)
                      <input
                        type="number"
                        value={item[column.id] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            updateItem(item.id, column.id, 0);
                          } else {
                            // Parse and round to 2 decimal places
                            const numValue = parseFloat(value) || 0;
                            const roundedValue = Math.round(numValue * 100) / 100;
                            updateItem(item.id, column.id, roundedValue);
                          }
                        }}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    ) : column.id === "amount" ? (
                      // Amount (read-only, calculated)
                      <div className="text-right font-medium text-gray-900 bg-gray-50 p-2 rounded border">
                        ₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    ) : (
                      // Text input for other fields (including HSN/SAC code)
                      <input
                        type="text"
                        value={item[column.id] || ""}
                        onChange={(e) => updateItem(item.id, column.id, e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder={column.id === "hsn_sac_code" ? "Enter HSN/SAC code" : `Enter ${column.name.toLowerCase()}`}
                      />
                    )}
                  </td>
                ))}
                <td className="px-4 py-4 text-center" style={{ width: '80px' }}>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className={`flex items-center justify-center text-sm font-medium rounded-full p-2 transition-colors duration-200 ${
                      items.length === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-900 hover:bg-red-50"
                    }`}
                    title="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Item
      </button>
    </div>
  );
};

export default TaxableInvoiceItemsTable;
