import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!firstName || !lastName || !email || !password) {
      setError('Sva polja su obavezna.')
      return
    }

    if (password.length < 8) {
      setError('Lozinka mora imati najmanje 8 karaktera.')
      return
    }

    if (password !== passwordConfirm) {
      setError('Lozinke se ne podudaraju.')
      return
    }

    setIsLoading(true)
    try {
      await register({ firstName, lastName, email, password, passwordConfirm })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Registracija nije uspjela. Pokušaj ponovo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Registracija</h1>
        <p>Kreiraj nalog pomoću emaila i lozinke.</p>

        <form onSubmit={handleSubmit} className="login-card__form">
          <label htmlFor="firstName">Ime</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />

          <label htmlFor="lastName">Prezime</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />

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
            autoComplete="new-password"
            placeholder="Najmanje 8 karaktera"
          />

          <label htmlFor="passwordConfirm">Potvrda lozinke</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
          />

          <button type="submit" disabled={isLoading} className="login-card__submit">
            {isLoading ? 'Registracija u toku...' : 'Registruj se'}
          </button>
        </form>

        {error && <p className="login-card__error">{error}</p>}

        <p className="login-card__register-link">
          Već imaš nalog? <Link to="/login">Prijavi se</Link>
        </p>
      </div>
    </div>
  )
}
