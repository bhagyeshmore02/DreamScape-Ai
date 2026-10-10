import { RouterProvider } from './router'
import { useRouter } from './routerContext'
import { AuthProvider, useAuth } from './AuthContext'
import { useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import CreateProjectPage from './pages/CreateProjectPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { navigate } = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      navigate('login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080b14', color: '#8b5cf6', fontFamily: "'Space Grotesk', sans-serif" }}>
        Loading...
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}

function Routes() {
  const { route } = useRouter()
  switch (route) {
    case 'login':           return <LoginPage />
    case 'signup':          return <SignupPage />
    case 'forgot-password': return <ForgotPasswordPage />
    case 'dashboard':       return <ProtectedRoute><DashboardPage /></ProtectedRoute>
    case 'create-project':  return <ProtectedRoute><CreateProjectPage /></ProtectedRoute>
    default:                return <LandingPage />
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <Routes />
      </RouterProvider>
    </AuthProvider>
  )
}
