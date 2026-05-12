import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import useAuth from '../../auth/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import ProfileService from '../services/ProfileService';
import { API_BASE_URL } from '../../../shared/utils/api';

export default function EditProfileScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [userName, setUserName] = useState(''); 
  const [aboutMe, setAboutMe] = useState('');
  const [email, setEmail] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setUserName(user.userName || '');
      setAboutMe(user.aboutMe || '');
      setEmail(user.email || '');
      setWebsiteLink(user.websiteUrl || '');
      setAvatarUri(user.avatarUrl || null);
    }
  }, [user]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    if (!userName.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    setLoading(true);
    try {
      let uploadedAvatarUrl = avatarUri;

      // Upload avatar if it's a local file URI
      if (avatarUri && (avatarUri.startsWith('file://') || avatarUri.startsWith('content://'))) {
        try {
          const formData = new FormData();
          const filename = avatarUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('File', {
            uri: avatarUri,
            name: filename,
            type: type,
          });

          const token = await AsyncStorage.getItem('@auth_token');
          const uploadResponse = await fetch(`${API_BASE_URL}/api/uploads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload avatar');
          }

          const uploadData = await uploadResponse.json();
          // Convert relative path to full URL
          const fileUrl = uploadData.fileUrl || uploadData.FileUrl;
          // uploadedAvatarUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;
          uploadedAvatarUrl = fileUrl;
        } catch (uploadError) {
          Alert.alert('Error', 'Failed to upload avatar: ' + uploadError.message);
          setLoading(false);
          return;
        }
      }

      // Prepare data to send to API
      const profileData = {
        userName: userName.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        aboutMe: aboutMe.trim(),
        websiteLink: websiteLink.trim(),
        avatarUri: uploadedAvatarUrl,
      };

      // Call API to update profile in database
      const response = await ProfileService.updateProfile(profileData);

      // Update local storage with response data
      const updatedUser = {
        ...user,
        userName: response.userName,
        displayName: response.displayName,
        email: response.email,
        aboutMe: response.aboutMe,
        websiteUrl: response.websiteUrl,
        avatarUrl: response.avatarUrl?.startsWith('http') ? response.avatarUrl : `${API_BASE_URL}${response.avatarUrl}`,
      };

      await AsyncStorage.setItem('@auth_user', JSON.stringify(updatedUser));

      // Refresh user data in useAuth hook
      if (refreshUser) {
        await refreshUser();
      }

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={28} color="#232629" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Feather name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            
            {/* PUBLIC INFORMATION */}
            <Text style={styles.sectionHeader}>PUBLIC INFORMATION</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor="#A0AAB2"
                value={displayName}
                onChangeText={setDisplayName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>About Me</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell everyone a little about yourself..."
                placeholderTextColor="#A0AAB2"
                value={aboutMe}
                onChangeText={setAboutMe}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            {/* LINKS */}
            <Text style={styles.sectionHeader}>LINKS & SOCIAL</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website / Portfolio</Text>
              <View style={styles.inputWithIcon}>
                <Feather name="globe" size={16} color="#838C95" style={styles.iconInside} />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor="#A0AAB2"
                  value={websiteLink}
                  onChangeText={setWebsiteLink}
                  autoCapitalize="none"
                  keyboardType="url"
                  editable={!loading}
                />
              </View>
            </View>

            {/* PRIVATE INFORMATION */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>PRIVATE INFORMATION</Text>
              <Text style={styles.sectionSubHeader}>(Not shown publicly)</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWithIcon}>
                <Feather name="at-sign" size={16} color="#838C95" style={styles.iconInside} />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="username"
                  placeholderTextColor="#A0AAB2"
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWithIcon}>
                <Feather name="mail" size={16} color="#838C95" style={styles.iconInside} />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="you@example.com"
                  placeholderTextColor="#A0AAB2"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Scrollable Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6E8',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C0D0E',
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // --- Avatar Section ---
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6E8',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '700',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // --- Form Layout ---
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6A737C',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 16,
  },
  sectionSubHeader: {
    fontSize: 11,
    color: '#9FA6AD',
    marginLeft: 8,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#232629',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6D9DC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0C0D0E',
    fontWeight: '500',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6D9DC',
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  iconInside: {
    marginRight: 10,
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
    color: '#0C0D0E',
    paddingVertical: 13,
    fontWeight: '500',
  },
  textArea: {
    height: 110,
    paddingTop: 13,
    textAlignVertical: 'top',
  },

  // --- Save Button ---
  saveButton: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 20,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#FDB98C',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});