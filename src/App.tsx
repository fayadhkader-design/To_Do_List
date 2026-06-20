import { useEffect, useMemo, useState } from 'react'
import { Calendar } from './components/Calendar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import type { Priority, Task, TaskDraft, TaskStatusFilter } from './types'
import { fromDateKey, toDateKey } from './utils/calendar'
import { loadTasks, saveTasks } from './utils/storage'

export default function App() {
  const today = useMemo(() => new Date(), [])
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(today))
  const [selectedDate, setSelectedDate] = useState(toDateKey(today))
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => saveTasks(tasks), [tasks])

  const selectedTasks = tasks
    .filter((task) => task.dueDate === selectedDate)
    .sort((a, b) => Number(a.completed) - Number(b.completed) || ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))

  const categories = Array.from(new Set(tasks.map((task) => task.category))).sort()
  const completedThisMonth = tasks.filter((task) => task.completed && task.dueDate.startsWith(`${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`)).length

  function selectDate(dateKey: string) {
    setSelectedDate(dateKey)
    const date = fromDateKey(dateKey)
    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }
    setEditingTask(null)
  }

  function submitTask(draft: TaskDraft) {
    const now = new Date().toISOString()
    if (editingTask) {
      setTasks((current) => current.map((task) => task.id === editingTask.id ? { ...task, ...draft, updatedAt: now } : task))
      setEditingTask(null)
    } else {
      setTasks((current) => [...current, {
        ...draft,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      }])
    }
    if (draft.dueDate !== selectedDate) selectDate(draft.dueDate)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Carolina Daybook home">
          <span className="brand-mark" aria-hidden="true">
            <i /><i /><i /><b />
          </span>
          <span><strong>Carolina</strong><em>Daybook</em></span>
        </a>
        <div className="header-note">
          <span className="weather-mark" aria-hidden="true">☼</span>
          <span>Plan kindly.<br /><strong>Finish proudly.</strong></span>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Your Carolina rhythm</p>
            <h1>Make room for<br /><em>what matters.</em></h1>
            <p className="hero-description">A clear view of the month, a thoughtful plan for today, and a little breathing room in between.</p>
          </div>
          <div className="hero-stat">
            <span className="stat-number">{completedThisMonth.toString().padStart(2, '0')}</span>
            <span>tasks finished<br />this month</span>
            <div className="argyle-strip" aria-hidden="true" />
          </div>
          <div className="old-well" aria-hidden="true">
            <div className="dome" />
            <div className="roof" />
            <div className="columns"><i /><i /><i /><i /><i /><i /></div>
            <div className="base" />
          </div>
        </section>

        <div className="planner-grid">
          <Calendar
            month={visibleMonth}
            selectedDate={selectedDate}
            tasks={tasks}
            onMonthChange={setVisibleMonth}
            onSelectDate={selectDate}
          />
          <TaskForm
            selectedDate={selectedDate}
            editingTask={editingTask}
            onSubmit={submitTask}
            onCancel={() => setEditingTask(null)}
          />
        </div>

        <TaskList
          selectedDate={selectedDate}
          tasks={selectedTasks}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          categoryFilter={categoryFilter}
          categories={categories}
          onStatusFilter={setStatusFilter}
          onPriorityFilter={setPriorityFilter}
          onCategoryFilter={setCategoryFilter}
          onToggle={(id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task))}
          onEdit={setEditingTask}
          onDelete={(id) => {
            setTasks((current) => current.filter((task) => task.id !== id))
            if (editingTask?.id === id) setEditingTask(null)
          }}
        />
      </main>

      <footer>
        <span>Made for full days &amp; blue skies.</span>
        <span>Chapel Hill, North Carolina</span>
      </footer>
    </div>
  )
}
