import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Lightbulb, TrendingUp, MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { Task } from '../types/Task';

interface AIAssistantProps {
  tasks: Task[];
  onTaskSuggestion: (suggestion: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  tasks,
  onTaskSuggestion,
  isOpen,
  onClose
}) => {
  const { generateTaskSuggestions, generateInsights, isProcessing } = useAI();
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'insights'>('chat');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([
    {
      type: 'ai',
      message: "Hi! I'm your AI task assistant. I can help you organize tasks, suggest new ones, and provide productivity insights. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
      loadInsights();
    }
  }, [isOpen, tasks]);

  const loadSuggestions = async () => {
    const taskSuggestions = await generateTaskSuggestions(tasks);
    setSuggestions(taskSuggestions);
  };

  const loadInsights = async () => {
    const taskInsights = await generateInsights(tasks);
    setInsights(taskInsights);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user' as const,
      message: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "I understand you'd like help with that. ";
      
      const messageLower = inputMessage.toLowerCase();
      
      if (messageLower.includes('suggest') || messageLower.includes('idea')) {
        aiResponse = "I'd be happy to suggest some tasks! Check out the 'Suggestions' tab for personalized task recommendations based on your current workload.";
      } else if (messageLower.includes('organize') || messageLower.includes('priority')) {
        aiResponse = "Great question about organization! I recommend focusing on overdue tasks first, then tackling high-priority items. Would you like me to help categorize your current tasks?";
      } else if (messageLower.includes('productive') || messageLower.includes('efficient')) {
        aiResponse = "To boost productivity, try time-blocking your tasks and taking regular breaks. I can see your task patterns and provide specific insights in the 'Insights' tab.";
      } else if (messageLower.includes('deadline') || messageLower.includes('due')) {
        aiResponse = "Managing deadlines is crucial! I can help you identify which tasks need immediate attention and suggest realistic timelines for new tasks.";
      } else {
        aiResponse = "I'm here to help with task management, organization, and productivity tips. Feel free to ask about task suggestions, prioritization, or any productivity challenges you're facing!";
      }

      const aiMessage = {
        type: 'ai' as const,
        message: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Task Assistant</h2>
              <p className="text-gray-600 text-sm">Your intelligent productivity companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-2 ${
                        msg.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-gray-100">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about task management..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Task Suggestions</h3>
                <p className="text-gray-600">Based on your current tasks and productivity patterns</p>
              </div>

              {isProcessing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Generating personalized suggestions...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {suggestion.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{suggestion.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>⏱️ {suggestion.estimatedDuration}</span>
                            <span>📁 {suggestion.category}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onTaskSuggestion(suggestion)}
                          className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Add Task</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Productivity Insights</h3>
                <p className="text-gray-600">AI-powered analysis of your task management patterns</p>
              </div>

              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`rounded-xl p-6 border ${
                    insight.type === 'productivity' ? 'bg-green-50 border-green-200' :
                    insight.type === 'deadline' ? 'bg-red-50 border-red-200' :
                    insight.type === 'organization' ? 'bg-blue-50 border-blue-200' :
                    'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'productivity' ? 'bg-green-100' :
                        insight.type === 'deadline' ? 'bg-red-100' :
                        insight.type === 'organization' ? 'bg-blue-100' :
                        'bg-purple-100'
                      }`}>
                        {insight.type === 'productivity' && <TrendingUp className="w-5 h-5 text-green-600" />}
                        {insight.type === 'deadline' && <Bot className="w-5 h-5 text-red-600" />}
                        {insight.type === 'organization' && <Lightbulb className="w-5 h-5 text-blue-600" />}
                        {insight.type === 'suggestion' && <Sparkles className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-gray-600">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};