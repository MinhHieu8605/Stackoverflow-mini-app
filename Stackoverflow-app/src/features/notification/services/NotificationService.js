import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

function formatTimeAgo(isoDate) {
  if (!isoDate) {
    return 'Vừa xong';
  }

  const createdTime = new Date(isoDate).getTime();
  if (Number.isNaN(createdTime)) {
    return 'Vừa xong';
  }

  const diffMinutes = Math.floor((Date.now() - createdTime) / 60000);

  if (diffMinutes < 1) {
    return 'Vừa xong';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Hôm qua';
  }
  return `${diffDays} ngày trước`;
}

const NotificationService = {
  async fetchNotifications(params = {}) {
    const { page = 1, pageSize = 20 } = params;
    const token = await AuthService.getToken();
    const user = await AuthService.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    let response;

    if (user.role === 'Admin') {
      response = await apiRequest(
        `/api/posts?page=${page}&pageSize=${pageSize}&approvalStatus=0`,
        { method: 'GET', token }
      );

      const items = Array.isArray(response?.items) ? response.items : [];

      return {
        items: items.map(item => ({
          id: String(item?.id ?? ''),
          type: 'pending_approval',
          title: `Bài viết mới cần duyệt: ${item?.title || 'Không có tiêu đề'}`,
          description: item?.body?.substring(0, 100) || '',
          userName: item?.userName || 'Unknown',
          avatarUrl: item?.avatarUrl || null,
          time: formatTimeAgo(item?.createdAt),
          postId: item?.id,
        })),
        page: response?.page || 1,
        pageSize: response?.pageSize || pageSize,
        totalCount: response?.totalCount || 0,
        totalPages: response?.totalPages || 1,
        hasNextPage: response?.hasNextPage || false,
        hasPreviousPage: response?.hasPreviousPage || false,
      };
    } else {
      response = await apiRequest(
        `/api/posts?page=${page}&pageSize=${pageSize}&approvalStatus=1&userId=${user.id}`,
        { method: 'GET', token }
      );

      const items = Array.isArray(response?.items) ? response.items : [];

      return {
        items: items.map(item => ({
          id: String(item?.id ?? ''),
          type: 'approved',
          title: `Bài viết của bạn đã được duyệt: ${item?.title || 'Không có tiêu đề'}`,
          description: item?.body?.substring(0, 100) || '',
          time: formatTimeAgo(item?.updatedAt || item?.createdAt),
          postId: item?.id,
        })),
        page: response?.page || 1,
        pageSize: response?.pageSize || pageSize,
        totalCount: response?.totalCount || 0,
        totalPages: response?.totalPages || 1,
        hasNextPage: response?.hasNextPage || false,
        hasPreviousPage: response?.hasPreviousPage || false,
      };
    }
  },
};

export default NotificationService;
