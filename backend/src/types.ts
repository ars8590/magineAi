export type GenerationRequest = {
  age: number;
  genre: string;
  theme: string;
  keywords: string;
  language: string;
  pages?: number;
};

export type GeneratedContent = {
  id: string;
  user_id?: string | null;
  title: string;
  introduction: string;
  main_story: string;
  character_highlights: string;
  conclusion: string;
  image_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
};

