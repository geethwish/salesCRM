#!/usr/bin/env node

/**
 * Swagger UI Test Script
 * 
 * This script tests the Swagger UI documentation endpoints to ensure
 * they are working correctly and not blocked by CSP or other issues.
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

/**
 * Test OpenAPI JSON endpoint
 */
async function testOpenAPIJson() {
  console.log('🔍 Testing OpenAPI JSON endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/docs/openapi.json`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('✅ OpenAPI JSON endpoint working');
      console.log(`   - Title: ${data.info?.title}`);
      console.log(`   - Version: ${data.info?.version}`);
      console.log(`   - Servers: ${data.servers?.length || 0}`);
      return true;
    } else {
      console.log(`❌ OpenAPI JSON endpoint failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OpenAPI JSON endpoint error: ${error.message}`);
    return false;
  }
}

/**
 * Test Swagger UI HTML endpoint
 */
async function testSwaggerUIHtml() {
  console.log('🔍 Testing Swagger UI HTML endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/docs`);
    
    if (response.statusCode === 200) {
      const html = response.data;
      
      // Check for essential Swagger UI elements
      const checks = [
        { name: 'HTML structure', test: html.includes('<!DOCTYPE html>') },
        { name: 'Swagger UI container', test: html.includes('id="swagger-ui"') },
        { name: 'Swagger UI bundle script', test: html.includes('swagger-ui-bundle.js') },
        { name: 'Swagger UI preset script', test: html.includes('swagger-ui-standalone-preset.js') },
        { name: 'Swagger UI CSS', test: html.includes('swagger-ui.css') },
        { name: 'OpenAPI JSON URL', test: html.includes('/api/docs/openapi.json') },
        { name: 'Error handling', test: html.includes('initializeSwaggerUI') },
        { name: 'Loading indicator', test: html.includes('Loading API Documentation') }
      ];
      
      console.log('✅ Swagger UI HTML endpoint working');
      checks.forEach(check => {
        console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
      });
      
      // Check CSP headers
      const csp = response.headers['content-security-policy'];
      if (csp) {
        console.log('📋 Content Security Policy:');
        console.log(`   - Allows unpkg.com scripts: ${csp.includes('https://unpkg.com')}`);
        console.log(`   - Allows unpkg.com styles: ${csp.includes('https://unpkg.com')}`);
        console.log(`   - Allows unsafe-inline: ${csp.includes("'unsafe-inline'")}`);
        console.log(`   - Allows unsafe-eval: ${csp.includes("'unsafe-eval'")}`);
      }
      
      return checks.every(check => check.test);
    } else {
      console.log(`❌ Swagger UI HTML endpoint failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Swagger UI HTML endpoint error: ${error.message}`);
    return false;
  }
}

/**
 * Test CORS headers
 */
async function testCorsHeaders() {
  console.log('🔍 Testing CORS headers...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/docs/openapi.json`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };
    
    console.log('✅ CORS headers present:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value || 'NOT SET'}`);
    });
    
    return corsHeaders['access-control-allow-origin'] === '*';
  } catch (error) {
    console.log(`❌ CORS headers test error: ${error.message}`);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Swagger UI Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('');
  
  const results = [];
  
  // Run tests
  results.push(await testOpenAPIJson());
  results.push(await testSwaggerUIHtml());
  results.push(await testCorsHeaders());
  
  console.log('');
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${results.filter(r => r).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r).length}`);
  
  if (results.every(r => r)) {
    console.log('');
    console.log('🎉 All tests passed! Swagger UI should be working correctly.');
    console.log(`📖 Visit: ${BASE_URL}/api/docs`);
  } else {
    console.log('');
    console.log('⚠️  Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
}
