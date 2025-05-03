
import React, { useState } from 'react';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const mockCase = {
  title: "Acute Chest Pain Case",
  difficulty: "Moderate",
  specialty: "Cardiology",
  steps: [
    {
      type: "chiefComplaint",
      content: "45-year-old male presents with severe chest pain radiating to left arm for 2 hours",
      question: "What is your initial impression?",
      expectedAnswer: "Acute Coronary Syndrome should be suspected",
      clinicalPearls: ["Always check vitals first", "Note radiation pattern"]
    },
    {
      type: "history",
      content: "Patient is diabetic, hypertensive, smoker. Pain started after climbing stairs.",
      question: "What risk factors are present?",
      expectedAnswer: "Multiple cardiovascular risk factors present",
      clinicalPearls: ["Cluster of risk factors increases ACS probability"]
    },
    {
      type: "examination",
      content: "BP: 90/60, HR: 110/min, Respiratory rate: 24/min, SpO2: 94% on room air",
      question: "What are the concerning vital signs?",
      expectedAnswer: "Hypotension and tachycardia suggest cardiogenic shock",
      clinicalPearls: ["Vitals suggest hemodynamic compromise"]
    },
  ]
};

export default function CaseGeneratorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [specialty, setSpecialty] = useState("cardiology");
  const [difficulty, setDifficulty] = useState("moderate");
  const [caseData, setCaseData] = useState(mockCase);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCase = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setCaseData(mockCase);
      setCurrentStep(0);
      setShowAnswer(false);
      setIsGenerating(false);
    }, 1000);
  };

  const progress = ((currentStep + 1) / caseData.steps.length) * 100;

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
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (UG Level)</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="difficult">Difficult (PG Level)</SelectItem>
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
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle>{caseData.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-primary/10 rounded">
                    {caseData.specialty}
                  </span>
                  <span className="px-2 py-1 bg-secondary/10 rounded">
                    {caseData.difficulty}
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
                          {caseData.steps[currentStep].clinicalPearls.map((pearl, index) => (
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

          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Medical Disclaimer</AlertTitle>
            <AlertDescription>
              This is an AI-generated case for educational purposes only. Always refer to standard medical textbooks and guidelines for clinical practice.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </AppLayout>
  );
}
