import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
    Article,
    Author,
    Category,
    Comment,
    CommentFormData,
    PostInteraction,
    SearchState,
    SocialStats,
    Tag,
    TTSState,
} from '../types';

interface AppState {
  // Content
  articles: Article[];
  authors: Author[];
  tags: Tag[];
  categories: Category[];

  // Search
  search: SearchState;

  // Text-to-Speech
  tts: TTSState;

  // UI State
  darkMode: boolean;
  sidebarOpen: boolean;

  // Social Features
  interactions: Record<string, PostInteraction>;
  comments: Record<string, Comment[]>;
  commentForm: {
    isOpen: boolean;
    parentId?: string;
    postId?: string;
  };
  stats: SocialStats;
  userPreferences: {
    name?: string;
    email?: string;
    website?: string;
    notifications: {
      replies: boolean;
      likes: boolean;
      newPosts: boolean;
    };
  };
}

/* eslint-disable no-unused-vars */
interface AppActions {
  // Content actions
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  removeArticle: (id: string) => void;

  setAuthors: (authors: Author[]) => void;
  addAuthor: (author: Author) => void;
  updateAuthor: (id: string, updates: Partial<Author>) => void;
  removeAuthor: (id: string) => void;

  setTags: (tags: Tag[]) => void;
  addTag: (tag: Omit<Tag, 'id' | 'createdDate'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  removeTag: (id: string) => void;
  getPopularTags: () => Tag[];

  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;

  // Search actions
  updateSearch: (updates: Partial<SearchState>) => void;
  clearSearch: () => void;

  // TTS actions
  updateTTS: (updates: Partial<TTSState>) => void;
  setTTSState: (state: Partial<TTSState>) => void;

  // UI actions
  toggleDarkMode: () => void;
  toggleSidebar: () => void;

  // Social actions
  toggleLike: (postId: string) => Promise<void>;
  sharePost: (
    postId: string,
    platform: string,
    url: string,
    title: string
  ) => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  addComment: (postId: string, commentData: CommentFormData) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  openCommentForm: (postId: string, parentId?: string) => void;
  closeCommentForm: () => void;
  updateStats: () => Promise<void>;
  updateUserPreferences: (
    preferences: Partial<AppState['userPreferences']>
  ) => void;
}
/* eslint-enable no-unused-vars */

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        articles: [],
        authors: [],
        tags: [],
        categories: [],

        darkMode: false,
        sidebarOpen: false,

        search: {
          query: '',
          results: [],
          isLoading: false,
          error: null,
          totalResults: 0,
          currentPage: 1,
          resultsPerPage: 10,
          filters: {
            tags: [],
            categories: [],
            authors: [],
            sortBy: 'relevance',
            sortOrder: 'desc',
          },
        },

        tts: {
          isPlaying: false,
          isPaused: false,
          isLoading: false,
          currentPosition: 0,
          duration: 0,
          settings: {
            rate: 1,
            pitch: 1,
            volume: 1,
            voice: null,
            autoPlay: false,
            highlightText: true,
          },
          error: null,
          availableVoices: [],
        },

        // Social state
        interactions: {},
        comments: {},
        commentForm: {
          isOpen: false,
        },
        stats: {
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0,
          popularPosts: [],
          engagementRate: 0,
        },
        userPreferences: {
          notifications: {
            replies: true,
            likes: false,
            newPosts: true,
          },
        },

        // Content actions
        setArticles: (articles: Article[]) =>
          set(state => {
            state.articles = articles;
          }),

        addArticle: (article: Article) =>
          set(state => {
            state.articles.push(article);
          }),

        updateArticle: (id: string, updates: Partial<Article>) =>
          set(state => {
            const index = state.articles.findIndex(
              (article: Article) => article.id === id
            );
            if (index !== -1) {
              state.articles[index] = { ...state.articles[index], ...updates };
            }
          }),

        removeArticle: (id: string) =>
          set(state => {
            state.articles = state.articles.filter(
              (article: Article) => article.id !== id
            );
          }),

        // Author actions
        setAuthors: (authors: Author[]) =>
          set(state => {
            state.authors = authors;
          }),

        addAuthor: (author: Author) =>
          set(state => {
            state.authors.push(author);
          }),

        updateAuthor: (id: string, updates: Partial<Author>) =>
          set(state => {
            const index = state.authors.findIndex(
              (author: Author) => author.id === id
            );
            if (index !== -1) {
              state.authors[index] = { ...state.authors[index], ...updates };
            }
          }),

        removeAuthor: (id: string) =>
          set(state => {
            state.authors = state.authors.filter(
              (author: Author) => author.id !== id
            );
          }),

