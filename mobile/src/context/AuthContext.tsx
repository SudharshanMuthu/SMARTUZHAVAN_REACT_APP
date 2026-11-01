import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../services/firebase';
import { adminService } from '../services/adminService';
import { UserProfile, UserRole } from '../types/user';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';

const PROFILE_CACHE_KEY = '@smart_uzhavan_user_profile';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist cached profile in AsyncStorage
  const saveCachedProfile = async (profile: UserProfile | null) => {
    try {
      if (profile) {
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      } else {
        await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to update profile storage cache:', err);
    }
  };

  // Helper to load cached profile from AsyncStorage
  const loadCachedProfile = async (): Promise<UserProfile | null> => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  // Fetch user profile from Firestore users/{uid}
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const db = getFirebaseFirestore();
      const userDocRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const profile: UserProfile = {
          uid,
          name: data.name || 'User',
          email: data.email || '',
          role: (data.role as UserRole) || 'Farmer',
          phone: data.phone || data.phoneNumber || undefined,
          createdAt: data.createdAt ? data.createdAt.toString() : null,
        };
        await saveCachedProfile(profile);
        return profile;
      }
      return null;
    } catch (err: any) {
      console.warn('[AuthContext] Failed to fetch user profile:', err?.message || err);
      // Fallback to cached profile if available
      return await loadCachedProfile();
    }
  };

  // Listen for Authentication state changes (both Admin session & Firebase Auth)
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // 1. Check for stored Admin Session
      const storedAdmin = await adminService.getStoredAdminSession();
      if (storedAdmin && isMounted) {
        const isStillValid = await adminService.verifySession();
        if (isStillValid && isMounted) {
          const adminProfile: UserProfile = {
            uid: 'admin_sys_master',
            name: storedAdmin.user.name || 'System Administrator',
            email: storedAdmin.user.email || 'admin@gmail.com',
            role: 'Admin',
            phone: '+91 94431 00000',
            createdAt: new Date().toISOString(),
          };
          setUser({
            uid: adminProfile.uid,
            email: adminProfile.email,
            displayName: adminProfile.name,
          } as any);
          setUserProfile(adminProfile);
          await saveCachedProfile(adminProfile);
          setIsLoading(false);
          return;
        } else {
          await adminService.logout();
        }
      }

      // 2. Fall back to cached profile for instant zero-flicker restoration for standard roles
      const cached = await loadCachedProfile();
      if (isMounted && cached && !userProfile) {
        // Admin access is strictly protected and requires verified backend session above
        if (cached.role !== 'Admin') {
          setUserProfile(cached);
        }
      }

      // 3. Listen to Firebase Auth state for regular users
      try {
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;

          if (firebaseUser) {
            setUser(firebaseUser);
            const profile = await fetchUserProfile(firebaseUser.uid);
            if (isMounted) {
              setUserProfile(profile);
              setIsLoading(false);
            }
          } else {
            // Only clear if not currently authenticated as admin
            if (userProfile?.role !== 'Admin') {
              setUser(null);
              setUserProfile(null);
              await saveCachedProfile(null);
            }
            if (isMounted) {
              setIsLoading(false);
            }
          }
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.warn('[AuthContext] Firebase Auth not configured:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const adminLogin = async (
    usernameOrEmail: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await adminService.login(usernameOrEmail, pass);
      if (res.success && res.adminUser) {
        const adminProfile: UserProfile = {
          uid: 'admin_sys_master',
          name: res.adminUser.name || 'System Administrator',
          email: res.adminUser.email || usernameOrEmail,
          role: 'Admin',
          phone: '+91 94431 00000',
          createdAt: new Date().toISOString(),
        };
        setUser({
          uid: adminProfile.uid,
          email: adminProfile.email,
          displayName: adminProfile.name,
        } as any);
        setUserProfile(adminProfile);
        await saveCachedProfile(adminProfile);
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid administrator credentials.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Administrator authentication failed.' };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    // Check if user is attempting Admin login (e.g. admin@gmail.com / admin)
    if (
      trimmedEmail.toLowerCase() === 'admin@gmail.com' ||
      trimmedEmail.toLowerCase() === 'admin'
    ) {
      return await adminLogin(trimmedEmail, trimmedPass);
    }

    try {
      const auth = getFirebaseAuth();
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
      const profile = await fetchUserProfile(cred.user.uid);
      setUser(cred.user);
      setUserProfile(profile);
      return { success: true };
    } catch (err: any) {
      // If Firebase rejects but credentials match admin portal, check admin backend
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        const adminTry = await adminService.login(trimmedEmail, trimmedPass);
        if (adminTry.success && adminTry.adminUser) {
          return await adminLogin(trimmedEmail, trimmedPass);
        }
      }
      const friendlyMessage = getFriendlyAuthErrorMessage(err.code || '');
      return { success: false, error: friendlyMessage };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());

      // Save user document matching the exact schema established in Flutter:
      // users/{uid} -> { name, email, role, createdAt }
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        role,
      };

      await setDoc(doc(db, 'users', cred.user.uid), {
        name: newProfile.name,
        email: newProfile.email,
        role: newProfile.role,
        createdAt: serverTimestamp(),
      });

      await saveCachedProfile(newProfile);
      setUser(cred.user);
      setUserProfile(newProfile);
      return { success: true };
    } catch (err: any) {
      const friendlyMessage = getFriendlyAuthErrorMessage(err.code || '');
      return { success: false, error: friendlyMessage };
    }
  };

  const updateUserProfile = async (updates: {
    name?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    try {
      const db = getFirebaseFirestore();
      const userRef = doc(db, 'users', user.uid);

      const firestoreUpdates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };

      if (updates.name !== undefined) {
        firestoreUpdates.name = updates.name.trim();
      }
      if (updates.phone !== undefined) {
        firestoreUpdates.phone = updates.phone.trim();
      }

      await updateDoc(userRef, firestoreUpdates);

      // Update Firebase Auth display name if name was changed
      if (updates.name) {
        try {
          await firebaseUpdateProfile(user, { displayName: updates.name.trim() });
        } catch (nameErr) {
          console.warn('[AuthContext] Could not update auth displayName:', nameErr);
        }
      }

      const updatedProfile: UserProfile = {
        ...(userProfile || {
          uid: user.uid,
          email: user.email || '',
          role: 'Farmer',
        }),
        name: updates.name !== undefined ? updates.name.trim() : userProfile?.name || 'User',
        phone: updates.phone !== undefined ? updates.phone.trim() : userProfile?.phone,
      };

      setUserProfile(updatedProfile);
      await saveCachedProfile(updatedProfile);
      return { success: true };
    } catch (err: any) {
      console.warn('[AuthContext] Error updating profile:', err?.message || err);
      return {
        success: false,
        error: err.message || 'Failed to update profile in database',
      };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (userProfile?.role === 'Admin') {
        await adminService.logout();
      } else {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
      }
    } catch (err: any) {
      console.warn('[AuthContext] Error signing out:', err?.message || err);
    } finally {
      await adminService.logout();
      await saveCachedProfile(null);
      setUser(null);
      setUserProfile(null);
    }
  };

  const isAdmin = userProfile?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
