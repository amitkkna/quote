// Simple test to verify percentage calculation functionality
// This can be run in the browser console or Node.js

function calculateFinalAmount(baseAmount, percentageIncrease) {
  return baseAmount + (baseAmount * percentageIncrease / 100);
}

function testPercentageCalculations() {
  console.log("Testing Percentage Calculation Functionality");
  console.log("===========================================");
  
  // Test cases
  const testCases = [
    { base: 1000, percentage: 10, expected: 1100 },
    { base: 500, percentage: 20, expected: 600 },
    { base: 1500, percentage: 15, expected: 1725 },
    { base: 2000, percentage: 0, expected: 2000 },
    { base: 750, percentage: 25, expected: 937.5 },
  ];
  
  let allTestsPassed = true;
  
  testCases.forEach((testCase, index) => {
    const result = calculateFinalAmount(testCase.base, testCase.percentage);
    const passed = Math.abs(result - testCase.expected) < 0.01; // Allow for floating point precision
    
    console.log(`Test ${index + 1}: Base: ₹${testCase.base}, Increase: ${testCase.percentage}%`);
    console.log(`Expected: ₹${testCase.expected}, Got: ₹${result}, ${passed ? 'PASS' : 'FAIL'}`);
    
    if (!passed) {
      allTestsPassed = false;
    }
  });
  
  console.log("===========================================");
  console.log(`Overall Result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return allTestsPassed;
}

function testMultipleItemsCalculation() {
  console.log("\nTesting Multiple Items Calculation");
  console.log("==================================");
  
  const items = [
    { baseAmount: 1000, percentageIncrease: 10 },
    { baseAmount: 500, percentageIncrease: 15 },
    { baseAmount: 750, percentageIncrease: 20 },
  ];
  
  let subtotal = 0;
  
  items.forEach((item, index) => {
    const finalAmount = calculateFinalAmount(item.baseAmount, item.percentageIncrease);
    subtotal += finalAmount;
    console.log(`Item ${index + 1}: ₹${item.baseAmount} + ${item.percentageIncrease}% = ₹${finalAmount}`);
  });
  
  const gstRate = 18;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;
  
  console.log(`Subtotal: ₹${subtotal}`);
  console.log(`GST (${gstRate}%): ₹${gstAmount}`);
  console.log(`Total: ₹${total}`);
  
  // Expected values
  const expectedSubtotal = 1100 + 575 + 900; // 2575
  const expectedGstAmount = 2575 * 0.18; // 463.5
  const expectedTotal = 2575 + 463.5; // 3038.5
  
  const subtotalMatch = Math.abs(subtotal - expectedSubtotal) < 0.01;
  const gstMatch = Math.abs(gstAmount - expectedGstAmount) < 0.01;
  const totalMatch = Math.abs(total - expectedTotal) < 0.01;
  
  console.log(`\nValidation:`);
  console.log(`Subtotal: ${subtotalMatch ? 'PASS' : 'FAIL'} (Expected: ₹${expectedSubtotal})`);
  console.log(`GST: ${gstMatch ? 'PASS' : 'FAIL'} (Expected: ₹${expectedGstAmount})`);
  console.log(`Total: ${totalMatch ? 'PASS' : 'FAIL'} (Expected: ₹${expectedTotal})`);
  
  return subtotalMatch && gstMatch && totalMatch;
}

function testGlobalPercentageApplication() {
  console.log("\nTesting Global Percentage Application");
  console.log("====================================");
  
  const items = [
    { baseAmount: 1000, percentageIncrease: 5 },
    { baseAmount: 500, percentageIncrease: 8 },
    { baseAmount: 750, percentageIncrease: 12 },
  ];
  
  const globalPercentage = 15;
  
  console.log("Before global percentage application:");
  items.forEach((item, index) => {
    const finalAmount = calculateFinalAmount(item.baseAmount, item.percentageIncrease);
    console.log(`Item ${index + 1}: ₹${item.baseAmount} + ${item.percentageIncrease}% = ₹${finalAmount}`);
  });
  
  console.log(`\nApplying global percentage: ${globalPercentage}%`);
  
  const updatedItems = items.map(item => ({
    ...item,
    percentageIncrease: globalPercentage,
    finalAmount: calculateFinalAmount(item.baseAmount, globalPercentage)
  }));
  
  console.log("After global percentage application:");
  updatedItems.forEach((item, index) => {
    console.log(`Item ${index + 1}: ₹${item.baseAmount} + ${item.percentageIncrease}% = ₹${item.finalAmount}`);
  });
  
  // Verify all items have the same percentage
  const allSamePercentage = updatedItems.every(item => item.percentageIncrease === globalPercentage);
  console.log(`\nAll items have same percentage: ${allSamePercentage ? 'PASS' : 'FAIL'}`);
  
  return allSamePercentage;
}

// Run all tests
function runAllTests() {
  console.log("MULTIPARTY QUOTATION SYSTEM - PERCENTAGE CALCULATION TESTS");
  console.log("=========================================================");
  
  const test1 = testPercentageCalculations();
  const test2 = testMultipleItemsCalculation();
  const test3 = testGlobalPercentageApplication();
  
  console.log("\n" + "=".repeat(60));
  console.log("FINAL RESULTS:");
  console.log(`Basic Percentage Calculations: ${test1 ? 'PASS' : 'FAIL'}`);
  console.log(`Multiple Items Calculation: ${test2 ? 'PASS' : 'FAIL'}`);
  console.log(`Global Percentage Application: ${test3 ? 'PASS' : 'FAIL'}`);
  console.log(`Overall: ${test1 && test2 && test3 ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
  
  return test1 && test2 && test3;
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateFinalAmount,
    testPercentageCalculations,
    testMultipleItemsCalculation,
    testGlobalPercentageApplication,
    runAllTests
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log("Running tests automatically...");
  runAllTests();
}
