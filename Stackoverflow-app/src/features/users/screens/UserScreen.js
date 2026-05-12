import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import UserService from '../services/UserService';
import { toFullUrl } from '../../../shared/utils/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export default function UserScreen() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      const displayName = user.displayName?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      return displayName.includes(keyword) || email.includes(keyword);
    });
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setError(null);
      const response = await UserService.searchUsers({ page: 1, pageSize: 100 });
      setUsers(response?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.avatarWrap}>
        {item.avatarUrl ? (
          <Image source={{ uri: toFullUrl(item.avatarUrl) }} style={styles.avatarCircle} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{item.displayName?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
        )}
      </View>

      <Text style={styles.displayName} numberOfLines={1}>{item.displayName}</Text>
      <Text style={styles.email} numberOfLines={1}>{item.email}</Text>

      <Text style={styles.aboutMe} numberOfLines={3}>
        {item.aboutMe || 'No about me information.'}
      </Text>

      <View style={styles.userFooter}>
        <View style={styles.reputationBadge}>
          <Feather name="star" size={12} color="#F97316" />
          <Text style={styles.reputationText}>{item.reputation || 0}</Text>
        </View>
        <Text style={styles.reputationLabel}>reputation</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.pageTitle}>Users</Text>
        <Text style={styles.subtitle}>Browse community members by display name or email.</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#838C95" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by display name or email"
          placeholderTextColor="#838C95"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Feather name="x" size={18} color="#838C95" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredUsers}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderUserItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F97316" />
      }
      ListEmptyComponent={
        <View style={styles.centerState}>
          <Feather name={error ? 'alert-circle' : 'users'} size={48} color="#838C95" />
          <Text style={styles.emptyText}>
            {error || (searchQuery ? 'No users found matching your search' : 'No users available')}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
    backgroundColor: '#F4F6F8',
    minHeight: '100%',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6E8',
    marginBottom: 12,
  },
  headerTop: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F97316',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6A737C',
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E3E6E8',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userCard: {
    width: CARD_WIDTH,
    height: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3E6E8',
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#E1ECF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F97316',
  },
  avatarText: {
    color: '#39739D',
    fontSize: 22,
    fontWeight: '800',
  },
  displayName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C0D0E',
    textAlign: 'center',
  },
  email: {
    fontSize: 11,
    color: '#39739D',
    marginTop: 4,
    textAlign: 'center',
  },
  aboutMe: {
    flex: 1,
    fontSize: 12,
    color: '#6A737C',
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
  userFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F2F3',
    paddingTop: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  reputationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
  },
  reputationLabel: {
    fontSize: 10,
    color: '#6A737C',
    marginTop: 3,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#6A737C',
    textAlign: 'center',
    fontSize: 15,
  },
});
