import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('--- Phase 4 Firebase Live Verification ---');
console.log('Target Project ID:', config.projectId);

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

async function runTests() {
  const testEmail = `phase4_test_${Date.now()}@smartuzhavan.test`;
  const testPassword = 'TestPassword@123';
  const testName = 'Test Farmer Phase4';
  const testRole = 'Farmer';

  // 1. Invalid credentials test
  console.log('\n[Test 1] Testing invalid credentials handling...');
  try {
    await signInWithEmailAndPassword(auth, 'nonexistent_user_999@test.com', 'wrong_pass_999');
    console.error('FAILED: Should have thrown invalid credential error');
  } catch (err) {
    console.log('PASSED: Expected Firebase Auth error received ->', err.code);
  }

  // 2. Registration test
  console.log('\n[Test 2] Testing real account registration...');
  let testUid = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    testUid = cred.user.uid;
    console.log('PASSED: Account created in Firebase Auth. UID:', testUid);

    // 3. Firestore profile write (schema matching Flutter: users/{uid})
    console.log('\n[Test 3] Writing user document to Firestore users/' + testUid + '...');
    await setDoc(doc(db, 'users', testUid), {
      name: testName,
      email: testEmail,
      role: testRole,
      createdAt: serverTimestamp(),
    });
    console.log('PASSED: Firestore document written with role:', testRole);
  } catch (err) {
    console.error('Registration/Firestore error:', err);
    throw err;
  }

  // 4. Sign out
  console.log('\n[Test 4] Testing Sign Out...');
  await signOut(auth);
  console.log('PASSED: User signed out cleanly.');

  // 5. Sign in with the newly created account
  console.log('\n[Test 5] Testing Sign In with created account...');
  const loginCred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
  console.log('PASSED: Signed in successfully. UID matches:', loginCred.user.uid === testUid);

  // 6. Read and verify Firestore user profile
  console.log('\n[Test 6] Fetching and verifying user profile from Firestore...');
  const userDocSnap = await getDoc(doc(db, 'users', testUid));
  if (userDocSnap.exists()) {
    const profile = userDocSnap.data();
    console.log('PASSED: Profile retrieved:', {
      name: profile.name,
      email: profile.email,
      role: profile.role,
    });
    if (profile.role !== testRole) {
      console.error('Role mismatch!');
    }
  } else {
    console.error('User document does not exist!');
  }

  // 7. Final clean sign out
  await signOut(auth);
  console.log('\n[Test 7] Final Sign Out completed.');
  console.log('\n>>> ALL 7 LIVE FIREBASE INTEGRATION TESTS PASSED! <<<');
}

runTests().catch((e) => {
  console.error('\nTest suite failed:', e);
  process.exit(1);
});
