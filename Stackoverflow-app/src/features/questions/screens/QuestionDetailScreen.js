import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import useQuestionDetail from '../hooks/useQuestionDetail';
import { toFullUrl } from '../../../shared/utils/api';

export default function QuestionDetailScreen() {
  const navigation = useNavigation();
  const { questionId } = useRoute().params;
  const {
    questionDetail, loading, comments, handleVote, handleSubmitComment, handleSubmitAnswer,
  } = useQuestionDetail(questionId);

  const [answerText, setAnswerText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Logic Handlers
  const onPostAnswer = async () => {
    setSubmitting(true);
    if (await handleSubmitAnswer(answerText)) setAnswerText('');
    setSubmitting(false);
  };

  const onPostComment = async (postId) => {
    if (await handleSubmitComment(postId, commentText)) {
      setCommentText('');
      setShowCommentInput(null);
    }
  };

  // Reusable Comment Component
  const CommentSection = ({ postId }) => (
    <View>
      {showCommentInput === postId && (
        <View style={styles.inlineCommentInput}>
          <TextInput
            style={styles.minimalInput}
            placeholder="Write a comment..."
            placeholderTextColor="#94A3B8"
            value={commentText}
            onChangeText={setCommentText}
            autoFocus
          />
          <TouchableOpacity onPress={() => onPostComment(postId)}>
            <Feather name="send" size={20} color="#F97316" />
          </TouchableOpacity>
        </View>
      )}
      {comments[postId]?.length > 0 && (
        <View style={styles.commentsListContainer}>
          {comments[postId].map((item) => (
            <View key={item.id} style={styles.commentItem}>
              <Text style={styles.commentContentText}>
                <Text style={styles.commentAuthorName}>{item.userName}</Text>
                {": "}{item.content}
              </Text>
              <Text style={styles.commentDateText}>
                {new Date(item.createdAt).toLocaleDateString('en-US')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#F97316" />
    </View>
  );

  const { question, answers = [] } = questionDetail || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Feather name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Question Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Question Card */}
          <View style={styles.mainCard}>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <View style={styles.userInfoRow}>
              {question.avatarUrl ? (
                <Image source={{ uri: toFullUrl(question.avatarUrl) }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{question.userName?.[0]}</Text>
                </View>
              )}
              <View>
                <Text style={styles.userName}>{question.userName}</Text>
                <Text style={styles.dateText}>{new Date(question.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={styles.bodyText}>{question.body}</Text>
            <View style={styles.interactionBar}>
              <View style={styles.voteBox}>
                <TouchableOpacity onPress={() => handleVote(1, question.id)} style={styles.voteBtn}>
                  <Feather name="chevron-up" size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.voteValue}>{question.voteCount || 0}</Text>
                <TouchableOpacity onPress={() => handleVote(-1, question.id)} style={styles.voteBtn}>
                  <Feather name="chevron-down" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.commentTrigger}
                onPress={() => setShowCommentInput(showCommentInput === question.id ? null : question.id)}
              >
                <Feather name="message-square" size={18} color="#F97316" />
                <Text style={styles.commentTriggerText}>Comment</Text>
              </TouchableOpacity>
            </View>
            <CommentSection postId={question.id} />
          </View>

          <Text style={styles.sectionTitle}>{answers.length} Answers</Text>

          {/* Answers List */}
          {answers.map((ans) => (
            <View key={ans.id} style={styles.answerCard}>
              <View style={styles.answerHeader}>
                {ans.avatarUrl ? (
                  <Image source={{ uri: toFullUrl(ans.avatarUrl) }} style={styles.answerAvatar} />
                ) : (
                  <View style={styles.answerAvatarPlaceholder}>
                    <Text style={styles.answerAvatarText}>{ans.userName?.[0]}</Text>
                  </View>
                )}
                <Text style={styles.answerUserName}>{ans.userName}</Text>
              </View>
              <Text style={styles.bodyText}>{ans.body}</Text>
              <View style={styles.answerFooter}>
                <TouchableOpacity onPress={() => handleVote(1, ans.id)} style={styles.miniVote}>
                  <Feather name="thumbs-up" size={16} color="#6B7280" />
                  <Text style={styles.miniVoteText}>{ans.voteCount || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCommentInput(showCommentInput === ans.id ? null : ans.id)}>
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
              </View>
              <CommentSection postId={ans.id} />
            </View>
          ))}

          {/* Answer Input */}
          <View style={styles.replySection}>
            <Text style={styles.replyTitle}>Your Answer</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Write your answer here..."
                placeholderTextColor="#94A3B8"
                value={answerText}
                onChangeText={setAnswerText}
                multiline
              />
            </View>
            <TouchableOpacity 
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={onPostAnswer}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Post Answer</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 18,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bodyText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  voteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  voteBtn: {
    padding: 8,
  },
  voteValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 8,
  },
  commentTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  commentTriggerText: {
    color: '#F97316',
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  answerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  answerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  answerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  answerUserName: {
    fontSize: 15,
    fontWeight: '700',
  },
  answerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  miniVote: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniVoteText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#6B7280',
  },
  replyText: {
    color: '#F97316',
    fontWeight: '700',
  },
  replySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
  },
  replyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  textAreaContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#F97316',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  inlineCommentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginTop: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  minimalInput: {
    flex: 1,
    fontSize: 14,
  },
  commentsListContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E2E8F0',
  },
  commentItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  commentContentText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  commentAuthorName: {
    fontWeight: '700',
    color: '#F97316',
  },
  commentDateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
});