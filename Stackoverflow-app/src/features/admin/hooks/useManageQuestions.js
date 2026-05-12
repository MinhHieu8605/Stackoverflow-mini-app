import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import QuestionService from '../../questions/services/questionService';

export default function useManageQuestions(options = {}) {
  const { pageSize = 10 } = options;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await QuestionService.searchQuestions({
        page: currentPage,
        pageSize,
        title: searchQuery,
        deleted: false,
      });
      setQuestions(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  const updateQuestion = useCallback(async (questionId, formData) => {
    try {
      await QuestionService.updateQuestion(questionId, formData);
      await loadQuestions();
    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  }, [loadQuestions]);

  const deleteQuestion = useCallback((question) => {
    return new Promise((resolve, reject) => {
      Alert.alert('Delete Question', `Delete "${question.title}"?`, [
        { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Cancelled')) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await QuestionService.deleteQuestion(question.id);
              await loadQuestions();
              resolve();
            } catch (error) {
              Alert.alert('Error', error.message);
              reject(error);
            }
          },
        },
      ]);
    });
  }, [loadQuestions]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    updateQuestion,
    deleteQuestion,
  };
}
