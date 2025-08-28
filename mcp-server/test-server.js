#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server can start and respond to basic requests
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Adventure Story MCP Server...\n');

// Start the MCP server
const serverPath = path.join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let responseReceived = false;

// Test basic initialization
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

// Send initialization request
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Test tools list request
const toolsRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 1000);

// Handle server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server Response:', output);
  responseReceived = true;
});

// Handle server errors
server.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.includes('Adventure Story MCP Server running')) {
    console.log('✅ Server started successfully!');
    console.log('📋 Server is ready to accept requests\n');
  } else {
    console.log('🔍 Server Debug:', error);
  }
});

// Handle server close
server.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Server test completed successfully!');
  } else {
    console.log(`\n❌ Server exited with code ${code}`);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server Error:', error);
});

// Cleanup after 10 seconds
setTimeout(() => {
  console.log('\n🔚 Ending test...');
  
  if (responseReceived) {
    console.log('✅ MCP Server test passed - server responded to requests');
  } else {
    console.log('⚠️  MCP Server test incomplete - no responses received');
  }
  
  server.kill('SIGTERM');
  
  setTimeout(() => {
    server.kill('SIGKILL');
    process.exit(0);
  }, 2000);
}, 10000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  server.kill('SIGTERM');
  process.exit(0);
});
