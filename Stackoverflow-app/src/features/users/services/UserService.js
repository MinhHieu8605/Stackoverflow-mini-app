import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

const UserService = {
  async searchUsers(params = {}) {
    try {
      const token = await AuthService.getToken();
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.userName) queryParams.append('userName', params.userName);
      if (params.email) queryParams.append('email', params.email);
      if (params.displayName) queryParams.append('displayName', params.displayName);

      const response = await apiRequest(`/api/users?${queryParams.toString()}`, {
        method: 'GET',
        token,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getUserById(id) {
    try {
      const token = await AuthService.getToken();
      const response = await apiRequest(`/api/users/${id}`, {
        method: 'GET',
        token,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const token = await AuthService.getToken();
      const response = await apiRequest('/api/users', {
        method: 'POST',
        body: userData,
        token,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const token = await AuthService.getToken();
      const response = await apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: userData,
        token,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const token = await AuthService.getToken();
      const response = await apiRequest(`/api/users/${id}`, {
        method: 'DELETE',
        token,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default UserService;
