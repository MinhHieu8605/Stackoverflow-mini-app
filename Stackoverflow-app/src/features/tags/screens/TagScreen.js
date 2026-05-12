import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import TagService from '../services/TagService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // Tính toán độ rộng card để chia 2 cột đều nhau

export default function TagScreen() {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('popular'); // 'popular', 'name', 'new'

  useEffect(() => {
    loadTags();
  }, []);

  // Sử dụng useMemo để tối ưu việc lọc và sắp xếp, tránh re-render thừa
  const filteredTags = useMemo(() => {
    let result = tags;

    // Lọc theo search query
    if (searchQuery.trim()) {
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sắp xếp theo sortType
    const sorted = [...result];
    if (sortType === 'popular') {
      sorted.sort((a, b) => b.usageCount - a.usageCount);
    } else if (sortType === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'new') {
      sorted.sort((a, b) => b.id - a.id);
    }

    return sorted;
  }, [searchQuery, tags, sortType]);

  const loadTags = async () => {
    try {
      setError(null);
      const response = await TagService.searchTags();
      setTags(response || []);
    } catch (err) {
      setError(err.message || 'Failed to load tags');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTags();
  };

  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const renderTagItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tagCard}
      activeOpacity={0.7}
    >
      <View style={styles.tagTopContent}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagName} numberOfLines={1}>{item.name}</Text>
        </View>

        <Text style={styles.tagDescription} numberOfLines={4}>
          {item.description || "No description available for this tag."}
        </Text>
      </View>

      <View style={styles.tagFooter}>
        <View style={styles.tagStat}>
          <Text style={styles.tagCount}>{formatCount(item.usageCount)}</Text>
          <Text style={styles.tagLabel}>questions</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.pageTitle}>Tags</Text>
        <Text style={styles.subtitle}>
          A tag is a keyword or label that categorizes your question with other, similar questions.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#838C95" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by tag name"
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

      <View style={styles.tabsGroup}>
        {['Popular', 'Name', 'New'].map((tab, index) => {
          const tabValue = tab.toLowerCase();
          const isActive = sortType === tabValue;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.7}
              onPress={() => setSortType(tabValue)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
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
      data={filteredTags}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderTagItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F97316" />
      }
      ListEmptyComponent={
        <View style={styles.centerState}>
          <Feather name={error ? "alert-circle" : "inbox"} size={48} color="#838C95" />
          <Text style={styles.emptyText}>
            {error || (searchQuery ? 'No tags found matching your search' : 'No tags available')}
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E3E6E8',
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 15,
  },
  tabsGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F2F3',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  tabText: { fontSize: 13, color: '#525960', fontWeight: '500' },
  tabTextActive: { color: '#0C0D0E', fontWeight: '600' },
  
  // Grid Layout
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tagCard: {
    width: CARD_WIDTH,
    height: 180, // Chiều cao cố định để các card luôn bằng nhau
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3E6E8',
    justifyContent: 'space-between', 
  },
  tagTopContent: {
    flex: 1,
  },
  tagBadge: {
    backgroundColor: '#E1ECF4',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  tagName: {
    color: '#39739D',
    fontSize: 13,
    fontWeight: '600',
  },
  tagDescription: {
    fontSize: 12,
    color: '#6A737C',
    lineHeight: 18,
  },
  tagFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F2F3',
    paddingTop: 8,
    marginTop: 8,
  },
  tagStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tagCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C0D0E',
    marginRight: 4,
  },
  tagLabel: {
    fontSize: 11,
    color: '#6A737C',
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