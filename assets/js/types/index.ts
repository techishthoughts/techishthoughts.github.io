/**
 * Core Types for Tech.ish Thoughts Blog
 */

// Author types
export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  email?: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  joinedDate: string;
  articlesCount?: number;
  isActive: boolean;
}

// Article/Post types
export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  plainContent: string; // For text-to-speech and search
  author: string; // Author ID
  publishedDate: string;
  updatedDate?: string;
  readingTime: number;
  wordCount: number;
  tags: string[];
  categories?: string[];
  featured: boolean;
  draft: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  permalink: string;
  relatedPosts?: string[]; // Article IDs
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articlesCount: number;
  createdDate: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string; // Parent category ID
  articlesCount: number;
  createdDate: string;
}

// Search types
export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  author: string;
  publishedDate: string;
  tags: string[];
  permalink: string;
  score: number; // Relevance score
  highlightedContent?: string;
}

export interface SearchFilters {
  tags?: string[];
  categories?: string[];
  authors?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'relevance' | 'date' | 'title' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
}

// Text-to-Speech types
export interface TTSSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string | null;
  autoPlay: boolean;
  highlightText: boolean;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentPosition: number;
  duration: number;
  settings: TTSSettings;
  error: string | null;
  availableVoices: SpeechSynthesisVoice[];
}

// UI/Component types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Hugo/Static site types
export interface HugoConfig {
  baseURL: string;
  title: string;
  description: string;
  author: string;
  languageCode: string;
  paginate: number;
  enableGitInfo: boolean;
  enableRobotsTXT: boolean;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: Record<string, string>;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  stack?: string;
}

// State management types
export interface AppState {
  articles: Article[];
  authors: Author[];
  tags: Tag[];
  categories: Category[];
  search: SearchState;
  tts: TTSState;
  theme: Theme;
  loading: {
    articles: boolean;
    search: boolean;
    tts: boolean;
  };
  errors: {
    articles: AppError | null;
    search: AppError | null;
    tts: AppError | null;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  data?: any;
}

// Form types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<keyof T, boolean>;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// Content types for Hugo
export interface HugoPage {
  title: string;
  date: string;
  draft: boolean;
  tags?: string[];
  categories?: string[];
  author?: string;
  summary?: string;
  featured?: boolean;
  weight?: number;
  type?: string;
  layout?: string;
  url?: string;
  aliases?: string[];
  [key: string]: any; // Allow additional frontmatter fields
}

// Social Features Types
export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    website?: string;
  };
  content: string;
  parentId?: string; // For nested replies
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface PostInteraction {
  postId: string;
  likes: number;
  shares: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface ShareOptions {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'email' | 'copy';
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
}

export interface CommentFormData {
  name: string;
  email: string;
  website?: string;
  content: string;
  parentId?: string;
}

export interface SocialStats {
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  popularPosts: string[];
  engagementRate: number;
}

// Export all types as a namespace for easier imports
export namespace BlogTypes {
  export type TAuthor = Author;
  export type TArticle = Article;
  export type TTag = Tag;
  export type TCategory = Category;
  export type TSearchResult = SearchResult;
  export type TSearchState = SearchState;
  export type TTTSState = TTSState;
  export type TAppState = AppState;
  export type TTheme = Theme;
  export type TApiResponse<T> = ApiResponse<T>;
  export type TAppError = AppError;
}
