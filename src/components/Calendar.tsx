import type { Task } from '../types'
import { getMonthGrid, shiftMonth, toDateKey, WEEKDAYS } from '../utils/calendar'

interface CalendarProps {
  month: Date
  selectedDate: string
  tasks: Task[]
  onMonthChange: (month: Date) => void
  onSelectDate: (date: string) => void
}

export function Calendar({ month, selectedDate, tasks, onMonthChange, onSelectDate }: CalendarProps) {
  const todayKey = toDateKey(new Date())
  const taskCounts = tasks.reduce<Record<string, { open: number; done: number }>>((counts, task) => {
    const existing = counts[task.dueDate] ?? { open: 0, done: 0 }
    existing[task.completed ? 'done' : 'open'] += 1
    counts[task.dueDate] = existing
    return counts
  }, {})

  return (
    <section className="calendar-card" aria-label="Monthly calendar">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">The month at a glance</p>
          <h2>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="month-actions">
          <button className="icon-button" onClick={() => onMonthChange(shiftMonth(month, -1))} aria-label="Previous month">←</button>
          <button className="today-button" onClick={() => {
            const today = new Date()
            onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))
            onSelectDate(toDateKey(today))
          }}>Today</button>
          <button className="icon-button" onClick={() => onMonthChange(shiftMonth(month, 1))} aria-label="Next month">→</button>
        </div>
      </div>

      <div className="weekday-row" aria-hidden="true">
        {WEEKDAYS.map((day, index) => (
          <div className={`weekday-tag weekday-${index}`} key={day}>
            <span className="weekday-full">{day}</span>
            <span className="weekday-short">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {getMonthGrid(month).map((date) => {
          const key = toDateKey(date)
          const counts = taskCounts[key]
          const outsideMonth = date.getMonth() !== month.getMonth()
          return (
            <button
              className={[
                'calendar-day',
                outsideMonth ? 'outside-month' : '',
                key === selectedDate ? 'selected' : '',
                key === todayKey ? 'today' : '',
              ].join(' ')}
              key={key}
              onClick={() => onSelectDate(key)}
              aria-label={`${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}${counts ? `, ${counts.open + counts.done} tasks` : ''}`}
              aria-pressed={key === selectedDate}
            >
              <span className="day-number">{date.getDate()}</span>
              {counts && (
                <span className="task-dots" aria-hidden="true">
                  {counts.open > 0 && <span className="task-dot open-dot" />}
                  {counts.done > 0 && <span className="task-dot done-dot" />}
                  <span className="task-count">{counts.open + counts.done}</span>
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="calendar-legend">
        <span><i className="legend-dot open-dot" /> Open</span>
        <span><i className="legend-dot done-dot" /> Finished</span>
      </div>
    </section>
  )
}