        // Tag actions
        setTags: (tags: Tag[]) =>
          set(state => {
            state.tags = tags;
          }),

        addTag: tagData =>
          set(state => {
            const newTag: Tag = {
              ...tagData,
              id: Date.now().toString(),
              createdDate: new Date().toISOString(),
            };
            state.tags.push(newTag);
          }),

        updateTag: (id, updates) =>
          set(state => {
            const index = state.tags.findIndex(tag => tag.id === id);
            if (index !== -1) {
              Object.assign(state.tags[index], updates);
            }
          }),

        removeTag: (id: string) =>
          set(state => {
            state.tags = state.tags.filter((tag: Tag) => tag.id !== id);
          }),

        getPopularTags: () => {
          const state = get();
          return [...state.tags].sort(
            (a, b) => b.articlesCount - a.articlesCount
          );
        },

        // Category actions
        setCategories: (categories: Category[]) =>
          set(state => {
            state.categories = categories;
          }),

        addCategory: (category: Category) =>
          set(state => {
            state.categories.push(category);
          }),

        updateCategory: (id: string, updates: Partial<Category>) =>
          set(state => {
            const index = state.categories.findIndex(
              (category: Category) => category.id === id
            );
            if (index !== -1) {
              state.categories[index] = {
                ...state.categories[index],
                ...updates,
              };
            }
          }),

        removeCategory: (id: string) =>
          set(state => {
            state.categories = state.categories.filter(
              (category: Category) => category.id !== id
            );
          }),

        // Search actions
        updateSearch: updates =>
          set(state => {
            Object.assign(state.search, updates);
          }),

        clearSearch: () =>
          set(state => {
            state.search = {
              query: '',
              results: [],
              isLoading: false,
              error: null,
              totalResults: 0,
              currentPage: 1,
              resultsPerPage: 10,
              filters: {
                tags: [],
                categories: [],
                authors: [],
                sortBy: 'relevance',
                sortOrder: 'desc',
              },
            };
          }),

        // UI actions
        toggleDarkMode: () =>
          set(state => {
            state.darkMode = !state.darkMode;
          }),

