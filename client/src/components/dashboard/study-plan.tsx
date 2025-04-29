import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudyPlanItem {
  subject: string;
  resource: string;
  estimatedTime: string;
  priority: string;
}

interface StudyPlanProps {
  items: StudyPlanItem[];
}

export function StudyPlan({ items }: StudyPlanProps) {
  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <h3 className="text-lg font-medium text-neutral-800">Today's Study Plan</h3>
      </CardHeader>
      <ul className="divide-y divide-neutral-200">
        {items.map((item, index) => (
          <li key={index} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-800 truncate">{item.subject}</p>
                  <p className="text-sm text-neutral-500">{item.resource}</p>
                </div>
              </div>
              <div className="ml-5 flex-shrink-0">
                <Button variant="outline" size="sm">Start</Button>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Estimated: {item.estimatedTime}</span>
                <span className="text-neutral-500">{item.priority} priority</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <CardFooter className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-sm sm:px-6">
        <a href="/planner" className="text-primary-500 font-medium hover:text-primary-600">View full study plan →</a>
      </CardFooter>
    </Card>
  );
}
