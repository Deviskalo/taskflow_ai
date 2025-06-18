import { useState } from 'react';
import { Task, TaskStatus } from '../types/Task';

interface AITaskSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  category: string;
}

interface AIInsight {
  type: 'productivity' | 'deadline' | 'organization' | 'suggestion';
  title: string;
  message: string;
  actionable?: boolean;
  action?: () => void;
}

export const useAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate AI task suggestions based on user patterns
  const generateTaskSuggestions = async (existingTasks: Task[]): Promise<AITaskSuggestion[]> => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions: AITaskSuggestion[] = [
      {
        title: "Review weekly goals",
        description: "Take 15 minutes to review and adjust your weekly objectives based on current progress.",
        priority: 'medium',
        estimatedDuration: '15 minutes',
        category: 'Planning'
      },
      {
        title: "Organize digital workspace",
        description: "Clean up desktop files, organize downloads folder, and update bookmarks.",
        priority: 'low',
        estimatedDuration: '30 minutes',
        category: 'Organization'
      },
      {
        title: "Schedule important calls",
        description: "Block time for important calls and meetings for the upcoming week.",
        priority: 'high',
        estimatedDuration: '20 minutes',
        category: 'Communication'
      },
      {
        title: "Update project documentation",
        description: "Review and update project documentation to reflect recent changes.",
        priority: 'medium',
        estimatedDuration: '45 minutes',
        category: 'Documentation'
      },
      {
        title: "Plan learning session",
        description: "Dedicate time to learn something new related to your field or interests.",
        priority: 'medium',
        estimatedDuration: '1 hour',
        category: 'Learning'
      }
    ];

    // Filter suggestions based on existing tasks to avoid duplicates
    const filteredSuggestions = suggestions.filter(suggestion => 
      !existingTasks.some(task => 
        task.title.toLowerCase().includes(suggestion.title.toLowerCase().split(' ')[0])
      )
    );

    setIsProcessing(false);
    return filteredSuggestions.slice(0, 3);
  };

  // Generate AI insights based on task patterns
  const generateInsights = async (tasks: Task[]): Promise<AIInsight[]> => {
    const insights: AIInsight[] = [];
    
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.due_date) < new Date()
    );
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'deadline',
        title: 'Overdue Tasks Alert',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider prioritizing these to stay on track.`,
        actionable: true
      });
    }

    if (completedTasks.length > pendingTasks.length && completedTasks.length > 0) {
      insights.push({
        type: 'productivity',
        title: 'Great Progress!',
        message: `You've completed ${completedTasks.length} tasks. You're doing excellent work staying productive!`,
        actionable: false
      });
    }

    if (pendingTasks.length > 5) {
      insights.push({
        type: 'organization',
        title: 'Task Organization',
        message: `You have ${pendingTasks.length} pending tasks. Consider breaking down larger tasks or setting priorities.`,
        actionable: true
      });
    }

    if (tasks.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Get Started',
        message: "Start by adding your first task or let me suggest some tasks to help you get organized!",
        actionable: true
      });
    }

    return insights;
  };

  // Smart task enhancement - improve task details with AI
  const enhanceTask = async (title: string, description?: string): Promise<{
    enhancedDescription: string;
    suggestedDueDate: string;
    priority: 'low' | 'medium' | 'high';
    estimatedDuration: string;
    tags: string[];
  }> => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple AI logic based on keywords
    const titleLower = title.toLowerCase();
    let priority: 'low' | 'medium' | 'high' = 'medium';
    let estimatedDuration = '30 minutes';
    let suggestedDays = 3;
    const tags: string[] = [];

    // Priority detection
    if (titleLower.includes('urgent') || titleLower.includes('asap') || titleLower.includes('important')) {
      priority = 'high';
      suggestedDays = 1;
    } else if (titleLower.includes('someday') || titleLower.includes('maybe') || titleLower.includes('consider')) {
      priority = 'low';
      suggestedDays = 7;
    }

    // Duration estimation
    if (titleLower.includes('meeting') || titleLower.includes('call')) {
      estimatedDuration = '1 hour';
      tags.push('meeting');
    } else if (titleLower.includes('review') || titleLower.includes('check')) {
      estimatedDuration = '15 minutes';
      tags.push('review');
    } else if (titleLower.includes('project') || titleLower.includes('develop')) {
      estimatedDuration = '2-3 hours';
      tags.push('project');
    }

    // Category tagging
    if (titleLower.includes('email') || titleLower.includes('message')) tags.push('communication');
    if (titleLower.includes('learn') || titleLower.includes('study')) tags.push('learning');
    if (titleLower.includes('plan') || titleLower.includes('organize')) tags.push('planning');

    const enhancedDescription = description || `Complete: ${title}. Estimated time: ${estimatedDuration}. Priority: ${priority}.`;
    
    const suggestedDueDate = new Date();
    suggestedDueDate.setDate(suggestedDueDate.getDate() + suggestedDays);

    setIsProcessing(false);
    
    return {
      enhancedDescription,
      suggestedDueDate: suggestedDueDate.toISOString().split('T')[0],
      priority,
      estimatedDuration,
      tags
    };
  };

  // Smart task organization suggestions
  const suggestTaskOrganization = async (tasks: Task[]): Promise<{
    categories: { [key: string]: Task[] };
    suggestions: string[];
  }> => {
    const categories: { [key: string]: Task[] } = {
      'High Priority': [],
      'Due Soon': [],
      'Overdue': [],
      'Completed': [],
      'Others': []
    };

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    tasks.forEach(task => {
      const dueDate = new Date(task.due_date);
      
      if (task.status === 'completed') {
        categories['Completed'].push(task);
      } else if (dueDate < now) {
        categories['Overdue'].push(task);
      } else if (dueDate <= threeDaysFromNow) {
        categories['Due Soon'].push(task);
      } else if (task.title.toLowerCase().includes('urgent') || task.title.toLowerCase().includes('important')) {
        categories['High Priority'].push(task);
      } else {
        categories['Others'].push(task);
      }
    });

    const suggestions = [
      "Focus on overdue tasks first to get back on track",
      "Schedule specific time blocks for high-priority tasks",
      "Break down large tasks into smaller, manageable steps",
      "Set realistic deadlines to avoid future overdue tasks"
    ];

    return { categories, suggestions };
  };

  return {
    generateTaskSuggestions,
    generateInsights,
    enhanceTask,
    suggestTaskOrganization,
    isProcessing
  };
};