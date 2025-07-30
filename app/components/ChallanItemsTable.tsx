"use client";

import { useState, useEffect } from "react";

// Define types
interface Column {
  id: string;
  name: string;
  width: string;
  isRequired: boolean;
}

interface ItemRow {
  id: string;
  [key: string]: any;
}

interface ChallanItemsTableProps {
  initialItems: ItemRow[];
  initialColumns?: Column[];
  onItemsChange: (items: ItemRow[]) => void;
}

const ChallanItemsTable: React.FC<ChallanItemsTableProps> = ({
  initialItems,
  initialColumns = [],
  onItemsChange,
}) => {
  // Default required columns for challan (quantity at the end)
  const defaultColumns: Column[] = [
    { id: "serial_no", name: "S. No.", width: "8%", isRequired: true },
    { id: "description", name: "Description", width: "40%", isRequired: true },
    { id: "quantity", name: "Qty/Units/Nos.", width: "20%", isRequired: true },
  ];

  // State for columns and items - ensure quantity is always last
  const [columns, setColumns] = useState<Column[]>(() => {
    const baseColumns = [
      { id: "serial_no", name: "S. No.", width: "8%", isRequired: true },
      { id: "description", name: "Description", width: "60%", isRequired: true },
    ];
    const customColumns = initialColumns.filter(col => !defaultColumns.some(defCol => defCol.id === col.id));
    const quantityColumn = { id: "quantity", name: "Qty/Units/Nos.", width: "15%", isRequired: true };

    return [...baseColumns, ...customColumns, quantityColumn];
  });

  const [items, setItems] = useState<ItemRow[]>(
    initialItems.length > 0
      ? initialItems.map((item, index) => ({
          ...item,
          serial_no: item.serial_no || (index + 1).toString()
        }))
      : [
          {
            id: "1",
            serial_no: "1",
            description: "",
            quantity: 0,
          },
        ]
  );

  // State for new column
  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);

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
      } else if (column.id === "quantity") {
        newItem[column.id] = ""; // Empty string instead of 0
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
    let columnWidth = "10%";
    if (nameLength > 10) {
      columnWidth = "12%";
    }
    if (nameLength > 15) {
      columnWidth = "15%";
    }

    const newColumn: Column = {
      id: columnId,
      name: newColumnName,
      width: columnWidth,
      isRequired: false,
    };

    // Always insert new columns before the quantity column (which should be last)
    const quantityIndex = columns.findIndex(col => col.id === "quantity");

    if (quantityIndex === -1) {
      // If quantity column not found, just add to end
      setColumns([...columns, newColumn]);
    } else {
      // Insert the new column before the quantity column
      const updatedColumns = [...columns];
      updatedColumns.splice(quantityIndex, 0, newColumn);
      setColumns(updatedColumns);
    }

    // Add this field to all existing items
    const updatedItems = items.map(item => ({
      ...item,
      [columnId]: "",
    }));

    setItems(updatedItems);
    onItemsChange(updatedItems);
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
    onItemsChange(updatedItems);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">Items</h2>
          <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
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
                : "bg-orange-600 text-white hover:bg-orange-700"
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
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
          <h3 className="text-sm font-medium text-orange-800 mb-3">Add a Custom Column</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name (e.g. Size, Color, Material)"
                className="w-full border border-orange-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              />
            </div>
            <button
              type="button"
              onClick={addColumn}
              disabled={!newColumnName.trim()}
              className={`whitespace-nowrap px-4 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 ${
                newColumnName.trim()
                  ? "bg-orange-600 text-white hover:bg-orange-700"
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
          <p className="text-xs text-orange-600 mt-2">
            Custom columns will appear before the Quantity column (which stays at the rightmost position).
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
                    {column.id === "quantity" ? (
                      // Quantity input - right aligned
                      <input
                        type="number"
                        value={item[column.id] || ""}
                        onChange={(e) => updateItem(
                          item.id,
                          column.id,
                          e.target.value === "" ? "" : parseInt(e.target.value) || 0
                        )}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-right font-medium"
                        min="0"
                        placeholder="0"
                      />
                    ) : (
                      // Text input for other fields
                      <input
                        type="text"
                        value={item[column.id] || ""}
                        onChange={(e) => updateItem(item.id, column.id, e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder={`Enter ${column.name.toLowerCase()}`}
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

export default ChallanItemsTable;
