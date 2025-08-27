import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

const root = createRoot(document.getElementById('root')!)

if (PUBLISHABLE_KEY && PUBLISHABLE_KEY.trim().length > 0) {
  root.render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  )
} else {
  root.render(
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      padding: 24, textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Missing Clerk publishable key</h1>
        <p style={{ opacity: 0.8 }}>
          Set the VITE_CLERK_PUBLISHABLE_KEY environment variable to enable authentication.
          You can configure it via the dev server environment or project settings.
        </p>
      </div>
    </div>
  )
}
