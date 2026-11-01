import assert from 'assert';
import http from 'http';
import app from './src/app.js';

const PORT = 5066;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const runTests = async () => {
  console.log('--- Starting Smart Uzhavan Phase 14 Admin Backend Tests ---');
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`[PASS] Admin test server started on ${BASE_URL}`);

  try {
    // Test 1: Invalid Login
    const invalidLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'WRONG_PASSWORD' }),
    });
    assert.strictEqual(invalidLoginRes.status, 401, 'Invalid password should return 401');
    const invalidData = await invalidLoginRes.json();
    assert.strictEqual(invalidData.success, false);
    console.log('[PASS] POST /api/admin/auth/login with wrong password -> 401 Access Denied');

    // Test 2: Valid Login with username 'admin' and password 'ADMIN123'
    const validLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'ADMIN123' }),
    });
    assert.strictEqual(validLoginRes.status, 200, 'Valid credentials should return 200');
    const loginData = await validLoginRes.json();
    assert.strictEqual(loginData.success, true);
    assert.ok(loginData.token, 'Token must be returned');
    assert.strictEqual(loginData.adminUser.username, 'admin');
    console.log('[PASS] POST /api/admin/auth/login (admin / ADMIN123) -> 200 Token Generated');

    const adminToken = loginData.token;

    // Test 3: Protected route without token
    const unauthRes = await fetch(`${BASE_URL}/api/admin/session`);
    assert.strictEqual(unauthRes.status, 401, 'Unauthorized request should return 401');
    console.log('[PASS] GET /api/admin/session without token -> 401 Protected');

    // Test 4: Protected route with valid Bearer token
    const authSessionRes = await fetch(`${BASE_URL}/api/admin/session`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(authSessionRes.status, 200, 'Session check should return 200');
    const sessionData = await authSessionRes.json();
    assert.strictEqual(sessionData.success, true);
    assert.strictEqual(sessionData.adminUser.isAdmin, true);
    console.log('[PASS] GET /api/admin/session with Bearer token -> 200 Verified');

    // Test 5: Admin Stats
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(statsRes.status, 200);
    const statsData = await statsRes.json();
    assert.strictEqual(statsData.success, true);
    console.log('[PASS] GET /api/admin/stats -> 200 Stats loaded');

    // Test 6: App Content & Categories
    const contentRes = await fetch(`${BASE_URL}/api/admin/content`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(contentRes.status, 200);
    const contentData = await contentRes.json();
    assert.strictEqual(contentData.success, true);
    assert.ok(Array.isArray(contentData.data.cropCategories));
    console.log(`[PASS] GET /api/admin/content -> 200 (${contentData.data.cropCategories.length} categories)`);

    // Test 7: Services Health
    const servicesRes = await fetch(`${BASE_URL}/api/admin/services`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(servicesRes.status, 200);
    const servicesData = await servicesRes.json();
    assert.strictEqual(servicesData.success, true);
    console.log('[PASS] GET /api/admin/services -> 200 Ecosystem health loaded');

    // Test 8: Logout
    const logoutRes = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(logoutRes.status, 200);
    console.log('[PASS] POST /api/admin/auth/logout -> 200 Session ended');

    console.log('\n=== Phase 14 Backend Admin Tests: 8 Passed, 0 Failed ===');
  } finally {
    server.close();
    console.log('[INFO] Test server closed cleanly.\n');
  }
};

runTests().catch((err) => {
  console.error('[FAIL] Admin Test suite error:', err);
  process.exit(1);
});
