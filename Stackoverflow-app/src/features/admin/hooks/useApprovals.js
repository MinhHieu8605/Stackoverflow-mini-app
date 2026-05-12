import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import ApprovalService from '../services/ApprovalService';

export default function useApprovals(options = {}) {
  const { pageSize = 10 } = options;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadPendingQuestions = useCallback(async (page = 1) => {
    setLoading(true);

    try {
      const response = await ApprovalService.fetchPendingApprovals({ page, pageSize });
      setQuestions(response?.items || []);
      setCurrentPage(response?.page || page);
      setTotalCount(response?.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch pending questions:', error);
      Alert.alert('Error', 'Failed to load pending questions');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const refreshQuestions = useCallback(async () => {
    setRefreshing(true);

    try {
      const response = await ApprovalService.fetchPendingApprovals({
        page: currentPage,
        pageSize
      });
      setQuestions(response?.items || []);
      setTotalCount(response?.totalCount || 0);
    } catch (error) {
      console.error('Failed to refresh questions:', error);
      Alert.alert('Error', 'Failed to refresh questions');
    } finally {
      setRefreshing(false);
    }
  }, [currentPage, pageSize]);

  const approveQuestion = useCallback(async (questionId) => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Approve Question',
        'Are you sure you want to approve this question?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Cancelled')) },
          {
            text: 'Approve',
            onPress: async () => {
              try {
                setProcessing(true);
                await ApprovalService.approveQuestion(questionId);
                Alert.alert('Success', 'Question approved successfully');
                await loadPendingQuestions(currentPage);
                resolve();
              } catch (error) {
                console.error('Failed to approve question:', error);
                Alert.alert('Error', 'Failed to approve question');
                reject(error);
              } finally {
                setProcessing(false);
              }
            },
          },
        ]
      );
    });
  }, [currentPage, loadPendingQuestions]);

  const rejectQuestion = useCallback(async (questionId, rejectionReason) => {
    if (!rejectionReason?.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      throw new Error('Rejection reason is required');
    }

    try {
      setProcessing(true);
      await ApprovalService.rejectQuestion(questionId, rejectionReason.trim());
      Alert.alert('Success', 'Question rejected successfully');
      await loadPendingQuestions(currentPage);
    } catch (error) {
      console.error('Failed to reject question:', error);
      Alert.alert('Error', 'Failed to reject question');
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [currentPage, loadPendingQuestions]);

  useEffect(() => {
    loadPendingQuestions(1);
  }, [loadPendingQuestions]);

  return {
    questions,
    loading,
    refreshing,
    processing,
    currentPage,
    totalCount,
    refreshQuestions,
    approveQuestion,
    rejectQuestion,
  };
}
