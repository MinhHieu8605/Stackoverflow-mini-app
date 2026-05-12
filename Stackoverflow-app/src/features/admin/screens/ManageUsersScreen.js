import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Pagination from '../../../shared/components/Pagination';
import useManageUsers from '../hooks/useManageUsers';
import { toFullUrl } from '../../../shared/utils/api';

export default function ManageUsersScreen() {
  const {
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
  } = useManageUsers();

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    displayName: '',
    email: '',
    password: '',
    location: '',
  });

  const handleCreate = () => {
    setEditMode(false);
    setSelectedUser(null);
    setFormData({ userName: '', displayName: '', email: '', password: '', location: '' });
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    setFormData({
      userName: user.userName,
      displayName: user.displayName,
      email: user.email,
      password: '',
      location: user.location || '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (user) => {
    try {
      await deleteUser(user);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedUser) {
        await updateUser(selectedUser.id, formData);
      } else {
        await createUser(formData);
      }
      setModalVisible(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      {item.avatarUrl ? (
        <Image source={{ uri: toFullUrl(item.avatarUrl) }} style={styles.avatarCircle} />
      ) : (
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.displayName}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.userHandle}>@{item.userName}</Text>
          <View style={styles.reputationBadge}>
            <Feather name="star" size={10} color="#F97316" />
            <Text style={styles.reputationText}>{item.reputation}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleEdit(item)}>
          <Feather name="edit-3" size={18} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleDelete(item)}>
          <Feather name="trash-2" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Users</Text>
          <Text style={styles.subtitle}>Manage your community</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate} activeOpacity={0.8}>
          <Feather name="user-plus" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="users" size={60} color="#E2E8F0" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editMode ? 'Edit Profile' : 'New User'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGap}>
                <InputField label="Username" icon="at-sign" value={formData.userName} onChange={(t) => setFormData({...formData, userName: t})} />
                <InputField label="Display Name" icon="user" value={formData.displayName} onChange={(t) => setFormData({...formData, displayName: t})} />
                <InputField label="Email" icon="mail" value={formData.email} onChange={(t) => setFormData({...formData, email: t})} keyboardType="email-address" />
                <InputField label={`Password ${editMode ? '(Optional)' : ''}`} icon="lock" value={formData.password} onChange={(t) => setFormData({...formData, password: t})} secure />
                <InputField label="Location" icon="map-pin" value={formData.location} onChange={(t) => setFormData({...formData, location: t})} />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>{editMode ? 'Save Changes' : 'Create User'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const InputField = ({ label, icon, secure, value, onChange, keyboardType }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldInputWrapper}>
      <Feather name={icon} size={16} color="#94A3B8" />
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#CBD5E1"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    elevation: 4,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchWrapper: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userHandle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  reputationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  userActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionIconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  inputGap: {
    gap: 16,
  },
  fieldContainer: {},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  fieldInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  fieldInput: {
    flex: 1,
    height: 44,
    marginLeft: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 30,
    marginBottom: 20,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 16,
  },
});
