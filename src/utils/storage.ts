import type { Task } from '../types'
import { isValidDateKey, toDateKey } from './calendar'

const STORAGE_KEY = 'carolina-daybook.tasks.v1'

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.notes === 'string' &&
    isValidDateKey(task.dueDate) &&
    ['low', 'medium', 'high'].includes(task.priority ?? '') &&
    typeof task.category === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  )
}

function makeSeedTasks(today: Date): Task[] {
  const now = new Date().toISOString()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const later = new Date(today)
  later.setDate(today.getDate() + 3)
  return [
    {
      id: crypto.randomUUID(),
      title: 'Map out the week',
      notes: 'Pick three priorities and leave room for something spontaneous.',
      dueDate: toDateKey(today),
      priority: 'high',
      category: 'Personal',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Study session at Davis',
      notes: 'Bring notes, water, and the good headphones.',
      dueDate: toDateKey(tomorrow),
      priority: 'medium',
      category: 'Study',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'Walk by the Old Well',
      notes: 'A small reset between busy days.',
      dueDate: toDateKey(later),
      priority: 'low',
      category: 'Campus',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function loadTasks(today = new Date()): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      const seeded = makeSeedTasks(today)
      saveTasks(seeded)
      return seeded
    }
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTask) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Keep the app usable when storage is unavailable or full.
  }
}

export function clearLocalTasks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage restrictions.
  }
}

export { STORAGE_KEY }
