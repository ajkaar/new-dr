
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import AppLayout from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

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
  const [date, setDate] = useState<Date>(new Date());
  const [totalDays, setTotalDays] = useState("90");
  const [hoursPerDay, setHoursPerDay] = useState("6");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weakTopics, setWeakTopics] = useState("");
  const [progress, setProgress] = useState(35); // Example progress
  const [weeklyPlan, setWeeklyPlan] = useState([
    {
      date: "May 5",
      task: "Medicine: Cardiovascular",
      hours: 2,
      done: false,
    },
    {
      date: "May 6",
      task: "Pharmacology: Antimicrobials + Quiz",
      hours: 3,
      done: false,
    },
    {
      date: "May 7",
      task: "Pathology: Neoplasia + Flashcards",
      hours: 2,
      done: false,
    },
  ]);

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
    // TODO: Implement plan generation logic
    console.log("Generating plan...");
  };

  const toggleTaskDone = (index: number) => {
    setWeeklyPlan(prev => 
      prev.map((task, i) => 
        i === index ? { ...task, done: !task.done } : task
      )
    );
  };

  return (
    <AppLayout
      title="Study Planner"
      description="Create and track your personalized study plan"
    >
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Input Form */}
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
                  onSelect={(date) => date && setDate(date)}
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
              <Button onClick={handleGeneratePlan} className="w-full">
                Generate My Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Study Plan</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleGeneratePlan}>
                Re-Generate Plan
              </Button>
              <Button variant="outline">View Progress</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label>Overall Progress</Label>
                  <Progress value={progress} className="mt-2" />
                </div>
                <div className="text-2xl font-bold">{progress}%</div>
              </div>
              
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Task</th>
                      <th className="p-3 text-left">Hours</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyPlan.map((item, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-3">{item.date}</td>
                        <td className="p-3">{item.task}</td>
                        <td className="p-3">{item.hours} hrs</td>
                        <td className="p-3">
                          <Checkbox
                            checked={item.done}
                            onCheckedChange={() => toggleTaskDone(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
