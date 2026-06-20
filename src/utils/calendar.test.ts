import { describe, expect, it } from 'vitest'
import { fromDateKey, getMonthGrid, isValidDateKey, shiftMonth, toDateKey } from './calendar'

describe('calendar utilities', () => {
  it('formats and parses local date keys', () => {
    expect(toDateKey(new Date(2026, 1, 9))).toBe('2026-02-09')
    expect(fromDateKey('2026-02-09').getDate()).toBe(9)
  })

  it('creates a 42-day Sunday-first grid across month boundaries', () => {
    const grid = getMonthGrid(new Date(2026, 1, 1))
    expect(grid).toHaveLength(42)
    expect(grid[0].getDay()).toBe(0)
    expect(toDateKey(grid[0])).toBe('2026-02-01')
    expect(toDateKey(grid[41])).toBe('2026-03-14')
  })

  it('handles leap-day validation and month shifting', () => {
    expect(isValidDateKey('2024-02-29')).toBe(true)
    expect(isValidDateKey('2025-02-29')).toBe(false)
    expect(toDateKey(shiftMonth(new Date(2026, 0, 1), -1))).toBe('2025-12-01')
  })
})
