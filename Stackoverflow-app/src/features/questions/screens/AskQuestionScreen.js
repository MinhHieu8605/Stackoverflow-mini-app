import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import QuestionService from '../services/questionService';

const QUESTION_TYPES = [
  { label: 'Troubleshooting', value: 1 },
  { label: 'Tooling', value: 2 },
  { label: 'Best Practices', value: 3 },
  { label: 'General', value: 4 }
];

export default function AskQuestionScreen() {
  const navigation = useNavigation();
  const [questionType, setQuestionType] = useState(1);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const getQuestionTypeLabel = (value) => {
    return QUESTION_TYPES.find(t => t.value === value)?.label || 'Troubleshooting';
  };

  const handleSubmit = async () => {
    // if (!title.trim() || title.length < 10) return Alert.alert('Notification', 'Title must be at least 10 characters long to clearly summarize your problem.');
    // if (!body.trim() || body.length < 100) return Alert.alert('Notification', 'Body must be at least 100 characters long to provide sufficient detail.');
    if (!tags.trim()) return Alert.alert('Notification', 'Please add at least one tag.');

    setSubmitting(true);
    try {
      await QuestionService.createQuestion({
        title: title.trim(),
        description: body.trim(),
        tag: tags.trim(),
        questionType,
      });

      Alert.alert('Notification', 'Your question has been submitted successfully! Wait for admin approval.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Notification', error.message || 'Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>What's on your mind?</Text>
            <Text style={styles.greetingSub}>Share your coding problem with the community to get help.</Text>
          </View>

          <View style={styles.card}>
            {/* Type Selector */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Type</Text>
              <TouchableOpacity
                style={[styles.inputBase, styles.dropdown]}
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{getQuestionTypeLabel(questionType)}</Text>
                <Feather name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
              </TouchableOpacity>

              {showTypeDropdown && (
                <View style={styles.dropdownMenu}>
                  {QUESTION_TYPES.map((type, index) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.dropdownItem,
                        index === QUESTION_TYPES.length - 1 && styles.dropdownItemLast
                      ]}
                      onPress={() => {
                        setQuestionType(type.value);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        questionType === type.value && styles.dropdownItemTextActive
                      ]}>
                        {type.label}
                      </Text>
                      {questionType === type.value && <Feather name="check" size={18} color="#F97316" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Title */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.inputBase, focusedInput === 'title' && styles.inputFocused]}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setFocusedInput('title')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Keep it brief and descriptive"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Body */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Body</Text>
                {/* Toolbar */}
                <View style={styles.toolbar}>
                   <Feather name="image" size={18} color="#6B7280" style={styles.toolIcon}/>
                   <Feather name="link" size={18} color="#6B7280" style={styles.toolIcon}/>
                   <Feather name="code" size={18} color="#6B7280" style={styles.toolIcon}/>
                </View>
              </View>
              <TextInput
                style={[styles.inputBase, styles.textArea, focusedInput === 'body' && styles.inputFocused]}
                value={body}
                onChangeText={setBody}
                onFocus={() => setFocusedInput('body')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Describe your issue, expected behavior, and what you've tried..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Tags */}
            <View style={styles.inputWrapperLast}>
              <Text style={styles.label}>Tags</Text>
              <TextInput
                style={[styles.inputBase, focusedInput === 'tags' && styles.inputFocused]}
                value={tags}
                onChangeText={setTags}
                onFocus={() => setFocusedInput('tags')}
                onBlur={() => setFocusedInput(null)}
                placeholder="e.g., react-native, ios, debug"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.footer}>
             <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Post Question</Text>
                  <Feather name="send" size={18} color="#FFFFFF" style={{marginLeft: 8}} />
                </>
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
    backgroundColor: '#F4F6F8',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  greetingSection: {
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0C0D0E',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: 14,
    color: '#6A737C',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E6E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputWrapperLast: {
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C0D0E',
    marginBottom: 8,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 12,
  },
  toolIcon: {
    opacity: 0.7,
  },
  inputBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0C0D0E',
    borderWidth: 1,
    borderColor: '#D6D9DC',
  },
  inputFocused: {
    borderColor: '#F97316',
    borderWidth: 1.5,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#0C0D0E',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D6D9DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E6E8',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#3B4045',
  },
  dropdownItemTextActive: {
    color: '#F97316',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 180,
    paddingTop: 11,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  submitBtn: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});