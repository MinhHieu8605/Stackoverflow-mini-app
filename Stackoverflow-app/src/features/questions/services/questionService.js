import { apiRequest } from '../../../shared/utils/api';
import AuthService from '../../auth/services/AuthService';

const QUESTION_TYPE_GENERAL = 4;

function formatTimeAgo(isoDate) {
  if (!isoDate) {
    return 'Now';
  }

  const createdTime = new Date(isoDate).getTime();
  if (Number.isNaN(createdTime)) {
    return 'Now';
  }

  const diffMinutes = Math.floor((Date.now() - createdTime) / 60000);

  if (diffMinutes < 1) {
    return 'Now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function mapQuestionFromApi(item) {
  const tags = Array.isArray(item?.tags) ? item.tags : [];

  return {
    id: String(item?.id ?? ''),
    title: item?.title || '',
    description: item?.body || '',
    tag: tags[0] || 'general',
    tags,
    user: item?.userName || 'Unknown',
    avatarUrl: item?.avatarUrl || null,
    votes: item?.voteCount ?? 0,
    answers: item?.answerCount ?? 0,
    views: item?.viewCount ?? 0,
    createdAt: formatTimeAgo(item?.createdAt),
  };
}

function buildTagList(tagText) {
  const tags = (tagText || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return tags.length > 0 ? tags : ['general'];
}

const QuestionService = {
  async fetchQuestions(params = {}) {
    const { page = 1, pageSize = 20 } = params;
    const response = await apiRequest(`/api/posts?page=${page}&pageSize=${pageSize}`);
    const items = Array.isArray(response?.items) ? response.items : [];

    return {
      items: items.map(mapQuestionFromApi),
      page: response?.page || 1,
      pageSize: response?.pageSize || pageSize,
      totalCount: response?.totalCount || 0,
      totalPages: response?.totalPages || 1,
      hasNextPage: response?.hasNextPage || false,
      hasPreviousPage: response?.hasPreviousPage || false,
    };
  },

  async getQuestionDetail(questionId) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts/questions/${questionId}`, {
      method: 'GET',
      token,
    });

    return response;
  },

  async createQuestion({ title, description, tag, questionType }) {
    const token = await AuthService.getToken();

    const payload = {
      title: title.trim(),
      body: description.trim(),
      tags: buildTagList(tag),
      questionType: questionType || QUESTION_TYPE_GENERAL,
    };

    const response = await apiRequest('/api/posts', {
      method: 'POST',
      body: payload,
      token,
    });

    return mapQuestionFromApi(response);
  },

  async createAnswer(questionId, body) {
    const token = await AuthService.getToken();

    const response = await apiRequest(`/api/posts`, {
      method: 'POST',
      body: {
        body: body.trim(),
        parentId: parseInt(questionId),
      },
      token,
    });

    return response;
  },

  async searchQuestions(params = {}) {
    const token = await AuthService.getToken();
    const { page = 1, pageSize = 10, title = '', deleted = false } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (title) queryParams.append('title', title);
    if (deleted !== undefined) queryParams.append('deleted', deleted.toString());

    const response = await apiRequest(`/api/posts?${queryParams.toString()}`, {
      method: 'GET',
      token,
    });

    return {
      items: response?.items || [],
      page: response?.page || 1,
      totalPages: response?.totalPages || 1,
      totalCount: response?.totalCount || 0,
    };
  },

  async updateQuestion(questionId, data) {
    const token = await AuthService.getToken();

    const payload = {
      title: data.title?.trim(),
      body: data.body?.trim(),
      tags: data.tags || [],
      questionType: data.questionType,
    };

    const response = await apiRequest(`/api/posts/${questionId}`, {
      method: 'PUT',
      body: payload,
      token,
    });

    return response;
  },

  async deleteQuestion(questionId) {
    const token = await AuthService.getToken();

    await apiRequest(`/api/posts/${questionId}`, {
      method: 'DELETE',
      token,
    });
  },
};

export default QuestionService;
