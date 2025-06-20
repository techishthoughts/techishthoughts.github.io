import {
  SettingsIcon,
  SmallCloseIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@chakra-ui/icons';
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

interface TextToSpeechProps {
  content: string;
  title?: string;
  author?: string;
  estimatedReadingTime?: number;
}

interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({
  content,
  title,
  author,
  estimatedReadingTime,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 1,
    pitch: 1,
    volume: 0.8,
    voice: null,
  });
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Clean and prepare text for speech
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/[#*_`]/g, '') // Remove markdown formatting
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Set default voice (prefer English voices)
        const defaultVoice =
          availableVoices.find(
            voice => voice.lang.startsWith('en') && voice.localService
          ) || availableVoices[0];

        setSettings(prev => ({ ...prev, voice: defaultVoice }));
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Estimate duration based on speech rate and content length
  useEffect(() => {
    if (content) {
      const cleanText = cleanTextForSpeech(content);
      const wordsPerMinute = 150 * settings.rate; // Average speaking rate adjusted by rate setting
      const wordCount = cleanText.split(' ').length;
      const estimatedDuration = (wordCount / wordsPerMinute) * 60; // in seconds
      setDuration(estimatedDuration);
    }
  }, [content, settings.rate]);

  const handlePlay = () => {
    if (!isSupported) return;

    const cleanText = cleanTextForSpeech(content);

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startProgressTracking();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.voice = settings.voice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentPosition(0);
      startProgressTracking();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      setCurrentPosition(0);
      stopProgressTracking();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      stopProgressTracking();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    stopProgressTracking();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentPosition(0);
    stopProgressTracking();
  };

  const startProgressTracking = () => {
    intervalRef.current = window.setInterval(() => {
      setCurrentPosition(prev => {
        const newPosition = prev + 1;
        const newProgress = (newPosition / duration) * 100;
        setProgress(Math.min(newProgress, 100));
        return newPosition;
      });
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <Box
        p={4}
        bg={bgColor}
        border='1px'
        borderColor={borderColor}
        borderRadius='lg'
        mb={6}
      >
        <Text color='orange.500' fontSize='sm'>
          Text-to-speech is not supported in your browser.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      bg={bgColor}
      border='1px'
      borderColor={borderColor}
      borderRadius='lg'
      boxShadow='md'
      mb={6}
    >
      <VStack spacing={4} align='stretch'>
        {/* Header */}
        <HStack justify='space-between' align='center'>
          <VStack align='start' spacing={1}>
            <HStack>
              <Badge colorScheme='blue' variant='subtle'>
                🎧 Listen
              </Badge>
              {estimatedReadingTime && (
                <Badge colorScheme='gray' variant='outline'>
                  ~{estimatedReadingTime} min read
                </Badge>
              )}
            </HStack>
            {title && (
              <Text fontSize='sm' fontWeight='medium' color={textColor}>
                {title}
              </Text>
            )}
            {author && (
              <Text fontSize='xs' color='gray.500'>
                by {author}
              </Text>
            )}
          </VStack>

          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Audio settings'
              icon={<SettingsIcon />}
              variant='ghost'
              size='sm'
            />
            <MenuList>
              <Box p={3}>
                <VStack spacing={3} align='stretch'>
                  <Box>
                    <Text fontSize='xs' mb={1}>
                      Speed: {settings.rate}x
                    </Text>
                    <Slider
                      value={settings.rate}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onChange={val =>
                        setSettings(prev => ({ ...prev, rate: val }))
                      }
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  <Box>
                    <Text fontSize='xs' mb={1}>
                      Volume
                    </Text>
                    <Slider
                      value={settings.volume}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={val =>
                        setSettings(prev => ({ ...prev, volume: val }))
                      }
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  {voices.length > 0 && (
                    <Box>
                      <Text fontSize='xs' mb={1}>
                        Voice
                      </Text>
                      {voices.slice(0, 5).map((voice, index) => (
                        <MenuItem
                          key={index}
                          fontSize='xs'
                          onClick={() =>
                            setSettings(prev => ({ ...prev, voice }))
                          }
                          bg={
                            settings.voice?.name === voice.name
                              ? 'blue.50'
                              : 'transparent'
                          }
                        >
                          {voice.name} ({voice.lang})
                        </MenuItem>
                      ))}
                    </Box>
                  )}
                </VStack>
              </Box>
            </MenuList>
          </Menu>
        </HStack>

        {/* Progress Bar */}
        <Box>
          <Progress
            value={progress}
            size='sm'
            colorScheme='blue'
            borderRadius='full'
            bg='gray.100'
          />
          <HStack justify='space-between' mt={1}>
            <Text fontSize='xs' color='gray.500'>
              {formatTime(currentPosition)}
            </Text>
            <Text fontSize='xs' color='gray.500'>
              {formatTime(duration)}
            </Text>
          </HStack>
        </Box>

        {/* Controls */}
        <HStack spacing={2} justify='center'>
          <Tooltip label={isPlaying ? 'Pause' : 'Play'}>
            <IconButton
              aria-label={isPlaying ? 'Pause' : 'Play'}
              icon={isPlaying ? <TriangleDownIcon /> : <TriangleUpIcon />}
              onClick={isPlaying ? handlePause : handlePlay}
              colorScheme='blue'
              size='lg'
              isRound
            />
          </Tooltip>

          <Tooltip label='Stop'>
            <IconButton
              aria-label='Stop'
              icon={<SmallCloseIcon />}
              onClick={handleStop}
              variant='ghost'
              size='md'
              isRound
              isDisabled={!isPlaying && !isPaused}
            />
          </Tooltip>
        </HStack>
      </VStack>
    </Box>
  );
};

export default TextToSpeech;
