'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { INITIAL_USER_PROFILE } from '@/data/mockData';
import { apiService } from '@/services/api';

interface UserContextType {
  currentUser: any;
  isAuthenticated: boolean;
  loadingUser: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  toggleSavedItem: (productId: string) => void;
  isSaved: (productId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    setLoadingUser(true);
    try {
      const res = await apiService.getCurrentUser();
      if (res.success && res.authenticated && res.user) {
        setCurrentUser(res.user);
        if (res.user.profile?.fullName) {
          setProfile((prev) => ({
            ...prev,
            name: res.user.profile.fullName,
            email: res.user.email,
            phone: res.user.profile.phone || '',
          }));
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      localStorage.removeItem('ensueno_customer_logged_in');
    } catch (e) {
      console.error('Error durante logout:', e);
    } finally {
      setCurrentUser(null);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const toggleSavedItem = (productId: string) => {
    const saved = profile.savedItemIds || [];
    const exists = saved.includes(productId);
    const newSaved = exists ? saved.filter((id) => id !== productId) : [...saved, productId];
    updateProfile({ savedItemIds: newSaved });
  };

  const isSaved = (productId: string) => {
    return (profile.savedItemIds || []).includes(productId);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loadingUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        refreshUser,
        logout,
        profile,
        updateProfile,
        toggleSavedItem,
        isSaved,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser utilizado dentro de UserProvider');
  }
  return context;
}
