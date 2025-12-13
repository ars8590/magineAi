import axios from 'axios';
import { AdminModeration, FeedbackPayload, GenerationRequest, GeneratedContent } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
});

export async function generateContent(payload: GenerationRequest) {
  const { data } = await api.post<{ id: string }>('/generate', payload);
  return data;
}

export async function fetchContent(id: string) {
  const { data } = await api.get<GeneratedContent>(`/content/${id}`);
  return data;
}

export async function submitFeedback(payload: FeedbackPayload) {
  const { data } = await api.post('/feedback', payload);
  return data;
}

export async function adminLogin(username: string, password: string) {
  const { data } = await api.post<{ token: string }>('/auth/login', { username, password });
  return data;
}

export async function moderateContent(token: string, payload: AdminModeration) {
  const { data } = await api.post(
    '/admin/moderate',
    { ...payload },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

