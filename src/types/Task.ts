export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  due_time?: string; // New field for time
  status: 'pending' | 'in-progress' | 'completed';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = Task['status'];

export interface TaskFilters {
  status: TaskStatus | 'all';
  search: string;
  sortBy: 'due_date' | 'created_at' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}