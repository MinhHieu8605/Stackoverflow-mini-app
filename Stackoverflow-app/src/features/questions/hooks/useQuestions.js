import { useCallback, useEffect, useState } from 'react';
import QuestionService from '../services/questionService';

export default function useQuestions(options = {}) {
	const { pageSize = 2 } = options;
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const loadQuestions = useCallback(async (page = 1) => {
		setLoading(true);
		setError('');

		try {
			const response = await QuestionService.fetchQuestions({ page, pageSize });
			setQuestions(response.items || []);
			setCurrentPage(response.page);
			setTotalPages(response.totalPages);
			setTotalCount(response.totalCount);
		} catch (err) {
			setError(err?.message || 'Unable to fetch questions.');
		} finally {
			setLoading(false);
		}
	}, [pageSize]);

	const refreshQuestions = useCallback(async () => {
		setRefreshing(true);
		setError('');

		try {
			const response = await QuestionService.fetchQuestions({ page: 1, pageSize });
			setQuestions(response.items || []);
			setCurrentPage(response.page);
			setTotalPages(response.totalPages);
			setTotalCount(response.totalCount);
		} catch (err) {
			setError(err?.message || 'Unable to fetch questions.');
		} finally {
			setRefreshing(false);
		}
	}, [pageSize]);

	const goToPage = useCallback((page) => {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			loadQuestions(page);
		}
	}, [totalPages, currentPage, loadQuestions]);

	useEffect(() => {
		loadQuestions(1);
	}, [loadQuestions]);

	return {
		questions,
		loading,
		refreshing,
		error,
		currentPage,
		totalPages,
		totalCount,
		refreshQuestions,
		goToPage,
	};
}
