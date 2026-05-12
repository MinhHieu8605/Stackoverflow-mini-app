import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

const CommentService = {
  async getComments(postId) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${postId}/comments`, {
      method: 'GET',
      token,
    });

    return response;
  },

  async createComment(postId, content) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: { Content: content },
      token,
    });

    return response;
  },

  async updateComment(postId, commentId, content) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: { Content: content },
      token,
    });

    return response;
  },

  async deleteComment(postId, commentId) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      token,
    });

    return response;
  },
};

export default CommentService;
