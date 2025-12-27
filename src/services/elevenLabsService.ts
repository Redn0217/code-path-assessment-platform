/**
 * ElevenLabs Conversational AI Service
 * Handles integration with ElevenLabs for the Aira interview system
 */

export interface ElevenLabsConfig {
  apiKey: string;
  agentId: string;
}

export interface ConversationState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  conversationId?: string;
  error?: string;
}

export interface InterviewStageConfig {
  stage: number;
  title: string;
  systemPrompt: string;
  firstMessage: string;
  dynamicVariables?: Record<string, any>;
}

export class ElevenLabsService {
  private config: ElevenLabsConfig;
  private currentStage: number = 0;
  private userProfile: any = null;

  constructor(config: ElevenLabsConfig) {
    this.config = config;
  }

  /**
   * Get configuration for each interview stage
   */
  getStageConfig(stage: number, userProfile?: any): InterviewStageConfig {
    const userName = userProfile?.full_name || 'there';
    
    const stageConfigs: Record<number, InterviewStageConfig> = {
      2: {
        stage: 2,
        title: 'AI Assistant Introduction',
        systemPrompt: `You are Aira, a friendly and professional AI interviewer for a coding assessment platform. 
        
        Your role is to conduct technical interviews and assess candidates' programming skills, problem-solving abilities, and technical knowledge.
        
        Guidelines:
        - Be warm, encouraging, and professional
        - Ask clear, specific questions about programming concepts
        - Listen actively and ask follow-up questions
        - Provide constructive feedback
        - Keep responses concise but thorough
        - Adapt your questioning based on the candidate's responses
        
        This is the introduction stage. Welcome the candidate and explain the interview process.`,
        firstMessage: `Hi ${userName}! I'm Aira, your AI interviewer. Welcome to the technical assessment. I'm here to evaluate your programming skills and technical knowledge through a conversational interview. 
        
        We'll go through several stages covering different aspects of software development. Feel free to think out loud and ask questions if you need clarification. Are you ready to begin?`,
        dynamicVariables: {
          user_name: userName,
          stage: 'introduction'
        }
      },
      3: {
        stage: 3,
        title: 'Knowledge Assessment',
        systemPrompt: `You are Aira, conducting the knowledge assessment phase of a technical interview.
        
        Focus on:
        - Programming fundamentals (data structures, algorithms)
        - Language-specific knowledge
        - Best practices and design patterns
        - Problem-solving approach
        
        Ask questions that reveal the candidate's depth of understanding. Start with broader concepts and dive deeper based on their responses.`,
        firstMessage: `Great! Let's start with the knowledge assessment. I'd like to understand your programming background and technical expertise. 
        
        Can you tell me about your experience with programming languages and which ones you're most comfortable with?`,
        dynamicVariables: {
          user_name: userName,
          stage: 'knowledge_assessment'
        }
      },
      4: {
        stage: 4,
        title: 'Deep Dive Discussion',
        systemPrompt: `You are Aira, conducting an in-depth technical discussion.
        
        Focus on:
        - Complex problem-solving scenarios
        - System design concepts
        - Real-world application of programming concepts
        - Technical decision-making process
        
        Present challenging scenarios and evaluate how the candidate approaches complex problems.`,
        firstMessage: `Excellent! Now let's dive deeper into more complex topics. I'd like to discuss how you approach challenging programming problems.
        
        Can you walk me through a difficult technical problem you've solved recently? What was your thought process?`,
        dynamicVariables: {
          user_name: userName,
          stage: 'deep_dive'
        }
      },
      5: {
        stage: 5,
        title: 'Final Questions',
        systemPrompt: `You are Aira, conducting the final assessment phase.
        
        Focus on:
        - Clarifying any remaining questions
        - Assessing overall technical maturity
        - Understanding career goals and interests
        - Evaluating communication skills
        
        Wrap up with thoughtful questions that give a complete picture of the candidate.`,
        firstMessage: `We're in the final stretch now! I have a few more questions to complete the assessment.
        
        What areas of software development are you most passionate about, and where do you see yourself growing technically?`,
        dynamicVariables: {
          user_name: userName,
          stage: 'final_questions'
        }
      },
      6: {
        stage: 6,
        title: 'Assessment Summary',
        systemPrompt: `You are Aira, providing the final assessment summary.
        
        Focus on:
        - Summarizing the candidate's strengths
        - Providing constructive feedback
        - Explaining next steps
        - Encouraging the candidate
        
        Be positive and professional while giving honest, helpful feedback.`,
        firstMessage: `Thank you for participating in this technical assessment! You've done a great job throughout our conversation.
        
        Let me provide you with some feedback on your performance and discuss the next steps in the process.`,
        dynamicVariables: {
          user_name: userName,
          stage: 'summary'
        }
      }
    };

    return stageConfigs[stage] || stageConfigs[2];
  }

  /**
   * Get conversation configuration for ElevenLabs
   */
  getConversationConfig(stage: number, userProfile?: any) {
    const stageConfig = this.getStageConfig(stage, userProfile);

    return {
      agent: {
        prompt: {
          prompt: stageConfig.systemPrompt
        },
        first_message: stageConfig.firstMessage,
        language: "en"
      },
      tts: {
        voice_id: "21m00Tcm4TlvDq8ikWAM" // Default ElevenLabs voice - can be customized
      },
      stt: {
        // Speech-to-text configuration for better voice detection
        model: "nova-2",
        language: "en",
        // More sensitive voice activity detection
        vad_threshold: 0.3, // Lower = more sensitive (default is 0.5)
        silence_timeout_ms: 1000, // Wait 1 second of silence before processing
        max_duration_ms: 30000 // Max 30 seconds per speech segment
      },
      dynamic_variables: stageConfig.dynamicVariables
    };
  }

  /**
   * Validate configuration
   */
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.agentId);
  }

  /**
   * Set user profile for personalization
   */
  setUserProfile(profile: any) {
    this.userProfile = profile;
  }

  /**
   * Set current stage
   */
  setCurrentStage(stage: number) {
    this.currentStage = stage;
  }

  /**
   * Get current stage
   */
  getCurrentStage(): number {
    return this.currentStage;
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID || ''
});
