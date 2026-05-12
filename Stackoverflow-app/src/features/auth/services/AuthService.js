import { apiRequest } from "../../../shared/utils/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../shared/utils/api';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

// Helper to convert relative URL to full URL
const toFullUrl = (url) => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

// Decode JWT token to get user info
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const AuthService = {
  // ====== LOGIN ======
  async login(email, password) {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    const tokenPayload = decodeToken(response.token);
    console.log('Decoded token payload:', tokenPayload);
    const userId = tokenPayload?.userId || tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const role = tokenPayload?.role || tokenPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'user';

    // Fetch full user profile to get avatarUrl and other fields
    const userProfile = await apiRequest(`/api/users/${userId}`, {
      method: 'GET',
      token: response.token,
    });

    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify({
      id: userId,
      userName: response.userName,
      displayName: response.displayName,
      email: response.email,
      role: role,
      avatarUrl: toFullUrl(userProfile.avatarUrl),
      aboutMe: userProfile.aboutMe,
      websiteUrl: userProfile.websiteUrl,
    }));

    return { ...response, role, id: userId, avatarUrl: toFullUrl(userProfile.avatarUrl), aboutMe: userProfile.aboutMe, websiteUrl: userProfile.websiteUrl };
  },

  // ====== REGISTER ======
  async register(userName, displayName, email, password) {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { userName, displayName, email, password },
    });

    const tokenPayload = decodeToken(response.token);
    const userId = tokenPayload?.userId || tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const role = tokenPayload?.role || tokenPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'user';

    // Fetch full user profile
    const userProfile = await apiRequest(`/api/users/${userId}`, {
      method: 'GET',
      token: response.token,
    });

    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify({
      id: userId,
      userName: response.userName,
      displayName: response.displayName,
      email: response.email,
      role: role,
      avatarUrl: toFullUrl(userProfile.avatarUrl),
      aboutMe: userProfile.aboutMe,
      websiteUrl: userProfile.websiteUrl,
    }));

    return { ...response, role, id: userId, avatarUrl: toFullUrl(userProfile.avatarUrl), aboutMe: userProfile.aboutMe, websiteUrl: userProfile.websiteUrl };
  },

  // ====== LOGOUT ======
  async logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },

  // ====== GET TOKEN ======
  async getToken() {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  // ====== GET USER ======
  async getUser() {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // ====== CHECK AUTH ======
  async isAuthenticated() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  }
};

export default AuthService;