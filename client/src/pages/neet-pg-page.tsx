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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen, 
  Clock, 
  FileText, 
  BarChart3, 
  Trophy,
  AlertCircle,
  PlusCircle,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  TimerIcon,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { generateQuiz, submitQuizAttempt } from '@/lib/ai-service';

// Mock data for subjects
const subjectData = [
  { id: 'medicine', name: 'Medicine', totalQuestions: 468, completedQuestions: 325 },
  { id: 'surgery', name: 'Surgery', totalQuestions: 362, completedQuestions: 180 },
  { id: 'obgyn', name: 'Obstetrics & Gynecology', totalQuestions: 281, completedQuestions: 120 },
  { id: 'pediatrics', name: 'Pediatrics', totalQuestions: 246, completedQuestions: 98 },
  { id: 'psp', name: 'PSM', totalQuestions: 214, completedQuestions: 160 },
  { id: 'ortho', name: 'Orthopedics', totalQuestions: 187, completedQuestions: 45 },
];

// Mock data for PYQs
const previousYearData = [
  { year: '2023', totalQuestions: 200, available: true },
  { year: '2022', totalQuestions: 200, available: true },
  { year: '2021', totalQuestions: 200, available: true },
  { year: '2020', totalQuestions: 200, available: true },
  { year: '2019', totalQuestions: 200, available: true },
  { year: '2018', totalQuestions: 200, available: true },
];

// Mock test form schema
const mockTestSchema = z.object({
  name: z.string().min(3, { message: "Test name must be at least 3 characters" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  numQuestions: z.string().min(1, { message: "Number of questions is required" }),
  subjects: z.array(z.string()).min(1, { message: "Select at least one subject" }),
});

type MockTestFormValues = z.infer<typeof mockTestSchema>;

// Question interface
interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string; };
  correctAnswer: string;
  explanation: string;
}

const NeetPgPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('previous-years');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [mockTest, setMockTest] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [testEndTime, setTestEndTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form setup
  const form = useForm<MockTestFormValues>({
    resolver: zodResolver(mockTestSchema),
    defaultValues: {
      name: 'Mock NEET PG Test',
      duration: '180', // 3 hours
      numQuestions: '200',
      subjects: [],
    },
  });
  
  // Sample PYQ data (normally would come from API)
  const sampleQuestions: QuizQuestion[] = [
    {
      question: "A 28-year-old woman presents with a 6-month history of amenorrhea, galactorrhea, and frontal headaches. Her prolactin level is 120 ng/mL. MRI reveals a 1.2 cm pituitary lesion. What is the most appropriate initial treatment?",
      options: {
        A: "Transsphenoidal surgery",
        B: "Cabergoline",
        C: "Radiation therapy",
        D: "Observation only"
      },
      correctAnswer: "B",
      explanation: "This patient has a prolactinoma, which is best initially treated with dopamine agonists like cabergoline or bromocriptine, which can reduce tumor size and normalize prolactin levels in most patients."
    },
    {
      question: "A 54-year-old male presents with sudden onset of severe tearing headache and drowsiness. CT scan shows subarachnoid hemorrhage. Which of the following is the most likely cause?",
      options: {
        A: "Hypertensive bleed",
        B: "Ruptured aneurysm",
        C: "Arteriovenous malformation",
        D: "Amyloid angiopathy"
      },
      correctAnswer: "B",
      explanation: "The most common cause of non-traumatic subarachnoid hemorrhage is a ruptured saccular aneurysm, accounting for about 80% of cases. The classic presentation is sudden onset of 'worst headache of life.'"
    },
    {
      question: "A 35-year-old male with HIV infection (CD4 count 120 cells/mm³) presents with fever, headache, and altered mental status. CSF examination shows lymphocytic pleocytosis, elevated protein, and low glucose. India ink preparation is positive. What is the most likely diagnosis?",
      options: {
        A: "Tuberculous meningitis",
        B: "Cryptococcal meningitis",
        C: "Toxoplasma encephalitis",
        D: "Progressive multifocal leukoencephalopathy"
      },
      correctAnswer: "B",
      explanation: "Cryptococcal meningitis is a common opportunistic infection in AIDS patients with low CD4 counts. India ink preparation showing encapsulated yeast cells is diagnostic for Cryptococcus neoformans."
    }
  ];
  
  // Load PYQ test
  const loadPreviousYearQuestions = (year: string) => {
    setSelectedYear(year);
    // In a real app, we would fetch questions from the API
    // For now, we'll use sample questions
    setMockTest(sampleQuestions);
    toast({
      title: `NEET PG ${year} Questions Loaded`,
      description: `${sampleQuestions.length} questions from NEET PG ${year} have been loaded.`,
    });
  };
  
  // Load subject test
  const loadSubjectQuestions = (subject: string) => {
    setSelectedSubject(subject);
    // In a real app, we would fetch questions from the API
    // For now, we'll use sample questions
    setMockTest(sampleQuestions);
    toast({
      title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Questions Loaded`,
      description: `${sampleQuestions.length} questions from ${subject} have been loaded.`,
    });
  };
  
  // Generate mock test
  const onSubmit = async (values: MockTestFormValues) => {
    setIsGenerating(true);
    try {
      // In a real app, we would generate a test based on the form values
      // For now, we'll use sample questions
      setMockTest(sampleQuestions);
      setTimeRemaining(parseInt(values.duration) * 60); // Convert minutes to seconds
      
      toast({
        title: "Mock Test Generated",
        description: `${sampleQuestions.length} questions have been generated for your mock test.`,
      });
      
      // Reset test state
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setTestStartTime(null);
      setTestEndTime(null);
      
      // Switch to mock test tab
      setActiveTab('mock-test');
    } catch (error) {
      console.error("Mock test generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate mock test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Start test
  const startTest = () => {
    setIsTestActive(true);
    setTestStartTime(new Date());
    
    // Start timer
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  // End test
  const endTest = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setIsTestActive(false);
    setTestEndTime(new Date());
    
    // Calculate and save score
    const score = calculateScore();
    const totalQuestions = mockTest.length;
    
    toast({
      title: "Test Completed",
      description: `Your score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)`,
    });
  };
  
  // Select answer
  const selectAnswer = (questionIndex: number, answer: string) => {
    if (!isTestActive) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };
  
  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion < mockTest.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    }
  };
  
  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1);
    }
  };
  
  // Calculate score
  const calculateScore = () => {
    let correctCount = 0;
    
    mockTest.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    return correctCount;
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format test time
  const formatTestTime = () => {
    if (!testStartTime || !testEndTime) return "N/A";
    
    const seconds = Math.round((testEndTime.getTime() - testStartTime.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <AppLayout 
      title="NEET PG Preparation" 
      description="Prepare for NEET PG with previous year questions, subject-wise practice, and full-length mock tests."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="previous-years">Previous Year Papers</TabsTrigger>
          <TabsTrigger value="subject-wise">Subject-wise Practice</TabsTrigger>
          <TabsTrigger value="mock-test">Create Mock Test</TabsTrigger>
        </TabsList>
        
        {/* Previous Year Papers */}
        <TabsContent value="previous-years">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Previous Year Cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {previousYearData.map((item) => (
                <Card 
                  key={item.year} 
                  className={`cursor-pointer transition-all ${selectedYear === item.year ? 'border-primary' : ''}`}
                  onClick={() => loadPreviousYearQuestions(item.year)}
                >
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">{item.year}</CardTitle>
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-muted-foreground">
                      {item.totalQuestions} Questions
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Instructions and Tips */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>NEET PG Format</CardTitle>
                  <CardDescription>
                    Current NEET PG exam pattern
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Questions:</span>
                      <span className="font-medium">200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">3 hours 30 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marking Scheme:</span>
                      <span className="font-medium">+4 for correct, -1 for incorrect</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Marks:</span>
                      <span className="font-medium">800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Question Type:</span>
                      <span className="font-medium">MCQs with single correct answer</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preparation Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Practice at least 5 years of previous papers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Identify high-yield topics from recurring questions</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Use timers to improve your speed</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Review incorrect answers thoroughly</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Create mnemonics for frequently tested topics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Selected Test Questions */}
          {selectedYear && mockTest.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>NEET PG {selectedYear} Questions</CardTitle>
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setActiveTab('mock-test');
                      startTest();
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Start Timed Test
                  </Button>
                </div>
                <CardDescription>
                  {mockTest.length} questions from NEET PG {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {mockTest.slice(0, 3).map((question, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium mb-2">Q{index + 1}: {question.question}</p>
                      <div className="ml-4 space-y-1 text-sm">
                        {Object.entries(question.options).map(([key, value]) => (
                          <p key={key}>{key}: {value}</p>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                {mockTest.length > 3 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {mockTest.length - 3} more questions available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Subject-wise Practice */}
        <TabsContent value="subject-wise">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Subject Cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subjectData.map((subject) => (
                <Card 
                  key={subject.id} 
                  className={`cursor-pointer transition-all ${selectedSubject === subject.id ? 'border-primary' : ''}`}
                  onClick={() => loadSubjectQuestions(subject.id)}
                >
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>Progress:</span>
                        <span>{Math.round((subject.completedQuestions / subject.totalQuestions) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(subject.completedQuestions / subject.totalQuestions) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {subject.completedQuestions}/{subject.totalQuestions} questions completed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Statistics and Performance */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Performance</CardTitle>
                  <CardDescription>
                    Subject-wise statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Medicine</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Surgery</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pediatrics</span>
                        <span>81%</span>
                      </div>
                      <Progress value={81} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subject Weightage</CardTitle>
                  <CardDescription>
                    Approximate distribution in NEET PG
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Medicine</span>
                      <span className="font-medium">20-25%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Surgery</span>
                      <span className="font-medium">15-20%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>OB-GYN</span>
                      <span className="font-medium">12-15%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Pediatrics</span>
                      <span className="font-medium">10-12%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>PSM</span>
                      <span className="font-medium">8-10%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Others</span>
                      <span className="font-medium">20-25%</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Selected Subject Questions */}
          {selectedSubject && mockTest.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="capitalize">
                    {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} Questions
                  </CardTitle>
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setActiveTab('mock-test');
                      startTest();
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Start Practice Test
                  </Button>
                </div>
                <CardDescription>
                  {mockTest.length} questions on {selectedSubject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {mockTest.slice(0, 3).map((question, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium mb-2">Q{index + 1}: {question.question}</p>
                      <div className="ml-4 space-y-1 text-sm">
                        {Object.entries(question.options).map(([key, value]) => (
                          <p key={key}>{key}: {value}</p>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                {mockTest.length > 3 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {mockTest.length - 3} more questions available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Create Mock Test */}
        <TabsContent value="mock-test">
          {mockTest.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Create Custom Mock Test</CardTitle>
                  <CardDescription>
                    Configure your mock test parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                                  <SelectItem value="120">120 minutes (2 hours)</SelectItem>
                                  <SelectItem value="180">180 minutes (3 hours)</SelectItem>
                                  <SelectItem value="210">210 minutes (3.5 hours)</SelectItem>
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
                                  <SelectItem value="50">50 Questions</SelectItem>
                                  <SelectItem value="100">100 Questions</SelectItem>
                                  <SelectItem value="150">150 Questions</SelectItem>
                                  <SelectItem value="200">200 Questions (Full Length)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="subjects"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Included Subjects</FormLabel>
                              <FormDescription>
                                Select subjects to include in your mock test
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {subjectData.map((subject) => (
                                <FormField
                                  key={subject.id}
                                  control={form.control}
                                  name="subjects"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={subject.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(subject.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, subject.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== subject.id
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer">
                                          {subject.name}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Mock Test...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Mock Test
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mock Test Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Simulate exam conditions (no interruptions)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Maintain the same pace you would in the actual exam</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Don't spend too much time on difficult questions</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Review all questions after completion</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Track your performance across multiple tests</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your Mock Test History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">No tests completed yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Create and complete your first mock test to see your performance.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Test Taking Interface */
            <div className="space-y-6">
              {/* Test Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {form.getValues().name || "NEET PG Mock Test"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mockTest.length} Questions • {isTestActive ? "Test in Progress" : (testEndTime ? "Test Completed" : "Ready to Start")}
                  </p>
                </div>
                
                {!isTestActive && !testEndTime ? (
                  <Button onClick={startTest}>
                    <Clock className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                ) : (
                  <div className="flex items-center">
                    <TimerIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className={`font-medium ${isTestActive && timeRemaining < 300 ? 'text-red-500' : ''}`}>
                      {isTestActive ? (
                        formatTime(timeRemaining)
                      ) : (
                        `Time: ${formatTestTime()}`
                      )}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Question {currentQuestion + 1} of {mockTest.length}</span>
                  <span>
                    {Object.keys(selectedAnswers).length} of {mockTest.length} answered
                  </span>
                </div>
                <Progress 
                  value={(currentQuestion + 1) / mockTest.length * 100} 
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
                    {mockTest[currentQuestion]?.question}
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedAnswers[currentQuestion] || ""}
                    onValueChange={(value) => selectAnswer(currentQuestion, value)}
                    className="space-y-3"
                    disabled={!isTestActive && !testEndTime}
                  >
                    {Object.keys(mockTest[currentQuestion]?.options || {}).map((letter) => (
                      <div key={letter} className="flex items-start space-x-2">
                        <RadioGroupItem 
                          value={letter} 
                          id={`option-${letter}`} 
                          className="mt-1"
                        />
                        <Label 
                          htmlFor={`option-${letter}`}
                          className={`flex-1 cursor-pointer space-y-1 rounded-md p-2 hover:bg-accent ${
                            testEndTime && letter === mockTest[currentQuestion].correctAnswer
                              ? 'bg-green-50 text-green-900'
                              : testEndTime && selectedAnswers[currentQuestion] === letter && letter !== mockTest[currentQuestion].correctAnswer
                              ? 'bg-red-50 text-red-900'
                              : ''
                          }`}
                        >
                          <div className="font-medium">
                            {letter}.
                          </div>
                          <div className="text-sm">
                            {mockTest[currentQuestion]?.options[letter as keyof typeof mockTest[currentQuestion].options]}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                
                {/* Explanation (only shown after test completion) */}
                {testEndTime && (
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex items-center space-x-2 mb-2">
                      {selectedAnswers[currentQuestion] === mockTest[currentQuestion].correctAnswer ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-medium">
                        {selectedAnswers[currentQuestion] === mockTest[currentQuestion].correctAnswer
                          ? "Correct!"
                          : "Incorrect"}
                      </h3>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Correct Answer: {mockTest[currentQuestion].correctAnswer}</p>
                      <p>{mockTest[currentQuestion].explanation}</p>
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
                    {isTestActive && (
                      <Button
                        variant="destructive"
                        onClick={endTest}
                      >
                        End Test
                      </Button>
                    )}
                    
                    {(!isTestActive && !testEndTime) || testEndTime ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMockTest([]);
                          setActiveTab('mock-test');
                        }}
                      >
                        New Test
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        onClick={nextQuestion}
                        disabled={currentQuestion === mockTest.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
              
              {/* Results Summary (only shown when test is complete) */}
              {testEndTime && (
                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                      Your performance summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">
                          {calculateScore()}/{mockTest.length}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Score
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">
                          {Math.round((calculateScore() / mockTest.length) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Percentage
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">
                          {formatTestTime()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Time Taken
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Question Summary</h3>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <div className="w-5 h-5 bg-green-100 rounded-full mr-2"></div>
                          <span>Correct: {calculateScore()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-5 h-5 bg-red-100 rounded-full mr-2"></div>
                          <span>Incorrect: {Object.keys(selectedAnswers).length - calculateScore()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-5 h-5 bg-gray-100 rounded-full mr-2"></div>
                          <span>Unattempted: {mockTest.length - Object.keys(selectedAnswers).length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setMockTest([]);
                        setActiveTab('mock-test');
                      }}
                    >
                      Create New Test
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        // In a real app, we would generate a report
                        toast({
                          title: "Report Generated",
                          description: "Your detailed performance report has been generated.",
                        });
                      }}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Detailed Analysis
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Question Navigator */}
              {mockTest.length > 0 && (
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm">Question Navigator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mockTest.map((_, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className={`w-10 h-10 p-0 ${
                            index === currentQuestion 
                              ? 'border-primary bg-primary-50' 
                              : selectedAnswers[index] !== undefined
                              ? testEndTime
                                ? selectedAnswers[index] === mockTest[index].correctAnswer
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                                : 'bg-gray-100'
                              : ''
                          }`}
                          onClick={() => setCurrentQuestion(index)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-100 rounded-sm mr-1"></div>
                          <span>Answered</span>
                        </div>
                        {testEndTime && (
                          <>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded-sm mr-1"></div>
                              <span>Correct</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm mr-1"></div>
                              <span>Incorrect</span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-primary-50 border border-primary rounded-sm mr-1"></div>
                          <span>Current</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default NeetPgPage;
