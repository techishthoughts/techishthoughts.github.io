import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CommentsSection } from './components/features/CommentsSection';
import { SocialActions } from './components/features/SocialActions';
import Footer from './components/Footer';
import TextToSpeech from './components/TextToSpeech';
import ThemeToggle from './components/ui/ThemeToggle';
import { SearchProvider } from './context/SearchContext';
import App from './search/App';
import { useAppStore } from './stores/useAppStore';
import './styles/global.css';

interface BlogData {
  postId: string;
  postTitle: string;
  postUrl: string;
  postContent: string;
  author: string;
  tags: string[];
  publishedDate: string;
}

declare global {
  interface Window {
    blogData: BlogData;
  }
}

// Social Actions Component
const SocialActionsApp: React.FC = () => {
  const { loadComments, updateStats } = useAppStore();

  React.useEffect(() => {
    if (window.blogData?.postId) {
      loadComments(window.blogData.postId);
      updateStats();
    }
  }, [loadComments, updateStats]);

  if (!window.blogData) {
    return null;
  }

  const { postId, postTitle, postUrl } = window.blogData;

  return (
    <SocialActions
      postId={postId}
      postTitle={postTitle}
      postUrl={postUrl}
      showLabels={false}
      size='md'
      variant='ghost'
    />
  );
};

// Social Actions Footer Component
const SocialActionsFooterApp: React.FC = () => {
  if (!window.blogData) {
    return null;
  }

  const { postId, postTitle, postUrl } = window.blogData;

  return (
    <SocialActions
      postId={postId}
      postTitle={postTitle}
      postUrl={postUrl}
      showLabels={true}
      size='lg'
      variant='outline'
    />
  );
};

// Text-to-Speech Component
const TextToSpeechApp: React.FC = () => {
  if (!window.blogData) {
    return null;
  }

  const { postContent } = window.blogData;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <TextToSpeech content={postContent} />
    </div>
  );
};

// Comments Component
const CommentsApp: React.FC = () => {
  if (!window.blogData) {
    return null;
  }

  const { postId } = window.blogData;

  return <CommentsSection postId={postId} showForm={true} />;
};

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Search App
  const searchRoot = document.getElementById('search-root');
  if (searchRoot) {
    const root = createRoot(searchRoot);
    root.render(
      <React.StrictMode>
        <ChakraProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </ChakraProvider>
      </React.StrictMode>
    );
  }
  // Social Actions in Header
  const socialActionsElement = document.getElementById('social-actions');
  if (socialActionsElement) {
    const root = createRoot(socialActionsElement);
    root.render(
      <ChakraProvider>
        <SocialActionsApp />
      </ChakraProvider>
    );
  }

  // Social Actions in Footer
  const socialActionsFooterElement = document.getElementById(
    'social-actions-footer'
  );
  if (socialActionsFooterElement) {
    const root = createRoot(socialActionsFooterElement);
    root.render(
      <ChakraProvider>
        <SocialActionsFooterApp />
      </ChakraProvider>
    );
  }

  // Text-to-Speech
  const textToSpeechElement = document.getElementById('text-to-speech');
  if (textToSpeechElement) {
    const root = createRoot(textToSpeechElement);
    root.render(
      <ChakraProvider>
        <TextToSpeechApp />
      </ChakraProvider>
    );
  }

  // Comments Section
  const commentsElement = document.getElementById('comments-section');
  if (commentsElement) {
    const root = createRoot(commentsElement);
    root.render(
      <ChakraProvider>
        <CommentsApp />
      </ChakraProvider>
    );
  }

  // Theme Toggle
  const themeToggleContainer = document.getElementById('theme-toggle-mount');
  if (themeToggleContainer) {
    const themeRoot = createRoot(themeToggleContainer);
    themeRoot.render(<ThemeToggle />);
  }

  // Footer
  const footerContainer = document.getElementById('footer-mount');
  if (footerContainer) {
    const footerRoot = createRoot(footerContainer);
    const siteTitle = footerContainer.dataset.siteTitle || 'Tech.ish Thoughts';
    const siteDescription =
      footerContainer.dataset.siteDescription ||
      'Insights, tutorials, and thoughts from tech enthusiasts, developers, and designers.';

    footerRoot.render(
      <Footer siteTitle={siteTitle} siteDescription={siteDescription} />
    );
  }
});
