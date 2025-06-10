// Mock data generation for assessment platform

// Define topic areas for each domain
const domainTopics = {
  python: ['Syntax', 'Data Structures', 'Functions', 'OOP', 'Libraries', 'File Handling'],
  devops: ['CI/CD', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'Infrastructure as Code'],
  cloud: ['AWS', 'Azure', 'GCP', 'Cloud Storage', 'Serverless', 'Security'],
  linux: ['Commands', 'Shell Scripting', 'File Permissions', 'Process Management', 'Networking'],
  networking: ['TCP/IP', 'DNS', 'Subnetting', 'Routing', 'Firewalls', 'Load Balancing'],
  storage: ['SAN', 'NAS', 'RAID', 'Backup Strategies', 'Data Replication'],
  virtualization: ['Hypervisors', 'Virtual Machines', 'Containers', 'Resource Allocation'],
  'object-storage': ['S3', 'Versioning', 'Lifecycle Policies', 'Data Consistency', 'Object Security'],
  'ai-ml': ['Data Preprocessing', 'Model Training', 'Evaluation Metrics', 'Frameworks', 'Neural Networks'],
  'data-security': ['Encryption', 'Access Control', 'Network Security', 'Vulnerability Assessment', 'Compliance', 'Incident Response'],
  'data-science': ['Statistics', 'Data Analysis', 'Data Visualization', 'Machine Learning', 'Big Data', 'Research Methods']
};

// Mock question templates for each type
const mockMCQs = [
  {
    question: "Which of the following statements is true regarding {topic}?",
    options: [
      "{topic} is a fundamental concept in {domain} that enables efficient resource utilization.",
      "{topic} is rarely used in modern {domain} implementations.",
      "{topic} was deprecated in the latest version of {domain}.",
      "{topic} only applies to enterprise-level {domain} solutions."
    ]
  },
  {
    question: "What is the primary purpose of {topic} in {domain}?",
    options: [
      "To optimize performance and enhance security in {domain} environments.",
      "To complicate {domain} implementations unnecessarily.",
      "To reduce compatibility with other {domain} components.",
      "To increase the learning curve for new {domain} practitioners."
    ]
  },
  {
    question: "Which tool is NOT typically associated with {topic} in {domain}?",
    options: [
      "UnrelatedTool",
      "StandardTool1",
      "StandardTool2",
      "StandardTool3"
    ]
  }
];

const mockCodeChallenges = {
  python: [
    {
      question: "Implement a function that {task} using Python.",
      instructions: "Write a Python function that counts the frequency of each word in a given string and returns a dictionary mapping each word to its frequency.",
      template: "def count_word_frequency(text):\n    # Your code here\n    pass\n\n# Example usage\n# result = count_word_frequency(\"apple banana apple\")\n# Should return: {\"apple\": 2, \"banana\": 1}",
      example: "Input: \"apple banana apple\"\nOutput: {\"apple\": 2, \"banana\": 1}"
    },
    {
      question: "Create a class that implements {topic} functionality.",
      instructions: "Create a Python class that represents a simple bank account with deposit, withdraw, and balance check methods.",
      template: "class BankAccount:\n    # Your code here\n    pass\n\n# Example usage\n# account = BankAccount(\"John\", 100)\n# account.deposit(50)\n# account.withdraw(25)\n# balance = account.get_balance()",
      example: "account = BankAccount(\"John\", 100)\naccount.deposit(50)  # Balance: 150\naccount.withdraw(25)  # Balance: 125\nbalance = account.get_balance()  # Returns: 125"
    }
  ],
  linux: [
    {
      question: "Write a shell script that {task}.",
      instructions: "Write a shell script that finds all files larger than 100MB in the /var/log directory and outputs their names and sizes to a file called large_files.txt.",
      template: "#!/bin/bash\n\n# Your code here\n",
      example: "Output should list files like:\n/var/log/syslog.1 120MB\n/var/log/apache2/access.log 200MB"
    }
  ],
  'data-security': [
    {
      question: "Implement a secure password validation function.",
      instructions: "Write a Python function that validates passwords according to security best practices: minimum 8 characters, contains uppercase, lowercase, numbers, and special characters.",
      template: "def validate_password(password):\n    # Your code here\n    pass\n\n# Example usage\n# is_valid = validate_password(\"SecureP@ss123\")\n# Should return: True",
      example: "Input: \"SecureP@ss123\"\nOutput: True\nInput: \"weak\"\nOutput: False"
    }
  ],
  'data-science': [
    {
      question: "Implement a data analysis function using Python.",
      instructions: "Write a Python function that calculates basic statistics (mean, median, mode) for a given dataset and returns them as a dictionary.",
      template: "def calculate_statistics(data):\n    # Your code here\n    pass\n\n# Example usage\n# stats = calculate_statistics([1, 2, 2, 3, 4, 5])\n# Should return: {'mean': 2.83, 'median': 2.5, 'mode': 2}",
      example: "Input: [1, 2, 2, 3, 4, 5]\nOutput: {'mean': 2.83, 'median': 2.5, 'mode': 2}"
    }
  ],
  default: [
    {
      question: "Implement a solution for {topic} in {domain}.",
      instructions: "Write code that demonstrates understanding of {topic} concepts in {domain}.",
      template: "// Your code here\n",
      example: "Sample input and output will depend on the specific task."
    }
  ]
};

