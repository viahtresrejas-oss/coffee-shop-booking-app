import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BookingProvider } from './src/contexts/BookingContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/db';

export default function App() {
  useEffect(() => {
    try {
      initDatabase();
    } catch (e) {
      console.warn('[App] initDatabase failed:', e);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <BookingProvider>
        <ProfileProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </ProfileProvider>
      </BookingProvider>
    </SafeAreaProvider>
  );
}
