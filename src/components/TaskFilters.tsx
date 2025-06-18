import React from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { TaskFilters as TaskFiltersType, TaskStatus } from '../types/Task';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFiltersChange }) => {
  const statusOptions: { value: TaskStatus | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
    { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5 hidden md:block" />
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFiltersChange({ ...filters, status: option.value })}
                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                  filters.status === option.value
                    ? option.color + ' shadow-md transform scale-105'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              sortBy: e.target.value as TaskFiltersType['sortBy']
            })}
            className="px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm md:text-base"
          >
            <option value="due_date">Due Date</option>
            <option value="created_at">Created Date</option>
            <option value="title">Title</option>
          </select>
          
          <button
            onClick={() => onFiltersChange({ 
              ...filters, 
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
            })}
            className="p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {filters.sortOrder === 'asc' ? 
              <SortAsc className="w-4 h-4 md:w-5 md:h-5 text-gray-600" /> : 
              <SortDesc className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};