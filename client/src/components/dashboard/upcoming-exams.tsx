import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";

interface ExamItem {
  id: number;
  title: string;
  date: string;
  duration: string;
  daysLeft: number;
}

interface UpcomingExamsProps {
  exams: ExamItem[];
}

export function UpcomingExams({ exams }: UpcomingExamsProps) {
  const getStatusBadge = (daysLeft: number) => {
    if (daysLeft <= 3) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> {daysLeft} days left
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        <Clock className="h-3 w-3 mr-1" /> {daysLeft} {daysLeft === 1 ? 'week' : 'weeks'} left
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <h3 className="text-lg font-medium text-neutral-800">Upcoming Exams</h3>
      </CardHeader>
      <ul className="divide-y divide-neutral-200">
        {exams.map((exam) => (
          <li key={exam.id} className="px-4 py-4 sm:px-6">
            <div>
              <p className="text-sm font-medium text-neutral-800">{exam.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{exam.date} · {exam.duration}</p>
            </div>
            <div className="mt-2">
              {getStatusBadge(exam.daysLeft)}
            </div>
          </li>
        ))}
      </ul>
      <CardFooter className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-sm sm:px-6">
        <a href="#" className="text-primary-500 font-medium hover:text-primary-600">View all exams →</a>
      </CardFooter>
    </Card>
  );
}
