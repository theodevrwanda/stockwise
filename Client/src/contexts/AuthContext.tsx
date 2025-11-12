// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import { AuthState, User, Business, Branch } from '@/types';
import axios from 'axios';

/* -----------------------------------------------------------------
   Context type – fully typed from shared interfaces
   ----------------------------------------------------------------- */
interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

/* -----------------------------------------------------------------
   Provider
   ----------------------------------------------------------------- */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    token: undefined,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timestampToDate = (ts: any): Date => (ts?.toDate ? ts.toDate() : new Date());

  /* ------------------- fetch business ------------------- */
  const getBusinessFromFirestore = async (businessId: string): Promise<Business | null> => {
    try {
      const snap = await getDoc(doc(db, 'businesses', businessId));
      if (!snap.exists()) return null;
      const d = snap.data();
      return {
        id: snap.id,
        cell: d.cell ?? '',
        district: d.district ?? '',
        duration: d.duration ?? '',
        name: d.name ?? '',
        photo: d.photo ?? null,
        plan: d.plan as Business['plan'],
        sector: d.sector ?? '',
        village: d.village ?? '',
        isActive: d.is_active ?? false,
        createdAt: timestampToDate(d.created_at),
        updatedAt: timestampToDate(d.updated_at),
        startDate: timestampToDate(d.start_date),
        endDate: timestampToDate(d.end_date),
      };
    } catch (e) {
      console.error('Error fetching business:', e);
      return null;
    }
  };

  /* ------------------- fetch user ------------------- */
  const getUserFromFirestore = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userSnap.exists()) {
        setErrorMessage('User record not found. Contact support.');
        await signOut(auth);
        return null;
      }

      const raw = userSnap.data();

      // Required fields
      const required = ['first_name', 'last_name', 'email', 'role', 'is_active', 'business_id'];
      const missing = required.filter((f) => raw[f] == null);
      if (missing.length) {
        setErrorMessage(`Missing: ${missing.join(', ')}`);
        await signOut(auth);
        return null;
      }

      if (!['admin', 'staff'].includes(raw.role)) {
        setErrorMessage('Invalid role.');
        await signOut(auth);
        return null;
      }

      if (!raw.is_active) {
        setErrorMessage('Account not activated.');
        await signOut(auth);
        return null;
      }

      const businessId: string = raw.business_id;
      const business = await getBusinessFromFirestore(businessId);
      if (!business) {
        setErrorMessage('Business not found.');
        await signOut(auth);
        return null;
      }

      // Default branch = business location
      const branch: Branch = {
        id: businessId,
        name: `${business.name} - Main Branch`,
        district: business.district,
        sector: business.sector,
        cell: business.cell,
        village: business.village,
      };

      const fullUser: User = {
        id: firebaseUser.uid,
        email: raw.email ?? firebaseUser.email!,
        firstName: raw.first_name,
        lastName: raw.last_name,
        fullName: `${raw.first_name} ${raw.last_name}`.trim(),
        role: raw.role,
        businessId,
        business,
        branch,
        isActive: raw.is_active,
        phone: raw.phone ?? null,
        gender: raw.gender ?? null,
        profileImage: raw.photo ?? firebaseUser.photoURL ?? null,
        createdAt: timestampToDate(raw.created_at),
        updatedAt: timestampToDate(raw.updated_at),
      };

      return fullUser;
    } catch (e) {
      console.error('Fatal error loading user:', e);
      setErrorMessage('Failed to load user data.');
      return null;
    }
  };

  /* ------------------- auth listener ------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        const appUser = await getUserFromFirestore(fbUser);

        if (appUser) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setAuthState({
            user: appUser,
            isAuthenticated: true,
            loading: false,
            token,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
            token: undefined,
          });
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          token: undefined,
        });
      }
    });
    return () => unsub();
  }, []);

  /* ------------------- actions ------------------- */
  const login = async (identifier: string, password: string): Promise<boolean> => {
    setAuthState((p) => ({ ...p, loading: true }));
    setErrorMessage(null);

    try {
      if (!identifier.includes('@')) {
        setErrorMessage('Use your email address.');
        setAuthState((p) => ({ ...p, loading: false }));
        return false;
      }
      await signInWithEmailAndPassword(auth, identifier, password);
      return true;
    } catch (err: any) {
      const msg =
        {
          'auth/user-not-found': 'No account found.',
          'auth/wrong-password': 'Incorrect password.',
          'auth/invalid-email': 'Invalid email.',
          'auth/too-many-requests': 'Too many attempts.',
        }[err.code] ?? 'Login failed.';
      setErrorMessage(msg);
      setAuthState((p) => ({ ...p, loading: false }));
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthState((p) => ({ ...p, loading: true }));
    setErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (err: any) {
      const msg =
        {
          'auth/popup-closed-by-user': 'Login cancelled.',
          'auth/popup-blocked': 'Popup blocked.',
        }[err.code] ?? 'Google login failed.';
      setErrorMessage(msg);
      setAuthState((p) => ({ ...p, loading: false }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Logout error:', e);
    }
    setErrorMessage(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const msg =
        {
          'auth/user-not-found': 'No account found.',
          'auth/invalid-email': 'Invalid email.',
        }[err.code] ?? 'Failed to send reset email.';
      throw new Error(msg);
    }
  };

  const updateUser = (patch: Partial<User>) => {
    if (authState.user) {
      setAuthState((p) => ({
        ...p,
        user: { ...p.user!, ...patch } as User,
      }));
    }
  };

  const clearError = () => setErrorMessage(null);

  /* ------------------- provider value ------------------- */
  const value: AuthContextType = {
    ...authState,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    resetPassword,
    errorMessage,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};