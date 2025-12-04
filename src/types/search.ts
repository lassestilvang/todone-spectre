export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type?: string;
  data?: any;
}

export interface SearchOptions {
  limit?: number;
  types?: string[];
  sortBy?: 'relevance' | 'title' | 'type';
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
}