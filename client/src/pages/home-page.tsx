import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  ChartLine, 
  Bookmark, 
  Bot, 
  Stethoscope, 
  HelpCircle,
  Brain,
  ClipboardList,
  Pill,
  FileText,
  Info
} from 'lucide-react';
import AppLayout from '@/components/layouts/app-layout';
import StatsCard from '@/components/dashboard/stats-card';
import ActivityItem from '@/components/dashboard/activity-item';
import RecommendationItem from '@/components/dashboard/recommendation-item';
import NewsCard from '@/components/dashboard/news-card';
import TaskItem from '@/components/dashboard/task-item';
import QuickAccessTool from '@/components/dashboard/quick-access-tool';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const quickAccessTools = [
    { icon: <Bot />, title: 'AI Chatbot', link: '/ai-chat' },
    { icon: <Stethoscope />, title: 'Diagnosis Tool', link: '/diagnosis-tool' },
    { icon: <HelpCircle />, title: 'Quiz Generator', link: '/quiz-generator' },
    { icon: <Brain />, title: 'Memory Booster', link: '/memory-booster' },
    { icon: <ClipboardList />, title: 'Case Generator', link: '/case-generator' },
    { icon: <Pill />, title: 'Drug Assistant', link: '/drug-assistant' },
  ];

  // Sample recommendations based on study patterns
  const recommendations = [
    { 
      icon: <Bookmark />, 
      title: 'Complete Respiratory System Quiz', 
      subtitle: 'Based on your recent studies',
      iconColor: 'text-primary',
      link: '/quiz-generator'
    },
    { 
      icon: <Pill />, 
      title: 'Explore Antihypertensive Drugs', 
      subtitle: 'Supplement your cardiovascular studies',
      iconColor: 'text-secondary-500',
      link: '/drug-assistant'
    },
    { 
      icon: <Brain />, 
      title: 'Memory Booster: Cranial Nerves', 
      subtitle: 'Create mnemonics for better retention',
      iconColor: 'text-accent-500',
      link: '/memory-booster'
    },
    { 
      icon: <Bot />, 
      title: 'AI Chatbot: Ask about Acid-Base Balance', 
      subtitle: 'Clarify concepts you struggled with',
      iconColor: 'text-primary',
      link: '/ai-chat'
    },
  ];

  // Sample tasks
  const todayTasks = [
    { 
      id: '1', 
      title: 'Review Respiratory System Notes (1 hour)', 
      description: 'Focus on gas exchange and lung volumes',
      priority: 'Critical' as const
    },
    { 
      id: '2', 
      title: 'Practice Quiz on Cardiac Pathologies (45 min)', 
      description: 'Prepare for upcoming cardiology module',
      priority: 'Medium' as const
    },
    { 
      id: '3', 
      title: 'Create Notes on Renal Physiology (1.5 hours)', 
      description: 'Use AI Notes Maker for efficiency',
      priority: 'Medium' as const
    },
  ];
  
  // Sample upcoming events
  const upcomingEvents = [
    {
      id: '1',
      title: 'Mock NEET PG Exam',
      description: 'Full-length practice test (3 hours)',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      time: '10:00 AM - 1:00 PM'
    },
    {
      id: '2',
      title: 'Pharmacology Group Study',
      description: 'Virtual study session with peers',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      time: '4:00 PM - 6:00 PM'
    },
    {
      id: '3',
      title: 'Internal Assessment',
      description: 'College exam on Cardiovascular System',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      time: '9:00 AM - 12:00 PM'
    },
  ];

  return (
    <AppLayout
      title="Dashboard"
      description={`Welcome back, ${user?.fullName || 'Doctor'}! Continue your medical learning journey.`}
    >
      {/* Notification Banner */}
      {!isDismissed && dashboardData?.announcements?.[0] && (
        <div className="mt-6">
          <Alert className="bg-primary-50 border-primary-200">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary-800">
              {dashboardData.announcements[0].title || 'Important Update'}
            </AlertTitle>
            <AlertDescription className="text-primary-700">
              {dashboardData.announcements[0].content || 
                'NEET PG 2023 exam dates have been announced. Check out the MedFeed section for details.'}
            </AlertDescription>
            <div className="mt-4 flex">
              <Button 
                variant="link" 
                className="text-primary-800 px-2 py-1.5 h-auto hover:bg-primary-100"
              >
                View details
              </Button>
              <Button 
                variant="link" 
                className="text-primary-800 px-2 py-1.5 h-auto hover:bg-primary-100 ml-3"
                onClick={() => setIsDismissed(true)}
              >
                Dismiss
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Quick Access Tools */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900">Quick Access</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {quickAccessTools.map((tool, index) => (
            <QuickAccessTool
              key={index}
              icon={tool.icon}
              title={tool.title}
              link={tool.link}
            />
          ))}
        </div>
      </div>

      {/* Stats & Progress */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Study Time Stats */}
        <StatsCard
          title="Study Time This Week"
          value={isLoading ? '...' : `${dashboardData?.studyTime?.hours || 12.5} hours`}
          icon={<Clock className="h-5 w-5" />}
          iconBgColor="bg-primary-100"
          iconTextColor="text-primary"
          chart={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm text-gray-500">Chart: Daily study hours</div>
            </div>
          }
        />

        {/* Quiz Performance */}
        <StatsCard
          title="Quiz Performance"
          value={isLoading ? '...' : `${dashboardData?.quizPerformance?.average || 76}% average`}
          icon={<ChartLine className="h-5 w-5" />}
          iconBgColor="bg-secondary-100"
          iconTextColor="text-secondary-600"
          chart={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm text-gray-500">Chart: Quiz accuracy by subject</div>
            </div>
          }
        />

        {/* Topics Covered */}
        <StatsCard
          title="Topics Completed"
          value="24 of 86"
          icon={<Bookmark className="h-5 w-5" />}
          iconBgColor="bg-accent-100"
          iconTextColor="text-accent-500"
          chart={
            <div className="mt-5">
              <h4 className="text-sm font-medium text-gray-500">Progress by subject</h4>
              <div className="mt-2">
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-gray-700">Anatomy</div>
                    <div className="text-xs font-medium text-gray-700">45%</div>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-gray-700">Physiology</div>
                    <div className="text-xs font-medium text-gray-700">30%</div>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-secondary-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-gray-700">Biochemistry</div>
                    <div className="text-xs font-medium text-gray-700">20%</div>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-accent-500 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* Learning Activities & Recommendations */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-6 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-900">
              Recent Learning Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-3">
            <ul className="divide-y divide-gray-200">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <ActivityItem
                    key={i}
                    type="note"
                    title="Loading..."
                    description="Loading activity data..."
                    date={new Date()}
                  />
                ))
              ) : (
                dashboardData?.recentActivities?.slice(0, 3).map((activity, index) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    title={activity.title}
                    description={activity.type === 'quiz' 
                      ? `You scored ${activity.score}/${activity.totalQuestions} on the quiz.` 
                      : `Related to ${activity.subject || 'medical studies'}.`
                    }
                    date={new Date(activity.date)}
                    score={activity.score}
                    total={activity.totalQuestions}
                  />
                )) || (
                  <>
                    <ActivityItem
                      type="note"
                      title="Completed Notes: Cardiovascular System"
                      description="You created comprehensive notes on heart functions and blood flow."
                      date={new Date(Date.now() - 2 * 60 * 60 * 1000)} // 2 hours ago
                      status="Completed"
                    />
                    <ActivityItem
                      type="quiz"
                      title="Attempted Quiz: Respiratory System"
                      description="You scored 18/25 on the medium difficulty quiz."
                      date={new Date(Date.now() - 24 * 60 * 60 * 1000)} // Yesterday
                      score={18}
                      total={25}
                    />
                    <ActivityItem
                      type="case"
                      title="Case Study: Diabetic Ketoacidosis"
                      description="You analyzed clinical presentation, diagnosis, and management."
                      date={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)} // 2 days ago
                      status="Clinical"
                    />
                  </>
                )
              )}
            </ul>
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                className="text-primary hover:text-primary-600"
              >
                View all activities <ChartLine className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader className="px-6 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-900">
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-3">
            <ul className="divide-y divide-gray-200">
              {recommendations.map((rec, index) => (
                <RecommendationItem 
                  key={index}
                  icon={rec.icon}
                  iconColor={rec.iconColor}
                  title={rec.title}
                  subtitle={rec.subtitle}
                  link={rec.link}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks & Events */}
      <div className="mt-8">
        <Card>
          <CardHeader className="px-6 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-900">
              Study Plan & Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Study Plan */}
              <div>
                <h4 className="text-base font-medium text-gray-900">Today's Study Plan</h4>
                <p className="mt-1 text-sm text-gray-500">Your AI-generated study plan for today</p>
                
                <ul className="mt-4 space-y-3">
                  {(dashboardData?.studyPlan?.plan?.todayTasks || todayTasks).map((task, index) => (
                    <TaskItem
                      key={index}
                      id={task.id || index.toString()}
                      title={task.title}
                      description={task.description}
                      priority={task.priority}
                    />
                  ))}
                </ul>
                
                <div className="mt-5">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="inline-flex items-center"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      className="mr-1 h-4 w-4" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M4 4V9H4.582M4.582 9C5.24585 7.35457 6.43568 5.99949 7.96503 5.12182C9.49438 4.24416 11.2768 3.89726 13.033 4.13703C14.7891 4.3768 16.4198 5.19079 17.6694 6.4469C18.919 7.70301 19.7254 9.33908 19.9573 11.095M4.582 9H9M20 20V15H19.419M19.419 15C18.7542 16.6454 17.5644 18.0005 16.035 18.8782C14.5056 19.7558 12.7232 20.1027 10.967 19.863C9.21079 19.6232 7.58016 18.8092 6.33057 17.5531C5.08098 16.297 4.27464 14.6609 4.04269 12.905M19.419 15H15" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    Regenerate Plan
                  </Button>
                </div>
              </div>
              
              {/* Upcoming Events */}
              <div>
                <h4 className="text-base font-medium text-gray-900">Upcoming Events</h4>
                <p className="mt-1 text-sm text-gray-500">Important dates and scheduled study sessions</p>
                
                <div className="mt-4 space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className={`flex items-center justify-center h-12 w-12 rounded-md ${
                            index === 0 ? 'bg-primary-100 text-primary' : 
                            index === 1 ? 'bg-secondary-100 text-secondary-600' : 
                            'bg-accent-100 text-accent-500'
                          }`}>
                            <span className="text-xs font-medium">
                              {event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                              <br/>
                              {event.date.getDate()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                          <p className="text-xs text-gray-500">{event.description}</p>
                          <p className="mt-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3 inline-block mr-1" />
                            {event.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-5">
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary-600 p-0"
                  >
                    View full calendar <ChartLine className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent News from MedFeed */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Latest from MedFeed</h2>
          <Button 
            variant="link" 
            className="text-primary hover:text-primary-600"
            asChild
          >
            <a href="/med-feed">View all <ChartLine className="h-4 w-4 ml-1" /></a>
          </Button>
        </div>
        
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <NewsCard
                key={index}
                imageUrl=""
                category="Loading..."
                title="Loading news content"
                summary="News content is being loaded"
                date={new Date()}
              />
            ))
          ) : (
            (dashboardData?.news || []).map((newsItem, index) => (
              <NewsCard
                key={index}
                imageUrl={newsItem.imageUrl || ''}
                category={newsItem.category}
                title={newsItem.title}
                summary={newsItem.content.substring(0, 120) + '...'}
                date={new Date(newsItem.publishedAt)}
                categoryColor={
                  newsItem.category === 'Exam News' ? 'bg-primary-100 text-primary-800' :
                  newsItem.category === 'Research' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }
              />
            )) || [
              <NewsCard
                key={0}
                imageUrl=""
                category="Exam News"
                title="NEET PG 2023 Registration Dates Announced"
                summary="The National Board of Examinations has released the official notification for NEET PG 2023 with important dates."
                date={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)} // 2 days ago
              />,
              <NewsCard
                key={1}
                imageUrl=""
                category="Research"
                title="New Breakthroughs in Alzheimer's Treatment"
                summary="Researchers have identified a potential new target for Alzheimer's disease treatment that shows promising results."
                date={new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)} // 5 days ago
                categoryColor="bg-green-100 text-green-800"
              />,
              <NewsCard
                key={2}
                imageUrl=""
                category="Residency"
                title="Top Residency Programs in India for 2023"
                summary="A comprehensive guide to the most sought-after residency programs across specialties in India."
                date={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)} // 1 week ago
                categoryColor="bg-purple-100 text-purple-800"
              />
            ]
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default HomePage;
