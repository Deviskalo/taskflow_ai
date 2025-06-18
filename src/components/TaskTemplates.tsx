import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit2, Trash2, Copy, Zap, X, FileText, Clock, Star } from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  estimatedDuration: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  defaultDueInDays: number;
  tags: string[];
  isDefault?: boolean;
}

interface TaskTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: TaskTemplate) => void;
}

export const TaskTemplates: React.FC<TaskTemplatesProps> = ({
  isOpen,
  onClose,
  onUseTemplate
}) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    estimatedDuration: '30 minutes',
    category: 'General',
    priority: 'medium' as 'low' | 'medium' | 'high',
    defaultDueInDays: 3,
    tags: [] as string[],
    tagInput: ''
  });

  // Default templates
  const defaultTemplates: TaskTemplate[] = [
    {
      id: 'default-1',
      name: 'Daily Standup',
      title: 'Daily Team Standup Meeting',
      description: 'Attend daily standup meeting to discuss progress, blockers, and plans for the day.',
      estimatedDuration: '15 minutes',
      category: 'Meetings',
      priority: 'medium',
      defaultDueInDays: 1,
      tags: ['meeting', 'daily', 'team'],
      isDefault: true
    },
    {
      id: 'default-2',
      name: 'Code Review',
      title: 'Review Pull Request',
      description: 'Review and provide feedback on team member\'s pull request. Check for code quality, functionality, and adherence to standards.',
      estimatedDuration: '45 minutes',
      category: 'Development',
      priority: 'high',
      defaultDueInDays: 1,
      tags: ['code-review', 'development', 'quality'],
      isDefault: true
    },
    {
      id: 'default-3',
      name: 'Weekly Planning',
      title: 'Weekly Goal Planning Session',
      description: 'Plan and prioritize tasks for the upcoming week. Review previous week\'s progress and adjust goals accordingly.',
      estimatedDuration: '1 hour',
      category: 'Planning',
      priority: 'medium',
      defaultDueInDays: 7,
      tags: ['planning', 'weekly', 'goals'],
      isDefault: true
    },
    {
      id: 'default-4',
      name: 'Client Follow-up',
      title: 'Follow up with Client',
      description: 'Reach out to client to check on project status, gather feedback, and address any concerns or questions.',
      estimatedDuration: '30 minutes',
      category: 'Communication',
      priority: 'high',
      defaultDueInDays: 2,
      tags: ['client', 'follow-up', 'communication'],
      isDefault: true
    },
    {
      id: 'default-5',
      name: 'Documentation',
      title: 'Update Project Documentation',
      description: 'Review and update project documentation to reflect recent changes, new features, or process improvements.',
      estimatedDuration: '1.5 hours',
      category: 'Documentation',
      priority: 'low',
      defaultDueInDays: 5,
      tags: ['documentation', 'maintenance', 'project'],
      isDefault: true
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem('taskflow_templates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates([...defaultTemplates, ...parsed]);
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates(defaultTemplates);
      }
    } else {
      setTemplates(defaultTemplates);
    }
  };

  const saveTemplates = (newTemplates: TaskTemplate[]) => {
    const customTemplates = newTemplates.filter(t => !t.isDefault);
    localStorage.setItem('taskflow_templates', JSON.stringify(customTemplates));
    setTemplates(newTemplates);
  };

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormData({
      name: '',
      title: '',
      description: '',
      estimatedDuration: '30 minutes',
      category: 'General',
      priority: 'medium',
      defaultDueInDays: 3,
      tags: [],
      tagInput: ''
    });
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    if (template.isDefault) return; // Can't edit default templates
    
    setEditingTemplate(template);
    setIsCreating(true);
    setFormData({
      name: template.name,
      title: template.title,
      description: template.description,
      estimatedDuration: template.estimatedDuration,
      category: template.category,
      priority: template.priority,
      defaultDueInDays: template.defaultDueInDays,
      tags: template.tags,
      tagInput: ''
    });
  };

  const handleSaveTemplate = () => {
    if (!formData.name.trim() || !formData.title.trim()) return;

    const newTemplate: TaskTemplate = {
      id: editingTemplate?.id || `template-${Date.now()}`,
      name: formData.name.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      estimatedDuration: formData.estimatedDuration,
      category: formData.category,
      priority: formData.priority,
      defaultDueInDays: formData.defaultDueInDays,
      tags: formData.tags
    };

    let updatedTemplates;
    if (editingTemplate) {
      updatedTemplates = templates.map(t => t.id === editingTemplate.id ? newTemplate : t);
    } else {
      updatedTemplates = [...templates, newTemplate];
    }

    saveTemplates(updatedTemplates);
    setIsCreating(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) return; // Can't delete default templates

    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(updatedTemplates);
    }
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Task Templates</h2>
              <p className="text-gray-600 text-sm">Create and manage reusable task templates</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateTemplate}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Templates List */}
          <div className={`${isCreating ? 'w-1/2' : 'w-full'} overflow-y-auto p-6 border-r border-gray-100`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {template.isDefault && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.title}</p>
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{template.estimatedDuration}</span>
                        </div>
                        <span>•</span>
                        <span>{template.category}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full border text-xs ${getPriorityColor(template.priority)}`}>
                          {template.priority}
                        </span>
                      </div>

                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{template.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onUseTemplate(template)}
                      className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Use Template</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      {!template.isDefault && (
                        <>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Form */}
          {isCreating && (
            <div className="w-1/2 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {editingTemplate ? 'Update your template details' : 'Create a reusable task template'}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Daily Standup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Daily Team Standup Meeting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Describe what this task involves..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <select
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="45 minutes">45 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                      <option value="3 hours">3 hours</option>
                      <option value="Half day">Half day</option>
                      <option value="Full day">Full day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General">General</option>
                      <option value="Meetings">Meetings</option>
                      <option value="Development">Development</option>
                      <option value="Planning">Planning</option>
                      <option value="Communication">Communication</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Review">Review</option>
                      <option value="Learning">Learning</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Due (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.defaultDueInDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultDueInDays: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={formData.tagInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add a tag..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-indigo-500 hover:text-indigo-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!formData.name.trim() || !formData.title.trim()}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingTemplate ? 'Update Template' : 'Save Template'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};