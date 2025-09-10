import {
  Badge,
  Button,
  HStack,
  Icon,
  Menu,
  Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { FaReddit } from 'react-icons/fa';
import {
  FiBookmark,
  FiCopy,
  FiFacebook,
  FiHeart,
  FiLinkedin,
  FiMail,
  FiMessageCircle,
  FiShare2,
  FiTwitter,
} from 'react-icons/fi';
import { useAppStore } from '../../stores/useAppStore';
import type { ShareOptions } from '../../types';

interface SocialActionsProps {
  postId: string;
  postTitle: string;
  postUrl: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid' | 'outline';
}

export const SocialActions: React.FC<SocialActionsProps> = ({
  postId,
  postTitle,
  postUrl,
  showLabels = false,
  size = 'md',
  variant = 'ghost',
}) => {
  const { interactions, toggleLike, sharePost, loadComments, openCommentForm } =
    useAppStore();

  const interaction = interactions[postId] || {
    postId,
    likes: 0,
    shares: 0,
    comments: 0,
    isLiked: false,
    isBookmarked: false,
  };

  const buttonColorScheme = 'gray';
  const likedColor = 'red.500';
  const bookmarkedColor = 'blue.500';

  const handleLike = async () => {
    try {
      await toggleLike(postId);
      // Toast functionality removed for v3 compatibility
      console.log(interaction.isLiked ? 'Removed like' : 'Liked!');
    } catch {
      console.error('Failed to update like status');
    }
  };

  const handleShare = async (platform: ShareOptions['platform']) => {
    const shareOptions: ShareOptions = {
      platform,
      url: postUrl,
      title: postTitle,
      hashtags: ['tech', 'blog'],
    };

    let shareUrl = '';
    let copied = false;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}&hashtags=${shareOptions.hashtags?.join(',')}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(`Check out this article: ${postUrl}`)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(postUrl);
          copied = true;
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
        }
        break;
    }

    if (shareUrl && !copied) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }

    try {
      await sharePost(postId, platform, postUrl, postTitle);
      toast({
        title: 'Shared!',
        description: copied
          ? 'Link copied to clipboard'
          : `Shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      if (!copied) {
        toast({
          title: 'Error',
          description: 'Failed to track share',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  const handleComment = () => {
    loadComments(postId);
    openCommentForm(postId);
  };

  const iconSize = size === 'sm' ? 4 : size === 'md' ? 5 : 6;
  const buttonSize = size;

  return (
    <HStack gap={2} align='center'>
      {/* Like Button */}
      <Tooltip label={interaction.isLiked ? 'Unlike' : 'Like this post'}>
        <Button
          colorScheme={interaction.isLiked ? 'red' : buttonColorScheme}
          variant={interaction.isLiked ? 'solid' : variant}
          size={buttonSize}
          onClick={handleLike}
          color={interaction.isLiked ? 'white' : likedColor}
          _hover={{
            color: likedColor,
            transform: 'scale(1.05)',
          }}
          transition='all 0.2s'
          aria-label={
            interaction.isLiked ? 'Unlike this post' : 'Like this post'
          }
        >
          <Icon as={FiHeart} w={iconSize} h={iconSize} />
          {showLabels && 'Like'}
          {interaction.likes > 0 && (
            <Badge ml={1} colorScheme={interaction.isLiked ? 'white' : 'red'}>
              {interaction.likes}
            </Badge>
          )}
        </Button>
      </Tooltip>

      {/* Share Button - Simplified for v3 compatibility */}
      <Button
        colorScheme={buttonColorScheme}
        variant={variant}
        size={buttonSize}
        onClick={() => handleShare('copy')}
        _hover={{
          transform: 'scale(1.05)',
        }}
        transition='all 0.2s'
        aria-label='Share this post'
      >
        <Icon as={FiShare2} w={iconSize} h={iconSize} />
        {showLabels && 'Share'}
        {interaction.shares > 0 && (
          <Badge ml={1} colorScheme='blue'>
            {interaction.shares}
          </Badge>
        )}
      </Button>

      {/* Comment Button */}
      <Tooltip label='View comments'>
        <Button
          colorScheme={buttonColorScheme}
          variant={variant}
          size={buttonSize}
          onClick={handleComment}
          _hover={{
            transform: 'scale(1.05)',
          }}
          transition='all 0.2s'
          aria-label='View comments'
        >
          <Icon as={FiMessageCircle} w={iconSize} h={iconSize} />
          {showLabels && 'Comment'}
          {interaction.comments > 0 && (
            <Badge ml={1} colorScheme='green'>
              {interaction.comments}
            </Badge>
          )}
        </Button>
      </Tooltip>

      {/* Bookmark Button */}
      <Tooltip
        label={
          interaction.isBookmarked ? 'Remove bookmark' : 'Bookmark this post'
        }
      >
        <Button
          colorScheme={interaction.isBookmarked ? 'blue' : buttonColorScheme}
          variant={interaction.isBookmarked ? 'solid' : variant}
          size={buttonSize}
          onClick={() => {
            // TODO: Implement bookmark functionality
            console.log('Bookmark feature coming soon!');
          }}
          color={interaction.isBookmarked ? 'white' : bookmarkedColor}
          _hover={{
            color: bookmarkedColor,
            transform: 'scale(1.05)',
          }}
          transition='all 0.2s'
          aria-label={
            interaction.isBookmarked ? 'Remove bookmark' : 'Bookmark this post'
          }
        >
          <Icon as={FiBookmark} w={iconSize} h={iconSize} />
          {showLabels && 'Save'}
        </Button>
      </Tooltip>
    </HStack>
  );
};
