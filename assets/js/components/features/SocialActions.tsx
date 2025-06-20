import {
  Badge,
  Button,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  useColorModeValue,
  useToast,
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
  const toast = useToast();
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

  const buttonColorScheme = useColorModeValue('gray', 'whiteAlpha');
  const likedColor = useColorModeValue('red.500', 'red.300');
  const bookmarkedColor = useColorModeValue('blue.500', 'blue.300');

  const handleLike = async () => {
    try {
      await toggleLike(postId);
      toast({
        title: interaction.isLiked ? 'Removed like' : 'Liked!',
        description: interaction.isLiked
          ? 'Post removed from your likes'
          : 'Thanks for liking this post!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
    } catch (error) {
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
    <HStack spacing={2} align='center'>
      {/* Like Button */}
      <Tooltip label={interaction.isLiked ? 'Unlike' : 'Like this post'}>
        <Button
          leftIcon={<Icon as={FiHeart} w={iconSize} h={iconSize} />}
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
          {showLabels && 'Like'}
          {interaction.likes > 0 && (
            <Badge ml={1} colorScheme={interaction.isLiked ? 'white' : 'red'}>
              {interaction.likes}
            </Badge>
          )}
        </Button>
      </Tooltip>

      {/* Share Menu */}
      <Menu>
        <MenuButton
          as={Button}
          leftIcon={<Icon as={FiShare2} w={iconSize} h={iconSize} />}
          colorScheme={buttonColorScheme}
          variant={variant}
          size={buttonSize}
          _hover={{
            transform: 'scale(1.05)',
          }}
          transition='all 0.2s'
          aria-label='Share this post'
        >
          {showLabels && 'Share'}
          {interaction.shares > 0 && (
            <Badge ml={1} colorScheme='blue'>
              {interaction.shares}
            </Badge>
          )}
        </MenuButton>
        <MenuList>
          <MenuItem
            icon={<Icon as={FiTwitter} />}
            onClick={() => handleShare('twitter')}
          >
            Share on Twitter
          </MenuItem>
          <MenuItem
            icon={<Icon as={FiFacebook} />}
            onClick={() => handleShare('facebook')}
          >
            Share on Facebook
          </MenuItem>
          <MenuItem
            icon={<Icon as={FiLinkedin} />}
            onClick={() => handleShare('linkedin')}
          >
            Share on LinkedIn
          </MenuItem>
          <MenuItem
            icon={<Icon as={FaReddit} />}
            onClick={() => handleShare('reddit')}
          >
            Share on Reddit
          </MenuItem>
          <MenuItem
            icon={<Icon as={FiMail} />}
            onClick={() => handleShare('email')}
          >
            Share via Email
          </MenuItem>
          <MenuItem
            icon={<Icon as={FiCopy} />}
            onClick={() => handleShare('copy')}
          >
            Copy Link
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Comment Button */}
      <Tooltip label='View comments'>
        <Button
          leftIcon={<Icon as={FiMessageCircle} w={iconSize} h={iconSize} />}
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
          leftIcon={<Icon as={FiBookmark} w={iconSize} h={iconSize} />}
          colorScheme={interaction.isBookmarked ? 'blue' : buttonColorScheme}
          variant={interaction.isBookmarked ? 'solid' : variant}
          size={buttonSize}
          onClick={() => {
            // TODO: Implement bookmark functionality
            toast({
              title: 'Coming Soon',
              description: 'Bookmark feature will be available soon!',
              status: 'info',
              duration: 2000,
              isClosable: true,
            });
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
          {showLabels && 'Save'}
        </Button>
      </Tooltip>
    </HStack>
  );
};
