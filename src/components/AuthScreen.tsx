import { useState } from 'react'
import { supabase } from '../lib/supabase'

type AuthMode = 'sign-in' | 'sign-up' | 'reset'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage('')
    setError('')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'sign-in') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) throw authError
      } else if (mode === 'sign-up') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (authError) throw authError
        if (!data.session) setMessage('Check your email to confirm your account, then come back and sign in.')
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (authError) throw authError
        setMessage('Password reset instructions are on their way to your email.')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <a className="brand auth-brand" href="/" aria-label="Carolina Daybook home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><b /></span>
          <span><strong>Carolina</strong><em>Daybook</em></span>
        </a>
        <div>
          <p className="eyebrow">Your Carolina rhythm</p>
          <h1>Plans that follow<br /><em>wherever you go.</em></h1>
          <p>Sign in to keep your calendar private, synced, and ready on every device.</p>
        </div>
        <div className="auth-well old-well" aria-hidden="true">
          <div className="dome" /><div className="roof" />
          <div className="columns"><i /><i /><i /><i /><i /><i /></div><div className="base" />
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="eyebrow">{mode === 'reset' ? 'A fresh start' : 'Welcome to the daybook'}</p>
          <h2>{mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create your account' : 'Reset your password'}</h2>
          <p className="auth-subtitle">
            {mode === 'sign-in' && 'Your plans are waiting for you.'}
            {mode === 'sign-up' && 'Make a private space for what matters.'}
            {mode === 'reset' && 'We’ll email you a secure reset link.'}
          </p>

          <label>
            Email address
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>

          {mode !== 'reset' && (
            <label>
              Password
              <input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" />
            </label>
          )}

          {error && <p className="auth-message error" role="alert">{error}</p>}
          {message && <p className="auth-message success" role="status">{message}</p>}

          <button className="primary-button auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create account' : 'Send reset email'}
          </button>

          <div className="auth-links">
            {mode === 'sign-in' && <button type="button" onClick={() => changeMode('reset')}>Forgot password?</button>}
            <button type="button" onClick={() => changeMode(mode === 'sign-up' ? 'sign-in' : mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
              {mode === 'sign-up' ? 'Already have an account? Sign in' : mode === 'sign-in' ? 'New here? Create an account' : 'Back to sign in'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
