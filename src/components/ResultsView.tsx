
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X } from 'lucide-react';

const ResultsView = ({ domain, difficulty, questions, answers, onComplete }) => {
  // Calculate score and analyze results
  const calculateResults = () => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    
    // Mock evaluation (in a real app, this would compare with correct answers)
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      // Simple mock scoring logic for demonstration
      if (userAnswer) {
        if (question.type === 'mcq' || question.type === 'scenario') {
          // For this demo, consider the first option as correct
          if (userAnswer === question.options[0]) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        } else if (question.type === 'code') {
          // For coding questions, just check if code is longer than 10 chars as mock
          if (userAnswer.length > 10) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        }
      } else {
        incorrectAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Analyze strengths and weaknesses based on subtopics
    const topicResults = {};
    questions.forEach(question => {
      if (!topicResults[question.topic]) {
        topicResults[question.topic] = { total: 0, correct: 0 };
      }
      
      topicResults[question.topic].total++;
      
      const userAnswer = answers[question.id];
      if (question.type === 'mcq' || question.type === 'scenario') {
        if (userAnswer === question.options[0]) {
          topicResults[question.topic].correct++;
        }
      } else if (question.type === 'code') {
        if (userAnswer && userAnswer.length > 10) {
          topicResults[question.topic].correct++;
        }
      }
    });
    
    // Calculate topic scores
    const topicScores = Object.entries(topicResults).map(([topic, data]) => ({
      topic,
      score: Math.round((data.correct / data.total) * 100)
    }));
    
    // Identify strengths (>80%) and weaknesses (<60%)
    const strengths = topicScores.filter(item => item.score >= 80).map(item => item.topic);
    const weaknesses = topicScores.filter(item => item.score < 60).map(item => item.topic);
    
    return {
      score,
      correctAnswers,
      incorrectAnswers,
      unanswered: questions.length - (correctAnswers + incorrectAnswers),
      topicScores,
      strengths,
      weaknesses
    };
  };
  
  const results = calculateResults();
  
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Results Header */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{domain.name} Assessment Results ({difficulty})</CardTitle>
              <Badge className={results.score >= 80 ? 'bg-green-100 text-green-800' : 
                              results.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}>
                {results.score >= 80 ? 'Excellent' : 
                 results.score >= 60 ? 'Satisfactory' : 
                 'Needs Improvement'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="relative h-36 w-36 mb-4">
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                  {results.score}%
                </div>
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={results.score >= 80 ? '#22c55e' : results.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${results.score * 2.51} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-8 w-full max-w-md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.incorrectAnswers}</div>
                  <div className="text-sm text-gray-500">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{results.unanswered}</div>
                  <div className="text-sm text-gray-500">Unanswered</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Results */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="questions" className="flex-1">Question Analysis</TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.topicScores.map((topic, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{topic.topic}</span>
                        <span className={`text-sm ${
                          topic.score >= 80 ? 'text-green-600' : 
                          topic.score >= 60 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {topic.score}%
                        </span>
                      </div>
                      <Progress 
                        value={topic.score} 
                        className={`h-2 ${
                          topic.score >= 80 ? 'bg-green-600' : 
                          topic.score >= 60 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h3 className="text-base font-medium mb-3 text-green-700">Strengths</h3>
                    {results.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {results.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-center">
                            <Check size={16} className="text-green-500 mr-2" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No strong areas identified.</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-3 text-red-700">Areas for Improvement</h3>
                    {results.weaknesses.length > 0 ? (
                      <ul className="space-y-2">
                        {results.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="flex items-center">
                            <X size={16} className="text-red-500 mr-2" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No significant weak areas identified.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Question Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map((question, idx) => {
                    const userAnswer = answers[question.id];
                    // Mock correct answer check (first option is always correct in this demo)
                    const isCorrect = 
                      question.type === 'mcq' || question.type === 'scenario' 
                        ? userAnswer === question.options[0]
                        : userAnswer && userAnswer.length > 10;
                    
                    return (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-medium">Question {idx + 1}</h3>
                          <Badge variant="outline" className={isCorrect 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                        <p className="text-sm mb-4">{question.question}</p>
                        
                        {(question.type === 'mcq' || question.type === 'scenario') && (
                          <div className="space-y-2 text-sm">
                            <div className="font-medium">Your answer:</div>
                            <div className={`p-2 rounded ${
                              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                              {userAnswer || "No answer provided"}
                            </div>
                            
                            {!isCorrect && (
                              <>
                                <div className="font-medium mt-2">Correct answer:</div>
                                <div className="p-2 rounded bg-green-50 border border-green-200">
                                  {question.options[0]}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {question.type === 'code' && (
                          <div className="space-y-2 text-sm">
                            <div className="font-medium">Your code solution:</div>
                            <div className={`p-2 rounded font-mono text-xs whitespace-pre overflow-x-auto ${
                              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                              {userAnswer || "No code submitted"}
                            </div>
                            
                            {!isCorrect && (
                              <div className="p-2 mt-2 bg-yellow-50 border border-yellow-200 rounded">
                                <div className="font-medium">Feedback:</div>
                                <p>Your code solution did not pass all test cases. Consider reviewing the requirements and try again.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Learning Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {results.weaknesses.length > 0 ? (
                  <div className="space-y-6">
                    {results.weaknesses.map((weakness, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-3">{weakness}</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-base font-medium mb-2">Recommended Resources</h4>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                                <div>
                                  <p className="font-medium">Online Course</p>
                                  <p className="text-gray-600">"{domain.name} Mastery: {weakness} Deep Dive"</p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                                <div>
                                  <p className="font-medium">Practice Exercises</p>
                                  <p className="text-gray-600">Complete the "{weakness} Fundamentals" exercise set</p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                                <div>
                                  <p className="font-medium">Documentation</p>
                                  <p className="text-gray-600">Read the official documentation on {weakness}</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-base font-medium mb-2">Learning Path</h4>
                            <ol className="space-y-2 text-sm">
                              <li className="flex items-start">
                                <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                                <span>Review basic concepts of {weakness}</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                                <span>Complete practice exercises focusing on {weakness}</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-gray-100 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                                <span>Take a mini-assessment on {weakness} to gauge improvement</span>
                              </li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-lg font-medium text-gray-800">Great job!</p>
                    <p className="text-gray-600 mt-2">
                      You've performed well across all topics. To further enhance your skills, 
                      consider taking on more advanced assessments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={onComplete}>
            Return to Dashboard
          </Button>
          <Button>
            Download Full Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
