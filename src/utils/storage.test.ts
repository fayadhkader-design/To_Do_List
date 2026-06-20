import { beforeEach, describe, expect, it } from 'vitest'
import { loadTasks, saveTasks, STORAGE_KEY } from './storage'
import type { Task } from '../types'

beforeEach(() => localStorage.clear())

describe('task storage', () => {
  it('seeds only on first launch', () => {
    const first = loadTasks(new Date(2026, 5, 20))
    expect(first.length).toBe(3)
    expect(loadTasks(new Date(2026, 5, 20))).toHaveLength(3)
  })

  it('persists valid tasks and ignores malformed entries', () => {
    const task: Task = {
      id: '1', title: 'Read', notes: '', dueDate: '2026-06-20', priority: 'high',
      category: 'Study', completed: false, createdAt: 'now', updatedAt: 'now',
    }
    saveTasks([task])
    expect(loadTasks()).toEqual([task])
    localStorage.setItem(STORAGE_KEY, JSON.stringify([task, { nope: true }]))
    expect(loadTasks()).toEqual([task])
  })

  it('recovers from invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{bad')
    expect(loadTasks()).toEqual([])
  })
})
