import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const DEFAULT_CATEGORY = 'Personal'

export function categoriesFromUser(user: User): string[] {
  const saved = user.user_metadata?.categories
  if (!Array.isArray(saved)) return [DEFAULT_CATEGORY]
  return normalizeCategories(saved.filter((value): value is string => typeof value === 'string'))
}

export function normalizeCategories(categories: string[]): string[] {
  const unique = new Map<string, string>()
  for (const category of [DEFAULT_CATEGORY, ...categories]) {
    const cleaned = category.trim().slice(0, 40)
    if (cleaned) unique.set(cleaned.toLocaleLowerCase(), cleaned)
  }
  const personal = unique.get(DEFAULT_CATEGORY.toLocaleLowerCase()) ?? DEFAULT_CATEGORY
  return [
    personal,
    ...Array.from(unique.entries())
      .filter(([key]) => key !== DEFAULT_CATEGORY.toLocaleLowerCase())
      .map(([, value]) => value)
      .sort((a, b) => a.localeCompare(b)),
  ]
}

export async function saveCategories(categories: string[]): Promise<string[]> {
  const normalized = normalizeCategories(categories)
  const { error } = await supabase.auth.updateUser({
    data: { categories: normalized },
  })
  if (error) throw error
  return normalized
}

export { DEFAULT_CATEGORY }