const mockScenarios = [
  {
    question: "A company is experiencing issues with {topic} in their {domain} environment. What is the most likely cause?",
    scenario: "A large enterprise is experiencing slow performance and occasional failures in their {domain} system that handles {topic}. The issues started after a recent update but there were no explicit error messages. What steps would you take to diagnose and resolve this issue?",
    options: [
      "First, check the configuration files for {topic} settings, then analyze system logs for error patterns, and finally test with a rollback to confirm if the update is the cause.",
      "Immediately roll back to the previous version without investigation.",
      "Ignore the issues as they are likely temporary and will resolve themselves.",
      "Replace the entire {domain} system with a different solution."
    ]
  },
  {
    question: "You need to implement {topic} for a critical {domain} project. Which approach is best?",
    scenario: "Your team is tasked with implementing a new {topic} solution within the existing {domain} infrastructure. The solution must be scalable, secure, and maintainable. With limited budget and a 3-month timeline, what approach would you recommend?",
    options: [
      "Use industry-standard tools and practices for {topic}, create proper documentation, and implement automated testing to ensure reliability and maintainability.",
      "Outsource the entire implementation to save time.",
      "Use experimental cutting-edge technologies to impress stakeholders.",
      "Implement a quick solution now and plan to completely rebuild later."
    ]
  }
];

export function generateMockQuestions(domain, difficulty) {
  const topics = domainTopics[domain] || domainTopics.python;
  const questionsCount = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20;
  
  const mcqCount = Math.floor(questionsCount * 0.6);
  const codeCount = Math.floor(questionsCount * 0.3);
  const scenarioCount = questionsCount - mcqCount - codeCount;
  
  const questions = [];
  
  // Generate MCQs
  for (let i = 0; i < mcqCount; i++) {
    const topic = topics[i % topics.length];
    const template = mockMCQs[i % mockMCQs.length];
    
    questions.push({
      id: `mcq-${i}`,
      type: 'mcq',
      topic,
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      question: template.question.replace(/{topic}/g, topic).replace(/{domain}/g, domain),
      options: template.options.map(opt => 
        opt.replace(/{topic}/g, topic).replace(/{domain}/g, domain)
      )
    });
  }
  
  // Generate coding questions
  const codeChallenges = mockCodeChallenges[domain] || mockCodeChallenges.default;
  for (let i = 0; i < codeCount; i++) {
    const topic = topics[(mcqCount + i) % topics.length];
    const template = codeChallenges[i % codeChallenges.length];
    
    questions.push({
      id: `code-${i}`,
      type: 'code',
      topic,
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      question: template.question.replace(/{topic}/g, topic).replace(/{domain}/g, domain).replace(/{task}/g, `implements ${topic}`),
      instructions: template.instructions.replace(/{topic}/g, topic).replace(/{domain}/g, domain),
      template: template.template,
      example: template.example
    });
  }
  
  // Generate scenarios
  for (let i = 0; i < scenarioCount; i++) {
    const topic = topics[(mcqCount + codeCount + i) % topics.length];
    const template = mockScenarios[i % mockScenarios.length];
    
    questions.push({
      id: `scenario-${i}`,
      type: 'scenario',
      topic,
      difficulty: 'hard', // Scenarios are usually challenging
      question: template.question.replace(/{topic}/g, topic).replace(/{domain}/g, domain),
      scenario: template.scenario.replace(/{topic}/g, topic).replace(/{domain}/g, domain),
      options: template.options.map(opt => 
        opt.replace(/{topic}/g, topic).replace(/{domain}/g, domain)
      )
    });
  }
  
  // Shuffle the questions
  return questions.sort(() => Math.random() - 0.5);
}
