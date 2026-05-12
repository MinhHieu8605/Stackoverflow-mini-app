import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <AntDesign name="aliwangwang" size={80} color="#F48225" />
        </View>

        {/* Brand Name */}
        <View style={styles.brandRow}>
          <Text style={styles.titleLight}>stack</Text>
          <Text style={styles.titleBold}>overflow</Text>
        </View>
        
        <Text style={styles.tagline}>Where developers learn, share, & build.</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#F48225" />
        <Text style={styles.version}>Minh Hieu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: "#F48225",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLight: {
    fontSize: 38,
    fontWeight: '300',
    color: '#232629',
    letterSpacing: -1,
  },
  titleBold: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#232629',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: '#6A737C',
    marginTop: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#BCBBBB',
    marginTop: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});