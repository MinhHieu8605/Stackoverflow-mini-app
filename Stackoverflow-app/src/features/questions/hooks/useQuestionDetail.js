import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import QuestionService from '../services/questionService';
import VoteService from '../services/VoteService';
import CommentService from '../services/CommentService';

export default function useQuestionDetail(questionId) {
  const [questionDetail, setQuestionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchQuestionDetail();
  }, [questionId]);

  const fetchQuestionDetail = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await QuestionService.getQuestionDetail(questionId);

      // Debug: check if answers have avatarUrl
      console.log('Question detail data:', data);
      if (data.answers && data.answers.length > 0) {
        console.log('First answer:', data.answers[0]);
        console.log('First answer avatarUrl:', data.answers[0].avatarUrl);
      }

      setQuestionDetail(data);

      await loadComments(data.question.id);
      for (const answer of data.answers || []) {
        await loadComments(answer.id);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadComments = async (postId) => {
    try {
      const commentList = await CommentService.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentList }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleVote = async (voteType, postId) => {
    try {
      await VoteService.votePost(postId, voteType);
      fetchQuestionDetail(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Operation failed');
    }
  };

  const handleSubmitComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      await CommentService.createComment(postId, commentText.trim());
      await loadComments(postId);
      return true;
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to post comment');
      return false;
    }
  };

  const handleSubmitAnswer = async (answerText) => {
    if (!answerText.trim()) {
      Alert.alert('Notice', 'Please enter your answer');
      return false;
    }
    try {
      await QuestionService.createAnswer(questionId, answerText.trim());
      Alert.alert('Success', 'Your answer has been posted!');
      fetchQuestionDetail();
      return true;
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to post answer');
      return false;
    }
  };

  return {
    questionDetail,
    loading,
    comments,
    handleVote,
    handleSubmitComment,
    handleSubmitAnswer,
  };
}
