"use client";

import { useState, useEffect } from "react";
import { formatIndianNumber } from "../utils/numberFormatter";

// Define types for our table
interface Column {
  id: string;
  name: string;
  width: string;
  isRequired: boolean;
  type?: 'text' | 'number' | 'percentage' | 'currency' | 'readonly';
}

interface ItemRow {
  id: string;
  baseAmount?: number;
  percentageIncrease?: number;
  finalAmount?: number;
  [key: string]: any; // Dynamic properties for custom columns
}

interface EnhancedItemsTableProps {
  initialColumns?: Column[];
  initialItems?: ItemRow[];
  onItemsChange: (items: ItemRow[]) => void;
  enablePercentageCalculation?: boolean;
  globalPercentageIncrease?: number;
  onGlobalPercentageApply?: (percentage: number) => void;
}

const EnhancedItemsTable = ({
  initialColumns = [],
  initialItems = [],
  onItemsChange,
  enablePercentageCalculation = false,
  globalPercentageIncrease = 0,
  onGlobalPercentageApply,
}: EnhancedItemsTableProps) => {
  // Default required columns
  const getDefaultColumns = (): Column[] => {
    if (enablePercentageCalculation) {
      return [
        { id: "serial_no", name: "S. No.", width: "8%", isRequired: true, type: 'readonly' },
        { id: "description", name: "Description", width: "30%", isRequired: true, type: 'text' },
        { id: "baseAmount", name: "Base Amount", width: "15%", isRequired: true, type: 'currency' },
        { id: "percentageIncrease", name: "Increase (%)", width: "12%", isRequired: true, type: 'percentage' },
        { id: "finalAmount", name: "Final Amount", width: "15%", isRequired: true, type: 'readonly' },
      ];
    } else {
      return [
        { id: "serial_no", name: "S. No.", width: "8%", isRequired: true, type: 'readonly' },
        { id: "description", name: "Description", width: "40%", isRequired: true, type: 'text' },
        { id: "amount", name: "Amount", width: "20%", isRequired: true, type: 'currency' },
      ];
    }
  };

  // State for columns and items
  const [columns, setColumns] = useState<Column[]>(() => {
    const defaultCols = getDefaultColumns();
    return [
      ...defaultCols,
      ...initialColumns.filter(col => !defaultCols.some(defCol => defCol.id === col.id)),
    ];
  });

  const [items, setItems] = useState<ItemRow[]>(
    initialItems.length > 0
      ? initialItems.map((item, index) => ({
          ...item,
          serial_no: item.serial_no || (index + 1).toString()
        }))
      : [{ 
          id: "1", 
          serial_no: "1", 
          description: "", 
          ...(enablePercentageCalculation 
            ? { baseAmount: 0, percentageIncrease: 0, finalAmount: 0 }
            : { amount: 0 }
          )
        }]
  );

  // State for new column
  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);

  // Calculate final amount based on base amount and percentage increase
  const calculateFinalAmount = (baseAmount: number, percentageIncrease: number): number => {
    return baseAmount + (baseAmount * percentageIncrease / 100);
  };

  // Add a new item row
  const addItem = () => {
    const newItem: ItemRow = {
      id: (items.length + 1).toString(),
    };

    // Add default values for all columns
    columns.forEach(column => {
      if (column.id === "serial_no") {
        newItem[column.id] = (items.length + 1).toString();
      } else if (column.id === "description") {
        newItem[column.id] = "";
      } else if (column.id === "amount") {
        newItem[column.id] = 0;
      } else if (column.id === "baseAmount") {
        newItem[column.id] = 0;
      } else if (column.id === "percentageIncrease") {
        newItem[column.id] = globalPercentageIncrease || 0;
      } else if (column.id === "finalAmount") {
        newItem[column.id] = 0;
      } else {
        newItem[column.id] = ""; // Default value for custom columns
      }
    });

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  // Remove an item row
  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  // Update item value
  const updateItem = (id: string, field: string, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate final amount if percentage calculation is enabled
        if (enablePercentageCalculation && (field === 'baseAmount' || field === 'percentageIncrease')) {
          const baseAmount = field === 'baseAmount' ? Number(value) : item.baseAmount || 0;
          const percentageIncrease = field === 'percentageIncrease' ? Number(value) : item.percentageIncrease || 0;
          updatedItem.finalAmount = calculateFinalAmount(baseAmount, percentageIncrease);
        }

        return updatedItem;
      }
      return item;
    });

    setItems(updatedItems);
    onItemsChange(updatedItems);
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

    // Calculate appropriate width based on column name length
    const nameLength = newColumnName.length;
    let columnWidth = "12%";
    if (nameLength > 10) {
      columnWidth = "15%";
    }
    if (nameLength > 15) {
      columnWidth = "18%";
    }

    const newColumn: Column = {
      id: columnId,
      name: newColumnName,
      width: columnWidth,
      isRequired: false,
      type: 'text',
    };

    // Add this field to all existing items
    const updatedItems = items.map(item => ({
      ...item,
      [columnId]: "",
    }));

    setColumns([...columns, newColumn]);
    setItems(updatedItems);
    onItemsChange(updatedItems);
    setNewColumnName("");
    setShowAddColumn(false);
  };

  // Remove a custom column
  const removeColumn = (columnId: string) => {
    const updatedColumns = columns.filter(col => col.id !== columnId);
    const updatedItems = items.map(item => {
      const { [columnId]: removed, ...rest } = item;
      return rest;
    });

    setColumns(updatedColumns);
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  // Apply global percentage increase to all items
  const applyGlobalPercentage = () => {
    if (!enablePercentageCalculation || !onGlobalPercentageApply) return;
    onGlobalPercentageApply(globalPercentageIncrease);
  };

  // Render input field based on column type
  const renderInputField = (item: ItemRow, column: Column) => {
    const value = item[column.id] || "";

    switch (column.type) {
      case 'readonly':
        if (column.id === 'serial_no') {
          return (
            <div className="text-center font-medium text-gray-600">
              {items.findIndex(i => i.id === item.id) + 1}
            </div>
          );
        }
        return (
          <input
            type="text"
            value={value}
            readOnly
            className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm bg-gray-100 text-gray-700"
          />
        );

      case 'currency':
        return (
          <div className="relative flex items-center">
            <span className="absolute right-3 text-gray-500 z-10">₹</span>
            <input
              type="number"
              value={value || ""}
              onChange={(e) => updateItem(
                item.id,
                column.id,
                e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
              )}
              className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right font-medium"
              min="0"
              step="0.01"
              placeholder="0.00"
              style={{direction: "rtl", paddingRight: "25px"}}
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="relative flex items-center">
            <span className="absolute right-3 text-gray-500 z-10">%</span>
            <input
              type="number"
              value={value || ""}
              onChange={(e) => updateItem(
                item.id,
                column.id,
                e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
              )}
              className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right font-medium"
              min="0"
              max="1000"
              step="0.01"
              placeholder="0.00"
              style={{direction: "rtl", paddingRight: "25px"}}
            />
          </div>
        );

      case 'text':
      default:
        if (column.id === 'description') {
          return (
            <textarea
              value={value}
              onChange={(e) => updateItem(item.id, column.id, e.target.value)}
              className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              rows={2}
              placeholder={`Enter ${column.name.toLowerCase()}`}
            />
          );
        }
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateItem(item.id, column.id, e.target.value)}
            className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder={`Enter ${column.name.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Global Percentage Control */}
      {enablePercentageCalculation && onGlobalPercentageApply && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Global Percentage Increase:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={globalPercentageIncrease}
                readOnly
                className="w-20 border border-gray-300 rounded-lg p-2 text-center bg-gray-100"
              />
              <span className="text-gray-500">%</span>
              <button
                onClick={applyGlobalPercentage}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
              >
                Apply to All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Column Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Custom Columns</h3>
          <button
            onClick={() => setShowAddColumn(!showAddColumn)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Column
          </button>
        </div>

        {showAddColumn && (
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter column name"
              onKeyPress={(e) => e.key === 'Enter' && addColumn()}
            />
            <button
              onClick={addColumn}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddColumn(false);
                setNewColumnName("");
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
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
                    {renderInputField(item, column)}
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-2 transition-colors duration-200"
                        title="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Button */}
      <div className="flex justify-center">
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
      </div>
    </div>
  );
};

export default EnhancedItemsTable;
