import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Sparkles, Loader2, Wand2, Clock } from 'lucide-react';
import { Task, TaskStatus } from '../types/Task';
import { useAI } from '../hooks/useAI';

interface SmartTaskFormProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  aiSuggestion?: any;
}

export const SmartTaskForm: React.FC<SmartTaskFormProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onSave,
  aiSuggestion
}) => {
  const { enhanceTask, isProcessing } = useAI();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    status: 'pending' as TaskStatus
  });

  const [aiEnhancement, setAiEnhancement] = useState<any>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get current date and time for minimum date selection
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Get suggested due dates with times
  const getSuggestedDates = () => {
    const today = new Date();
    const suggestions = [
      { label: 'Today 9 AM', date: new Date(today), time: '09:00' },
      { label: 'Today 2 PM', date: new Date(today), time: '14:00' },
      { label: 'Today 5 PM', date: new Date(today), time: '17:00' },
      { label: 'Tomorrow 9 AM', date: new Date(today.getTime() + 24 * 60 * 60 * 1000), time: '09:00' },
      { label: 'Tomorrow 2 PM', date: new Date(today.getTime() + 24 * 60 * 60 * 1000), time: '14:00' },
      { label: 'This Weekend', date: new Date(today.getTime() + (6 - today.getDay()) * 24 * 60 * 60 * 1000), time: '10:00' },
      { label: 'Next Week', date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), time: '09:00' },
      { label: 'Next Month', date: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()), time: '09:00' }
    ];

    return suggestions.map(s => ({
      ...s,
      dateString: s.date.toISOString().split('T')[0]
    }));
  };

  // Get suggested times
  const getSuggestedTimes = () => {
    return [
      { label: 'Morning', time: '09:00' },
      { label: 'Lunch', time: '12:00' },
      { label: 'Afternoon', time: '14:00' },
      { label: 'Evening', time: '17:00' },
      { label: 'Night', time: '20:00' }
    ];
  };

  useEffect(() => {
    if (aiSuggestion) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        title: aiSuggestion.title,
        description: aiSuggestion.description,
        due_date: tomorrow.toISOString().split('T')[0],
        due_time: '09:00',
        status: 'pending'
      });
      setShowAiSuggestions(true);
    } else if (task) {
      const taskDate = new Date(task.due_date);
      setFormData({
        title: task.title,
        description: task.description,
        due_date: taskDate.toISOString().split('T')[0],
        due_time: task.due_time || taskDate.toTimeString().slice(0, 5),
        status: task.status
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        title: '',
        description: '',
        due_date: tomorrow.toISOString().split('T')[0],
        due_time: '09:00',
        status: 'pending'
      });
    }
    setErrors({});
    setAiEnhancement(null);
    setShowAiSuggestions(false);
  }, [task, isOpen, aiSuggestion]);

  const handleAiEnhance = async () => {
    if (!formData.title.trim()) return;
    
    try {
      const enhancement = await enhanceTask(formData.title, formData.description);
      setAiEnhancement(enhancement);
      setShowAiSuggestions(true);
    } catch (error) {
      console.error('AI enhancement failed:', error);
    }
  };

  const applyAiSuggestions = () => {
    if (aiEnhancement) {
      setFormData(prev => ({
        ...prev,
        description: aiEnhancement.enhancedDescription,
        due_date: aiEnhancement.suggestedDueDate
      }));
    }
    setShowAiSuggestions(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    if (!formData.due_time) {
      newErrors.due_time = 'Due time is required';
    } else if (formData.due_date) {
      // Check if the selected date and time is in the past
      const selectedDateTime = new Date(`${formData.due_date}T${formData.due_time}`);
      const now = new Date();
      
      if (selectedDateTime < now) {
        newErrors.due_time = 'Due time cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Combine date and time into ISO string
    const dueDateTime = new Date(`${formData.due_date}T${formData.due_time}`);

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      due_date: dueDateTime.toISOString(),
      due_time: formData.due_time,
      status: formData.status
    });

    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleQuickDateTimeSelect = (dateString: string, time: string) => {
    handleInputChange('due_date', dateString);
    handleInputChange('due_time', time);
  };

  const handleQuickTimeSelect = (time: string) => {
    handleInputChange('due_time', time);
  };

  if (!isOpen) return null;

  const suggestedDates = getSuggestedDates();
  const suggestedTimes = getSuggestedTimes();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>{task ? 'Edit Task' : 'Create Smart Task'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Task Title *
              </label>
              {!task && formData.title && (
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isProcessing}
                  className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  <span>AI Enhance</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Enter task title..."
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {showAiSuggestions && aiEnhancement && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Suggestions</span>
                </h4>
                <button
                  type="button"
                  onClick={applyAiSuggestions}
                  className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Apply All
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    aiEnhancement.priority === 'high' ? 'bg-red-100 text-red-700' :
                    aiEnhancement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {aiEnhancement.priority}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estimated Duration:</span>
                  <span className="ml-2 text-gray-600">{aiEnhancement.estimatedDuration}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Suggested Due Date:</span>
                  <span className="ml-2 text-gray-600">{new Date(aiEnhancement.suggestedDueDate).toLocaleDateString()}</span>
                </div>
                {aiEnhancement.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiEnhancement.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none"
              placeholder="Enter task description..."
            />
          </div>

          {/* Quick Date & Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Schedule
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {suggestedDates.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => handleQuickDateTimeSelect(suggestion.dateString, suggestion.time)}
                  className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                    formData.due_date === suggestion.dateString && formData.due_time === suggestion.time
                      ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-md'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <div className="font-medium">{suggestion.label}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {suggestion.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.due_date}
                  min={getCurrentDateTime()}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                    errors.due_date ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.due_date && (
                <p className="text-red-600 text-sm mt-1">{errors.due_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Time *
              </label>
              
              {/* Quick Time Selection */}
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {suggestedTimes.map((suggestion) => (
                    <button
                      key={suggestion.time}
                      type="button"
                      onClick={() => handleQuickTimeSelect(suggestion.time)}
                      className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                        formData.due_time === suggestion.time
                          ? 'bg-purple-100 text-purple-700 border-purple-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => handleInputChange('due_time', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                    errors.due_time ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.due_time && (
                <p className="text-red-600 text-sm mt-1">{errors.due_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Due date and time info */}
          {formData.due_date && formData.due_time && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="font-medium">Scheduled for:</p>
                  <p className="text-sm">
                    {new Date(`${formData.due_date}T${formData.due_time}`).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })} at {new Date(`${formData.due_date}T${formData.due_time}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{task ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};