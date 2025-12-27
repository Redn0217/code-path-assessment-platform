import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConversation } from '@elevenlabs/react';
import { elevenLabsService, ConversationState } from '@/services/elevenLabsService';
import { toast } from 'sonner';

export interface UseElevenLabsConversationProps {
  stage: number;
  userProfile?: any;
  onStageComplete?: (stage: number) => void;
  onError?: (error: string) => void;
}

export const useElevenLabsConversation = ({
  stage,
  userProfile,
  onStageComplete,
  onError
}: UseElevenLabsConversationProps) => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRequestedMicPermission, setHasRequestedMicPermission] = useState(false);
  const currentStageRef = useRef(stage);
  const isStartingRef = useRef(false);
  const isEndingRef = useRef(false);

  // Memoize conversation handlers to prevent re-initialization
  const conversationHandlers = useMemo(() => ({
    onConnect: () => {
      setConversationState(prev => ({ ...prev, isConnected: true, error: undefined }));
      toast.success('Connected to AI interviewer');
    },
    onDisconnect: () => {
      setConversationState(prev => ({
        ...prev,
        isConnected: false,
        isListening: false,
        isSpeaking: false
      }));
    },
    onMessage: (message: any) => {
      // Handle different message types
      if (message.type === 'agent_response') {
        setConversationState(prev => ({ ...prev, isSpeaking: true }));
      } else if (message.type === 'user_transcript') {
        setConversationState(prev => ({ ...prev, isListening: true }));
      } else if (message.type === 'audio') {
        // Audio message received, agent is speaking
        setConversationState(prev => ({ ...prev, isSpeaking: true }));
      }
    },
    onError: (error: any) => {
      console.error('ElevenLabs conversation error:', error);
      const errorMessage = `Conversation error: ${error.message || 'Unknown error'}`;
      setConversationState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      onError?.(errorMessage);
    },
    onDebug: (debugInfo: any) => {
      // Silent debug handler to prevent errors
    }
  }), [onError]);

  // Initialize ElevenLabs conversation hook
  const conversation = useConversation(conversationHandlers);



  // Update service with current stage and user profile
  useEffect(() => {
    elevenLabsService.setCurrentStage(stage);
    if (userProfile) {
      elevenLabsService.setUserProfile(userProfile);
    }
    currentStageRef.current = stage;
  }, [stage, userProfile]);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    if (hasRequestedMicPermission) return true;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasRequestedMicPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast.error('Microphone access is required for the voice interview');
      return false;
    }
  }, [hasRequestedMicPermission]);

  // Start conversation for current stage
  const startConversation = useCallback(async () => {
    // Prevent multiple simultaneous starts
    if (isStartingRef.current || conversationState.isConnected) {
      return;
    }

    if (!elevenLabsService.validateConfig()) {
      const error = 'ElevenLabs configuration is missing. Please check your API key and Agent ID.';
      setConversationState(prev => ({ ...prev, error }));
      toast.error(error);
      return;
    }

    isStartingRef.current = true;

    try {
      // Request microphone permission first (automatically)
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        const error = 'Microphone access is required for voice interviews. Please grant permission and try again.';
        setConversationState(prev => ({ ...prev, error }));
        return;
      }

      setConversationState(prev => ({ ...prev, error: undefined }));

      // Get conversation configuration for current stage
      const conversationConfig = elevenLabsService.getConversationConfig(stage, userProfile);

      // Start the conversation with stage-specific configuration
      const conversationId = await conversation.startSession({
        agentId: elevenLabsService['config'].agentId,
        connectionType: 'webrtc', // Use WebRTC for better performance
        conversationConfigOverride: conversationConfig,
        userId: userProfile?.id || 'anonymous'
      });

      setConversationState(prev => ({
        ...prev,
        conversationId,
        isListening: true
      }));

      setIsInitialized(true);
      toast.success(`Voice interview started for ${elevenLabsService.getStageConfig(stage).title}`);

    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      const errorMessage = `Failed to start conversation: ${error.message || 'Unknown error'}`;
      setConversationState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      isStartingRef.current = false;
    }
  }, [conversation, stage, userProfile, requestMicrophonePermission, conversationState.isConnected]);

  // End conversation
  const endConversation = useCallback(async () => {
    // Prevent multiple simultaneous ends
    if (isEndingRef.current || !conversationState.isConnected) {
      return;
    }

    isEndingRef.current = true;

    try {
      await conversation.endSession();
      setConversationState({
        isConnected: false,
        isListening: false,
        isSpeaking: false
      });
      setIsInitialized(false);
    } catch (error: any) {
      console.error('Failed to end conversation:', error);
      // Don't show error toast for ending conversation as it might be intentional
    } finally {
      isEndingRef.current = false;
    }
  }, [conversation, conversationState.isConnected]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (!conversationState.isConnected) {
      startConversation();
    } else {
      // Toggle microphone mute/unmute
      setConversationState(prev => ({ 
        ...prev, 
        isListening: !prev.isListening 
      }));
    }
  }, [conversationState.isConnected, startConversation]);

  // Set volume
  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume });
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, [conversation]);

  // Auto-manage conversation based on stage changes
  useEffect(() => {
    const shouldHaveConversation = stage >= 2 && stage <= 5;
    const stageChanged = currentStageRef.current !== stage;

    // Update stage ref
    currentStageRef.current = stage;

    // Handle initial mount or stage changes
    if (shouldHaveConversation && !isStartingRef.current) {
      // Need conversation for this stage
      if (conversationState.isConnected && stageChanged) {
        // Already connected and stage changed, restart with new config
        endConversation().then(() => {
          setTimeout(() => startConversation(), 1000);
        });
      } else if (!conversationState.isConnected) {
        // Not connected, start new conversation (initial mount or after disconnect)
        startConversation();
      }
    } else if (!shouldHaveConversation && conversationState.isConnected && !isEndingRef.current) {
      // Don't need conversation for this stage, end it
      endConversation();
    }
  }, [stage, conversationState.isConnected]); // Depend on both stage and connection state

  return {
    // State
    conversationState,
    isInitialized,
    hasRequestedMicPermission,
    
    // Actions
    startConversation,
    endConversation,
    toggleListening,
    setVolume,
    requestMicrophonePermission,
    
    // ElevenLabs conversation object for advanced usage
    conversation
  };
};
