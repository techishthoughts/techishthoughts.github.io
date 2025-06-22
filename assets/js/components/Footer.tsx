import React, { useState } from 'react';

interface FooterProps {
  siteTitle?: string;
  siteDescription?: string;
  currentYear?: number;
}

export const Footer: React.FC<FooterProps> = ({
  siteTitle = 'Tech.ish Thoughts',
  siteDescription = 'Insights, tutorials, and thoughts from tech enthusiasts, developers, and designers.',
  currentYear = new Date().getFullYear(),
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubscribing) return;

    setIsSubscribing(true);

    // Simulate subscription (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscriptionStatus('success');
      setEmail('');
    } catch {
      setSubscriptionStatus('error');
    } finally {
      setIsSubscribing(false);
      setTimeout(() => setSubscriptionStatus('idle'), 3000);
    }
  };

  return (
    <footer className='bg-gray-50 dark:bg-gray-900 mt-16 border-t border-gray-200 dark:border-gray-700'>
      <div className='container py-16'>
        {/* Newsletter Section */}
        <div className='text-center mb-16 max-w-2xl mx-auto'>
          <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
            Subscribe to {siteTitle}
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-300 mb-8'>
            Get the latest articles and insights delivered to your inbox.
          </p>

          <form
            onSubmit={handleSubscribe}
            className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'
          >
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Enter your email'
              className='flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
              required
            />
            <button
              type='submit'
              disabled={isSubscribing}
              className='btn-primary px-6 py-3 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {subscriptionStatus === 'success' && (
            <p className='text-green-600 dark:text-green-400 mt-4'>
              ✓ Successfully subscribed! Check your email for confirmation.
            </p>
          )}

          {subscriptionStatus === 'error' && (
            <p className='text-red-600 dark:text-red-400 mt-4'>
              ✗ Something went wrong. Please try again.
            </p>
          )}

          <p className='text-sm text-gray-500 dark:text-gray-400 mt-4'>
            No spam, unsubscribe at any time.
          </p>
        </div>

        {/* Footer Links */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-12'>
          <div className='md:col-span-2'>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
              {siteTitle}
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-6 max-w-md'>
              {siteDescription}
            </p>
            <div className='flex gap-4'>
              <a
                href='https://github.com/techishthoughts'
                className='social-link github'
                aria-label='GitHub'
                target='_blank'
                rel='noopener noreferrer'
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                </svg>
              </a>
              <a
                href='https://twitter.com/techishthoughts'
                className='social-link twitter'
                aria-label='Twitter'
                target='_blank'
                rel='noopener noreferrer'
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                </svg>
              </a>
              <a
                href='https://linkedin.com/company/techishthoughts'
                className='social-link linkedin'
                aria-label='LinkedIn'
                target='_blank'
                rel='noopener noreferrer'
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                </svg>
              </a>
              <a
                href='mailto:hello@techishthoughts.com'
                className='social-link email'
                aria-label='Email'
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z' />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className='font-semibold text-gray-900 dark:text-white mb-4'>
              Quick Links
            </h4>
            <ul className='space-y-3 text-gray-600 dark:text-gray-300'>
              <li>
                <a href='/posts/' className='hover:text-primary-500 transition'>
                  All Articles
                </a>
              </li>
              <li>
                <a
                  href='/contributors/'
                  className='hover:text-primary-500 transition'
                >
                  Contributors
                </a>
              </li>
              <li>
                <a href='/about/' className='hover:text-primary-500 transition'>
                  About
                </a>
              </li>
              <li>
                <a href='/tags/' className='hover:text-primary-500 transition'>
                  Tags
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-gray-900 dark:text-white mb-4'>
              Categories
            </h4>
            <ul className='space-y-3 text-gray-600 dark:text-gray-300'>
              <li>
                <a
                  href='/categories/frontend/'
                  className='hover:text-primary-500 transition'
                >
                  Frontend
                </a>
              </li>
              <li>
                <a
                  href='/categories/backend/'
                  className='hover:text-primary-500 transition'
                >
                  Backend
                </a>
              </li>
              <li>
                <a
                  href='/categories/devops/'
                  className='hover:text-primary-500 transition'
                >
                  DevOps
                </a>
              </li>
              <li>
                <a
                  href='/categories/design/'
                  className='hover:text-primary-500 transition'
                >
                  UI/UX
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>
            © {currentYear} {siteTitle}. All rights reserved.
          </p>
          <div className='flex gap-6 text-sm text-gray-500 dark:text-gray-400'>
            <a href='/privacy/' className='hover:text-primary-500 transition'>
              Privacy Policy
            </a>
            <a href='/terms/' className='hover:text-primary-500 transition'>
              Terms of Service
            </a>
            <a href='/rss.xml' className='hover:text-primary-500 transition'>
              RSS Feed
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
