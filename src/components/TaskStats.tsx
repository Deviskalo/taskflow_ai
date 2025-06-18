import React from 'react';
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';

interface TaskStatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

export const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: ListTodo,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-blue-100'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconColor: 'text-amber-100'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: AlertTriangle,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'text-purple-100'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      iconColor: 'text-green-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div 
            key={item.label}
            className={`${item.color} p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs md:text-sm font-medium">{item.label}</p>
                <p className="text-xl md:text-3xl font-bold">{item.value}</p>
              </div>
              <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${item.iconColor}`} />
            </div>
          </div>
        );
      })}
      
      {stats.overdue > 0 && (
        <div className="col-span-2 lg:col-span-4 bg-gradient-to-br from-red-500 to-red-600 p-3 md:p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-semibold text-sm md:text-base">
              {stats.overdue} task{stats.overdue !== 1 ? 's' : ''} overdue
            </span>
          </div>
        </div>
      )}
    </div>
  );
};