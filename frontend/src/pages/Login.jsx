import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  async function handleSuccess(credentialResponse) {
    setError('')
    try {
      await loginWithGoogle(credentialResponse.credential)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Prijava nije uspjela. Pokušaj ponovo.')
    }
  }

  function handleError() {
    setError('Google prijava je otkazana ili nije uspjela.')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Prijava</h1>
        <p>Prijavi se preko Google naloga da nastaviš.</p>

        <div className="login-card__button">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>

        {error && <p className="login-card__error">{error}</p>}
      </div>
    </div>
  )
}
