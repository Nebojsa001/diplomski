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
  }, [])

  async function loginWithGoogle(credential) {
    const loggedInUser = await authService.loginWithGoogle(credential)
    setUser(loggedInUser)
    return loggedInUser
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
