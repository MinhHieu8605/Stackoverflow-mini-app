import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useQuestions from '../../questions/hooks/useQuestions';
import useAuth from '../../auth/hooks/useAuth';
import Pagination from '../../../shared/components/Pagination';

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    questions,
    loading,
    refreshing,
    error,
    currentPage,
    totalPages,
    refreshQuestions,
    goToPage,
  } = useQuestions({ pageSize: 2 });
  const { user } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshQuestions} />}
    >
      {/* ==== Header Section - Greeting ==== */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.codeIcon}>
             <MaterialCommunityIcons name="robot-happy-outline" size={24} color="black" />
          </View>
          <Text style={styles.greetingText}>
            Hey <Text style={styles.userName}>{user?.displayName || 'User'}</Text>, what do you want to learn today?
          </Text>
        </View>
        <Text style={styles.subGreeting}>
          Get instant answers with AI Assist, grounded in community-verified knowledge.
        </Text>
      </View>

      {/* ==== AI Assist Input Area ==== */}
      <View style={styles.aiBox}>
        <TextInput 
          placeholder="Start a chat with AI Assist..."
          placeholderTextColor="#9199a1"
          multiline
          style={styles.aiInput}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Feather name="arrow-up" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        By using AI Assist, you agree to Stack Overflow's <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>. Powered with the help of OpenAI.
      </Text>

      {/* ==== Section Title with Filter ==== */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Interesting posts for you</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="filter-variant" size={20} color="#525960" />
          <Feather name="chevron-down" size={16} color="#525960" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSub}>Based on your viewing history and watched tags. <Text style={styles.link}>Customize your feed</Text></Text>

      {/* ==== Question List ==== */}
      <View style={styles.postList}>
        {loading && <ActivityIndicator style={styles.loadingState} size="small" color="#F97316" />}

        {!loading && !!error && <Text style={styles.errorState}>{error}</Text>}

        {!loading && !error && questions.length === 0 && (
          <Text style={styles.emptyState}>No posts to show.</Text>
        )}

        {!loading && !error && questions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.postCard}
            onPress={() => navigation.navigate('QuestionDetailScreen', { questionId: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.postAuthorRow}>
              <View style={[styles.authorDot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.authorName}>{item.user || 'Unknown User'}</Text>
              <Text style={styles.postTime}> • {item.time || '12 min ago'}</Text>
            </View>

            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postSnippet} numberOfLines={3}>
              {item.description || 'No description available.'}
            </Text>

            {/* Tags */}
            <View style={styles.tagRow}>
              {(item.tags && item.tags.length > 0 ? item.tags : [item.tag]).slice(0, 3).map((tag) => (
                <View key={`${item.id}-${tag}`} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Interaction Stats */}
            <View style={styles.interactionRow}>
               <View style={styles.statItem}>
                  <Feather name="triangle" size={14} color="#6a737c" style={{transform: [{rotate: '0deg'}]}} />
                  <Text style={styles.statNumber}>{item.votes}</Text>
               </View>
               <View style={styles.statItem}>
                  <Feather name="message-square" size={14} color="#6a737c" />
                  <Text style={styles.statNumber}>{item.answers}</Text>
               </View>
            </View>
          </TouchableOpacity>
        ))}

        {!loading && !error && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeIcon: {
    width: 35,
    height: 35,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e3e6e8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9f9',
  },
  greetingText: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#0c0d0e',
    lineHeight: 28,
  },
  userName: {
    color: '#0c0d0e',
  },
  subGreeting: {
    fontSize: 15,
    color: '#6a737c',
    marginTop: 12,
    lineHeight: 22,
  },
  aiBox: {
    margin: 20,
    padding: 12,
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e6e8',
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  aiInput: {
    fontSize: 16,
    color: '#0c0d0e',
    textAlignVertical: 'top',
  },
  sendButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#0c0d0e',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    paddingHorizontal: 20,
    fontSize: 12,
    color: '#6a737c',
    lineHeight: 18,
  },
  link: {
    color: '#EA580C',
    textDecorationLine: 'underline',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0c0d0e',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f3',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  sectionSub: {
    paddingHorizontal: 20,
    fontSize: 13,
    color: '#6a737c',
    marginTop: 4,
  },
  postList: {
    marginTop: 16,
  },
  loadingState: {
    marginTop: 12,
    marginBottom: 12,
  },
  errorState: {
    marginHorizontal: 20,
    marginBottom: 12,
    color: '#B42318',
    fontSize: 13,
  },
  emptyState: {
    marginHorizontal: 20,
    marginBottom: 12,
    color: '#6a737c',
    fontSize: 13,
  },
  postCard: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e3e6e8',
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorDot: {
    width: 12,
    height: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 13,
    color: '#3b4045',
  },
  postTime: {
    fontSize: 13,
    color: '#6a737c',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0c0d0e',
    marginBottom: 8,
  },
  postSnippet: {
    fontSize: 14,
    color: '#3b4045',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e1ecf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: '#39739d',
    fontSize: 12,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 13,
    color: '#6a737c',
  },

});