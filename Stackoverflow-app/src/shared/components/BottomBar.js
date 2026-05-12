import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const tabs = [
  { key: 'Home', label: 'Home', icon: 'home' },
  { key: 'Questions', label: 'Questions', icon: 'message-square' },
  { key: 'Ask', label: '', icon: 'plus' },
  { key: 'Notification', label: 'Notice', icon: 'bell' },
  { key: 'Profile', label: 'Profile', icon: 'user' },
];

export default function BottomBar({ state, navigation }) {
  return (
    <View style={styles.wrapper}>
      {tabs.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.key);
        const routeIndex = state.routes.indexOf(route);
        const isActive = routeIndex >= 0 && state.index === routeIndex;
        const isPrimary = tab.key === 'Ask';

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => navigation.navigate(tab.key)}
            activeOpacity={0.75}
          >
            <View style={isPrimary ? styles.plusButton : null}>
              <Feather
                name={tab.icon}
                size={isPrimary ? 24 : 20}
                color={isPrimary ? '#fff' : isActive ? '#F97316' : '#6A737C'}
              />
            </View>
            {!isPrimary && (
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E6E8',
    paddingTop: 6,
    paddingBottom: Platform.OS === 'android' ? 50 : 8,
    paddingHorizontal: 6,
    alignItems: 'flex-end',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#6A737C',
  },
  tabLabelActive: {
    color: '#F97316',
    fontWeight: '700',
  },
});