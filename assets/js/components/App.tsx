import React from 'react';
import { createRoot } from 'react-dom/client';
import Footer from './Footer';
import ThemeToggle from './ui/ThemeToggle';

interface AppProps {
  siteTitle?: string;
  siteDescription?: string;
}

const App: React.FC<AppProps> = ({
  siteTitle = 'Tech.ish Thoughts',
  siteDescription = 'Insights, tutorials, and thoughts from tech enthusiasts, developers, and designers.',
}) => {
  return (
    <>
      {/* Theme Toggle - will be rendered in header */}
      <div id='theme-toggle-container'>
        <ThemeToggle />
      </div>

      {/* Footer - will replace the static footer */}
      <div id='footer-container'>
        <Footer siteTitle={siteTitle} siteDescription={siteDescription} />
      </div>
    </>
  );
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Mount theme toggle in header if container exists
  const themeToggleContainer = document.getElementById('theme-toggle-mount');
  if (themeToggleContainer) {
    const themeRoot = createRoot(themeToggleContainer);
    themeRoot.render(<ThemeToggle />);
  }

  // Mount footer if container exists
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

export default App;
