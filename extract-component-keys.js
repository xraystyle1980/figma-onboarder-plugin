#!/usr/bin/env node

/**
 * Helper script to extract component keys from Figma URLs
 * Usage: node extract-component-keys.js "https://www.figma.com/file/..."
 */

function extractComponentKey(url) {
  // Extract node-id from Figma URL
  const nodeIdMatch = url.match(/node-id=([^&]+)/);
  if (nodeIdMatch) {
    return nodeIdMatch[1];
  }
  
  // Alternative format: node-id with encoding
  const encodedMatch = url.match(/node-id=([^&]+)&t=/);
  if (encodedMatch) {
    return decodeURIComponent(encodedMatch[1]);
  }
  
  return null;
}

function generateLibraryKeysObject(componentKeys) {
  const template = `const LIBRARY_KEYS = {
  'full-screen-layout': '${componentKeys['full-screen-layout'] || 'YOUR_KEY_HERE'}',
  'modal-layout-form': '${componentKeys['modal-layout-form'] || 'YOUR_KEY_HERE'}',
  'modal-layout': '${componentKeys['modal-layout'] || 'YOUR_KEY_HERE'}',
  'tooltip-layout': '${componentKeys['tooltip-layout'] || 'YOUR_KEY_HERE'}',
  'split-screen-layout': '${componentKeys['split-screen-layout'] || 'YOUR_KEY_HERE'}',
};`;
  
  return template;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node extract-component-keys.js <figma-url>

Example:
  node extract-component-keys.js "https://www.figma.com/file/abc123/MyLibrary?node-id=123%3A456&t=abc123"

This will extract the component key from the URL and display it.
    `);
    process.exit(1);
  }
  
  const url = args[0];
  const key = extractComponentKey(url);
  
  if (key) {
    console.log(`Component Key: ${key}`);
    console.log(`\nCopy this key and update the LIBRARY_KEYS object in code.ts`);
  } else {
    console.error('Could not extract component key from URL');
    console.error('Make sure the URL contains a node-id parameter');
    process.exit(1);
  }
}

module.exports = {
  extractComponentKey,
  generateLibraryKeysObject
}; 