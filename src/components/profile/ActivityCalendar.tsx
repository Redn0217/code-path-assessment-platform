import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityCalendarProps {
  userId: string;
}

interface ActivityData {
  date: string;
  count: number;
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ userId }) => {
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 11, 31));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const { data: activityData = [], isLoading } = useQuery({
    queryKey: ['user-activity', userId, currentYear],
    queryFn: async () => {
      // Fetch both regular assessments and mastery attempts
      const [regularAssessments, masteryAttempts] = await Promise.all([
        supabase
          .from('assessments')
          .select('completed_at')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', yearStart.toISOString())
          .lte('completed_at', yearEnd.toISOString()),
        supabase
          .from('user_mastery_attempts')
          .select('completed_at')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', yearStart.toISOString())
          .lte('completed_at', yearEnd.toISOString())
      ]);

      // Combine all assessments
      const allAssessments = [
        ...(regularAssessments.data || []),
        ...(masteryAttempts.data || [])
      ];

      // Group by date and count
      const activityMap = new Map<string, number>();
      
      allAssessments.forEach(assessment => {
        if (assessment.completed_at) {
          const date = format(new Date(assessment.completed_at), 'yyyy-MM-dd');
          activityMap.set(date, (activityMap.get(date) || 0) + 1);
        }
      });

      return Array.from(activityMap.entries()).map(([date, count]) => ({
        date,
        count
      }));
    },
  });

  const getActivityLevel = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const getActivityColor = (level: number) => {
    const colors = [
      'bg-gray-100', // No activity
      'bg-green-200', // Low activity
      'bg-green-300', // Medium-low activity
      'bg-green-400', // Medium-high activity
      'bg-green-500', // High activity
    ];
    return colors[level] || colors[0];
  };

  const getActivityCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const activity = activityData.find(a => a.date === dateStr);
    return activity?.count || 0;
  };

  const getTotalContributions = () => {
    return activityData.reduce((total, activity) => total + activity.count, 0);
  };

  const getWeeksArray = () => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    allDays.forEach((day, index) => {
      if (index === 0) {
        // Fill the first week with empty days if needed
        const dayOfWeek = day.getDay();
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push(new Date(0)); // Use epoch as placeholder
        }
      }

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days to the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(0)); // Use epoch as placeholder
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const weeks = getWeeksArray();
  const totalContributions = getTotalContributions();

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{totalContributions} assessments in {currentYear}</span>
          <div className="flex items-center space-x-1">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-2 h-2 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="flex space-x-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => {
                const isPlaceholder = day.getTime() === 0;
                const count = isPlaceholder ? 0 : getActivityCount(day);
                const level = getActivityLevel(count);

                return (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-2 h-2 rounded-sm ${
                          isPlaceholder
                            ? 'bg-transparent'
                            : getActivityColor(level)
                        } ${!isPlaceholder ? 'cursor-pointer hover:ring-1 hover:ring-gray-400' : ''}`}
                      />
                    </TooltipTrigger>
                    {!isPlaceholder && (
                      <TooltipContent>
                        <p className="text-xs">
                          {count} assessment{count !== 1 ? 's' : ''} on {format(day, 'MMM d, yyyy')}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          Assessment activity throughout {currentYear}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ActivityCalendar;
