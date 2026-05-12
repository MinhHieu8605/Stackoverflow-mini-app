import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import AppNavigator from './src/shared/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}
