import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Validate that critical Firebase config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const
const missingKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key] || firebaseConfig[key] === 'undefined'
)

if (missingKeys.length > 0) {
  console.error(
    `[DreamScape AI] Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}. ` +
    'Ensure VITE_FIREBASE_* environment variables are set in .env.local (for local dev) ' +
    'or as GitHub repository secrets (for CI/CD builds).'
  )
}

// Initialize Firebase with error handling
let app: FirebaseApp
let auth: Auth

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
} catch (error) {
  console.error('[DreamScape AI] Failed to initialize Firebase:', error)
  // Create a visible error message so the user doesn't see just a blank screen
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `
      <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#080b14;color:#f87171;font-family:'Space Grotesk',sans-serif;padding:2rem;text-align:center">
        <h1 style="font-size:1.5rem;margin-bottom:1rem">⚠️ Configuration Error</h1>
        <p style="color:#94a3b8;max-width:500px">Firebase could not be initialized. This usually means environment variables are missing from the build. Please check the project documentation.</p>
      </div>`
  }
  // Re-throw so dependent modules can detect the failure
  throw error
}

export const googleProvider = new GoogleAuthProvider()
export { app, auth }

