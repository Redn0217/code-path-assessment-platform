
export const DOMAINS = [
  'python', 'devops', 'cloud', 'linux', 'networking', 
  'storage', 'virtualization', 'object-storage', 'ai-ml'
];

export const getDefaultFormData = () => ({
  domain: '',
  mcq_count: 10,
  coding_count: 5,
  scenario_count: 5,
  total_time_minutes: 60,
  difficulty_distribution: {
    beginner: 40,
    intermediate: 40,
    advanced: 20
  }
});

export const validateDifficultyDistribution = (distribution: any) => {
  const total = distribution.beginner + distribution.intermediate + distribution.advanced;
  return total === 100;
};

export const hasEnoughQuestions = (config: any, counts: any) => {
  if (!counts) return false;
  return counts.mcq >= config.mcq_count && 
         counts.coding >= config.coding_count && 
         counts.scenario >= config.scenario_count;
};
