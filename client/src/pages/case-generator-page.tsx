
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ChevronRight, Star, Trophy } from 'lucide-react';
import { generateCase } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';

const CaseGeneratorPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [caseData, setCaseData] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const specialties = [
    { value: 'medicine', label: 'Internal Medicine' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'obgyn', label: 'Obstetrics & Gynecology' },
    // Add more specialties
  ];

  const difficulties = [
    { value: 'ug', label: 'Undergraduate Level' },
    { value: 'pg', label: 'NEET PG Level' },
    { value: 'advanced', label: 'Advanced PG Level' },
  ];

  const generateNewCase = async (specialty, difficulty) => {
    try {
      const response = await generateCase(specialty, difficulty);
      setCaseData(response.case);
      setCurrentStep(0);
      setUserAnswers({});
      setShowAnswer(false);
      setScore(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate case",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSubmit = (stepIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [stepIndex]: answer
    }));
    setShowAnswer(true);
  };

  const nextStep = () => {
    if (currentStep < caseData.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const calculateStepScore = (userAnswer, expectedAnswer) => {
    // Implement scoring logic based on keyword matching
    const score = 0; // Replace with actual scoring logic
    return score;
  };

  return (
    <AppLayout title="Interactive Case Generator" description="Practice with realistic clinical cases">
      <div className="space-y-6">
        {!caseData ? (
          <Card>
            <CardHeader>
              <CardTitle>Generate New Case</CardTitle>
              <CardDescription>Select specialty and difficulty level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialty</label>
                <Select onValueChange={value => setSpecialty(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select onValueChange={value => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(d => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => generateNewCase(specialty, difficulty)}
              >
                Generate Case
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{caseData.title}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{caseData.specialty}</Badge>
                  <Badge variant="outline">{caseData.difficulty}</Badge>
                </div>
              </div>
              <Progress value={(currentStep + 1) / caseData.steps.length * 100} className="w-32" />
            </div>

            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Current Step Content */}
                <div className="space-y-4">
                  <div className="font-medium text-lg">
                    {caseData.steps[currentStep].content}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">
                      {caseData.steps[currentStep].question}
                    </label>
                    <Textarea 
                      placeholder="Type your answer..."
                      value={userAnswers[currentStep] || ''}
                      onChange={(e) => setUserAnswers(prev => ({
                        ...prev,
                        [currentStep]: e.target.value
                      }))}
                      className="min-h-[100px]"
                    />
                  </div>

                  {!showAnswer ? (
                    <Button 
                      onClick={() => handleAnswerSubmit(currentStep, userAnswers[currentStep])}
                      disabled={!userAnswers[currentStep]}
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="font-medium">Expected Answer:</div>
                        <div>{caseData.steps[currentStep].expectedAnswer}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-medium flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Clinical Pearls:
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {caseData.steps[currentStep].clinicalPearls.map((pearl, i) => (
                            <li key={i}>{pearl}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button onClick={nextStep} className="mt-4">
                        {currentStep < caseData.steps.length - 1 ? (
                          <>Next Step <ChevronRight className="ml-2 h-4 w-4" /></>
                        ) : (
                          'Complete Case'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default CaseGeneratorPage;
