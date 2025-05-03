import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect } from 'wouter';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const MEDICAL_SUBJECTS = [
  "Medicine",
  "Surgery",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Pathology",
  "Pharmacology",
  "Microbiology",
  "Anatomy",
  "Physiology",
  "Biochemistry",
];

export default function StudyPlannerPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [totalDays, setTotalDays] = useState("90");
  const [hoursPerDay, setHoursPerDay] = useState("6");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weakTopics, setWeakTopics] = useState("");
  const [progress, setProgress] = useState(35);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any>(null);

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

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examName: "NEET PG",
          totalDays: parseInt(totalDays),
          hoursPerDay: parseInt(hoursPerDay),
          subjects: selectedSubjects,
          weakTopics,
          startDate: date.toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const data = await response.json();
      setStudyPlan(data.studyPlan);
      toast({
        title: "Success",
        description: "Study plan generated successfully!"
      });
    } catch (error) {
      console.error("Failed to generate plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout
      title="Study Planner"
      description="Create and track your personalized study plan"
    >
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Study Plan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label>Preparation Period (Days)</Label>
                <Input
                  type="number"
                  value={totalDays}
                  onChange={(e) => setTotalDays(e.target.value)}
                />
              </div>
              <div>
                <Label>Study Hours per Day</Label>
                <Input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                />
              </div>
              <div>
                <Label>Weak Topics</Label>
                <Input
                  value={weakTopics}
                  onChange={(e) => setWeakTopics(e.target.value)}
                  placeholder="Enter topics you need to focus on"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Start Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label>Select Subjects</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {MEDICAL_SUBJECTS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSubjects([...selectedSubjects, subject]);
                          } else {
                            setSelectedSubjects(
                              selectedSubjects.filter((s) => s !== subject)
                            );
                          }
                        }}
                      />
                      <label htmlFor={subject}>{subject}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleGeneratePlan} 
                disabled={isGenerating || selectedSubjects.length === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  "Generate My Plan"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {studyPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Your Study Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyPlan.plan.map((day: any, index: number) => (
                  <div key={index} className="p-4 border rounded">
                    <h3 className="font-medium">{day.date}</h3>
                    <p>{day.task}</p>
                    <div className="text-sm text-gray-500">
                      Duration: {day.hours} hours
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}