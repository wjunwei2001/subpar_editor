#!/usr/bin/env node
/**
 * Setup script for LSP dependencies
 * Run with: npm run setup:lsp
 */

const { execSync, spawnSync } = require('child_process');

console.log('Setting up LSP dependencies...\n');

// Check for Python LSP
console.log('Checking Python LSP (python-lsp-server)...');
try {
  const result = spawnSync('pylsp', ['--version'], {
    shell: true,
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  if (result.status === 0) {
    console.log('[OK] Python LSP is already installed\n');
  } else {
    throw new Error('Not found');
  }
} catch {
  console.log('Python LSP not found. Attempting to install...');
  try {
    execSync('pip install python-lsp-server', { stdio: 'inherit' });
    console.log('[OK] Python LSP installed successfully\n');
  } catch (err) {
    console.log('[WARN] Could not install Python LSP automatically.');
    console.log('  Please install manually with: pip install python-lsp-server\n');
  }
}

// TypeScript LSP is included in devDependencies
console.log('Checking TypeScript LSP...');
try {
  require.resolve('typescript-language-server');
  console.log('[OK] TypeScript LSP is installed (via npm)\n');
} catch {
  console.log('[WARN] TypeScript LSP not found. Run: npm install\n');
}

console.log('LSP setup complete!');
