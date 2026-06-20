import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthScreen } from './components/AuthScreen'
import { Calendar } from './components/Calendar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { supabase } from './lib/supabase'
import { createTask, deleteTask, fetchTasks, importTasks, updateTask } from './services/tasks'
import type { Priority, Task, TaskDraft, TaskStatusFilter } from './types'
import { fromDateKey, toDateKey } from './utils/calendar'
import { clearLocalTasks, loadTasks } from './utils/storage'

export default function App() {
  const today = useMemo(() => new Date(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [cloudError, setCloudError] = useState('')
  const [localTasks] = useState<Task[]>(() => loadTasks(today))
  const [showImport, setShowImport] = useState(false)
  const [selectedDate, setSelectedDate] = useState(toDateKey(today))
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setTasks([])
      return
    }
    setTasksLoading(true)
    setCloudError('')
    fetchTasks()
      .then((cloudTasks) => {
        setTasks(cloudTasks)
        setShowImport(cloudTasks.length === 0 && localTasks.length > 0)
      })
      .catch((error: Error) => setCloudError(
        error.message.includes('tasks')
          ? 'The secure tasks table still needs to be created in Supabase.'
          : error.message,
      ))
      .finally(() => setTasksLoading(false))
  }, [session, localTasks])

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

  async function submitTask(draft: TaskDraft) {
    if (!session?.user) return
    setCloudError('')
    try {
      if (editingTask) {
        const saved = await updateTask(editingTask.id, draft)
        setTasks((current) => current.map((task) => task.id === saved.id ? saved : task))
        setEditingTask(null)
      } else {
        const saved = await createTask(session.user, draft)
        setTasks((current) => [...current, saved])
      }
      if (draft.dueDate !== selectedDate) selectDate(draft.dueDate)
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : 'Could not save this task.')
    }
  }

  async function handleImport() {
    if (!session?.user) return
    setTasksLoading(true)
    setCloudError('')
    try {
      const imported = await importTasks(session.user, localTasks)
      setTasks(imported)
      clearLocalTasks()
      setShowImport(false)
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : 'Could not import local tasks.')
    } finally {
      setTasksLoading(false)
    }
  }

  async function handlePasswordUpdate(event: React.FormEvent) {
    event.preventDefault()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setCloudError(error.message)
      return
    }
    setPasswordRecovery(false)
    setNewPassword('')
  }

  if (authLoading) {
    return <div className="app-loading"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><b /></span><p>Opening your daybook…</p></div>
  }

  if (!session) return <AuthScreen />

  if (passwordRecovery) {
    return (
      <main className="password-page">
        <form className="auth-form" onSubmit={handlePasswordUpdate}>
          <p className="eyebrow">Almost there</p>
          <h2>Choose a new password</h2>
          <label>New password<input type="password" minLength={6} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
          {cloudError && <p className="auth-message error">{cloudError}</p>}
          <button className="primary-button auth-submit">Save new password</button>
        </form>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Carolina Daybook home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><b /></span>
          <span><strong>Carolina</strong><em>Daybook</em></span>
        </a>
        <div className="account-menu">
          <span><small>Signed in as</small>{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
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
            <div className="dome" /><div className="roof" />
            <div className="columns"><i /><i /><i /><i /><i /><i /></div><div className="base" />
          </div>
        </section>

        {showImport && (
          <aside className="import-banner">
            <div><strong>Bring your earlier tasks with you?</strong><span>We found {localTasks.length} task{localTasks.length === 1 ? '' : 's'} saved in this browser.</span></div>
            <div><button className="text-button" onClick={() => setShowImport(false)}>Not now</button><button className="primary-button" onClick={handleImport}>Import tasks</button></div>
          </aside>
        )}

        {cloudError && <div className="cloud-error" role="alert"><strong>Cloud setup needs attention</strong><span>{cloudError}</span></div>}

        {tasksLoading ? (
          <div className="tasks-loading">Syncing your plans…</div>
        ) : (
          <>
            <div className="planner-grid">
              <Calendar month={visibleMonth} selectedDate={selectedDate} tasks={tasks} onMonthChange={setVisibleMonth} onSelectDate={selectDate} />
              <TaskForm selectedDate={selectedDate} editingTask={editingTask} onSubmit={submitTask} onCancel={() => setEditingTask(null)} />
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
              onToggle={async (id) => {
                const original = tasks.find((task) => task.id === id)
                if (!original) return
                try {
                  const saved = await updateTask(id, { completed: !original.completed })
                  setTasks((current) => current.map((task) => task.id === id ? saved : task))
                } catch (error) {
                  setCloudError(error instanceof Error ? error.message : 'Could not update this task.')
                }
              }}
              onEdit={setEditingTask}
              onDelete={async (id) => {
                try {
                  await deleteTask(id)
                  setTasks((current) => current.filter((task) => task.id !== id))
                  if (editingTask?.id === id) setEditingTask(null)
                } catch (error) {
                  setCloudError(error instanceof Error ? error.message : 'Could not delete this task.')
                }
              }}
            />
          </>
        )}
      </main>

      <footer><span>Made for full days &amp; blue skies.</span><span>Chapel Hill, North Carolina</span></footer>
    </div>
  )
}
