import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from '../../auth/hooks/useAuth';
import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, loading: authLoading, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [stats, setStats] = useState({ reputation: 0, answers: 0, questions: 0 });

  const loadStats = React.useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const token = await AuthService.getToken();
      const opts = { method: 'GET', token };
      const [profileRes, questionsRes, answersRes] = await Promise.all([
        apiRequest(`/api/users/${user.id}`, opts),
        apiRequest(`/api/posts?pageSize=1&userId=${user.id}`, opts),
        apiRequest(`/api/posts?pageSize=1&userId=${user.id}&postType=2`, opts),
      ]);

      setStats({
        reputation: profileRes?.reputation ?? 0,
        answers: answersRes?.totalCount ?? 0,
        questions: questionsRes?.totalCount ?? 0,
      });
    } catch (error) {
      console.error('Failed to load profile stats:', error);
    }
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && refreshUser) {
        refreshUser();
      }
      if (isAuthenticated) {
        loadStats();
      }
    }, [isAuthenticated, refreshUser, loadStats])
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigation.navigate('LoginScreen');
    }
  }, [isAuthenticated, authLoading, navigation]);

  const handleLogout = async () => {
    await logout();
    navigation.navigate('LoginScreen');
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* --- Header Section --- */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.avatarWrapper}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</Text>
                  </View>
                )}
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.name}>{user?.displayName || 'To Minh Hieu'}</Text>
                <View style={styles.infoList}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="cake-variant-outline" size={14} color="#838C95" />
                    <Text style={styles.infoText}>Member for 3 months</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather name="clock" size={12} color="#838C95" />
                    <Text style={styles.infoText}>Last seen recently</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={20} color="#FF5252" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <MaterialCommunityIcons name="pencil-outline" size={16} color="#4A4A4A" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* --- Modern Pill Tabs --- */}
          <View style={styles.tabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {['Profile', 'Activity', 'Saves', 'Settings'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabPill, activeTab === tab && styles.activeTabPill]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* --- Stats Section --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stats Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.reputation}</Text>
                <Text style={styles.statLabel}>Reputation</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.answers}</Text>
                <Text style={styles.statLabel}>Answers</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.questions}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
            </View>
          </View>

          {/* --- About Section --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              {user?.aboutMe ? (
                <Text style={styles.aboutTextContent}>{user.aboutMe}</Text>
              ) : (
                <>
                  <View style={styles.aboutEmptyIcon}>
                    <Feather name="user" size={24} color="#BFC5C9" />
                  </View>
                  <Text style={styles.aboutText}>
                    Your about me section is currently blank.
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')}>
                    <Text style={styles.aboutLink}>Add a short bio</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* --- Badges Section --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges</Text>

            <View style={styles.badgesRow}>
              {/* Unearned Gold */}
              <View style={[styles.badgeCard, styles.badgeCardDashed]}>
                <View style={[styles.badgeIconCircle, { backgroundColor: '#FFF9E6' }]}>
                  <MaterialCommunityIcons name="medal-outline" size={26} color="#FFCC00" />
                </View>
                <Text style={styles.badgeEmptyText}>Score 100+ on an answer</Text>
                <TouchableOpacity style={styles.badgeCTAOutline}>
                  <Text style={styles.badgeCTATextOutline}>Earn Gold</Text>
                </TouchableOpacity>
              </View>

              {/* Unearned Silver */}
              <View style={[styles.badgeCard, styles.badgeCardDashed]}>
                <View style={[styles.badgeIconCircle, { backgroundColor: '#F8F9F9' }]}>
                  <MaterialCommunityIcons name="medal-outline" size={26} color="#B4B8BC" />
                </View>
                <Text style={styles.badgeEmptyText}>Score 25+ on a question</Text>
                <TouchableOpacity style={styles.badgeCTAOutline}>
                  <Text style={styles.badgeCTATextOutline}>Earn Silver</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Earned Bronze */}
            <View style={styles.earnedBadgeCard}>
              <View style={styles.earnedBadgeHeader}>
                <View style={styles.earnedBadgeLeft}>
                  <View style={[styles.badgeIconSmall, { backgroundColor: '#FFF5ED' }]}>
                    <MaterialCommunityIcons name="medal" size={20} color="#D1A684" />
                  </View>
                  <View>
                    <Text style={styles.badgeCountText}>1 <Text style={styles.earnedBadgeSubText}>bronze badge</Text></Text>
                  </View>
                </View>
                <Text style={styles.badgeDate}>Jan 16</Text>
              </View>

              <TouchableOpacity style={styles.badgeDetail}>
                <View style={styles.badgeDetailLeft}>
                  <View style={styles.dotIndicator} />
                  <Text style={styles.badgeDetailName}>Supporter</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#9FA6AD" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Nền tổng thể sáng và hiện đại hơn
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  scrollView: {
    flex: 1,
  },
  // Header Styles
  headerCard: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 6,
  },
  infoList: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6A737C',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9F9',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  // Tabs Styles
  tabsWrapper: {
    marginBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 10,
    gap: 5,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3E6E8',
  },
  activeTabPill: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    color: '#6A737C',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  // General Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E3E6E8',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1D20',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6A737C',
    fontWeight: '500',
  },
  // About
  aboutEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#6A737C',
    textAlign: 'center',
    marginBottom: 8,
  },
  aboutTextContent: {
    fontSize: 15,
    color: '#232629',
    lineHeight: 22,
  },
  aboutLink: {
    color: '#EA580C',
    fontWeight: '600',
    fontSize: 14,
  },
  // Badges
  badgesRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  badgeCardDashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D6D9DC',
    backgroundColor: '#FAFAFA',
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeEmptyText: {
    fontSize: 13,
    color: '#6A737C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    height: 36, // Giữ độ cao cố định để 2 thẻ cân bằng
  },
  badgeCTAOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3E6E8',
    backgroundColor: '#fff',
    width: '100%',
    alignItems: 'center',
  },
  badgeCTATextOutline: {
    fontSize: 13,
    color: '#3B4045',
    fontWeight: '600',
  },
  earnedBadgeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  earnedBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  earnedBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1D20',
  },
  earnedBadgeSubText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6A737C',
  },
  badgeDate: {
    fontSize: 13,
    color: '#9FA6AD',
  },
  badgeDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9F9',
    borderRadius: 12,
  },
  badgeDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1A684',
  },
  badgeDetailName: {
    fontSize: 14,
    color: '#1A1D20',
    fontWeight: '600',
  },
});