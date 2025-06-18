import { useState, useEffect, useMemo } from 'react';
import { Task, TaskFilters, TaskStatus } from '../types/Task';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    search: '',
    sortBy: 'due_date',
    sortOrder: 'asc'
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...taskData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      setTasks(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setTasks(prev => prev.map(task => 
        task.id === id ? data : task
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | Date = a[filters.sortBy];
      let bValue: string | Date = b[filters.sortBy];

      if (filters.sortBy === 'due_date' || filters.sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, filters]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.due_date) < new Date()
    ).length;

    return { total, pending, inProgress, completed, overdue };
  }, [tasks]);

  return {
    tasks: filteredAndSortedTasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    taskStats,
    loading
  };
};