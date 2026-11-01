import http from 'http';
import app from './src/app.js';

const PORT = 5056;

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
          resolve({ status: res.statusCode, body: parsed });
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
  console.log('--- Testing Phase 11A: Agri Care Store Endpoints ---');
  let server;
  let passed = 0;
  let failed = 0;

  try {
    server = await new Promise((res, rej) => {
      const s = app.listen(PORT, '127.0.0.1', () => res(s));
      s.on('error', rej);
    });

    // Test 1: Fetch all products
    const resProducts = await makeRequest('/api/agri-store/products');
    if (resProducts.status === 200 && resProducts.body.data.products.length >= 10) {
      console.log(`[PASS] GET /api/agri-store/products -> 200 (${resProducts.body.data.products.length} products loaded)`);
      passed++;
    } else {
      console.error('[FAIL] GET /api/agri-store/products', resProducts);
      failed++;
    }

    // Test 2: Filter by category (fertilizer)
    const resFert = await makeRequest('/api/agri-store/products?category=fertilizer');
    if (resFert.status === 200 && resFert.body.data.products.every((p) => p.category === 'fertilizer')) {
      console.log(`[PASS] GET /api/agri-store/products?category=fertilizer -> 200 (${resFert.body.data.products.length} fertilizers)`);
      passed++;
    } else {
      console.error('[FAIL] Category filter', resFert);
      failed++;
    }

    // Test 3: Search query
    const resSearch = await makeRequest('/api/agri-store/products?query=coragen');
    if (resSearch.status === 200 && resSearch.body.data.products.length > 0) {
      console.log(`[PASS] GET /api/agri-store/products?query=coragen -> 200 (Found ${resSearch.body.data.products[0].name})`);
      passed++;
    } else {
      console.error('[FAIL] Search query', resSearch);
      failed++;
    }

    // Test 4: Get product by ID
    const resDetail = await makeRequest('/api/agri-store/products/prot_coragen_fmc');
    if (resDetail.status === 200 && resDetail.body.data.id === 'prot_coragen_fmc' && resDetail.body.data.safetyWarnings.length > 0) {
      console.log(`[PASS] GET /api/agri-store/products/prot_coragen_fmc -> 200 (Toxicity: ${resDetail.body.data.toxicityBand}, PHI: ${resDetail.body.data.waitingPeriodDays} days)`);
      passed++;
    } else {
      console.error('[FAIL] Product by ID', resDetail);
      failed++;
    }

    // Test 5: Fetch nearby shops
    const resShops = await makeRequest('/api/agri-store/shops?district=Trichy');
    if (resShops.status === 200 && resShops.body.data.shops.length > 0) {
      console.log(`[PASS] GET /api/agri-store/shops?district=Trichy -> 200 (${resShops.body.data.shops.length} verified shops in Trichy)`);
      passed++;
    } else {
      console.error('[FAIL] Nearby shops', resShops);
      failed++;
    }

    // Test 6: Distance calculation with coordinates (Trichy center)
    const resGps = await makeRequest('/api/agri-store/shops?lat=10.7905&lon=78.7047');
    if (resGps.status === 200 && resGps.body.data.gpsActive && resGps.body.data.shops[0].distanceKm !== undefined) {
      console.log(`[PASS] GET /api/agri-store/shops (GPS active) -> 200 (Nearest: ${resGps.body.data.shops[0].name} @ ${resGps.body.data.shops[0].distanceKm} km)`);
      passed++;
    } else {
      console.error('[FAIL] GPS distance calculation', resGps);
      failed++;
    }

    // Test 7: Product comparison
    const resCompare = await makeRequest('/api/agri-store/compare', {
      method: 'POST',
      body: { productIds: ['fert_urea_iffco', 'fert_dap_coromandel'] },
    });
    if (resCompare.status === 200 && resCompare.body.data.comparisonCount === 2) {
      console.log('[PASS] POST /api/agri-store/compare -> 200 (Comparison matrix created)');
      passed++;
    } else {
      console.error('[FAIL] Compare products', resCompare);
      failed++;
    }

    // Test 8: Store metadata
    const resMeta = await makeRequest('/api/agri-store/metadata');
    if (resMeta.status === 200 && resMeta.body.data.categories.length === 6) {
      console.log('[PASS] GET /api/agri-store/metadata -> 200 (Categories & Subsidized fertilizer guarantee)');
      passed++;
    } else {
      console.error('[FAIL] Store metadata', resMeta);
      failed++;
    }

  } catch (err) {
    console.error('[FATAL] AgriStore test error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
      console.log('[INFO] Test server closed cleanly.');
    }
  }

  console.log(`\n=== Agri Care Store Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
