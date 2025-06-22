const fs = require('fs');
const path = require('path');

// Path to the controller file
const filePath = path.join(__dirname, 'controllers', 'documentController.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic parts
content = content.replace(/fileData: fileBuffer/g, 'fileData: Buffer.from(fileBuffer)');
content = content.replace(/fileData: highlightedPdf/g, 'fileData: Buffer.from(highlightedPdf)');
content = content.replace(/fileData: maskedPdf/g, 'fileData: Buffer.from(maskedPdf)');

// Write back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('File updated successfully'); 