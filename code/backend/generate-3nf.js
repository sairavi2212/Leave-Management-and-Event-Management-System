#!/usr/bin/env node

/**
 * Script to generate 3NF diagram and serve it on a local server
 * Usage: node generate-3nf.js
 */

import generate3NFDiagram from './utils/generate3NFDiagram.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';  // We'll add this dependency

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generate the diagram
console.log('Generating 3NF database diagram...');
const result = generate3NFDiagram();

if (result.success) {
  // Find the file path
  const filePath = result.message.split('Generated 3NF diagram at: ')[1];
  
  // Create a simple server to serve the file
  const server = http.createServer((req, res) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  });
  
  const PORT = 3030;
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n✅ 3NF Diagram server running at ${url}`);
    console.log(`Opening browser automatically...`);
    
    // Open the browser to view the diagram
    open(url).catch(() => {
      console.log(`\nCouldn't open browser automatically. Please open ${url} manually.`);
    });
    
    console.log('\nPress Ctrl+C to stop the server');
  });
} else {
  console.error('Failed to generate 3NF diagram:', result.message);
  process.exit(1);
}