const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a simple API build script
console.log('Building API functions...');

// Build only the API folder
try {
  execSync('npx tsc --project api/tsconfig.json', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✓ API build completed');
} catch (error) {
  console.error('✗ API build failed:', error.message);
  process.exit(1);
}