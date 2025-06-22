import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Footer } from '../../components/Footer';

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders footer with default props', () => {
    render(<Footer />);

    expect(
      screen.getByText('Subscribe to Tech.ish Thoughts')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Get the latest articles and insights delivered to your inbox.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Tech.ish Thoughts')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Insights, tutorials, and thoughts from tech enthusiasts, developers, and designers.'
      )
    ).toBeInTheDocument();
  });

  it('renders footer with custom props', () => {
    render(
      <Footer
        siteTitle='Custom Blog'
        siteDescription='Custom description'
        currentYear={2023}
      />
    );

    expect(screen.getByText('Subscribe to Custom Blog')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(
      screen.getByText('© 2023 Custom Blog. All rights reserved.')
    ).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Footer />);

    // Quick Links
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All Articles' })).toHaveAttribute(
      'href',
      '/posts/'
    );
    expect(screen.getByRole('link', { name: 'Contributors' })).toHaveAttribute(
      'href',
      '/contributors/'
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about/'
    );
    expect(screen.getByRole('link', { name: 'Tags' })).toHaveAttribute(
      'href',
      '/tags/'
    );

    // Categories
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Frontend' })).toHaveAttribute(
      'href',
      '/categories/frontend/'
    );
    expect(screen.getByRole('link', { name: 'Backend' })).toHaveAttribute(
      'href',
      '/categories/backend/'
    );
    expect(screen.getByRole('link', { name: 'DevOps' })).toHaveAttribute(
      'href',
      '/categories/devops/'
    );
    expect(screen.getByRole('link', { name: 'UI/UX' })).toHaveAttribute(
      'href',
      '/categories/design/'
    );
  });

  it('renders social media links', () => {
    render(<Footer />);

    expect(screen.getByLabelText('GitHub')).toHaveAttribute(
      'href',
      'https://github.com/techishthoughts'
    );
    expect(screen.getByLabelText('Twitter')).toHaveAttribute(
      'href',
      'https://twitter.com/techishthoughts'
    );
    expect(screen.getByLabelText('LinkedIn')).toHaveAttribute(
      'href',
      'https://linkedin.com/company/techishthoughts'
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'href',
      'mailto:hello@techishthoughts.com'
    );
  });

  it('renders footer links', () => {
    render(<Footer />);

    expect(
      screen.getByRole('link', { name: 'Privacy Policy' })
    ).toHaveAttribute('href', '/privacy/');
    expect(
      screen.getByRole('link', { name: 'Terms of Service' })
    ).toHaveAttribute('href', '/terms/');
    expect(screen.getByRole('link', { name: 'RSS Feed' })).toHaveAttribute(
      'href',
      '/rss.xml'
    );
  });

  it('handles email subscription form', async () => {
    render(<Footer />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const subscribeButton = screen.getByRole('button', { name: 'Subscribe' });

    expect(emailInput).toBeInTheDocument();
    expect(subscribeButton).toBeInTheDocument();

    // Test form submission
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(subscribeButton);

    expect(subscribeButton).toHaveTextContent('Subscribing...');
    expect(subscribeButton).toBeDisabled();

    await waitFor(
      () => {
        expect(
          screen.getByText(
            '✓ Successfully subscribed! Check your email for confirmation.'
          )
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(emailInput).toHaveValue('');
    expect(subscribeButton).toHaveTextContent('Subscribe');
    expect(subscribeButton).not.toBeDisabled();
  });

  it('shows no spam message', () => {
    render(<Footer />);

    expect(
      screen.getByText('No spam, unsubscribe at any time.')
    ).toBeInTheDocument();
  });

  it('requires email for subscription', () => {
    render(<Footer />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    expect(emailInput).toBeRequired();
  });

  it('prevents submission with empty email', () => {
    render(<Footer />);

    const subscribeButton = screen.getByRole('button', { name: 'Subscribe' });

    // Try to submit without email
    fireEvent.click(subscribeButton);

    // Button should not show loading state
    expect(subscribeButton).toHaveTextContent('Subscribe');
    expect(subscribeButton).not.toBeDisabled();
  });

  it('handles subscription with valid email', async () => {
    render(<Footer />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const subscribeButton = screen.getByRole('button', { name: 'Subscribe' });

    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.submit(subscribeButton.closest('form')!);

    expect(subscribeButton).toHaveTextContent('Subscribing...');

    await waitFor(
      () => {
        expect(
          screen.getByText(
            '✓ Successfully subscribed! Check your email for confirmation.'
          )
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('displays current year in copyright', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);

    expect(
      screen.getByText(
        `© ${currentYear} Tech.ish Thoughts. All rights reserved.`
      )
    ).toBeInTheDocument();
  });

  it('social links have proper attributes', () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText('GitHub');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const twitterLink = screen.getByLabelText('Twitter');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');

    const linkedinLink = screen.getByLabelText('LinkedIn');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
