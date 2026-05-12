import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

const ProfileService = {
  async updateProfile(profileData) {
    const token = await AuthService.getToken();
    const user = await AuthService.getUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }

    const requestBody = {
      userName: profileData.userName,
      displayName: profileData.displayName,
      email: profileData.email,
      aboutMe: profileData.aboutMe,
      websiteUrl: profileData.websiteLink,
      avatarUrl: profileData.avatarUri,
    };

    const response = await apiRequest(`/api/users/${user.id}`, {
      method: 'PUT',
      body: requestBody,
      token,
    });

    return response;
  },

  async getProfile() {
    const token = await AuthService.getToken();
    const user = await AuthService.getUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }

    const response = await apiRequest(`/api/users/${user.id}`, {
      method: 'GET',
      token,
    });

    return response;
  },
};

export default ProfileService;
