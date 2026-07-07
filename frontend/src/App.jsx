import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/context/AuthContext'
import AppRoutes from '@/routes/AppRoutes'
import { env } from '@/config/env'

export default function App() {
  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
