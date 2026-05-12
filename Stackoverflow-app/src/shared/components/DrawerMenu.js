import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../features/auth/hooks/useAuth';

export default function DrawerMenu({ visible, onClose, currentRoute }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const menuItems = [
    { icon: 'home', label: 'Home', type: 'feather', route: 'Home' },
  ];

  const contentItems = [
    { icon: 'help-circle', label: 'Questions', type: 'feather', route: 'Questions' },
    { icon: 'tag', label: 'Tags', type: 'feather', route: 'Tags' },
    { icon: 'users', label: 'Users', type: 'feather', route: 'Users' },
    { icon: 'message-circle', label: 'Ask Question', type: 'feather', route: 'Ask' },
    { icon: 'file-text', label: 'Profile', type: 'feather', route: 'Profile' },
  ];

  const handleNavigate = (route) => {
    if (route && navigation) {
      navigation.navigate('MainTabs', { screen: route });
      onClose();
    }
  };

  const handleAdminNavigate = () => {
    if (navigation) {
      navigation.navigate('AdminScreen');
      onClose();
    }
  };

  const communityItems = [
    { icon: 'layers', label: 'Stack Overflow', type: 'feather' },
    { icon: 'users', label: 'Communities', type: 'feather' },
    { icon: 'grid', label: 'Collectives', type: 'feather' },
  ];

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Lớp nền tối mờ */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Khung Drawer */}
      <View style={styles.drawer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {menuItems.map((item, index) => {
            const isActive = currentRoute === item.route;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, isActive && styles.activeItem]}
                activeOpacity={0.7}
                onPress={() => handleNavigate(item.route)}
              >
                {item.type === 'feather' ? (
                  <Feather name={item.icon} size={20} color={isActive ? "#F97316" : "#3B4045"} />
                ) : (
                  <MaterialCommunityIcons name={item.icon} size={20} color={isActive ? "#F97316" : "#3B4045"} />
                )}
                <Text style={[styles.menuText, isActive && styles.activeText]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider} />

          {/* Section: Content */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.sectionHeader} activeOpacity={0.7}>
              <Text style={styles.sectionTitle}>Content</Text>
              <Feather name="chevron-up" size={16} color="#848D95" />
            </TouchableOpacity>

            {contentItems.map((item, index) => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[styles.menuItem, isActive && styles.activeItem]}
                  onPress={() => handleNavigate(item.route)}
                >
                  <Feather
                    name={item.icon}
                    size={18}
                    color={isActive ? "#F97316" : "#525960"}
                  />
                  <Text style={[styles.menuText, isActive && styles.activeText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Section: Communities */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.sectionHeader} activeOpacity={0.7}>
              <Text style={styles.sectionTitle}>Communities</Text>
              <Feather name="chevron-up" size={16} color="#848D95" />
            </TouchableOpacity>

            {communityItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
                <Feather name={item.icon} size={18} color="#525960" />
                <Text style={[styles.menuText, { color: '#525960' }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section: Admin - Only visible for Admin role */}
          {isAdmin && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <TouchableOpacity style={styles.sectionHeader} activeOpacity={0.7}>
                  <Text style={styles.sectionTitle}>Admin</Text>
                  <Feather name="chevron-up" size={16} color="#848D95" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, currentRoute === 'AdminScreen' && styles.activeItem]}
                  activeOpacity={0.7}
                  onPress={handleAdminNavigate}
                >
                  <Feather name="user" size={16} color={currentRoute === 'AdminScreen' ? "#F97316" : "#525960"} />
                  <Text style={[styles.menuText, currentRoute === 'AdminScreen' && styles.activeText]}>
                    Admin Dashboard
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 57,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 10, 11, 0.4)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 230,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 3,
    marginBottom: 4,
    borderRadius: 10, 
    gap: 14,
  },
  activeItem: {
    backgroundColor: '#FFF7ED',
  },
  menuText: {
    fontSize: 15,
    color: '#3B4045',
    fontWeight: '500',
  },
  activeText: {
    color: '#F97316',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F2F3', 
    marginVertical: 12,
    marginHorizontal: 24, 
  },
  section: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28, 
    paddingVertical: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#848D95',
    fontWeight: '700',
    textTransform: 'uppercase', 
    letterSpacing: 0.8, 
  },
});