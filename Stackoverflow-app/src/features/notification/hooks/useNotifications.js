import { useState, useEffect, useCallback } from 'react';
import NotificationService from '../services/NotificationService';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await NotificationService.fetchNotifications({
        page: pageNum,
        pageSize: 20,
      });
      setNotifications(response.items);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const refresh = useCallback(() => {
    fetchNotifications(page);
  }, [fetchNotifications, page]);

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      fetchNotifications(page + 1);
    }
  }, [hasNextPage, page, fetchNotifications]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      fetchNotifications(page - 1);
    }
  }, [hasPreviousPage, page, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    refresh,
    goToNextPage,
    goToPreviousPage,
  };
}
