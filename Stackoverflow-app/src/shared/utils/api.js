import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBaseUrl() {
	const hostUri =
		Constants.expoConfig?.hostUri ||
		Constants.manifest2?.extra?.expoGo?.debuggerHost ||
		'';
	const host = hostUri.split(':')[0];

	let url;

	if (host) {
		// Dev client connected to Metro bundler — use the dev server's IP
		url = `http://${host}:5036`;
	} else if (Platform.OS === 'android') {
		url = 'https://barmaid-surname-smoked.ngrok-free.dev';
	} else {
		// iOS simulator or web
		url = 'http://localhost:5036';
	}

	console.log('[API] Resolved base URL:', url, '| hostUri:', hostUri || '(empty)');
	return url;
}

const API_BASE_URL = resolveApiBaseUrl();

export function toFullUrl(url) {
	if (!url) return null;
	return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
}

function getErrorMessage(responseBody, statusCode) {
	if (responseBody && typeof responseBody === 'object') {
		if (typeof responseBody.message === 'string' && responseBody.message.trim()) {
			return responseBody.message;
		}
		if (typeof responseBody.title === 'string' && responseBody.title.trim()) {
			return responseBody.title;
		}
	}

	if (statusCode === 401) {
		return 'You are not authorized to perform this action. Please log in again.';
	}

	return 'Failed to process the request. Please try again.';
}

export async function apiRequest(path, options = {}) {
	const { method = 'GET', body, token } = options;
	const headers = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const requestConfig = {
		method,
		headers,
	};

	if (body !== undefined) {
		requestConfig.body = JSON.stringify(body);
	}

	let response;

	try {
		response = await fetch(`${API_BASE_URL}${path}`, requestConfig);
	} catch (error) {
		throw new Error('Failed to connect to the backend. Please check the API server.');
	}

	const contentType = response.headers.get('content-type') || '';
	const isJsonResponse = contentType.includes('application/json');
	const responseBody = isJsonResponse ? await response.json() : null;

	if (!response.ok) {
		throw new Error(getErrorMessage(responseBody, response.status));
	}

	return responseBody;
}

export { API_BASE_URL };
