import type { Priority, Task, TaskStatusFilter } from '../types'
import { formatLongDate } from '../utils/calendar'

interface TaskListProps {
  selectedDate: string
  tasks: Task[]
  statusFilter: TaskStatusFilter
  priorityFilter: Priority | 'all'
  categoryFilter: string
  categories: string[]
  onStatusFilter: (filter: TaskStatusFilter) => void
  onPriorityFilter: (filter: Priority | 'all') => void
  onCategoryFilter: (category: string) => void
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({
  selectedDate, tasks, statusFilter, priorityFilter, categoryFilter, categories,
  onStatusFilter, onPriorityFilter, onCategoryFilter, onToggle, onEdit, onDelete,
}: TaskListProps) {
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === 'all' || (statusFilter === 'done' ? task.completed : !task.completed)
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter
    return statusMatch && priorityMatch && categoryMatch
  })

  return (
    <section className="agenda-card" aria-labelledby="agenda-heading">
      <div className="agenda-heading">
        <div>
          <p className="eyebrow">Today’s page</p>
          <h2 id="agenda-heading">{formatLongDate(selectedDate)}</h2>
        </div>
        <span className="task-total">{tasks.filter((task) => !task.completed).length} open</span>
      </div>

      <div className="filters" aria-label="Task filters">
        <div className="status-tabs">
          {(['all', 'open', 'done'] as TaskStatusFilter[]).map((filter) => (
            <button key={filter} className={statusFilter === filter ? 'active' : ''} onClick={() => onStatusFilter(filter)}>
              {filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="select-filters">
          <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => onPriorityFilter(event.target.value as Priority | 'all')}>
            <option value="all">Every priority</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => onCategoryFilter(event.target.value)}>
            <option value="all">Every category</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </div>
      </div>

      <div className="task-list">
        {filteredTasks.map((task) => (
          <article className={`task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`} key={task.id}>
            <button
              className="check-button"
              aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
              onClick={() => onToggle(task.id)}
            >
              {task.completed && '✓'}
            </button>
            <div className="task-copy">
              <div className="task-title-row">
                <h3>{task.title}</h3>
                <span className={`priority-pill ${task.priority}`}>{task.priority}</span>
              </div>
              {task.notes && <p>{task.notes}</p>}
              <span className="category-chip">{task.category}</span>
            </div>
            <div className="task-actions">
              <button onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>Edit</button>
              <button className="delete-button" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>Delete</button>
            </div>
          </article>
        ))}

        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-bell" aria-hidden="true">✦</div>
            <h3>The quad is quiet.</h3>
            <p>{tasks.length ? 'No tasks match these filters.' : 'Nothing is scheduled here yet. Add something worth remembering.'}</p>
          </div>
        )}
      </div>
    </section>
  )
}
