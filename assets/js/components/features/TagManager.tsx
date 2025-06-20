import { AddIcon, DeleteIcon, StarIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Textarea,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { searchService } from '@services/searchService';
import { useAppStore } from '@stores/useAppStore';
import type { BaseComponentProps, Tag } from '@types';
import React, { useEffect, useMemo, useState } from 'react';

interface TagManagerProps extends BaseComponentProps {
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  readOnly?: boolean;
  maxTags?: number;
  allowCreate?: boolean;
  showPopular?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TagFormData {
  name: string;
  description: string;
  color: string;
}

const TAG_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8C471',
  '#82E0AA',
  '#F1948A',
  '#85C1E9',
  '#D2B4DE',
];

export const TagManager: React.FC<TagManagerProps> = ({
  selectedTags = [],
  onTagsChange,
  readOnly = false,
  maxTags = 10,
  allowCreate = true,
  showPopular = true,
  size = 'md',
  className,
  'data-testid': testId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tagForm, setTagForm] = useState<TagFormData>({
    name: '',
    description: '',
    color: TAG_COLORS[0],
  });
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const { isOpen: isEditOpen, onClose: onEditClose } = useDisclosure();

  const toast = useToast();
  const { tags, addTag, updateTag, getPopularTags } = useAppStore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Get popular tags
  const popularTags = useMemo(() => {
    if (!showPopular) return [];
    return getPopularTags().slice(0, 8);
  }, [tags, showPopular, getPopularTags]);

  // Filter tags based on search
  useEffect(() => {
    const filterTags = async () => {
      if (!searchQuery.trim()) {
        setFilteredTags([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchService.searchTags(searchQuery);
        setFilteredTags(results);
      } catch (error) {
        console.error('Error searching tags:', error);
        setFilteredTags([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(filterTags, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleTagSelect = (tagId: string) => {
    if (readOnly) return;

    const newSelected = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];

    if (newSelected.length <= maxTags) {
      onTagsChange?.(newSelected);
    } else {
      toast({
        title: 'Maximum tags reached',
        description: `You can only select up to ${maxTags} tags`,
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleCreateTag = () => {
    if (!tagForm.name.trim()) {
      toast({
        title: 'Tag name required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const existingTag = tags.find(
      (tag: Tag) => tag.name.toLowerCase() === tagForm.name.toLowerCase()
    );

    if (existingTag) {
      toast({
        title: 'Tag already exists',
        description: 'A tag with this name already exists',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const newTag: Tag = {
      id: Date.now().toString(),
      name: tagForm.name.trim(),
      slug: tagForm.name.toLowerCase().replace(/\s+/g, '-'),
      description: tagForm.description.trim(),
      color: tagForm.color,
      articlesCount: 0,
      createdDate: new Date().toISOString(),
    };

    addTag(newTag);
    toast({
      title: 'Tag created',
      description: `"${newTag.name}" has been created successfully`,
      status: 'success',
      duration: 3000,
    });

    setTagForm({ name: '', description: '', color: TAG_COLORS[0] });
    onCreateClose();
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !tagForm.name.trim()) return;

    const updatedTag = {
      ...editingTag,
      name: tagForm.name.trim(),
      description: tagForm.description.trim(),
      color: tagForm.color,
      slug: tagForm.name.toLowerCase().replace(/\s+/g, '-'),
    };

    try {
      updateTag(editingTag.id, updatedTag);

      toast({
        title: 'Tag updated',
        description: `"${updatedTag.name}" has been updated successfully`,
        status: 'success',
        duration: 3000,
      });

      setEditingTag(null);
      setTagForm({ name: '', description: '', color: TAG_COLORS[0] });
      onEditClose();
    } catch (error) {
      toast({
        title: 'Error updating tag',
        description: 'Failed to update the tag. Please try again.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getTagById = (id: string) => tags.find((tag: Tag) => tag.id === id);

  const getTagSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default:
        return 'md';
    }
  };

  return (
    <Box className={className} data-testid={testId}>
      <VStack spacing={4} align='stretch'>
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <Box>
            <Text fontSize='sm' fontWeight='medium' mb={2}>
              Selected Tags ({selectedTags.length}/{maxTags})
            </Text>
            <Wrap spacing={2}>
              {selectedTags.map(tagId => {
                const tag = getTagById(tagId);
                if (!tag) return null;

                return (
                  <WrapItem key={tagId}>
                    <Badge
                      size={getTagSize()}
                      colorScheme='blue'
                      borderRadius='full'
                      px={3}
                      py={1}
                      cursor={readOnly ? 'default' : 'pointer'}
                      onClick={() => !readOnly && handleTagSelect(tagId)}
                      bg={tag.color}
                      color='white'
                      _hover={!readOnly ? { opacity: 0.8 } : {}}
                    >
                      <HStack spacing={1}>
                        <Text>{tag.name}</Text>
                        {!readOnly && (
                          <IconButton
                            size='xs'
                            icon={<DeleteIcon />}
                            aria-label='Remove tag'
                            variant='ghost'
                            colorScheme='whiteAlpha'
                            minW='auto'
                            h='auto'
                            onClick={e => {
                              e.stopPropagation();
                              handleTagSelect(tagId);
                            }}
                          />
                        )}
                      </HStack>
                    </Badge>
                  </WrapItem>
                );
              })}
            </Wrap>
          </Box>
        )}

        {!readOnly && (
          <>
            {/* Search Input */}
            <Box>
              <HStack spacing={2}>
                <Input
                  placeholder='Search tags...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  size={size}
                />
                {allowCreate && (
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={onCreateOpen}
                    size={size}
                    colorScheme='blue'
                    variant='outline'
                  >
                    Create
                  </Button>
                )}
              </HStack>
            </Box>

            {/* Search Results */}
            {searchQuery && (
              <Box
                bg={bgColor}
                border='1px'
                borderColor={borderColor}
                borderRadius='md'
                p={3}
                maxH='200px'
                overflowY='auto'
              >
                {isSearching ? (
                  <Flex justify='center' py={4}>
                    <Spinner size='sm' />
                  </Flex>
                ) : filteredTags.length > 0 ? (
                  <Wrap spacing={2}>
                    {filteredTags.map(tag => (
                      <WrapItem key={tag.id}>
                        <Badge
                          size={getTagSize()}
                          colorScheme={
                            selectedTags.includes(tag.id) ? 'blue' : 'gray'
                          }
                          borderRadius='full'
                          px={3}
                          py={1}
                          cursor='pointer'
                          onClick={() => handleTagSelect(tag.id)}
                          bg={
                            selectedTags.includes(tag.id)
                              ? tag.color
                              : 'gray.100'
                          }
                          color={
                            selectedTags.includes(tag.id) ? 'white' : 'gray.800'
                          }
                          _hover={{ opacity: 0.8 }}
                        >
                          <HStack spacing={1}>
                            <Text>{tag.name}</Text>
                            {tag.articlesCount > 0 && (
                              <Text fontSize='xs'>({tag.articlesCount})</Text>
                            )}
                          </HStack>
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : (
                  <Text color='gray.500' textAlign='center' py={2}>
                    No tags found for "{searchQuery}"
                    {allowCreate && (
                      <Button
                        size='sm'
                        variant='link'
                        colorScheme='blue'
                        ml={2}
                        onClick={() => {
                          setTagForm(prev => ({ ...prev, name: searchQuery }));
                          onCreateOpen();
                        }}
                      >
                        Create "{searchQuery}"
                      </Button>
                    )}
                  </Text>
                )}
              </Box>
            )}

            {/* Popular Tags */}
            {showPopular && popularTags.length > 0 && !searchQuery && (
              <Box>
                <HStack spacing={2} mb={2}>
                  <StarIcon color='yellow.500' boxSize={4} />
                  <Text fontSize='sm' fontWeight='medium'>
                    Popular Tags
                  </Text>
                </HStack>
                <Wrap spacing={2}>
                  {popularTags.map(tag => (
                    <WrapItem key={tag.id}>
                      <Badge
                        size={getTagSize()}
                        colorScheme={
                          selectedTags.includes(tag.id) ? 'blue' : 'gray'
                        }
                        borderRadius='full'
                        px={3}
                        py={1}
                        cursor='pointer'
                        onClick={() => handleTagSelect(tag.id)}
                        bg={
                          selectedTags.includes(tag.id) ? tag.color : 'gray.100'
                        }
                        color={
                          selectedTags.includes(tag.id) ? 'white' : 'gray.800'
                        }
                        _hover={{ opacity: 0.8 }}
                      >
                        <HStack spacing={1}>
                          <Text>{tag.name}</Text>
                          <Text fontSize='xs'>({tag.articlesCount})</Text>
                        </HStack>
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </>
        )}
      </VStack>

      {/* Create Tag Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Tag</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Tag Name</FormLabel>
                <Input
                  value={tagForm.name}
                  onChange={e =>
                    setTagForm(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Enter tag name'
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={tagForm.description}
                  onChange={e =>
                    setTagForm(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Optional description'
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Color</FormLabel>
                <Wrap spacing={2}>
                  {TAG_COLORS.map(color => (
                    <WrapItem key={color}>
                      <Box
                        w={8}
                        h={8}
                        bg={color}
                        borderRadius='full'
                        cursor='pointer'
                        border={
                          tagForm.color === color ? '3px solid' : '2px solid'
                        }
                        borderColor={
                          tagForm.color === color ? 'blue.500' : 'gray.300'
                        }
                        onClick={() => setTagForm(prev => ({ ...prev, color }))}
                        _hover={{ transform: 'scale(1.1)' }}
                      />
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleCreateTag}>
              Create Tag
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Tag</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Tag Name</FormLabel>
                <Input
                  value={tagForm.name}
                  onChange={e =>
                    setTagForm(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Enter tag name'
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={tagForm.description}
                  onChange={e =>
                    setTagForm(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Optional description'
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Color</FormLabel>
                <Wrap spacing={2}>
                  {TAG_COLORS.map(color => (
                    <WrapItem key={color}>
                      <Box
                        w={8}
                        h={8}
                        bg={color}
                        borderRadius='full'
                        cursor='pointer'
                        border={
                          tagForm.color === color ? '3px solid' : '2px solid'
                        }
                        borderColor={
                          tagForm.color === color ? 'blue.500' : 'gray.300'
                        }
                        onClick={() => setTagForm(prev => ({ ...prev, color }))}
                        _hover={{ transform: 'scale(1.1)' }}
                      />
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>

              {editingTag && (
                <Alert status='info' borderRadius='md'>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Tag Statistics</AlertTitle>
                    <AlertDescription>
                      This tag is used in {editingTag.articlesCount} articles
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleUpdateTag}>
              Update Tag
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TagManager;
