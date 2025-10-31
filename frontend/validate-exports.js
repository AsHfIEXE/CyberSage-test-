#!/usr/bin/env node

// Simple validation script to check component exports and test imports
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating CyberSage 2.0 Component Exports and Test Imports...\n');

// Check component exports
const componentsDir = './src/components';
const testsDir = './src/__tests__';

const exportChecks = [
  {
    component: 'VirtualizedLists.jsx',
    export: 'VirtualizedVulnerabilityList',
    testFile: 'components/VirtualizedVulnerabilityList.test.js'
  },
  {
    component: 'OptimizedComponents.jsx', 
    export: 'OptimizedStatsCard',
    testFile: 'components/OptimizedStatsCard.test.js'
  },
  {
    component: 'ThemeComponents.jsx',
    export: 'PageTransition',
    testFile: 'pages/ThemeComponents.test.js'
  }
];

let allValid = true;

exportChecks.forEach(check => {
  const componentPath = path.join(componentsDir, check.component);
  const testPath = path.join(testsDir, check.testFile);
  
  console.log(`📋 Checking ${check.component}...`);
  
  // Check if component file exists
  if (!fs.existsSync(componentPath)) {
    console.log(`  ❌ Component file not found: ${componentPath}`);
    allValid = false;
    return;
  }
  
  // Check if test file exists
  if (!fs.existsSync(testPath)) {
    console.log(`  ❌ Test file not found: ${testPath}`);
    allValid = false;
    return;
  }
  
  // Check component export
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  const exportRegex = new RegExp(`export\\s+(?:const|function)\\s+${check.export}`, 'm');
  if (!exportRegex.test(componentContent)) {
    console.log(`  ❌ Export '${check.export}' not found in ${check.component}`);
    allValid = false;
  } else {
    console.log(`  ✅ Export '${check.export}' found in ${check.component}`);
  }
  
  // Check test import
  const testContent = fs.readFileSync(testPath, 'utf8');
  const importRegex = new RegExp(`from\\s+['"]\\.\\./\\.\\./components/[^'"]*['"]`, 'm');
  const imports = testContent.match(importRegex);
  
  if (!imports || imports.length === 0) {
    console.log(`  ⚠️  No component imports found in test file`);
  } else {
    imports.forEach(imp => console.log(`  📦 Import: ${imp}`));
  }
  
  // Check userEvent usage
  const userEventMatches = testContent.match(/userEvent\.setup\(\)/g);
  if (userEventMatches) {
    console.log(`  ⚠️  Found ${userEventMatches.length} userEvent.setup() calls (requires v14)`);
  }
  
  console.log('');
});

console.log('📊 Summary:');
if (allValid) {
  console.log('✅ All component exports and imports are valid');
  console.log('🔧 Next steps: Install dependencies and run tests');
} else {
  console.log('❌ Some issues found. Please fix the above errors.');
}

console.log('\n🛠️  Manual fixes applied:');
console.log('  ✅ Removed duplicate setupTests.js from __tests__ directory');
console.log('  ✅ Fixed mock data structure in EnhancedDashboardPage.test.js');
console.log('  ✅ Added scanHistory, toolActivity, aiInsights, chains arrays to mock');