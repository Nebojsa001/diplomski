import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '@/services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Na prvi load provjerimo da li vec postoji sesija u localStorage
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setUser(authService.getStoredUser())
    }
    setIsLoading(false)

    // Ako api.js otkrije istekao/nevazeci token (401), odmah azuriramo state
    function handleExpired() {
      setUser(null)
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  async function loginWithGoogle(credential) {
    const loggedInUser = await authService.loginWithGoogle(credential)
    setUser(loggedInUser)
    return loggedInUser
  }

  async function login(email, password) {
    const loggedInUser = await authService.login({ email, password })
    setUser(loggedInUser)
    return loggedInUser
  }

  async function register(payload) {
    const registeredUser = await authService.register(payload)
    setUser(registeredUser)
    return registeredUser
  }

  function logout() {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    loginWithGoogle,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth mora biti koristen unutar AuthProvider-a')
  }
  return context
}
