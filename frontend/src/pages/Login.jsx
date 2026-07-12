import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { loginWithGoogle, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  async function handleGoogleSuccess(credentialResponse) {
    setError('')
    try {
      await loginWithGoogle(credentialResponse.credential)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Prijava nije uspjela. Pokušaj ponovo.')
    }
  }

  function handleGoogleError() {
    setError('Google prijava je otkazana ili nije uspjela.')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email i lozinka su obavezni.')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Prijava nije uspjela. Pokušaj ponovo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Prijava</h1>
        <p>Prijavi se preko emaila i lozinke ili preko Google naloga.</p>

        <form onSubmit={handleSubmit} className="login-card__form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="ime.prezime@email.com"
          />

          <label htmlFor="password">Lozinka</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />

          <button type="submit" disabled={isLoading} className="login-card__submit">
            {isLoading ? 'Prijava u toku...' : 'Prijavi se'}
          </button>
        </form>

        <p className="login-card__divider">ili</p>

        <div className="login-card__button">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>

        {error && <p className="login-card__error">{error}</p>}

        <p className="login-card__register-link">
          Nemaš nalog? <Link to="/register">Registruj se</Link>
        </p>
      </div>
    </div>
  )
}
