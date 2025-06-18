import React, { useState } from 'react';
import { Calendar, Edit2, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Task, TaskStatus } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onTaskClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Clock,
          label: 'Pending'
        };
      case 'in-progress':
        return {
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: AlertCircle,
          label: 'In Progress'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          label: 'Completed'
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  const dueDateTime = new Date(task.due_date);
  const isOverdue = task.status !== 'completed' && dueDateTime < new Date();
  
  const formattedDueDate = dueDateTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedDueTime = task.due_time || dueDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const statusOrder: TaskStatus[] = ['pending', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(task.id, nextStatus);
  };

  const handleTaskClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md transform hover:-translate-y-1 ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100'
    }`}>
      <div 
        className="p-4 md:p-6 cursor-pointer"
        onClick={handleTaskClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 md:space-x-3 mb-2">
              <h3 className={`font-semibold text-base md:text-lg truncate ${
                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              
              <button
                onClick={handleStatusClick}
                className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 flex-shrink-0 ${statusConfig.color}`}
              >
                <div className="flex items-center space-x-1">
                  <StatusIcon className="w-3 h-3" />
                  <span className="hidden md:inline">{statusConfig.label}</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4 text-sm text-gray-500">
              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{formattedDueDate}</span>
              </div>
              
              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{formattedDueTime}</span>
              </div>
              
              {isOverdue && <span className="text-red-600 font-medium text-xs">(Overdue)</span>}
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-4 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && task.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">{task.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};