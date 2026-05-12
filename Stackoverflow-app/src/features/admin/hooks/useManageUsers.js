import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import UserService from '../../users/services/UserService';

export default function useManageUsers(options = {}) {
  const { pageSize = 10 } = options;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await UserService.searchUsers({
        page: currentPage,
        pageSize,
        userName: searchQuery,
      });
      setUsers(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  const createUser = useCallback(async (formData) => {
    try {
      await UserService.createUser(formData);
      await loadUsers();
    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (userId, formData) => {
    try {
      await UserService.updateUser(userId, formData);
      await loadUsers();
    } catch (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  }, [loadUsers]);

  const deleteUser = useCallback((user) => {
    return new Promise((resolve, reject) => {
      Alert.alert('Delete User', `Delete ${user.displayName}?`, [
        { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Cancelled')) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await UserService.deleteUser(user.id);
              await loadUsers();
              resolve();
            } catch (error) {
              Alert.alert('Error', error.message);
              reject(error);
            }
          },
        },
      ]);
    });
  }, [loadUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    createUser,
    updateUser,
    deleteUser,
  };
}
