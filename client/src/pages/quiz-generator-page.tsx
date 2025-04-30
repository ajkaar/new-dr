import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppLayout from '@/components/layouts/app-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { HelpCircle, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2, BarChart3 } from 'lucide-react';
import { generateQuiz, submitQuizAttempt } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';

// Form schema for quiz generation
const formSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  topic: z.string().min(1, { message: "Topic is required" }),
  difficulty: z.string().min(1, { message: "Difficulty is required" }),
  numQuestions: z.string().min(1, { message: "Number of questions is required" }),
});

type FormValues = z.infer<typeof formSchema>;

// Quiz question interface
interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string; };
  correctAnswer: string;
  explanation: string;
}

const QuizGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [quizEndTime, setQuizEndTime] = useState<Date | null>(null);
  const [quizSubject, setQuizSubject] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get quiz history
  const { data: quizHistory } = useQuery({
    queryKey: ['/api/quiz/history'],
    enabled: !!user,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      topic: '',
      difficulty: 'medium',
      numQuestions: '10',
    },
  });

  // Subject options
  const subjects = [
    { value: 'anatomy', label: 'Anatomy' },
    { value: 'physiology', label: 'Physiology' },
    { value: 'biochemistry', label: 'Biochemistry' },
    { value: 'pathology', label: 'Pathology' },
    { value: 'pharmacology', label: 'Pharmacology' },
    { value: 'microbiology', label: 'Microbiology' },
    { value: 'medicine', label: 'Internal Medicine' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'obgyn', label: 'Obstetrics & Gynecology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'radiology', label: 'Radiology' },
  ];

  // Topic suggestions based on selected subject
  const getTopicSuggestions = (subject: string) => {
    switch (subject) {
      case 'anatomy':
        return [
          { value: 'upper_limb', label: 'Upper Limb' },
          { value: 'lower_limb', label: 'Lower Limb' },
          { value: 'thorax', label: 'Thorax' },
          { value: 'abdomen', label: 'Abdomen' },
          { value: 'head_neck', label: 'Head & Neck' },
          { value: 'neuroanatomy', label: 'Neuroanatomy' },
        ];
      case 'physiology':
        return [
          { value: 'cardiovascular', label: 'Cardiovascular System' },
          { value: 'respiratory', label: 'Respiratory System' },
          { value: 'renal', label: 'Renal System' },
          { value: 'neurophysiology', label: 'Neurophysiology' },
          { value: 'endocrinology', label: 'Endocrinology' },
          { value: 'gastrointestinal', label: 'Gastrointestinal System' },
        ];
      case 'biochemistry':
        return [
          { value: 'enzymes', label: 'Enzymes' },
          { value: 'metabolism', label: 'Metabolism' },
          { value: 'vitamins', label: 'Vitamins & Minerals' },
          { value: 'molecular_biology', label: 'Molecular Biology' },
          { value: 'nutrition', label: 'Nutrition' },
        ];
      default:
        return [];
    }
  };

  // Topic options based on selected subject
  const topicOptions = form.watch('subject') 
    ? getTopicSuggestions(form.watch('subject')) 
    : [];

  // Generate quiz
  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    try {
      const numQuestionsInt = parseInt(values.numQuestions);
      
      // Set quiz metadata
      setQuizSubject(values.subject);
      setQuizTopic(values.topic);
      setQuizDifficulty(values.difficulty);
      
      const response = await generateQuiz(
        values.subject,
        values.topic,
        values.difficulty,
        numQuestionsInt
      );
      
      if (response.quiz && response.quiz.questions) {
        setQuizQuestions(response.quiz.questions);
        toast({
          title: "Quiz Generated",
          description: `Created ${response.quiz.questions.length} questions on ${values.topic}`,
        });
        
        // Reset quiz state
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setShowExplanation(false);
        setQuizStartTime(null);
        setQuizEndTime(null);
        
        // Switch to quiz tab
        setActiveTab('quiz');
      } else {
        throw new Error("Invalid quiz data format");
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Start quiz
  const startQuiz = () => {
    setIsQuizActive(true);
    setQuizStartTime(new Date());
  };

  // Select answer
  const selectAnswer = (questionIndex: number, answer: string) => {
    if (!isQuizActive) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
      setShowExplanation(false);
    } else if (!quizEndTime) {
      // End the quiz if we're on the last question
      endQuiz();
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1);
      setShowExplanation(false);
    }
  };

  // Toggle explanation
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  // End quiz and calculate score
  const endQuiz = () => {
    setIsQuizActive(false);
    setQuizEndTime(new Date());
    setShowExplanation(true);
    
    // Calculate and save score
    saveQuizResult();
  };

  // Calculate score
  const calculateScore = () => {
    let correctCount = 0;
    
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    return correctCount;
  };

  // Save quiz result
  const saveQuizResult = async () => {
    if (!quizStartTime || !quizEndTime) return;
    
    const score = calculateScore();
    const totalQuestions = quizQuestions.length;
    const timeTakenSeconds = Math.round((quizEndTime.getTime() - quizStartTime.getTime()) / 1000);
    
    try {
      await submitQuizAttempt(
        quizSubject,
        quizTopic,
        quizDifficulty,
        score,
        totalQuestions,
        timeTakenSeconds
      );
      
      toast({
        title: "Quiz Result Saved",
        description: `Your score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)`,
      });
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz result",
        variant: "destructive",
      });
    }
  };

  // Get the current question's letter options (A, B, C, D)
  const getOptionLetters = () => {
    return Object.keys(quizQuestions[currentQuestion]?.options || {});
  };

  // Format quiz time
  const formatQuizTime = () => {
    if (!quizStartTime || !quizEndTime) return "N/A";
    
    const seconds = Math.round((quizEndTime.getTime() - quizStartTime.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout 
      title="Quiz Generator" 
      description="Create custom quizzes based on subject, topic, and difficulty level."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="generator">Generate Quiz</TabsTrigger>
          <TabsTrigger value="quiz" disabled={quizQuestions.length === 0}>Take Quiz</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
        </TabsList>
        
        {/* Quiz Generator */}
        <TabsContent value="generator">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Create Custom Quiz</CardTitle>
                <CardDescription>
                  Configure your quiz parameters to generate MCQs from standard medical textbooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.value} value={subject.value}>
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The medical subject for your quiz questions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          {topicOptions.length > 0 ? (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select topic" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {topicOptions.map((topic) => (
                                  <SelectItem key={topic.value} value={topic.value}>
                                    {topic.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl>
                              <Input 
                                placeholder="Enter specific topic" 
                                {...field} 
                              />
                            </FormControl>
                          )}
                          <FormDescription>
                            Specific area within the subject
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Level</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                                <SelectItem value="neet-pg">NEET PG Level</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="numQuestions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Questions</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select number" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="5">5 Questions</SelectItem>
                                <SelectItem value="10">10 Questions</SelectItem>
                                <SelectItem value="15">15 Questions</SelectItem>
                                <SelectItem value="20">20 Questions</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Generate Quiz
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quiz Tips</CardTitle>
                <CardDescription>
                  How to get the most out of our quizzes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Specific Topics</h3>
                  <p className="text-sm text-muted-foreground">
                    For better results, select specific topics rather than broad subjects
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Progressive Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with easier difficulty and gradually increase as you improve
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Timed Practice</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the timer feature to simulate exam conditions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Review Explanations</h3>
                  <p className="text-sm text-muted-foreground">
                    Always read the explanations, even for questions you answered correctly
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Our quizzes reference standard textbooks like Harrison's, Robbins, and Guyton
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Quiz Taking Interface */}
        <TabsContent value="quiz">
          {quizQuestions.length > 0 && (
            <div className="space-y-6">
              {/* Quiz Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold capitalize">
                    {form.getValues().subject} Quiz: {form.getValues().topic.replace('_', ' ')}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    Difficulty: {form.getValues().difficulty} • {quizQuestions.length} Questions
                  </p>
                </div>
                
                {!isQuizActive && !quizEndTime ? (
                  <Button onClick={startQuiz}>
                    <Clock className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Button>
                ) : (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {quizEndTime ? (
                        `Time: ${formatQuizTime()}`
                      ) : (
                        "Timer Running..."
                      )}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                  <span>
                    {Object.keys(selectedAnswers).length} of {quizQuestions.length} answered
                  </span>
                </div>
                <Progress 
                  value={(currentQuestion + 1) / quizQuestions.length * 100} 
                  className="h-2"
                />
              </div>
              
              {/* Question Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {currentQuestion + 1}
                  </CardTitle>
                  <div className="mt-2 text-base font-normal">
                    {quizQuestions[currentQuestion]?.question}
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedAnswers[currentQuestion] || ""}
                    onValueChange={(value) => selectAnswer(currentQuestion, value)}
                    className="space-y-3"
                    disabled={!isQuizActive && !quizEndTime}
                  >
                    {getOptionLetters().map((letter) => (
                      <div key={letter} className="flex items-start space-x-2">
                        <RadioGroupItem 
                          value={letter} 
                          id={`option-${letter}`} 
                          className="mt-1"
                        />
                        <Label 
                          htmlFor={`option-${letter}`}
                          className={`flex-1 cursor-pointer space-y-1 rounded-md p-2 hover:bg-accent ${
                            quizEndTime && letter === quizQuestions[currentQuestion].correctAnswer
                              ? 'bg-green-50 text-green-900'
                              : quizEndTime && selectedAnswers[currentQuestion] === letter && letter !== quizQuestions[currentQuestion].correctAnswer
                              ? 'bg-red-50 text-red-900'
                              : ''
                          }`}
                        >
                          <div className="font-medium">
                            {letter}.
                          </div>
                          <div className="text-sm">
                            {quizQuestions[currentQuestion]?.options[letter as keyof typeof quizQuestions[currentQuestion].options]}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                
                {/* Explanation */}
                {(showExplanation || quizEndTime) && (
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex items-center space-x-2 mb-2">
                      {selectedAnswers[currentQuestion] === quizQuestions[currentQuestion].correctAnswer ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-medium">
                        {selectedAnswers[currentQuestion] === quizQuestions[currentQuestion].correctAnswer
                          ? "Correct!"
                          : "Incorrect"}
                      </h3>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Correct Answer: {quizQuestions[currentQuestion].correctAnswer}</p>
                      <p>{quizQuestions[currentQuestion].explanation}</p>
                    </div>
                  </div>
                )}
                
                <CardFooter className="flex justify-between py-4">
                  <Button 
                    variant="outline" 
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-2">
                    {isQuizActive && !quizEndTime && (
                      <Button
                        variant="secondary"
                        onClick={toggleExplanation}
                      >
                        {showExplanation ? "Hide Explanation" : "Show Explanation"}
                      </Button>
                    )}
                    
                    {isQuizActive && !quizEndTime && currentQuestion === quizQuestions.length - 1 && (
                      <Button
                        variant="default"
                        onClick={endQuiz}
                      >
                        Finish Quiz
                      </Button>
                    )}
                    
                    {(!isQuizActive && !quizEndTime) || quizEndTime ? (
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('generator')}
                      >
                        New Quiz
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        onClick={nextQuestion}
                        disabled={currentQuestion === quizQuestions.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
              
              {/* Results Summary (only shown when quiz is complete) */}
              {quizEndTime && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Results</CardTitle>
                    <CardDescription>
                      Your performance summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">
                          {calculateScore()}/{quizQuestions.length}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Score
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">
                          {Math.round((calculateScore() / quizQuestions.length) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Percentage
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">
                          {formatQuizTime()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Time Taken
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('generator')}
                    >
                      Create New Quiz
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => setActiveTab('history')}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Quiz History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
              <CardDescription>
                Track your performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizHistory && quizHistory.length > 0 ? (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Subject</th>
                          <th className="text-left py-3 px-4">Topic</th>
                          <th className="text-left py-3 px-4">Difficulty</th>
                          <th className="text-center py-3 px-4">Score</th>
                          <th className="text-center py-3 px-4">Percentage</th>
                          <th className="text-right py-3 px-4">Time Taken</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizHistory.map((attempt, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">
                              {new Date(attempt.completedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {attempt.subject}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {attempt.topic.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {attempt.difficulty}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {attempt.score}/{attempt.totalQuestions}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                            </td>
                            <td className="py-3 px-4 text-right">
                              {Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60).toString().padStart(2, '0')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Basic Performance Chart */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Performance Trend</h3>
                    <div className="h-60 bg-gray-50 flex items-center justify-center rounded-lg border">
                      <p className="text-muted-foreground">Chart visualization would appear here</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No quiz history yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Complete your first quiz to start tracking your progress
                  </p>
                  <Button 
                    className="mt-6" 
                    onClick={() => setActiveTab('generator')}
                  >
                    Create Your First Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default QuizGeneratorPage;
