import { supabase } from '@/integrations/supabase/client';

// Raw database response type
interface AssessmentConfigRaw {
  id: string;
  module_id: string;
  domain: string;
  mcq_count: number;
  coding_count: number;
  scenario_count: number;
  total_time_minutes: number;
  difficulty_distribution: any; // JSON type from database
  created_at: string;
  created_by: string;
  updated_at: string;
}

// Processed type for application use
export interface AssessmentConfig {
  id: string;
  module_id: string;
  domain: string;
  mcq_count: number;
  coding_count: number;
  scenario_count: number;
  total_time_minutes: number;
  difficulty_distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface Question {
  id: string;
  module_id: string;
  domain: string;
  question_type: 'mcq' | 'coding' | 'scenario';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  code_template?: string;
  test_cases?: any[];
  time_limit?: number;
  memory_limit?: number;
  tags?: string[];
  created_at: string;
}

export interface GeneratedAssessment {
  questions: Question[];
  config: AssessmentConfig;
  metadata: {
    total_questions: number;
    mcq_count: number;
    coding_count: number;
    scenario_count: number;
    difficulty_breakdown: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
    estimated_time_minutes: number;
  };
}

/**
 * Generates a customized assessment based on the module's assessment configuration
 */
export class AssessmentGenerator {
  
  /**
   * Generate an assessment for a specific module
   */
  static async generateAssessment(moduleId: string): Promise<GeneratedAssessment> {
    // 1. Fetch assessment configuration
    const config = await this.getAssessmentConfig(moduleId);
    if (!config) {
      throw new Error('No assessment configuration found for this module');
    }

    // 2. Fetch all available questions for the module
    const allQuestions = await this.getAllQuestions(moduleId);
    
    // 3. Validate sufficient questions exist
    this.validateQuestionAvailability(config, allQuestions);
    
    // 4. Generate the assessment
    const selectedQuestions = this.selectQuestions(config, allQuestions);
    
    // 5. Create metadata
    const metadata = this.generateMetadata(selectedQuestions, config);
    
    return {
      questions: selectedQuestions,
      config,
      metadata
    };
  }

  /**
   * Get assessment configuration for a module
   */
  private static async getAssessmentConfig(moduleId: string): Promise<AssessmentConfig | null> {
    const { data, error } = await supabase
      .from('assessment_configs')
      .select('*')
      .eq('module_id', moduleId)
      .single();

    if (error) {
      console.error('Error fetching assessment config:', error);
      return null;
    }

    const rawData = data as AssessmentConfigRaw;

    // Transform the data to ensure proper typing
    const transformedData: AssessmentConfig = {
      id: rawData.id,
      module_id: rawData.module_id,
      domain: rawData.domain,
      mcq_count: rawData.mcq_count,
      coding_count: rawData.coding_count,
      scenario_count: rawData.scenario_count,
      total_time_minutes: rawData.total_time_minutes,
      difficulty_distribution: this.parseDifficultyDistribution(rawData.difficulty_distribution)
    };

    return transformedData;
  }

  /**
   * Parse difficulty distribution from database JSON to typed object
   */
  private static parseDifficultyDistribution(jsonData: any): { beginner: number; intermediate: number; advanced: number } {
    // Default distribution if parsing fails
    const defaultDistribution = { beginner: 40, intermediate: 40, advanced: 20 };

    try {
      if (typeof jsonData === 'object' && jsonData !== null) {
        return {
          beginner: Number(jsonData.beginner) || defaultDistribution.beginner,
          intermediate: Number(jsonData.intermediate) || defaultDistribution.intermediate,
          advanced: Number(jsonData.advanced) || defaultDistribution.advanced
        };
      }

      // If it's a string, try to parse it as JSON
      if (typeof jsonData === 'string') {
        const parsed = JSON.parse(jsonData);
        return {
          beginner: Number(parsed.beginner) || defaultDistribution.beginner,
          intermediate: Number(parsed.intermediate) || defaultDistribution.intermediate,
          advanced: Number(parsed.advanced) || defaultDistribution.advanced
        };
      }

      return defaultDistribution;
    } catch (error) {
      console.warn('Failed to parse difficulty distribution, using defaults:', error);
      return defaultDistribution;
    }
  }

