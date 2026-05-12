import React from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useNotifications from '../hooks/useNotifications';
import useAuth from '../../auth/hooks/useAuth';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    refresh,
    goToNextPage,
    goToPreviousPage,
  } = useNotifications();

  const handleNotificationPress = (notification) => {
    if (notification.postId) {
      if (user?.role === 'Admin' && notification.type === 'pending_approval') {
        navigation.navigate('ApproveQuestionsScreen');
      } else {
        navigation.navigate('QuestionDetailScreen', { questionId: notification.postId });
      }
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#F97316']} />
      }
    >
      <Text style={styles.title}>Notification</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No new notifications</Text>
        </View>
      ) : (
        <>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                {item.type === 'pending_approval' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Cần duyệt</Text>
                  </View>
                )}
                {item.type === 'approved' && (
                  <View style={[styles.badge, styles.badgeApproved]}>
                    <Text style={styles.badgeText}>Đã duyệt</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description && (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              {item.userName && (
                <Text style={styles.cardUser}>Người đăng: {item.userName}</Text>
              )}
              <Text style={styles.cardTime}>{item.time}</Text>
            </TouchableOpacity>
          ))}

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, !hasPreviousPage && styles.pageButtonDisabled]}
                onPress={goToPreviousPage}
                disabled={!hasPreviousPage}
              >
                <Text style={[styles.pageButtonText, !hasPreviousPage && styles.pageButtonTextDisabled]}>
                  Trước
                </Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Trang {page} / {totalPages}
              </Text>
              <TouchableOpacity
                style={[styles.pageButton, !hasNextPage && styles.pageButtonDisabled]}
                onPress={goToNextPage}
                disabled={!hasNextPage}
              >
                <Text style={[styles.pageButtonText, !hasNextPage && styles.pageButtonTextDisabled]}>
                  Sau
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F9',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9F9',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#232629',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E6E8',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeApproved: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#232629',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6A737C',
    marginBottom: 6,
    lineHeight: 18,
  },
  cardUser: {
    fontSize: 12,
    color: '#0074CC',
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 12,
    color: '#6A737C',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#6A737C',
  },
  errorText: {
    fontSize: 15,
    color: '#D1343E',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
  },
  pageButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: '#E4E6E8',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  pageButtonTextDisabled: {
    color: '#9199A1',
  },
  pageInfo: {
    fontSize: 14,
    color: '#232629',
    fontWeight: '600',
  },
});