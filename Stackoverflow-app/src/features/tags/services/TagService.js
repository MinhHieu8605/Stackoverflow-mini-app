import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

const TagService = {
  async searchTags(keyword = '') {
    const token = await AuthService.getToken();
    const queryParam = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    const response = await apiRequest(`/api/tags/search${queryParam}`, {
      method: 'GET',
      token,
    });
    return response;
  },
};

export default TagService;
