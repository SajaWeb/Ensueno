'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { INITIAL_USER_PROFILE } from '@/data/mockData';

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  toggleSavedItem: (productId: string) => void;
  isSaved: (productId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ensueno_user_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading profile from localStorage', e);
    }
  }, []);

  const saveProfileToStorage = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('ensueno_user_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    saveProfileToStorage(newProfile);
  };

  const toggleSavedItem = (productId: string) => {
    const saved = profile.savedItemIds || [];
    const exists = saved.includes(productId);
    const newSaved = exists
      ? saved.filter((id) => id !== productId)
      : [...saved, productId];
    updateProfile({ savedItemIds: newSaved });
  };

  const isSaved = (productId: string) => {
    return (profile.savedItemIds || []).includes(productId);
  };

  return (
    <UserContext.Provider
      value={{
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
