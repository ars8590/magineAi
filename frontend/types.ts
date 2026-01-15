export interface GenerationRequest {
    age: number;
    genre: string;
    theme: string;
    keywords: string | string[]; // Allow both for flexibility in form handling
    language: string;
    pages?: number;
}

export interface GeneratedContent {
    id: string;
    user_id: string | null;
    title: string;
    introduction: string;
    mainStory: string; // JSON string of MagazineStructure
    characterHighlights: string;
    conclusion: string;
    content?: string; // Legacy
    images: string[];
    image_url?: string | null; // Legacy
    type: 'magazine' | 'book' | 'story';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface FeedbackPayload {
    contentId: string;
    rating: number;
    comment: string;
}

export interface AdminModeration {
    contentId: string;
    action: 'approve' | 'reject';
}

export interface MagazinePage {
    pageNumber: number;
    type: 'COVER' | 'EDITOR_NOTE' | 'CONTENTS' | 'INTRODUCTION' | 'CHAPTER' | 'FEATURE' | 'SUMMARY' | 'BACK_COVER';
    title?: string;
    content?: string;
    image?: string;
    imagePrompt?: string;
    layout?: 'simple-text' | 'image-right' | 'image-left' | 'image-top' | 'image-bottom' | 'full-image' | 'quote-break';
    chapterNumber?: number;
}

export interface MagazineStructure {
    title: string;
    totalPages: number;
    pages: MagazinePage[];
}
