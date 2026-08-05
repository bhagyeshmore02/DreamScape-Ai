import { RouterProvider } from './router'
import { useRouter } from './routerContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import CreateProjectPage from './pages/CreateProjectPage'

function Routes() {
  const { route } = useRouter()
  switch (route) {
    case 'login':           return <LoginPage />
    case 'signup':          return <SignupPage />
    case 'forgot-password': return <ForgotPasswordPage />
    case 'dashboard':       return <DashboardPage />
    case 'create-project':  return <CreateProjectPage />
    default:                return <LandingPage />
  }
}

export default function App() {
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  )
}