  /**
   * Fetch all questions for a module, grouped by type and difficulty
   */
  private static async getAllQuestions(moduleId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('module_id', moduleId);

    if (error) {
      throw new Error(`Error fetching questions: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No questions found for this module');
    }

    return data as Question[];
  }

  /**
   * Validate that enough questions exist to fulfill the configuration
   */
  private static validateQuestionAvailability(config: AssessmentConfig, questions: Question[]): void {
    const questionCounts = this.countQuestionsByType(questions);
    
    const errors: string[] = [];
    
    if (questionCounts.mcq < config.mcq_count) {
      errors.push(`Insufficient MCQ questions: need ${config.mcq_count}, have ${questionCounts.mcq}`);
    }
    
    if (questionCounts.coding < config.coding_count) {
      errors.push(`Insufficient coding questions: need ${config.coding_count}, have ${questionCounts.coding}`);
    }
    
    if (questionCounts.scenario < config.scenario_count) {
      errors.push(`Insufficient scenario questions: need ${config.scenario_count}, have ${questionCounts.scenario}`);
    }
    
    if (errors.length > 0) {
      throw new Error(`Cannot generate assessment: ${errors.join(', ')}`);
    }
  }

  /**
   * Count questions by type
   */
  private static countQuestionsByType(questions: Question[]) {
    return questions.reduce((counts, question) => {
      counts[question.question_type] = (counts[question.question_type] || 0) + 1;
      counts.total = (counts.total || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  /**
   * Select questions based on configuration requirements
   */
  private static selectQuestions(config: AssessmentConfig, allQuestions: Question[]): Question[] {
    const selectedQuestions: Question[] = [];
    
    // Group questions by type and difficulty
    const questionsByType = this.groupQuestionsByType(allQuestions);
    
    // Select MCQ questions
    const mcqQuestions = this.selectQuestionsByTypeAndDifficulty(
      questionsByType.mcq || [],
      config.mcq_count,
      config.difficulty_distribution
    );
    selectedQuestions.push(...mcqQuestions);
    
    // Select coding questions
    const codingQuestions = this.selectQuestionsByTypeAndDifficulty(
      questionsByType.coding || [],
      config.coding_count,
      config.difficulty_distribution
    );
    selectedQuestions.push(...codingQuestions);
    
    // Select scenario questions
    const scenarioQuestions = this.selectQuestionsByTypeAndDifficulty(
      questionsByType.scenario || [],
      config.scenario_count,
      config.difficulty_distribution
    );
    selectedQuestions.push(...scenarioQuestions);
    
    // Shuffle the final question order
    return this.shuffleArray(selectedQuestions);
  }

  /**
   * Group questions by type
   */
  private static groupQuestionsByType(questions: Question[]) {
    return questions.reduce((groups, question) => {
      const type = question.question_type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(question);
      return groups;
    }, {} as Record<string, Question[]>);
  }

  /**
   * Select questions of a specific type with difficulty distribution
   */
  private static selectQuestionsByTypeAndDifficulty(
    questions: Question[],
    totalCount: number,
    difficultyDistribution: { beginner: number; intermediate: number; advanced: number }
  ): Question[] {
    // Group by difficulty
    const questionsByDifficulty = questions.reduce((groups, question) => {
      const difficulty = question.difficulty;
      if (!groups[difficulty]) {
        groups[difficulty] = [];
      }
      groups[difficulty].push(question);
      return groups;
    }, {} as Record<string, Question[]>);
    
    // Calculate how many questions needed for each difficulty
    const beginnerCount = Math.round((totalCount * difficultyDistribution.beginner) / 100);
    const intermediateCount = Math.round((totalCount * difficultyDistribution.intermediate) / 100);
    const advancedCount = totalCount - beginnerCount - intermediateCount; // Ensure exact total
    
    const selectedQuestions: Question[] = [];
    
    // Select beginner questions
    const beginnerQuestions = this.shuffleArray(questionsByDifficulty.beginner || []).slice(0, beginnerCount);
    selectedQuestions.push(...beginnerQuestions);
    
    // Select intermediate questions
    const intermediateQuestions = this.shuffleArray(questionsByDifficulty.intermediate || []).slice(0, intermediateCount);
    selectedQuestions.push(...intermediateQuestions);
    
    // Select advanced questions
    const advancedQuestions = this.shuffleArray(questionsByDifficulty.advanced || []).slice(0, advancedCount);
    selectedQuestions.push(...advancedQuestions);
    
    return selectedQuestions;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate assessment metadata
   */
  private static generateMetadata(questions: Question[], config: AssessmentConfig) {
    const difficultyBreakdown = questions.reduce((counts, question) => {
      counts[question.difficulty] = (counts[question.difficulty] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const typeCounts = this.countQuestionsByType(questions);
    
    return {
      total_questions: questions.length,
      mcq_count: typeCounts.mcq || 0,
      coding_count: typeCounts.coding || 0,
      scenario_count: typeCounts.scenario || 0,
      difficulty_breakdown: {
        beginner: difficultyBreakdown.beginner || 0,
        intermediate: difficultyBreakdown.intermediate || 0,
        advanced: difficultyBreakdown.advanced || 0,
      },
      estimated_time_minutes: config.total_time_minutes
    };
  }
}
