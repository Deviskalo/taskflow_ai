import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Calendar, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Task } from '../types/Task';

interface TaskAnalyticsProps {
  tasks: Task[];
}

export const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ tasks }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Basic stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.due_date) < now
    );

    // Time-based analytics
    const thisWeekTasks = tasks.filter(t => new Date(t.created_at) >= thisWeek);
    const thisMonthTasks = tasks.filter(t => new Date(t.created_at) >= thisMonth);
    const lastMonthTasks = tasks.filter(t => 
      new Date(t.created_at) >= lastMonth && new Date(t.created_at) <= lastMonthEnd
    );

    const thisWeekCompleted = thisWeekTasks.filter(t => t.status === 'completed').length;
    const thisMonthCompleted = thisMonthTasks.filter(t => t.status === 'completed').length;
    const lastMonthCompleted = lastMonthTasks.filter(t => t.status === 'completed').length;

    // Completion rate
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    const weeklyCompletionRate = thisWeekTasks.length > 0 ? (thisWeekCompleted / thisWeekTasks.length) * 100 : 0;
    const monthlyGrowth = lastMonthCompleted > 0 ? 
      ((thisMonthCompleted - lastMonthCompleted) / lastMonthCompleted) * 100 : 0;

    // Daily completion pattern (last 7 days)
    const dailyPattern = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayCompleted = completedTasks.filter(t => {
        const completedDate = new Date(t.updated_at);
        return completedDate >= dayStart && completedDate < dayEnd;
      }).length;

      dailyPattern.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayCompleted,
        date: date.toISOString().split('T')[0]
      });
    }

    // Average completion time (for completed tasks)
    const completionTimes = completedTasks.map(t => {
      const created = new Date(t.created_at);
      const completed = new Date(t.updated_at);
      return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
    });
    const avgCompletionTime = completionTimes.length > 0 ? 
      completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : 0;

    // Task distribution by status
    const statusDistribution = [
      { status: 'Completed', count: completedTasks.length, color: 'bg-green-500' },
      { status: 'In Progress', count: inProgressTasks.length, color: 'bg-purple-500' },
      { status: 'Pending', count: pendingTasks.length, color: 'bg-amber-500' },
      { status: 'Overdue', count: overdueTasks.length, color: 'bg-red-500' }
    ];

    // Productivity insights
    const insights = [];
    
    if (completionRate > 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Productivity!',
        message: `You've completed ${completionRate.toFixed(1)}% of your tasks. Keep up the great work!`
      });
    } else if (completionRate < 50) {
      insights.push({
        type: 'warning',
        title: 'Room for Improvement',
        message: `Your completion rate is ${completionRate.toFixed(1)}%. Consider breaking down large tasks or adjusting deadlines.`
      });
    }

    if (overdueTasks.length > 0) {
      insights.push({
        type: 'error',
        title: 'Overdue Tasks Alert',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Prioritize these to get back on track.`
      });
    }

    if (monthlyGrowth > 20) {
      insights.push({
        type: 'success',
        title: 'Great Progress!',
        message: `You've completed ${monthlyGrowth.toFixed(1)}% more tasks this month compared to last month.`
      });
    }

    if (avgCompletionTime < 1) {
      insights.push({
        type: 'info',
        title: 'Quick Executor',
        message: `You complete tasks quickly (avg: ${avgCompletionTime.toFixed(1)} days). Consider taking on more challenging projects.`
      });
    }

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate,
      weeklyCompletionRate,
      monthlyGrowth,
      avgCompletionTime,
      dailyPattern,
      statusDistribution,
      insights,
      thisWeekCompleted,
      thisMonthCompleted
    };
  }, [tasks]);

  const maxDailyCompleted = Math.max(...analytics.dailyPattern.map(d => d.completed), 1);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
            </div>
            <Target className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold">{analytics.thisWeekCompleted}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg. Completion</p>
              <p className="text-3xl font-bold">{analytics.avgCompletionTime.toFixed(1)}d</p>
            </div>
            <Clock className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className={`bg-gradient-to-br p-6 rounded-xl text-white ${
          analytics.monthlyGrowth >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                analytics.monthlyGrowth >= 0 ? 'text-emerald-100' : 'text-red-100'
              }`}>Monthly Growth</p>
              <p className="text-3xl font-bold">
                {analytics.monthlyGrowth >= 0 ? '+' : ''}{analytics.monthlyGrowth.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className={`w-8 h-8 ${
              analytics.monthlyGrowth >= 0 ? 'text-emerald-200' : 'text-red-200'
            }`} />
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Completion Pattern (Last 7 Days)</h3>
        </div>
        
        <div className="flex items-end justify-between space-x-2 h-40">
          {analytics.dailyPattern.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '120px' }}>
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 flex items-end justify-center"
                  style={{ 
                    height: `${(day.completed / maxDailyCompleted) * 100}%`,
                    minHeight: day.completed > 0 ? '20px' : '0px'
                  }}
                >
                  {day.completed > 0 && (
                    <span className="text-white text-xs font-bold mb-1">{day.completed}</span>
                  )}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mt-2">{day.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Distribution</h3>
        
        <div className="space-y-4">
          {analytics.statusDistribution.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                <span className="font-medium text-gray-700">{item.status}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ 
                      width: `${analytics.totalTasks > 0 ? (item.count / analytics.totalTasks) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Productivity Insights</h3>
        </div>
        
        {analytics.insights.length > 0 ? (
          <div className="space-y-4">
            {analytics.insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  insight.type === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${
                    insight.type === 'success' ? 'bg-green-100' :
                    insight.type === 'warning' ? 'bg-yellow-100' :
                    insight.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {insight.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                    {insight.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {insight.type === 'info' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Complete more tasks to unlock productivity insights!</p>
          </div>
        )}
      </div>
    </div>
  );
};