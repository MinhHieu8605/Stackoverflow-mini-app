import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import useAuth from '../../features/auth/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function TopBar({ onMenuPress }) {
  const navigation = useNavigation();
  const topInset = Platform.OS === 'android' ? 25 : 8;
  const { user } = useAuth();

  return (
    <View style={[styles.wrapper, { paddingTop: topInset }]}>
      <View style={styles.bar}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.6}
          hitSlop={8}
          onPress={onMenuPress}
        >
          <Feather name="menu" size={22} color="#232629" />
        </TouchableOpacity>

          <View style={styles.logoWrap}>
            <AntDesign name="aliwangwang" size={22} style={styles.logoIcon} />
            <Text style={styles.logoTextLight}>Stack</Text>
            <Text style={styles.logoTextBold}>Overflow</Text>
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.6}
              hitSlop={8}
            >
              <Feather name="search" size={20} color="#232629" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarButton}
              activeOpacity={0.6}
              hitSlop={8}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.displayName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F8F9F9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D6D9DC',
  },
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  logoWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  logoIcon: {
    marginRight: 6,
    alignSelf: 'center',
  },
  logoTextLight: {
    fontSize: 18,
    color: '#232629',
  },
  logoTextBold: {
    fontSize: 18,
    color: '#232629',
    fontWeight: '700',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E3E6E8',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E3E6E8',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
