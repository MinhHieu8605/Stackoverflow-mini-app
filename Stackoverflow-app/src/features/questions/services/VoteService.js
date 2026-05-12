import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

const VoteService = {
  async votePost(postId, voteType) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${postId}/vote`, {
      method: 'PUT',
      body: { voteType },
      token,
    });

    return response;
  },

  async getMyVoteState(postId) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/${postId}/vote/me`, {
      method: 'GET',
      token,
    });

    return response;
  },
};

export default VoteService;
