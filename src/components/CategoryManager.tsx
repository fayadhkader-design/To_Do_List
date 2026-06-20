import { useEffect, useState } from 'react'

interface CategoryManagerProps {
  categories: string[]
  busy: boolean
  onAdd: (name: string) => Promise<void>
  onRename: (oldName: string, newName: string) => Promise<void>
  onDelete: (name: string) => Promise<void>
  onClose: () => void
}

export function CategoryManager({ categories, busy, onAdd, onRename, onDelete, onClose }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [categories])

  async function addCategory(event: React.FormEvent) {
    event.preventDefault()
    const name = newCategory.trim()
    if (!name) return
    if (categories.some((category) => category.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('That category already exists.')
      return
    }
    try {
      await onAdd(name)
      setNewCategory('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add that category.')
    }
  }

  async function renameCategory(event: React.FormEvent, oldName: string) {
    event.preventDefault()
    const name = renameValue.trim()
    if (!name || name === oldName) {
      setEditing(null)
      return
    }
    if (categories.some((category) => category !== oldName && category.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('That category already exists.')
      return
    }
    try {
      await onRename(oldName, name)
      setEditing(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not rename that category.')
    }
  }

  async function deleteCategory(name: string) {
    try {
      setError('')
      await onDelete(name)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete that category.')
    }
  }

  return (
    <div className="category-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose()
    }}>
      <section className="category-modal" role="dialog" aria-modal="true" aria-labelledby="category-title">
        <header>
          <div>
            <p className="eyebrow">Sort your daybook</p>
            <h2 id="category-title">Manage categories</h2>
          </div>
          <button className="chat-close" onClick={onClose} disabled={busy} aria-label="Close category manager">×</button>
        </header>

        <form className="category-add" onSubmit={addCategory}>
          <label htmlFor="new-category">New category</label>
          <div>
            <input id="new-category" value={newCategory} maxLength={40} onChange={(event) => setNewCategory(event.target.value)} placeholder="e.g. Classes, Work, Wellness" />
            <button className="primary-button" disabled={busy || !newCategory.trim()}>Add</button>
          </div>
        </form>

        {error && <p className="category-error" role="alert">{error}</p>}

        <div className="category-list">
          {categories.map((category) => (
            <div className="category-row" key={category}>
              {editing === category ? (
                <form onSubmit={(event) => renameCategory(event, category)}>
                  <input autoFocus value={renameValue} maxLength={40} onChange={(event) => setRenameValue(event.target.value)} />
                  <button disabled={busy}>Save</button>
                  <button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <span><i aria-hidden="true" />{category}</span>
                  <div>
                    {category !== 'Personal' && (
                      <>
                        <button disabled={busy} onClick={() => {
                          setEditing(category)
                          setRenameValue(category)
                        }}>Rename</button>
                        <button className="delete-button" disabled={busy} onClick={() => deleteCategory(category)}>Delete</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="category-help">Deleting a category moves its tasks to Personal, so nothing gets lost.</p>
      </section>
    </div>
  )
}
