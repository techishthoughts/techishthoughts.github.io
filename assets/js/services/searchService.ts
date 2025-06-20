import Fuse, {
  type FuseResult,
  type FuseResultMatch,
  type IFuseOptions,
} from 'fuse.js';
import { debounce } from 'lodash-es';
import type {
  Article,
  Author,
  SearchFilters,
  SearchResult,
  Tag,
} from '../types';

/**
 * Advanced Search Service using Fuse.js
 * Features: Fuzzy search, filters, sorting, pagination, highlighting
 */
class SearchService {
  private articlesFuse: Fuse<Article> | null = null;
  private authorsFuse: Fuse<Author> | null = null;
  private tagsFuse: Fuse<Tag> | null = null;

  // Fuse.js options for articles
  private readonly articlesOptions: IFuseOptions<Article> = {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'summary', weight: 0.3 },
      { name: 'plainContent', weight: 0.4 },
      { name: 'tags', weight: 0.2 },
      { name: 'author', weight: 0.1 },
    ],
    threshold: 0.3, // Lower = more strict matching
    distance: 100,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
    findAllMatches: true,
    ignoreLocation: true,
  };

  // Fuse.js options for authors
  private readonly authorsOptions: IFuseOptions<Author> = {
    keys: [
      { name: 'name', weight: 0.8 },
      { name: 'bio', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
  };

  // Fuse.js options for tags
  private readonly tagsOptions: IFuseOptions<Tag> = {
    keys: [
      { name: 'name', weight: 0.9 },
      { name: 'description', weight: 0.1 },
    ],
    threshold: 0.2,
    includeScore: true,
    includeMatches: true,
  };

  /**
   * Initialize search indices
   */
  public initializeIndices(
    articles: Article[],
    authors: Author[],
    tags: Tag[]
  ): void {
    // Filter out draft articles for public search
    const publishedArticles = articles.filter(article => !article.draft);

    this.articlesFuse = new Fuse(publishedArticles, this.articlesOptions);
    this.authorsFuse = new Fuse(authors, this.authorsOptions);
    this.tagsFuse = new Fuse(tags, this.tagsOptions);
  }

  /**
   * Update search indices with new data
   */
  public updateIndices(
    articles?: Article[],
    authors?: Author[],
    tags?: Tag[]
  ): void {
    if (articles && this.articlesFuse) {
      const publishedArticles = articles.filter(article => !article.draft);
      this.articlesFuse.setCollection(publishedArticles);
    }

    if (authors && this.authorsFuse) {
      this.authorsFuse.setCollection(authors);
    }

    if (tags && this.tagsFuse) {
      this.tagsFuse.setCollection(tags);
    }
  }

  /**
   * Search articles with filters and sorting
   */
  public async searchArticles(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    results: SearchResult[];
    totalResults: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!this.articlesFuse) {
      throw new Error('Search index not initialized');
    }

    let results: SearchResult[] = [];

    if (query.trim()) {
      // Perform fuzzy search
      const fuseResults = this.articlesFuse.search(query);

      results = fuseResults.map(result => ({
        id: result.item.id,
        title: result.item.title,
        summary: result.item.summary,
        author: result.item.author,
        publishedDate: result.item.publishedDate,
        tags: result.item.tags,
        permalink: result.item.permalink,
        score: result.score || 0,
        highlightedContent: this.highlightMatches(result),
      }));
    } else {
      // No query - return all articles
      const allArticles = (this.articlesFuse as any)._docs as Article[];
      results = allArticles.map((article: Article) => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        author: article.author,
        publishedDate: article.publishedDate,
        tags: article.tags,
        permalink: article.permalink,
        score: 1,
        highlightedContent: undefined,
      }));
    }

    // Apply filters
    results = this.applyFilters(results, filters);

    // Apply sorting
    results = this.applySorting(results, filters);

    // Calculate pagination
    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      totalResults,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Search authors
   */
  public async searchAuthors(query: string): Promise<Author[]> {
    if (!this.authorsFuse || !query.trim()) {
      return [];
    }

    const results = this.authorsFuse.search(query);
    return results.map(result => result.item);
  }

  /**
   * Search tags
   */
  public async searchTags(query: string): Promise<Tag[]> {
    if (!this.tagsFuse || !query.trim()) {
      return [];
    }

    const results = this.tagsFuse.search(query);
    return results.map(result => result.item);
  }

  /**
   * Get search suggestions
   */
  public async getSearchSuggestions(
    query: string,
    limit: number = 5
  ): Promise<{
    articles: string[];
    authors: string[];
    tags: string[];
  }> {
    if (!query.trim()) {
      return { articles: [], authors: [], tags: [] };
    }

    const [articleResults, authorResults, tagResults] = await Promise.all([
      this.searchArticles(query, {}, 1, limit),
      this.searchAuthors(query),
      this.searchTags(query),
    ]);

    return {
      articles: articleResults.results.slice(0, limit).map(r => r.title),
      authors: authorResults.slice(0, limit).map(a => a.name),
      tags: tagResults.slice(0, limit).map(t => t.name),
    };
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(
    results: SearchResult[],
    filters: SearchFilters
  ): SearchResult[] {
    let filteredResults = [...results];

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filteredResults = filteredResults.filter(result =>
        filters.tags!.some(tag => result.tags.includes(tag))
      );
    }

    // Filter by authors
    if (filters.authors && filters.authors.length > 0) {
      filteredResults = filteredResults.filter(result =>
        filters.authors!.includes(result.author)
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredResults = filteredResults.filter(
        result => new Date(result.publishedDate) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredResults = filteredResults.filter(
        result => new Date(result.publishedDate) <= toDate
      );
    }

    return filteredResults;
  }

  /**
   * Apply sorting to search results
   */
  private applySorting(
    results: SearchResult[],
    filters: SearchFilters
  ): SearchResult[] {
    const sortBy = filters.sortBy || 'relevance';
    const sortOrder = filters.sortOrder || 'desc';

    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case 'date':
          comparison =
            new Date(a.publishedDate).getTime() -
            new Date(b.publishedDate).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Highlight matching text in search results
   */
  private highlightMatches(result: FuseResult<Article>): string | undefined {
    if (!result.matches || result.matches.length === 0) {
      return undefined;
    }

    const contentMatch = result.matches.find(
      (match: FuseResultMatch) =>
        match.key === 'plainContent' || match.key === 'summary'
    );

    if (!contentMatch) {
      return undefined;
    }

    let content = result.item.plainContent || result.item.summary;
    if (!content || !contentMatch.indices) {
      return undefined;
    }

    let highlightedContent = content;
    let offset = 0;

    contentMatch.indices.forEach(([start, end]: [number, number]) => {
      const before = highlightedContent.slice(0, start + offset);
      const match = highlightedContent.slice(start + offset, end + 1 + offset);
      const after = highlightedContent.slice(end + 1 + offset);

      highlightedContent = before + '<mark>' + match + '</mark>' + after;
      offset += 13; // Length of '<mark>' + '</mark>'
    });

    // Return excerpt around first match
    const excerptLength = 200;
    const firstMatchIndex = contentMatch.indices[0][0];
    const startIndex = Math.max(0, firstMatchIndex - excerptLength / 2);
    const endIndex = Math.min(content.length, startIndex + excerptLength);

    return (
      highlightedContent.slice(startIndex, endIndex) +
      (endIndex < content.length ? '...' : '')
    );
  }

  /**
   * Debounced search function for real-time search
   */
  public debouncedSearch = debounce(
    async (
      query: string,
      filters: SearchFilters,
      callback: (results: SearchResult[]) => void
    ) => {
      try {
        const searchResults = await this.searchArticles(query, filters);
        callback(searchResults.results);
      } catch (error) {
        console.error('Search error:', error);
        callback([]);
      }
    },
    300 // 300ms delay
  );

  /**
   * Clear search index
   */
  public clearIndices(): void {
    this.articlesFuse = null;
    this.authorsFuse = null;
    this.tagsFuse = null;
  }

  /**
   * Get search statistics
   */
  public getSearchStats(): {
    articlesIndexed: number;
    authorsIndexed: number;
    tagsIndexed: number;
    isReady: boolean;
  } {
    // Use collection length instead of index size
    const articlesCount = this.articlesFuse
      ? (this.articlesFuse as any)._docs?.length || 0
      : 0;
    const authorsCount = this.authorsFuse
      ? (this.authorsFuse as any)._docs?.length || 0
      : 0;
    const tagsCount = this.tagsFuse
      ? (this.tagsFuse as any)._docs?.length || 0
      : 0;

    return {
      articlesIndexed: articlesCount,
      authorsIndexed: authorsCount,
      tagsIndexed: tagsCount,
      isReady: Boolean(this.articlesFuse && this.authorsFuse && this.tagsFuse),
    };
  }
}

// Export singleton instance
export const searchService = new SearchService();

// Export utilities for use in components
export const createSearchQuery = (
  query: string,
  filters: SearchFilters = {}
): string => {
  const params = new URLSearchParams();

  if (query) params.set('q', query);
  if (filters.tags?.length) params.set('tags', filters.tags.join(','));
  if (filters.authors?.length) params.set('authors', filters.authors.join(','));
  if (filters.categories?.length)
    params.set('categories', filters.categories.join(','));
  if (filters.dateFrom) params.set('from', filters.dateFrom);
  if (filters.dateTo) params.set('to', filters.dateTo);
  if (filters.sortBy) params.set('sort', filters.sortBy);
  if (filters.sortOrder) params.set('order', filters.sortOrder);

  return params.toString();
};

export const parseSearchQuery = (
  queryString: string
): {
  query: string;
  filters: SearchFilters;
} => {
  const params = new URLSearchParams(queryString);

  return {
    query: params.get('q') || '',
    filters: {
      tags: params.get('tags')?.split(',').filter(Boolean) || [],
      authors: params.get('authors')?.split(',').filter(Boolean) || [],
      categories: params.get('categories')?.split(',').filter(Boolean) || [],
      dateFrom: params.get('from') || undefined,
      dateTo: params.get('to') || undefined,
      sortBy: (params.get('sort') as SearchFilters['sortBy']) || 'relevance',
      sortOrder: (params.get('order') as SearchFilters['sortOrder']) || 'desc',
    },
  };
};
