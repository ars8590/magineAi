import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { GeneratedContent, GenerationRequest } from '../types';

let supabase: SupabaseClient | null = null;
const IMAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'magazine-images';


export function getClient() {
  if (!supabase) {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Supabase credentials missing');
    }
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return supabase;
}

export async function verifySupabaseToken(token: string) {
  const client = getClient();
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error) return null;
  return user;
}

export async function savePreference(userId: string | null, input: GenerationRequest) {
  const client = getClient();
  await client.from('preferences').insert({
    user_id: userId,
    age: input.age,
    genre: input.genre,
    theme: input.theme,
    keywords: input.keywords,
    language: input.language
  });
}

export async function saveGeneratedContent(
  userId: string | null,
  payload: Omit<GeneratedContent, 'id'>
) {
  const client = getClient();
  const { data, error } = await client
    .from('generated_content')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as GeneratedContent;
}

export async function fetchGeneratedContent(id: string) {
  const client = getClient();
  const { data, error } = await client.from('generated_content').select('*').eq('id', id).single();
  if (error) throw error;
  return data as GeneratedContent;
}

export async function saveFeedback(contentId: string, userId: string | null, rating: number, comment: string) {
  const client = getClient();
  const { error } = await client.from('feedback').insert({
    content_id: contentId,
    user_id: userId,
    rating,
    comment
  });
  if (error) throw error;
}

export async function findAdmin(username: string) {
  const client = getClient();
  const { data, error } = await client.from('admins').select('*').eq('username', username).single();
  if (error) throw error;
  return data;
}

export async function createUser(email: string, passwordHash: string, name: string) {
  const client = getClient();
  const { data, error } = await client
    .from('users')
    .insert({ email, password_hash: passwordHash, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function findUser(email: string) {
  const client = getClient();
  const { data, error } = await client.from('users').select('*').eq('email', email).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function moderateContentRecord(contentId: string, status: 'approved' | 'rejected') {
  const client = getClient();
  const { error } = await client
    .from('generated_content')
    .update({ status })
    .eq('id', contentId);
  if (error) throw error;
}

/**
 * Fetch an image from a URL and upload it into Supabase Storage.
 * Returns the public URL stored in your bucket.
 */
export async function uploadImageFromUrl(sourceUrl: string) {
  const client = getClient();

  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  const ext = contentType.split('/')[1] || 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await client.storage
    .from(IMAGE_BUCKET)
    .upload(fileName, Buffer.from(arrayBuffer), {
      contentType,
      upsert: false
    });

  if (error) throw error;

  const { data } = client.storage.from(IMAGE_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}


export async function getUserLibrary(userId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('generated_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (error) throw error;

  // Backfill 'type' since DB doesn't have it yet
  const typedData = (data as GeneratedContent[]).map(item => ({
    ...item,
    type: 'magazine'
  }));

  return typedData;
}

export async function getAllUsers() {
  const client = getClient();
  const { data, error } = await client.from('users').select('id, name, email, created_at, status').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateUserStatus(userId: string, status: 'active' | 'blocked') {
  const client = getClient();
  const { error } = await client.from('users').update({ status }).eq('id', userId);
  if (error) throw error;
}

export async function deleteGeneratedContent(contentId: string) {
  const client = getClient();
  const { error } = await client.from('generated_content').delete().eq('id', contentId);
  if (error) throw error;
}

export async function getAllContent() {
  const client = getClient();
  const { data, error } = await client.from('generated_content').select('*, users(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data as (GeneratedContent & { users: { name: string } | null })[];
}
