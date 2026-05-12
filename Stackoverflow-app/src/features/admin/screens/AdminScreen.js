import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import useAuth from '../../auth/hooks/useAuth';
import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

export default function AdminScreen({ navigation }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [stats, setStats] = useState({ users: 0, questions: 0, pendingApproval: 0, tags: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const token = await AuthService.getToken();
      const opts = { method: 'GET', token };

      const [usersRes, questionsRes, pendingRes, tagsRes] = await Promise.all([
        apiRequest('/api/users?pageSize=1', opts),
        apiRequest('/api/posts?pageSize=1', opts),
        apiRequest('/api/posts?pageSize=1&approvalStatus=0', opts),
        apiRequest('/api/tags/search', opts).catch(() => []),
      ]);
      console.log('Admin stats fetched:', { usersRes, questionsRes, pendingRes, tagsRes });

      setStats({
        users: usersRes?.totalCount ?? 0,
        questions: questionsRes?.totalCount ?? 0,
        pendingApproval: pendingRes?.totalCount ?? 0,
        tags: Array.isArray(tagsRes) ? tagsRes.length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigation.navigate('LoginScreen');
    }
  }, [isAuthenticated, loading, navigation]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('LoginScreen');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerMain}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="shield-crown" size={48} color="#F97316" />
              </View>
              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>Welcome back, {user?.userName || 'Admin'}</Text>
            </View>
          </View>

          {/* Stats Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="account-group" size={32} color="#EA580C" />
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#EA580C" style={{ marginTop: 8 }} />
                ) : (
                  <Text style={styles.statValue}>{stats.users}</Text>
                )}
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="comment-question" size={32} color="#5FAD56" />
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#5FAD56" style={{ marginTop: 8 }} />
                ) : (
                  <Text style={styles.statValue}>{stats.questions}</Text>
                )}
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="tag-multiple" size={32} color="#F97316" />
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#F97316" style={{ marginTop: 8 }} />
                ) : (
                  <Text style={styles.statValue}>{stats.tags}</Text>
                )}
                <Text style={styles.statLabel}>Tags</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="clock-alert-outline" size={32} color="#FF5252" />
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#FF5252" style={{ marginTop: 8 }} />
                ) : (
                  <Text style={styles.statValue}>{stats.pendingApproval}</Text>
                )}
                <Text style={styles.statLabel}>Pending Approval</Text>
              </View>
            </View>
          </View>

          {/* Management Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ManageUsersScreen')}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="account-multiple" size={24} color="#EA580C" />
                <Text style={styles.menuText}>Manage Users</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9FA6AD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ManageQuestionsScreen')}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="comment-text-multiple" size={24} color="#5FAD56" />
                <Text style={styles.menuText}>Manage Questions</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9FA6AD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ApproveQuestionsScreen')}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="flag-variant" size={24} color="#FF5252" />
                <Text style={styles.menuText}>Approve Questions</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9FA6AD" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="cog" size={24} color="#6A737C" />
                <Text style={styles.menuText}>Settings</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9FA6AD" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutMenuItem} onPress={handleLogout}>
              <View style={styles.menuLeft}>
                <Feather name="log-out" size={24} color="#FF5252" />
                <Text style={styles.logoutMenuText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F2F3',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerMain: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#232629',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6A737C',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#232629',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9F9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#232629',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6A737C',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6E8',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#232629',
    fontWeight: '500',
  },
  logoutMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E3E6E8',
  },
  logoutMenuText: {
    fontSize: 15,
    color: '#FF5252',
    fontWeight: '500',
  },
});
