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
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Stethoscope, VolumeX, History, Clipboard, FlaskRound, Radiation, List, AlertCircle } from 'lucide-react';
import { getDiagnosis } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

// Form schema
const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: "Symptoms must be at least 10 characters",
  }),
  duration: z.string().optional(),
  patientAge: z.string().optional(),
  patientGender: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DiagnosisToolPage: React.FC = () => {
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
      duration: '',
      patientAge: '',
      patientGender: '',
      medicalHistory: '',
      currentMedications: '',
    },
  });

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Format symptoms with additional context if provided
      let fullSymptomDescription = `Symptoms: ${values.symptoms}`;
      
      if (values.duration) {
        fullSymptomDescription += `\nDuration: ${values.duration}`;
      }
      
      if (values.patientAge && values.patientGender) {
        fullSymptomDescription += `\nPatient: ${values.patientAge} year old ${values.patientGender}`;
      } else if (values.patientAge) {
        fullSymptomDescription += `\nPatient Age: ${values.patientAge} years`;
      } else if (values.patientGender) {
        fullSymptomDescription += `\nPatient Gender: ${values.patientGender}`;
      }
      
      if (values.medicalHistory) {
        fullSymptomDescription += `\nRelevant Medical History: ${values.medicalHistory}`;
      }
      
      if (values.currentMedications) {
        fullSymptomDescription += `\nCurrent Medications: ${values.currentMedications}`;
      }
      
      const response = await getDiagnosis(fullSymptomDescription);
      
      setDiagnosisResult(response.diagnosis);
      
      // Update token usage
      if (response.tokenUsage && user) {
        // Update the cached user data with new token usage
        queryClient.setQueryData(['/api/user'], {
          ...user,
          tokenUsage: response.tokenUsage.current
        });
      }
      
      toast({
        title: "Diagnosis Generated",
        description: "AI has analyzed the symptoms and generated potential diagnoses.",
      });
    } catch (error) {
      console.error("Diagnosis error:", error);
      toast({
        title: "Error",
        description: "Failed to generate diagnosis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Example cases for quick selection
  const exampleCases = [
    {
      title: "Chest Pain & Shortness of Breath",
      symptoms: "Patient presents with sudden onset of chest pain radiating to the left arm and jaw. Associated with shortness of breath and sweating. Pain is described as pressure-like and crushing.",
      duration: "2 hours",
      patientAge: "62",
      patientGender: "male",
      medicalHistory: "Hypertension, Diabetes Mellitus, Hyperlipidemia",
      currentMedications: "Amlodipine, Metformin, Atorvastatin"
    },
    {
      title: "Abdominal Pain & Vomiting",
      symptoms: "Right lower quadrant abdominal pain that started periumbilically. Pain is sharp and constant. Associated with nausea, vomiting, and low-grade fever. No diarrhea. Loss of appetite.",
      duration: "36 hours",
      patientAge: "24",
      patientGender: "female",
      medicalHistory: "None",
      currentMedications: "None"
    },
    {
      title: "Fever & Cough",
      symptoms: "High-grade fever with chills. Productive cough with yellowish sputum. Right-sided chest pain on deep inspiration. Decreased appetite and fatigue.",
      duration: "5 days",
      patientAge: "45",
      patientGender: "male",
      medicalHistory: "Smoking (20 pack-years)",
      currentMedications: "None"
    }
  ];

  const loadExampleCase = (index: number) => {
    const example = exampleCases[index];
    form.reset({
      symptoms: example.symptoms,
      duration: example.duration,
      patientAge: example.patientAge,
      patientGender: example.patientGender,
      medicalHistory: example.medicalHistory,
      currentMedications: example.currentMedications,
    });
  };

  return (
    <AppLayout 
      title="AI Diagnosis Tool" 
      description="Enter symptoms to receive potential diagnoses based on clinical knowledge and medical textbooks."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="symptoms" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="symptoms">Input Symptoms</TabsTrigger>
              <TabsTrigger value="results" disabled={!diagnosisResult}>
                Diagnosis Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="symptoms">
              <Card>
                <CardHeader>
                  <CardTitle>Symptom Analysis</CardTitle>
                  <CardDescription>
                    Provide detailed information for more accurate diagnosis suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="symptoms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symptoms <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the symptoms in detail..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Include details like location, severity, and character of symptoms
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="How long?" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                    <SelectItem value="months">Months</SelectItem>
                                    <SelectItem value="years">Years</SelectItem>
                                    <SelectItem value="sudden">Sudden onset</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="patientGender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Patient gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="patientAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Patient age" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="infant">Infant (0-1)</SelectItem>
                                  <SelectItem value="child">Child (2-12)</SelectItem>
                                  <SelectItem value="adolescent">Adolescent (13-18)</SelectItem>
                                  <SelectItem value="young-adult">Young Adult (19-35)</SelectItem>
                                  <SelectItem value="middle-aged">Middle-aged (36-55)</SelectItem>
                                  <SelectItem value="elderly">Elderly (56+)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="medicalHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relevant Medical History</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any pre-existing conditions, past surgeries, etc."
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="currentMedications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Medications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any medications currently being taken..."
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Symptoms...
                          </>
                        ) : (
                          <>
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Generate Diagnosis
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Differential Diagnosis</CardTitle>
                  <CardDescription>
                    Based on the symptoms provided, here are possible diagnoses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {diagnosisResult ? (
                      <div dangerouslySetInnerHTML={{ __html: diagnosisResult.replace(/\n/g, '<br/>') }} />
                    ) : (
                      <p className="text-muted-foreground">No diagnosis generated yet. Please submit symptoms first.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => form.reset()}
                  >
                    New Diagnosis
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => window.print()}
                  >
                    Print Results
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          {/* Example Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Example Cases</CardTitle>
              <CardDescription>
                Load these examples to see how the tool works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleCases.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => loadExampleCase(index)}
                >
                  <div className="truncate">{example.title}</div>
                </Button>
              ))}
            </CardContent>
          </Card>
          
          {/* Clinical Features Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Assessment Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <VolumeX className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Chief Complaint</p>
                    <p className="text-sm text-muted-foreground">Main symptom bringing the patient in</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <History className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">History of Present Illness</p>
                    <p className="text-sm text-muted-foreground">Timeline, onset, modifying factors</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <Clipboard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Past Medical History</p>
                    <p className="text-sm text-muted-foreground">Chronic conditions, previous diagnoses</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <FlaskRound className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Medications</p>
                    <p className="text-sm text-muted-foreground">Current medications and allergies</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <Radiation className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Physical Examination</p>
                    <p className="text-sm text-muted-foreground">Vital signs, general appearance</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <List className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Diagnostic Evaluation</p>
                    <p className="text-sm text-muted-foreground">Labs, imaging, other tests</p>
                  </div>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">This tool uses AI to suggest potential diagnoses based on symptoms and does not replace clinical judgment.</p>
            </CardFooter>
          </Card>
          
          {/* Disclaimer */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800">Medical Disclaimer</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    This tool is for educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DiagnosisToolPage;
