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
  main_story: string; // Can store JSON string of MagazineStructure
  character_highlights: string;
  conclusion: string;
  image_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  type?: string;
};

export type MagazinePage = {
  pageNumber: number;
  type: 'COVER' | 'EDITOR_NOTE' | 'CONTENTS' | 'INTRODUCTION' | 'CHAPTER' | 'FEATURE' | 'SUMMARY' | 'BACK_COVER';
  title?: string;
  content?: string;
  image?: string;
  imagePrompt?: string; // Semantic description for the image
  layout?: 'simple-text' | 'image-right' | 'image-left' | 'image-top' | 'image-bottom' | 'full-image' | 'quote-break';
  chapterNumber?: number;
};

export type MagazineStructure = {
  title: string;
  totalPages: number;
  pages: MagazinePage[];
};

