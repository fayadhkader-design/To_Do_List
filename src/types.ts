export type Priority = 'low' | 'medium' | 'high'
export type TaskStatusFilter = 'all' | 'open' | 'done'

export interface Task {
  id: string
  title: string
  notes: string
  dueDate: string
  priority: Priority
  category: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TaskDraft = Pick<Task, 'title' | 'notes' | 'dueDate' | 'priority' | 'category'>