        toggleSidebar: () =>
          set(state => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        // TTS actions
        updateTTS: updates =>
          set(state => {
            Object.assign(state.tts, updates);
          }),

        setTTSState: (newState: Partial<TTSState>) =>
          set(state => {
            state.tts = { ...state.tts, ...newState };
          }),

        // Social actions
        toggleLike: async (postId: string) => {
          const state = get();
          const currentInteraction = state.interactions[postId] || {
            postId,
            likes: 0,
            shares: 0,
            comments: 0,
            isLiked: false,
            isBookmarked: false,
          };

          try {
            // Optimistic update
            set(state => {
              const interaction =
                state.interactions[postId] || currentInteraction;
              interaction.isLiked = !interaction.isLiked;
              interaction.likes += interaction.isLiked ? 1 : -1;
              state.interactions[postId] = interaction;
            });

            // TODO: Make API call to backend
            // await api.toggleLike(postId);

            // Update stats
            get().updateStats();
          } catch (error) {
            // Revert optimistic update on error
            set(state => {
              const interaction = state.interactions[postId];
              if (interaction) {
                interaction.isLiked = !interaction.isLiked;
                interaction.likes += interaction.isLiked ? 1 : -1;
              }
            });
            console.error('Failed to toggle like:', error);
          }
        },

        sharePost: async (
          postId: string,
          _platform: string,
          _url: string,
          _title: string
        ) => {
          try {
            // Update share count
            set(state => {
              const interaction = state.interactions[postId] || {
                postId,
                likes: 0,
                shares: 0,
                comments: 0,
                isLiked: false,
                isBookmarked: false,
              };
              interaction.shares += 1;
              state.interactions[postId] = interaction;
            });

            // TODO: Make API call to track share
            // await api.trackShare(postId, platform);

            // Update stats
            get().updateStats();
          } catch (error) {
            console.error('Failed to track share:', error);
          }
        },

        loadComments: async (postId: string) => {
          try {
            // TODO: Load comments from API
            // const comments = await api.getComments(postId);

            // Mock data for now
            const mockComments: Comment[] = [
              {
                id: '1',
                postId,
                author: {
                  name: 'John Doe',
                  email: 'john@example.com',
                  avatar: 'https://via.placeholder.com/40',
                },
                content: 'Great article! Thanks for sharing.',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                likes: 3,
                isLiked: false,
                status: 'approved',
              },
              {
                id: '2',
                postId,
                author: {
                  name: 'Jane Smith',
                  email: 'jane@example.com',
                },
                content: 'This helped me understand the concept better.',
                createdAt: new Date(Date.now() - 43200000).toISOString(),
                likes: 1,
                isLiked: true,
                status: 'approved',
              },
            ];

            set(state => {
              state.comments[postId] = mockComments;
            });
          } catch (error) {
            console.error('Failed to load comments:', error);
          }
        },

        addComment: async (postId: string, commentData: CommentFormData) => {
          try {
            const newComment: Comment = {
              id: Date.now().toString(),
              postId,
              author: {
                name: commentData.name,
                email: commentData.email,
                website: commentData.website,
              },
              content: commentData.content,
              parentId: commentData.parentId,
              createdAt: new Date().toISOString(),
              likes: 0,
              isLiked: false,
              status: 'pending',
            };

            // Optimistic update
            set(state => {
              if (!state.comments[postId]) {
                state.comments[postId] = [];
              }

              if (commentData.parentId) {
                // Add as reply
                const parentComment = state.comments[postId].find(
                  c => c.id === commentData.parentId
                );
                if (parentComment) {
                  if (!parentComment.replies) {
                    parentComment.replies = [];
                  }
                  parentComment.replies.push(newComment);
                }
              } else {
                // Add as top-level comment
                state.comments[postId].push(newComment);
              }

              // Update comment count
              const interaction = state.interactions[postId] || {
                postId,
                likes: 0,
                shares: 0,
                comments: 0,
                isLiked: false,
                isBookmarked: false,
              };
              interaction.comments += 1;
              state.interactions[postId] = interaction;
            });

            // TODO: Send to API
            // await api.addComment(postId, commentData);

            // Close comment form
            get().closeCommentForm();

            // Update stats
            get().updateStats();
          } catch (error) {
            console.error('Failed to add comment:', error);
          }
        },

        toggleCommentLike: async (commentId: string) => {
          try {
            set(state => {
              // Find and update comment like status
              Object.values(state.comments).forEach(postComments => {
                const comment = postComments.find(c => c.id === commentId);
                if (comment) {
                  comment.isLiked = !comment.isLiked;
                  comment.likes += comment.isLiked ? 1 : -1;
                } else {
                  // Check replies
                  postComments.forEach(c => {
                    if (c.replies) {
                      const reply = c.replies.find(r => r.id === commentId);
                      if (reply) {
                        reply.isLiked = !reply.isLiked;
                        reply.likes += reply.isLiked ? 1 : -1;
                      }
                    }
                  });
                }
              });
            });

            // TODO: API call
            // await api.toggleCommentLike(commentId);
          } catch (error) {
            console.error('Failed to toggle comment like:', error);
          }
        },

        deleteComment: async (commentId: string) => {
          try {
            set(state => {
              Object.keys(state.comments).forEach(postId => {
                state.comments[postId] = state.comments[postId].filter(
                  c => c.id !== commentId
                );

                // Also remove from replies
                state.comments[postId].forEach(comment => {
                  if (comment.replies) {
                    comment.replies = comment.replies.filter(
                      r => r.id !== commentId
                    );
                  }
                });
              });
            });

            // TODO: API call
            // await api.deleteComment(commentId);
          } catch (error) {
            console.error('Failed to delete comment:', error);
          }
        },

        openCommentForm: (postId: string, parentId?: string) => {
          set(state => {
            state.commentForm = {
              isOpen: true,
              postId,
              parentId,
            };
          });
        },

        closeCommentForm: () => {
          set(state => {
            state.commentForm = {
              isOpen: false,
            };
          });
        },

        updateStats: async () => {
          try {
            const state = get();
            const interactions = Object.values(state.interactions);
            const comments = Object.values(state.comments).flat();

            const stats: SocialStats = {
              totalLikes: interactions.reduce((sum, i) => sum + i.likes, 0),
              totalShares: interactions.reduce((sum, i) => sum + i.shares, 0),
              totalComments: comments.length,
              popularPosts: interactions
                .sort(
                  (a, b) =>
                    b.likes +
                    b.shares +
                    b.comments -
                    (a.likes + a.shares + a.comments)
                )
                .slice(0, 5)
                .map(i => i.postId),
              engagementRate:
                interactions.length > 0
                  ? interactions.reduce(
                      (sum, i) => sum + i.likes + i.shares + i.comments,
                      0
                    ) / interactions.length
                  : 0,
            };

            set(state => {
              state.stats = stats;
            });
          } catch (error) {
            console.error('Failed to update stats:', error);
          }
        },

        updateUserPreferences: preferences => {
          set(state => {
            Object.assign(state.userPreferences, preferences);
          });

          // Save to localStorage
          const state = get();
          localStorage.setItem(
            'blog-user-preferences',
            JSON.stringify(state.userPreferences)
          );
        },
      }))
    ),
    { name: 'blog-store' }
  )
);
