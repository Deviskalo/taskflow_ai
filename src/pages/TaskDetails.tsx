import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, Edit2, Trash2, Save, X } from 'lucide-react';
import { Task, TaskStatus } from '../types/Task';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    status: 'pending' as TaskStatus
  });

  useEffect(() => {
    if (id && user) {
      fetchTask();
    }
  }, [id, user]);

  const fetchTask = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        navigate('/dashboard');
        return;
      }

      setTask(data);
      const taskDate = new Date(data.due_date);
      setEditForm({
        title: data.title,
        description: data.description,
        due_date: taskDate.toISOString().split('T')[0],
        due_time: data.due_time || taskDate.toTimeString().slice(0, 5),
        status: data.status
      });
    } catch (error) {
      console.error('Error:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!task || !user) return;

    try {
      const dueDateTime = new Date(`${editForm.due_date}T${editForm.due_time}`);
      
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editForm.title,
          description: editForm.description,
          due_date: dueDateTime.toISOString(),
          due_time: editForm.due_time,
          status: editForm.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      await fetchTask();
      setEditing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!task || !user) return;

    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', task.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting task:', error);
          return;
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Task not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;
  const dueDateTime = new Date(task.due_date);
  const isOverdue = task.status !== 'completed' && dueDateTime < new Date();
  
  const formattedDueDate = dueDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedDueTime = task.due_time || dueDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-2 md:space-x-4">
            {!editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm md:text-base"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm md:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            {editing && (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm md:text-base"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm md:text-base"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Task Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {editing ? (
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={editForm.due_time}
                    onChange={(e) => setEditForm({ ...editForm, due_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskStatus })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <h1 className={`text-2xl md:text-3xl font-bold mb-4 md:mb-0 ${
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {task.title}
                </h1>
                
                <div className={`px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color} flex-shrink-0`}>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className="w-4 h-4" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                <div className={`flex items-center space-x-2 text-base md:text-lg ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  <Calendar className="w-5 h-5" />
                  <span>{formattedDueDate}</span>
                </div>
                
                <div className={`flex items-center space-x-2 text-base md:text-lg ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  <Clock className="w-5 h-5" />
                  <span>{formattedDueTime}</span>
                </div>
                
                {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
              </div>

              {task.description && (
                <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 md:pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span>
                    <br />
                    {new Date(task.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <br />
                    {new Date(task.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};