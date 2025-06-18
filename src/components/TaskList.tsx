import React from 'react';
import { Task, TaskStatus } from '../types/Task';
import { TaskItem } from './TaskItem';
import { ListTodo } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onTaskClick
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
          <ListTodo className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-500 mb-6">
          Get started by creating your first task!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onStatusChange={onStatusChange}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};