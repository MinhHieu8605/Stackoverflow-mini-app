import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

const ApprovalService = {
  async fetchPendingApprovals(params = {}) {
    const { page = 1, pageSize = 10 } = params;
    const token = await AuthService.getToken();

    const response = await apiRequest(
      `/api/posts?page=${page}&pageSize=${pageSize}&approvalStatus=0`,
      { method: 'GET', token }
    );

    return response;
  },

  async approveQuestion(questionId) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${questionId}/approve`, {
      method: 'POST',
      token,
    });

    return response;
  },

  async rejectQuestion(questionId, rejectionReason) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${questionId}/reject`, {
      method: 'POST',
      body: { rejectionReason },
      token,
    });

    return response;
  },
};

export default ApprovalService;
