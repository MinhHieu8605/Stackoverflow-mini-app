import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import useApprovals from '../hooks/useApprovals';

export default function ApproveQuestionsScreen({ navigation }) {
  const {
    questions,
    loading,
    refreshing,
    processing,
    totalCount,
    refreshQuestions,
    approveQuestion,
    rejectQuestion,
  } = useApprovals();

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (questionId) => {
    try {
      await approveQuestion(questionId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleRejectPress = (question) => {
    setSelectedQuestion(question);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    try {
      await rejectQuestion(selectedQuestion.id, rejectionReason);
      setRejectModalVisible(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#232629" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Approve Questions</Text>
          <View style={styles.headerRight}>
            <Text style={styles.countBadge}>{totalCount}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshQuestions} />}
        >
          {questions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="check-circle-outline" size={64} color="#9FA6AD" />
              <Text style={styles.emptyText}>No pending questions</Text>
              <Text style={styles.emptySubtext}>All questions have been reviewed</Text>
            </View>
          ) : (
            questions.map((item) => (
              <View key={item.id} style={styles.questionCard}>
                {/* Question Info */}
                <View style={styles.questionHeader}>
                  <View style={styles.userInfo}>
                    {item.avatarUrl ? (
                      <Image source={{ uri: item.avatarUrl }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {item.userName ? item.userName.charAt(0).toUpperCase() : '?'}
                        </Text> 
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.userName || 'Unknown'}</Text>
                      <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.questionTitle}>{item.title}</Text>
                <Text style={styles.questionBody} numberOfLines={3}>
                  {item.body}
                </Text>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="thumb-up-outline" size={16} color="#6A737C" />
                    <Text style={styles.statText}>{item.voteCount || 0} votes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="eye-outline" size={16} color="#6A737C" />
                    <Text style={styles.statText}>{item.viewCount || 0} views</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectPress(item)}
                    disabled={processing}
                  >
                    <Feather name="x" size={18} color="#fff" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(item.id)}
                    disabled={processing}
                  >
                    <Feather name="check" size={18} color="#fff" />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Reject Modal */}
        <Modal
          visible={rejectModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRejectModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reject Question</Text>
              <Text style={styles.modalSubtitle}>
                Please provide a reason for rejecting this question
              </Text>

              <TextInput
                style={styles.textArea}
                placeholder="Enter rejection reason..."
                placeholderTextColor="#9FA6AD"
                multiline
                numberOfLines={4}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setRejectModalVisible(false)}
                  disabled={processing}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleRejectConfirm}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Reject</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6E8',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#232629',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: '#FF5252',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#232629',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6A737C',
    marginTop: 8,
  },
  questionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E3E6E8',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#232629',
  },
  postDate: {
    fontSize: 12,
    color: '#6A737C',
    marginTop: 2,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232629',
    marginBottom: 8,
  },
  questionBody: {
    fontSize: 14,
    color: '#6A737C',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E1ECF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#39739D',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E3E6E8',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6A737C',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
  },
  rejectButton: {
    backgroundColor: '#FF5252',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#5FAD56',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#232629',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6A737C',
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E3E6E8',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#232629',
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#E3E6E8',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#232629',
  },
  modalConfirmButton: {
    backgroundColor: '#FF5252',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
