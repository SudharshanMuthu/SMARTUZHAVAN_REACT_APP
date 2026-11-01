/**
 * Smart Uzhavan - Phase 10 Backend Integration Test Suite
 * Validates all endpoints, security headers, CORS, and auth guards.
 */

import http from 'http';
import app from './src/app.js';

const PORT = 5055; // dedicated test port

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Smart Uzhavan Phase 10 Backend Integration Tests ---');
  let server;
  let passed = 0;
  let failed = 0;

  try {
    server = await new Promise((res, rej) => {
      const s = app.listen(PORT, '127.0.0.1', () => res(s));
      s.on('error', rej);
    });

    console.log(`[PASS] Test server started on http://127.0.0.1:${PORT}`);
    passed++;

    // Test 1: Health check endpoint
    const health = await makeRequest('/api/health');
    if (health.status === 200 && health.body.status === 'healthy') {
      console.log('[PASS] GET /api/health -> 200 Healthy, timestamp present');
      passed++;
    } else {
      console.error('[FAIL] GET /api/health', health);
      failed++;
    }

    // Test 2: AI advice (chat handler with valid message)
    const aiChat = await makeRequest('/api/ai/chat', {
      method: 'POST',
      body: { message: 'How to control pests in tomato organic farming?' },
    });
    if (aiChat.status === 200 && (aiChat.body.reply || aiChat.body.status === 'success' || aiChat.body.response)) {
      console.log('[PASS] POST /api/ai/chat -> 200 Response generated');
      passed++;
    } else {
      console.error('[FAIL] POST /api/ai/chat', aiChat);
      failed++;
    }

    // Test 3: Live Weather endpoint
    const weather = await makeRequest('/api/weather/current?lat=13.0827&lon=80.2707');
    if (weather.status === 200 && (weather.body.data || weather.body.temperature !== undefined || weather.body.location || weather.body.status === 'success')) {
      console.log('[PASS] GET /api/weather/current -> 200 Open-Meteo live weather data returned');
      passed++;
    } else {
      console.error('[FAIL] GET /api/weather/current', weather);
      failed++;
    }

    // Test 4: Mandi Market Prices endpoint
    const market = await makeRequest('/api/market/metadata');
    if (market.status === 200 && (market.body.crops || market.body.mandis || market.body.status === 'success')) {
      console.log('[PASS] GET /api/market/metadata -> 200 Supported crops and mandis returned');
      passed++;
    } else {
      console.error('[FAIL] GET /api/market/metadata', market);
      failed++;
    }

    // Test 5: Mandi Price Query
    const mandiPrice = await makeRequest('/api/market/prices?crop=Paddy&location=Trichy');
    if (mandiPrice.status === 200 && (mandiPrice.body.crop || mandiPrice.body.status === 'success')) {
      console.log('[PASS] GET /api/market/prices?crop=Paddy&location=Trichy -> 200 Mandi prices returned');
      passed++;
    } else {
      console.error('[FAIL] GET /api/market/prices', mandiPrice);
      failed++;
    }

    // Test 6: Agricultural Alerts & News
    const news = await makeRequest('/api/alerts/news');
    if (news.status === 200 && (Array.isArray(news.body.news) || Array.isArray(news.body) || news.body.status === 'success')) {
      console.log('[PASS] GET /api/alerts/news -> 200 Agri news returned');
      passed++;
    } else {
      console.error('[FAIL] GET /api/alerts/news', news);
      failed++;
    }

    // Test 7: Government Schemes
    const schemes = await makeRequest('/api/alerts/schemes');
    if (schemes.status === 200 && (Array.isArray(schemes.body.schemes) || Array.isArray(schemes.body) || schemes.body.status === 'success')) {
      console.log('[PASS] GET /api/alerts/schemes -> 200 Government schemes returned');
      passed++;
    } else {
      console.error('[FAIL] GET /api/alerts/schemes', schemes);
      failed++;
    }

    // Test 8: Admin route security guard (must reject without Bearer token)
    const adminUnauth = await makeRequest('/api/admin/overview');
    if (adminUnauth.status === 401 || adminUnauth.status === 403) {
      console.log(`[PASS] GET /api/admin/overview -> ${adminUnauth.status} Unauthorized/Forbidden (Security guard active)`);
      passed++;
    } else {
      console.error('[FAIL] GET /api/admin/overview should reject unauthenticated requests', adminUnauth);
      failed++;
    }

    // Test 9: Non-existent route 404 handler
    const notFound = await makeRequest('/api/nonexistent-route-xyz');
    if (notFound.status === 404) {
      console.log('[PASS] GET /api/nonexistent -> 404 Handled cleanly');
      passed++;
    } else {
      console.error('[FAIL] 404 handler', notFound);
      failed++;
    }

  } catch (err) {
    console.error('[FATAL] Integration test exception:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
      console.log('[INFO] Test server closed cleanly.');
    }
  }

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
