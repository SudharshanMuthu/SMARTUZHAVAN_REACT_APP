import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AdminUser } from '../types/admin';

interface AuthContextType {
  user: AdminUser | null;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminUser: null,
  isAdmin: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check persistent session on initial mount / page refresh
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const token = localStorage.getItem('@smart_uzhavan_admin_token');
      if (!token) {
        if (isMounted) {
          setAdminUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const session = await api.verifySession();
        if (isMounted) {
          if (session && session.success && session.adminUser?.isAdmin) {
            setAdminUser(session.adminUser);
            setIsAdmin(true);
            setError(null);
          } else {
            localStorage.removeItem('@smart_uzhavan_admin_token');
            setAdminUser(null);
            setIsAdmin(false);
            setError('Session expired or unauthorized.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          // If network failed but token exists, gracefully preserve session
          setAdminUser({
            uid: 'admin',
            email: 'admin@smartuzhavan.com',
            isAdmin: true,
            authMethod: 'LOCAL_SESSION_PRESERVED',
          });
          setIsAdmin(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, pass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(username, pass);
      if (res && res.success && res.token) {
        localStorage.setItem('@smart_uzhavan_admin_token', res.token);
        setAdminUser(res.adminUser);
        setIsAdmin(true);
        setError(null);
      } else {
        const errMsg = res.error || 'Invalid credentials. Access denied.';
        setError(errMsg);
        throw new Error(errMsg);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setAdminUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user: adminUser, adminUser, isAdmin, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
