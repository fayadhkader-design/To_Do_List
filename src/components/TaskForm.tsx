import { useEffect, useState } from 'react'
import type { Priority, Task, TaskDraft } from '../types'
import { formatLongDate } from '../utils/calendar'

interface TaskFormProps {
  selectedDate: string
  editingTask: Task | null
  categories: string[]
  onManageCategories: () => void
  onSubmit: (draft: TaskDraft) => void
  onCancel: () => void
}

const EMPTY_DRAFT = { title: '', notes: '', priority: 'medium' as Priority, category: 'Personal' }

export function TaskForm({ selectedDate, editingTask, categories, onManageCategories, onSubmit, onCancel }: TaskFormProps) {
  const [draft, setDraft] = useState<TaskDraft>({ ...EMPTY_DRAFT, dueDate: selectedDate })
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft(editingTask
      ? { title: editingTask.title, notes: editingTask.notes, dueDate: editingTask.dueDate, priority: editingTask.priority, category: editingTask.category }
      : { ...EMPTY_DRAFT, dueDate: selectedDate })
    setError('')
  }, [editingTask, selectedDate])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!draft.title.trim()) {
      setError('Give this task a short title.')
      return
    }
    if (!draft.dueDate) {
      setError('Choose a date for this task.')
      return
    }
    onSubmit({ ...draft, title: draft.title.trim(), notes: draft.notes.trim(), category: draft.category.trim() || 'Personal' })
    if (!editingTask) setDraft({ ...EMPTY_DRAFT, dueDate: selectedDate })
    setError('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-title-row">
        <div>
          <p className="eyebrow">{editingTask ? 'Pencil it in again' : 'Add to the day'}</p>
          <h3>{editingTask ? 'Edit task' : formatLongDate(selectedDate)}</h3>
        </div>
        <span className="paperclip" aria-hidden="true">⌁</span>
      </div>

      <label>
        What needs doing?
        <input
          autoComplete="off"
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="e.g. Review lecture notes"
        />
      </label>

      <label>
        Notes <span className="optional">(optional)</span>
        <textarea
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          placeholder="A useful detail for future you..."
          rows={3}
        />
      </label>

      <div className="form-row">
        <label>
          Due date
          <input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} />
        </label>
        <label>
          Priority
          <select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <label>
        <span className="category-label-row"><span>Category</span><button type="button" onClick={onManageCategories}>Manage categories</button></span>
        <select
          value={draft.category}
          onChange={(event) => setDraft({ ...draft, category: event.target.value })}
        >
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        {editingTask && <button type="button" className="text-button" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="primary-button">{editingTask ? 'Save changes' : 'Add to daybook'} <span>→</span></button>
      </div>
    </form>
  )
}
