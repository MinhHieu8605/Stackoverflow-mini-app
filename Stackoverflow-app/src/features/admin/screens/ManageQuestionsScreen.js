import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Pagination from '../../../shared/components/Pagination';
import useManageQuestions from '../hooks/useManageQuestions';
import { toFullUrl } from '../../../shared/utils/api';

const QUESTION_TYPES = [
  { value: 1, label: 'Troubleshooting' },
  { value: 2, label: 'Tooling' },
  { value: 3, label: 'Best Practices' },
  { value: 4, label: 'General' },
];

export default function ManageQuestionsScreen() {
  const {
    questions,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    updateQuestion,
    deleteQuestion,
  } = useManageQuestions();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
    questionType: 4,
  });

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      title: question.title || '',
      body: question.body || '',
      tags: Array.isArray(question.tags) ? question.tags.join(', ') : '',
      questionType: question.questionType || 4,
    });
    setModalVisible(true);
  };

  const handleDelete = async (question) => {
    try {
      await deleteQuestion(question);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleSubmit = async () => {
    try {
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await updateQuestion(selectedQuestion.id, {
        title: formData.title,
        body: formData.body,
        tags,
        questionType: formData.questionType,
      });
      setModalVisible(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const getQuestionTypeLabel = (type) => {
    const found = QUESTION_TYPES.find((t) => t.value === type);
    return found ? found.label : 'General';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderQuestionItem = ({ item }) => (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.userInfo}>
          {item.avatarUrl ? (
            <Image source={{ uri: toFullUrl(item.avatarUrl) }} style={styles.avatarCircle} />
          ) : (
            <View style={styles.avatarCircle}>
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
        <View style={styles.questionActions}>
          <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleEdit(item)}>
            <Feather name="edit-3" size={18} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleDelete(item)}>
            <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.questionTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.questionBody} numberOfLines={2}>
        {item.body}
      </Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Feather name="thumbs-up" size={14} color="#6A737C" />
          <Text style={styles.statText}>{item.voteCount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Feather name="message-square" size={14} color="#6A737C" />
          <Text style={styles.statText}>{item.answerCount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Feather name="eye" size={14} color="#6A737C" />
          <Text style={styles.statText}>{item.viewCount || 0}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{getQuestionTypeLabel(item.questionType)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Questions</Text>
          <Text style={styles.subtitle}>Manage community questions</Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderQuestionItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="help-circle" size={60} color="#E2E8F0" />
              <Text style={styles.emptyText}>No questions found</Text>
            </View>
          }
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Question</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGap}>
                <InputField
                  label="Title"
                  icon="file-text"
                  value={formData.title}
                  onChange={(t) => setFormData({ ...formData, title: t })}
                />
                <InputField
                  label="Body"
                  icon="align-left"
                  value={formData.body}
                  onChange={(t) => setFormData({ ...formData, body: t })}
                  multiline
                />
                <InputField
                  label="Tags (comma separated)"
                  icon="tag"
                  value={formData.tags}
                  onChange={(t) => setFormData({ ...formData, tags: t })}
                />

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Question Type</Text>
                  <View style={styles.typeSelector}>
                    {QUESTION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.typeOption,
                          formData.questionType === type.value && styles.typeOptionActive,
                        ]}
                        onPress={() => setFormData({ ...formData, questionType: type.value })}
                      >
                        <Text
                          style={[
                            styles.typeOptionText,
                            formData.questionType === type.value && styles.typeOptionTextActive,
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const InputField = ({ label, icon, value, onChange, multiline }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.fieldInputWrapper, multiline && styles.fieldInputWrapperMultiline]}>
      <Feather name={icon} size={16} color="#94A3B8" style={multiline && styles.iconTop} />
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#CBD5E1"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  searchWrapper: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F97316',
  },
  userDetails: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  postDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  questionActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionIconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  questionBody: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E1ECF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#39739D',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6A737C',
    fontWeight: '500',
  },
  typeBadge: {
    marginLeft: 'auto',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C2410C',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  inputGap: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  fieldInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  fieldInputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  iconTop: {
    marginTop: 2,
  },
  fieldInput: {
    flex: 1,
    height: 44,
    marginLeft: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  fieldInputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeOptionActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 30,
    marginBottom: 20,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 16,
  },
});
