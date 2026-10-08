import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile as dbGetProfile, saveProfile as dbSaveProfile } from '../services/db';

const PROFILE_KEY = '@nook_profile_v1';

const DEFAULT_PROFILE = {
  name: 'Maya Lin',
  email: 'maya@example.com',
  photo:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
};

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // One-time migration from legacy AsyncStorage profile.
        try {
          const raw = await AsyncStorage.getItem(PROFILE_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            if (saved && typeof saved === 'object') {
              const current = dbGetProfile();
              const isDefault =
                !current ||
                (current.name === DEFAULT_PROFILE.name && current.email === DEFAULT_PROFILE.email);
              if (isDefault) {
                dbSaveProfile({
                  name: saved.name ?? DEFAULT_PROFILE.name,
                  email: saved.email ?? DEFAULT_PROFILE.email,
                  phone: saved.phone ?? DEFAULT_PROFILE.phone ?? '',
                  avatar_uri: saved.photo ?? saved.avatar_uri ?? DEFAULT_PROFILE.photo,
                });
              }
              await AsyncStorage.removeItem(PROFILE_KEY).catch(() => {});
            }
          }
        } catch {
          // Corrupted legacy storage — fall through to SQLite.
        }
        const row = dbGetProfile();
        if (row) {
          setProfile({
            name: row.name ?? DEFAULT_PROFILE.name,
            email: row.email ?? DEFAULT_PROFILE.email,
            phone: row.phone ?? '',
            photo: row.photo ?? row.avatar_uri ?? DEFAULT_PROFILE.photo,
          });
        }
      } catch {
        // DB unavailable — keep defaults so screens never crash.
      }
      setLoaded(true);
    })();
  }, []);

  const updateProfile = async (next) => {
    // FIX (deep-scan): `profile` state captured in closure can be stale when
    // two updates fire quickly (name edit + photo pick). Use a functional
    // merge + ref so no update is lost, and tolerate non-object payloads.
    const patch = next && typeof next === 'object' ? next : {};
    let merged = null;
    setProfile((prev) => {
      merged = { ...(prev ?? DEFAULT_PROFILE), ...patch };
      return merged;
    });
    // `merged` is set synchronously inside the updater above.
    const toPersist = merged ?? { ...DEFAULT_PROFILE, ...patch };
    try {
      // Lab 05: persist to SQLite so avatar URI survives app restarts.
      const saved = dbSaveProfile({
        name: toPersist.name,
        email: toPersist.email,
        phone: toPersist.phone ?? '',
        avatar_uri: toPersist.photo ?? toPersist.avatar_uri ?? '',
      });
      const finalProfile = saved
        ? {
            name: saved.name,
            email: saved.email,
            phone: saved.phone ?? '',
            photo: saved.photo ?? saved.avatar_uri ?? DEFAULT_PROFILE.photo,
          }
        : toPersist;
      setProfile(finalProfile);
      try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(finalProfile));
      } catch {
        // Legacy cache failed — SQLite copy is authoritative.
      }
      return finalProfile;
    } catch {
      // Persistence failed — in-memory copy still updated
    }
    return toPersist;
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
