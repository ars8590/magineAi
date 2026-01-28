import axios from 'axios';
import { AdminModeration, FeedbackPayload, GenerationRequest, GeneratedContent } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
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

export async function userLogin(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: { id: string; name: string; email: string } }>(
    '/auth/login/user',
    { email, password }
  );
  return data;
}

export async function userSignup(name: string, email: string, password: string) {
  const { data } = await api.post<{ token: string; user: { id: string; name: string; email: string } }>(
    '/auth/signup',
    { name, email, password }
  );
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

export async function getLibrary() {
  const { data } = await api.get<GeneratedContent[]>('/library');
  return data;
}

export async function deleteContent(id: string) {
  await api.delete(`/library/${id}`); // Or /admin/content/${id} if admin
}

export async function fetchUsers() {
  const { data } = await api.get<{ id: string, name: string, email: string, created_at: string, status: string }[]>('/admin/users');
  return data;
}

export async function updateUserStatus(userId: string, status: 'active' | 'blocked') {
  await api.post(`/admin/users/${userId}/status`, { status });
}

export async function deleteAdminContent(id: string) {
  await api.delete(`/admin/content/${id}`);
}

export async function fetchAllAdminContent() {
  const { data } = await api.get<(GeneratedContent & { users: { name: string } | null })[]>('/admin/content');
  return data;
}


export async function authExchange(supabaseToken: string) {
  const { data } = await api.post<{ token: string; user: { id: string; name: string; email: string } }>(
    '/auth/exchange',
    { supabaseToken }
  );
  return data;
}
