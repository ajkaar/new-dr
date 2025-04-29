import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProgressItem {
  subject: string;
  percentage: number;
}

interface WeeklyProgressProps {
  progressItems: ProgressItem[];
}

export function WeeklyProgress({ progressItems }: WeeklyProgressProps) {
  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <h3 className="text-lg font-medium text-neutral-800">Weekly Progress</h3>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="space-y-5">
          {progressItems.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-neutral-700">{item.subject}</h4>
                <span className="text-sm font-medium text-neutral-700">{item.percentage}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-500 h-2.5 rounded-full" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
