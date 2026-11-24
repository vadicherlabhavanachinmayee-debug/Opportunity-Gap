
import { useState } from 'react'
import './Auth.css'

type AuthUser = {
  userId: number
  name: string
  email: string
}

type AuthProps = {
  onAuthSuccess: (user: AuthUser) => void
}

function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!isLogin && password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const endpoint = isLogin ? 'login' : 'register'

      const body = isLogin
        ? { email, password }
        : { name, email, password }

      const response = await fetch(
        `http://localhost:8080/api/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.')
      }

      if (!isLogin) {
        setMessage('Account created successfully! You can now log in.')
        setIsLogin(true)
        setPassword('')
      } else {
        onAuthSuccess({
          userId: data.userId,
          name: data.name,
          email: data.email,
        })
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to connect to the server.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          Opportunity<span>Gap</span>
        </div>

        <div className="auth-heading">
          <p className="auth-eyebrow">YOUR FUTURE STARTS HERE</p>
          <h1>{isLogin ? 'Welcome back!' : 'Create your account'}</h1>
          <p>
            {isLogin
              ? 'Sign in to discover opportunities made for you.'
              : 'Join us and never miss an opportunity again.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? 'selected' : ''}
            onClick={() => {
              setIsLogin(true)
              setError('')
              setMessage('')
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={!isLogin ? 'selected' : ''}
            onClick={() => {
              setIsLogin(false)
              setError('')
              setMessage('')
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={isLogin ? undefined : 8}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Login →'
                : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer">
          Every opportunity deserves a chance.
        </p>
      </div>
    </div>
  )
}

export default Auth
