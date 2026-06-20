import type { User } from '@supabase/supabase-js'
import type { Task, TaskDraft } from '../types'
import { supabase } from '../lib/supabase'

interface TaskRow {
  id: string
  user_id: string
  title: string
  notes: string
  due_date: string
  priority: Task['priority']
  category: string
  completed: boolean
  created_at: string
  updated_at: string
}

function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    dueDate: row.due_date,
    priority: row.priority,
    category: row.category,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toInsert(user: User, task: TaskDraft | Task) {
  return {
    user_id: user.id,
    title: task.title,
    notes: task.notes,
    due_date: task.dueDate,
    priority: task.priority,
    category: task.category,
    ...('completed' in task ? { completed: task.completed } : {}),
  }
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date')
    .order('created_at')

  if (error) throw error
  return (data as TaskRow[]).map(fromRow)
}

export async function createTask(user: User, draft: TaskDraft): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(toInsert(user, draft))
    .select()
    .single()

  if (error) throw error
  return fromRow(data as TaskRow)
}

export async function updateTask(id: string, changes: Partial<TaskDraft & Pick<Task, 'completed'>>): Promise<Task> {
  const update = {
    ...(changes.title !== undefined ? { title: changes.title } : {}),
    ...(changes.notes !== undefined ? { notes: changes.notes } : {}),
    ...(changes.dueDate !== undefined ? { due_date: changes.dueDate } : {}),
    ...(changes.priority !== undefined ? { priority: changes.priority } : {}),
    ...(changes.category !== undefined ? { category: changes.category } : {}),
    ...(changes.completed !== undefined ? { completed: changes.completed } : {}),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('tasks').update(update).eq('id', id).select().single()
  if (error) throw error
  return fromRow(data as TaskRow)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function importTasks(user: User, tasks: Task[]): Promise<Task[]> {
  if (!tasks.length) return []
  const { data, error } = await supabase
    .from('tasks')
    .insert(tasks.map((task) => toInsert(user, task)))
    .select()

  if (error) throw error
  return (data as TaskRow[]).map(fromRow)
}
