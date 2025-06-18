import React, { useState } from 'react';
import { CheckSquare, Trash2, Calendar, Clock, Filter, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Task, TaskStatus } from '../types/Task';

interface QuickActionsProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStatusChange: (taskIds: string[], status: TaskStatus) => void;
  onBulkDelete: (taskIds: string[]) => void;
  onBulkReschedule: (taskIds: string[], days: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  tasks,
  selectedTasks,
  onSelectTask,
  onSelectAll,
  onClearSelection,
  onBulkStatusChange,
  onBulkDelete,
  onBulkReschedule,
  isOpen,
  onClose
}) => {
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'status' | 'reschedule';
    data?: any;
  } | null>(null);

  const selectedTasksData = tasks.filter(task => selectedTasks.includes(task.id));
  const hasSelection = selectedTasks.length > 0;

  const handleBulkStatusChange = (status: TaskStatus) => {
    setConfirmAction({ type: 'status', data: status });
  };

  const handleBulkDelete = () => {
    setConfirmAction({ type: 'delete' });
  };

  const handleBulkReschedule = (days: number) => {
    setConfirmAction({ type: 'reschedule', data: days });
  };

  const executeAction = () => {
    if (!confirmAction || selectedTasks.length === 0) return;

    switch (confirmAction.type) {
      case 'delete':
        onBulkDelete(selectedTasks);
        break;
      case 'status':
        onBulkStatusChange(selectedTasks, confirmAction.data);
        break;
      case 'reschedule':
        onBulkReschedule(selectedTasks, confirmAction.data);
        break;
    }

    setConfirmAction(null);
    onClearSelection();
  };

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Mark as Pending', color: 'bg-amber-600 hover:bg-amber-700', icon: Clock };
      case 'in-progress':
        return { label: 'Mark as In Progress', color: 'bg-purple-600 hover:bg-purple-700', icon: AlertTriangle };
      case 'completed':
        return { label: 'Mark as Completed', color: 'bg-green-600 hover:bg-green-700', icon: CheckCircle };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-gray-600 text-sm">Perform bulk operations on your tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Controls */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onSelectAll}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Select All ({tasks.length})</span>
              </button>
              
              {hasSelection && (
                <button
                  onClick={onClearSelection}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Selection</span>
                </button>
              )}
            </div>

            {hasSelection && (
              <div className="text-sm text-gray-600">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Task Selection List */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  selectedTasks.includes(task.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onSelectTask(task.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => onSelectTask(task.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bulk Actions ({selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Changes */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 text-sm">Change Status</h4>
                {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map((status) => {
                  const config = getStatusConfig(status);
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => handleBulkStatusChange(status)}
                      className={`w-full flex items-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors duration-200 ${config.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{config.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Reschedule */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 text-sm">Reschedule</h4>
                {[
                  { label: 'Postpone 1 Day', days: 1 },
                  { label: 'Postpone 3 Days', days: 3 },
                  { label: 'Postpone 1 Week', days: 7 }
                ].map((option) => (
                  <button
                    key={option.days}
                    onClick={() => handleBulkReschedule(option.days)}
                    className="w-full flex items-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Delete */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 text-sm">Danger Zone</h4>
                <button
                  onClick={handleBulkDelete}
                  className="w-full flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete Selected</span>
                </button>
              </div>
            </div>

            {/* Selected Tasks Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Selected Tasks:</h4>
              <div className="space-y-1">
                {selectedTasksData.slice(0, 5).map((task) => (
                  <div key={task.id} className="text-sm text-gray-600">
                    • {task.title}
                  </div>
                ))}
                {selectedTasksData.length > 5 && (
                  <div className="text-sm text-gray-500">
                    ... and {selectedTasksData.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  confirmAction.type === 'delete' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {confirmAction.type === 'delete' ? (
                    <Trash2 className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Action
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                {confirmAction.type === 'delete' && 
                  `Are you sure you want to delete ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''}? This action cannot be undone.`
                }
                {confirmAction.type === 'status' && 
                  `Change the status of ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''} to "${confirmAction.data.replace('-', ' ')}"?`
                }
                {confirmAction.type === 'reschedule' && 
                  `Postpone ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''} by ${confirmAction.data} day${confirmAction.data !== 1 ? 's' : ''}?`
                }
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 ${
                    confirmAction.type === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};