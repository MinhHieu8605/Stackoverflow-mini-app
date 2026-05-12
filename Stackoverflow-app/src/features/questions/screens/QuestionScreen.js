import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useQuestions from '../hooks/useQuestions';
import Pagination from '../../../shared/components/Pagination';
import { toFullUrl } from '../../../shared/utils/api';

export default function QuestionScreen() {
  const navigation = useNavigation();
  const [sortType, setSortType] = useState('newest'); // 'newest', 'unanswered'
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const {
    questions,
    loading,
    refreshing,
    error,
    currentPage,
    totalPages,
    totalCount,
    refreshQuestions,
    goToPage,
  } = useQuestions({ pageSize: 2 });

  // Lọc và sắp xếp questions
  const filteredQuestions = questions
    .filter(q => {
      const matchTitle = !filterTitle || q.title.toLowerCase().includes(filterTitle.toLowerCase());
      const matchTag = !filterTag || (q.tags && q.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())));
      return matchTitle && matchTag;
    })
    .filter(q => {
      if (sortType === 'unanswered') {
        return q.answers === 0;
      }
      return true;
    });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshQuestions} />}
    >
      <View style={styles.headerContainer}>
        {/* Tiêu đề và Nút hành động */}
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.pageTitle}>Newest Questions</Text>
            <Text style={styles.questionCount}>{totalCount.toLocaleString()} questions</Text>
          </View>
          
          <TouchableOpacity
            style={styles.askButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Ask')}
          >
            <Feather name="edit-2" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.askButtonText}>Ask</Text>
          </TouchableOpacity>
        </View>

        {/* Hàng bộ lọc */}
        <View style={styles.filterRow}>
          <View style={styles.tabsGroup}>
            <TouchableOpacity
              style={[styles.tab, sortType === 'newest' && styles.tabActive]}
              activeOpacity={0.7}
              onPress={() => setSortType('newest')}
            >
              <Text style={sortType === 'newest' ? styles.tabTextActive : styles.tabText}>Newest</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, sortType === 'unanswered' && styles.tabActive]}
              activeOpacity={0.7}
              onPress={() => setSortType('unanswered')}
            >
              <Text style={sortType === 'unanswered' ? styles.tabTextActive : styles.tabText}>Unanswered</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.7}
            onPress={() => setFilterVisible(true)}
          >
            <Feather name="sliders" size={14} color="#3B4045" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#F48024" style={{ marginTop: 30 }} />
        ) : null}
        
        {!loading && error ? (
          <View style={styles.centerState}>
            <Feather name="alert-circle" size={32} color="#B42318" style={{ marginBottom: 8 }} />
            <Text style={styles.errorState}>{error}</Text>
          </View>
        ) : null}
        
        {!loading && !error && questions?.length === 0 ? (
          <View style={styles.centerState}>
            <Feather name="inbox" size={32} color="#838C95" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyState}>No questions found.</Text>
          </View>
        ) : null}

        {!loading && !error && filteredQuestions ? filteredQuestions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('QuestionDetailScreen', { questionId: item.id })}
            activeOpacity={0.7}
          >
            
            {/* Tiêu đề & Nội dung */}
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Tags */}
            {item.tags && item.tags.length > 0 ? (
              <View style={styles.tagRow}>
                {item.tags.slice(0, 4).map((tag) => (
                  <View key={`${item.id}-${tag}`} style={styles.tagItem}>
                    <Text style={styles.tagItemText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Thống kê & Tác giả */}
            <View style={styles.cardFooter}>
              <View style={styles.statsGroup}>
                <View style={styles.statItem}>
                  <Feather name="chevron-up" size={16} color="#6A737C" />
                  <Text style={styles.statText}>{item.votes}</Text>
                </View>
                <View style={[styles.statItem, item.answers > 0 && styles.statItemActive]}>
                  <Feather name="message-square" size={13} color={item.answers > 0 ? "#2E6F44" : "#6A737C"} />
                  <Text style={[styles.statText, item.answers > 0 && styles.statTextActive]}>{item.answers}</Text>
                </View>
                <View style={styles.statItem}>
                  <Feather name="eye" size={13} color="#6A737C" />
                  <Text style={styles.statText}>{item.views || 0}</Text>
                </View>
              </View>

              <View style={styles.metaGroup}>
                {item.avatarUrl ? (
                  <Image source={{ uri: toFullUrl(item.avatarUrl) }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.user?.[0]?.toUpperCase() || 'U'}</Text>
                  </View>
                )}
                <Text style={styles.authorText}>{item.user}</Text>
                <Text style={styles.timeText}>{item.createdAt}</Text>
              </View>
            </View>

          </TouchableOpacity>
        )) : null}

        {!loading && !error && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Questions</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Feather name="x" size={24} color="#525960" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Title</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Search by title..."
                placeholderTextColor="#9199A1"
                value={filterTitle}
                onChangeText={setFilterTitle}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Tag</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Search by tag..."
                placeholderTextColor="#9199A1"
                value={filterTag}
                onChangeText={setFilterTag}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setFilterTitle('');
                  setFilterTag('');
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6E8',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  questionCount: {
    fontSize: 14,
    color: '#838C95',
    fontWeight: '500',
  },
  askButton: {
    flexDirection: 'row',
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4, 
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tabsGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F2F3',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#525960',
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: 13,
    color: '#0C0D0E',
    fontWeight: '600',
  },
  filterBtn: {
    backgroundColor: '#F1F2F3',
    padding: 8,
    borderRadius: 8,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  errorState: {
    color: '#B42318',
    fontSize: 15,
    fontWeight: '500',
  },
  emptyState: {
    color: '#6A737C',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E6E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0c0d0e',
    marginBottom: 6,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3F4349',
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagItem: {
    backgroundColor: '#E1ECF4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagItemText: {
    color: '#39739D',
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F2F3',
    paddingTop: 12,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemActive: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: -6, 
  },
  statText: {
    fontSize: 13,
    color: '#6A737C',
    fontWeight: '500',
  },
  statTextActive: {
    color: '#2E6F44',
    fontWeight: '600',
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#D6D9DC',
  },
  avatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  authorText: {
    fontSize: 13,
    color: '#0c0d0e',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#838C95',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C0D0E',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#525960',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E3E6E8',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0C0D0E',
    backgroundColor: '#F8F9F9',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E3E6E8',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#525960',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F97316',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});