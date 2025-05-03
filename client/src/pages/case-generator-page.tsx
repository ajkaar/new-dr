
import React, { useState } from 'react';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, ArrowRight, Stethoscope } from 'lucide-react';
import { generateCase } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';

export default function CaseGeneratorPage() {
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [specialty, setSpecialty] = useState('medicine');
  const [caseData, setCaseData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateCase = async () => {
    setIsGenerating(true);
    try {
      const response = await generateCase(specialty);
      if (response.case) {
        setCaseData(response.case);
        setCurrentStep(0);
        setShowAnswer(false);
        setUserAnswer('');
      } else {
        toast({
          title: "Error",
          description: "Please log in to generate cases",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate case. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const progress = caseData ? ((currentStep + 1) / caseData.steps.length) * 100 : 0;

  return (
    <AppLayout
      title="Interactive Case Generator"
      description="Practice with AI-generated clinical cases based on Indian medical curriculum"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Controls */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Case Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="pulmonology">Pulmonology</SelectItem>
                  <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="nephrology">Nephrology</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="general-surgery">General Surgery</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="obstetrics-gynecology">Obstetrics & Gynecology</SelectItem>
                  <SelectItem value="psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                  <SelectItem value="ent">ENT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleGenerateCase} 
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate New Case"}
            </Button>
          </CardContent>
        </Card>

        {/* Case Content */}
        <div className="md:col-span-3">
          {caseData ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    {caseData.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="px-2 py-1 bg-primary/10 rounded">
                      {specialty}
                    </span>
                    <span className="px-2 py-1 bg-secondary/10 rounded">
                      {difficulty}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Step {currentStep + 1} of {caseData.steps.length}
                    </div>
                    <Progress value={progress} className="w-1/2" />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Clinical Information:</h3>
                      <p>{caseData.steps[currentStep].content}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Question:</h3>
                      <p>{caseData.steps[currentStep].question}</p>
                      <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="mt-2"
                      />
                    </div>

                    {showAnswer && (
                      <div className="space-y-4">
                        <Alert>
                          <BookOpen className="h-4 w-4" />
                          <AlertTitle>Expected Answer</AlertTitle>
                          <AlertDescription>
                            {caseData.steps[currentStep].expectedAnswer}
                          </AlertDescription>
                        </Alert>

                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Clinical Pearls:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {caseData.steps[currentStep].clinicalPearls.map((pearl: string, index: number) => (
                              <li key={index} className="text-sm">{pearl}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {showAnswer ? "Hide Answer" : "Show Answer"}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (currentStep < caseData.steps.length - 1) {
                          setCurrentStep(currentStep + 1);
                          setShowAnswer(false);
                          setUserAnswer('');
                        }
                      }}
                      disabled={currentStep === caseData.steps.length - 1}
                    >
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Generate a new case to begin practicing
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
