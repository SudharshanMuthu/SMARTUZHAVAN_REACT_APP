import http from 'http';
import app from './src/app.js';

const PORT = 5057;

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
  console.log('--- Testing Phase 11B: Farm Tools & Tech Endpoints ---');
  let server;
  let passed = 0;
  let failed = 0;

  try {
    server = await new Promise((res, rej) => {
      const s = app.listen(PORT, '127.0.0.1', () => res(s));
      s.on('error', rej);
    });

    // Test 1: Fetch all tools
    const resTools = await makeRequest('/api/farm-tools/products');
    if (resTools.status === 200 && resTools.body.data.tools.length >= 10) {
      console.log(`[PASS] GET /api/farm-tools/products -> 200 (${resTools.body.data.tools.length} tools loaded)`);
      passed++;
    } else {
      console.error('[FAIL] GET /api/farm-tools/products', resTools);
      failed++;
    }

    // Test 2: Filter by category (tractor_parts)
    const resTractorParts = await makeRequest('/api/farm-tools/products?category=tractor_parts');
    if (resTractorParts.status === 200 && resTractorParts.body.data.tools.every((t) => t.category === 'tractor_parts')) {
      console.log(`[PASS] GET /api/farm-tools/products?category=tractor_parts -> 200 (${resTractorParts.body.data.tools.length} tractor spare parts)`);
      passed++;
    } else {
      console.error('[FAIL] Tractor parts filter', resTractorParts);
      failed++;
    }

    // Test 3: Tractor OEM compatibility check
    const resMahindra = await makeRequest('/api/farm-tools/products?tractorBrand=Mahindra');
    if (
      resMahindra.status === 200 &&
      resMahindra.body.data.tools.length > 0 &&
      resMahindra.body.data.tools[0].isCompatibilityVerified === true &&
      resMahindra.body.data.tools[0].partNumber === '005558491R91'
    ) {
      console.log(`[PASS] Tractor OEM compatibility check -> 200 (Mahindra OEM P/N: ${resMahindra.body.data.tools[0].partNumber})`);
      passed++;
    } else {
      console.error('[FAIL] Tractor OEM compatibility check', resMahindra);
      failed++;
    }

    // Test 4: Get tool by ID
    const resToolDetail = await makeRequest('/api/farm-tools/products/tool_tata_manvetti');
    if (resToolDetail.status === 200 && resToolDetail.body.data.id === 'tool_tata_manvetti') {
      console.log(`[PASS] GET /api/farm-tools/products/tool_tata_manvetti -> 200 (${resToolDetail.body.data.name})`);
      passed++;
    } else {
      console.error('[FAIL] Tool by ID', resToolDetail);
      failed++;
    }

    // Test 5: Fetch machinery rentals
    const resRentals = await makeRequest('/api/farm-tools/rentals');
    if (resRentals.status === 200 && resRentals.body.data.rentals.length >= 5) {
      console.log(`[PASS] GET /api/farm-tools/rentals -> 200 (${resRentals.body.data.rentals.length} machinery rental listings)`);
      passed++;
    } else {
      console.error('[FAIL] Machinery rentals', resRentals);
      failed++;
    }

    // Test 6: Rental filter by type (harvester)
    const resHarvester = await makeRequest('/api/farm-tools/rentals?type=harvester');
    if (resHarvester.status === 200 && resHarvester.body.data.rentals.length > 0 && resHarvester.body.data.rentals[0].type === 'harvester') {
      console.log(`[PASS] GET /api/farm-tools/rentals?type=harvester -> 200 (${resHarvester.body.data.rentals[0].title})`);
      passed++;
    } else {
      console.error('[FAIL] Harvester rental filter', resHarvester);
      failed++;
    }

    // Test 7: Tool comparison matrix
    const resCompare = await makeRequest('/api/farm-tools/compare', {
      method: 'POST',
      body: { toolIds: ['part_mahindra_oil_filter', 'part_tafe_mf_fan_belt'] },
    });
    if (resCompare.status === 200 && resCompare.body.data.comparisonCount === 2) {
      console.log('[PASS] POST /api/farm-tools/compare -> 200 (Comparison matrix generated)');
      passed++;
    } else {
      console.error('[FAIL] Tool comparison', resCompare);
      failed++;
    }

    // Test 8: Store metadata
    const resMeta = await makeRequest('/api/farm-tools/metadata');
    if (resMeta.status === 200 && resMeta.body.data.categories.length === 7 && resMeta.body.data.rentalTypes.length === 6) {
      console.log('[PASS] GET /api/farm-tools/metadata -> 200 (Categories, rental types & tractor brands)');
      passed++;
    } else {
      console.error('[FAIL] Metadata', resMeta);
      failed++;
    }

  } catch (err) {
    console.error('[FATAL] Farm Tools test error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
      console.log('[INFO] Test server closed cleanly.');
    }
  }

  console.log(`\n=== Farm Tools & Tech Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
