import {
    Alert,
    AlertIcon,
    Avatar,
    Badge,
    Box,
    Button,
    Collapse,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Input,
    Link,
    Spinner,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
    FiChevronDown,
    FiChevronUp,
    FiFlag,
    FiHeart,
    FiMessageCircle,
} from 'react-icons/fi';
import { useAppStore } from '../../stores/useAppStore';
import type { Comment, CommentFormData } from '../../types';

interface CommentsSectionProps {
  postId: string;
  showForm?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  level?: number;
}

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit: (data: CommentFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  parentId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CommentFormData>({
    name: '',
    email: '',
    website: '',
    content: '',
    parentId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { userPreferences } = useAppStore();

  // Pre-fill form with user preferences
  useEffect(() => {
    if (userPreferences.name || userPreferences.email) {
      setFormData(prev => ({
        ...prev,
        name: userPreferences.name || '',
        email: userPreferences.email || '',
        website: userPreferences.website || '',
      }));
    }
  }, [userPreferences]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Comment content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Comment must be at least 10 characters long';
    }

    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = 'Please enter a valid website URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        name: userPreferences.name || '',
        email: userPreferences.email || '',
        website: userPreferences.website || '',
        content: '',
        parentId,
      });
    }
  };

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius='md'
      border='1px solid'
      borderColor={borderColor}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align='stretch'>
          <HStack spacing={4}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel fontSize='sm'>Name</FormLabel>
              <Input
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder='Your name'
                size='sm'
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel fontSize='sm'>Email</FormLabel>
              <Input
                type='email'
                value={formData.email}
                onChange={e =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder='your@email.com'
                size='sm'
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
          </HStack>

          <FormControl isInvalid={!!errors.website}>
            <FormLabel fontSize='sm'>Website (optional)</FormLabel>
            <Input
              value={formData.website}
              onChange={e =>
                setFormData(prev => ({ ...prev, website: e.target.value }))
              }
              placeholder='https://yourwebsite.com'
              size='sm'
            />
            <FormErrorMessage>{errors.website}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.content} isRequired>
            <FormLabel fontSize='sm'>Comment</FormLabel>
            <Textarea
              value={formData.content}
              onChange={e =>
                setFormData(prev => ({ ...prev, content: e.target.value }))
              }
              placeholder={
                parentId ? 'Write your reply...' : 'Share your thoughts...'
              }
              rows={4}
              resize='vertical'
            />
            <FormErrorMessage>{errors.content}</FormErrorMessage>
          </FormControl>

          <HStack justify='flex-end' spacing={2}>
            {onCancel && (
              <Button variant='ghost' size='sm' onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type='submit'
              colorScheme='blue'
              size='sm'
              isLoading={isSubmitting}
              loadingText='Posting...'
            >
              {parentId ? 'Reply' : 'Post Comment'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  level = 0,
}) => {
  const { toggleCommentLike } = useAppStore();
  const { isOpen: showReplies, onToggle: toggleReplies } = useDisclosure({
    defaultIsOpen: true,
  });
  const toast = useToast();

  const handleLike = async () => {
    try {
      await toggleCommentLike(comment.id);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleReply = () => {
    onReply(comment.id);
  };

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const pendingBg = useColorModeValue('yellow.50', 'yellow.900');

  const isNested = level > 0;
  const maxNestingLevel = 3;
  const canNest = level < maxNestingLevel;

  return (
    <Box
      pl={isNested ? 4 : 0}
      borderLeft={isNested ? '2px solid' : undefined}
      borderLeftColor={isNested ? borderColor : undefined}
    >
      <Box
        p={4}
        bg={comment.status === 'pending' ? pendingBg : bgColor}
        borderRadius='md'
        border='1px solid'
        borderColor={borderColor}
        position='relative'
      >
        {comment.status === 'pending' && (
          <Badge
            position='absolute'
            top={2}
            right={2}
            colorScheme='yellow'
            size='sm'
          >
            Pending Approval
          </Badge>
        )}

        <HStack align='start' spacing={3}>
          <Avatar
            size='sm'
            src={comment.author.avatar}
            name={comment.author.name}
          />

          <VStack align='start' spacing={2} flex={1}>
            <HStack spacing={2} wrap='wrap'>
              {comment.author.website ? (
                <Link
                  href={comment.author.website}
                  isExternal
                  fontWeight='semibold'
                  color='blue.500'
                  fontSize='sm'
                >
                  {comment.author.name}
                </Link>
              ) : (
                <Text fontWeight='semibold' fontSize='sm'>
                  {comment.author.name}
                </Text>
              )}
              <Text fontSize='xs' color={mutedColor}>
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {comment.updatedAt && (
                <Badge size='sm' colorScheme='gray'>
                  edited
                </Badge>
              )}
            </HStack>

            <Text fontSize='sm' whiteSpace='pre-wrap'>
              {comment.content}
            </Text>

            <HStack spacing={4}>
              <Button
                size='xs'
                variant='ghost'
                leftIcon={<FiHeart />}
                colorScheme={comment.isLiked ? 'red' : 'gray'}
                onClick={handleLike}
              >
                {comment.likes > 0 && comment.likes}
              </Button>

              {canNest && (
                <Button
                  size='xs'
                  variant='ghost'
                  leftIcon={<FiMessageCircle />}
                  onClick={handleReply}
                >
                  Reply
                </Button>
              )}

              <Button
                size='xs'
                variant='ghost'
                leftIcon={<FiFlag />}
                onClick={() => {
                  toast({
                    title: 'Coming Soon',
                    description: 'Comment reporting will be available soon',
                    status: 'info',
                    duration: 2000,
                    isClosable: true,
                  });
                }}
              >
                Report
              </Button>

              {/* TODO: Add edit/delete for comment authors */}
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box mt={2}>
          <Button
            size='xs'
            variant='ghost'
            leftIcon={showReplies ? <FiChevronUp /> : <FiChevronDown />}
            onClick={toggleReplies}
            mb={2}
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length}{' '}
            {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>

          <Collapse in={showReplies}>
            <VStack spacing={2} align='stretch'>
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </VStack>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  showForm = true,
}) => {
  const {
    comments,
    commentForm,
    loadComments,
    addComment,
    openCommentForm,
    closeCommentForm,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const postComments = comments[postId] || [];
  const approvedComments = postComments.filter(c => c.status === 'approved');

  useEffect(() => {
    const fetchComments = async () => {
      if (!comments[postId]) {
        setIsLoading(true);
        try {
          await loadComments(postId);
        } catch (_error) {
          toast({
            title: 'Error',
            description: 'Failed to load comments',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchComments();
  }, [postId, comments, loadComments, toast]);

  const handleCommentSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      await addComment(postId, data);
      toast({
        title: 'Comment posted!',
        description: 'Your comment has been submitted for review.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentId: string) => {
    openCommentForm(postId, parentId);
  };

  if (isLoading) {
    return (
      <Box textAlign='center' py={8}>
        <Spinner size='lg' />
        <Text mt={2} color='gray.500'>
          Loading comments...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align='stretch'>
        {/* Comments Header */}
        <HStack justify='space-between' align='center'>
          <Text fontSize='xl' fontWeight='bold'>
            Comments ({approvedComments.length})
          </Text>
        </HStack>

        {/* Comment Form */}
        {showForm && (
          <CommentForm
            postId={postId}
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Comments List */}
        {approvedComments.length === 0 ? (
          <Alert status='info' borderRadius='md'>
            <AlertIcon />
            <Box>
              <Text fontWeight='semibold'>No comments yet</Text>
              <Text fontSize='sm'>Be the first to share your thoughts!</Text>
            </Box>
          </Alert>
        ) : (
          <VStack spacing={4} align='stretch'>
            {approvedComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
              />
            ))}
          </VStack>
        )}

        {/* Reply Form Modal/Inline */}
        {commentForm.isOpen && commentForm.parentId && (
          <Box mt={4}>
            <Text fontSize='sm' color='gray.500' mb={2}>
              Replying to comment
            </Text>
            <CommentForm
              postId={postId}
              parentId={commentForm.parentId}
              onSubmit={handleCommentSubmit}
              onCancel={closeCommentForm}
              isSubmitting={isSubmitting}
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};
