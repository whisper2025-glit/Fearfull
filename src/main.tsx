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
  // Enhanced error display for missing environment variables
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  root.render(
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      padding: 24, textAlign: 'center', backgroundColor: '#f8fafc'
    }}>
      <div style={{ maxWidth: 600, backgroundColor: 'white', padding: 32, borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: 24, marginBottom: 16, color: '#dc2626' }}>Configuration Error</h1>
        <p style={{ marginBottom: 16, color: '#374151' }}>
          Missing Clerk publishable key (VITE_CLERK_PUBLISHABLE_KEY)
        </p>
        {isDevelopment && (
          <div style={{ textAlign: 'left', backgroundColor: '#f3f4f6', padding: 16, borderRadius: 4, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Development Setup:</h3>
            <p style={{ fontSize: 14, fontFamily: 'monospace' }}>
              Use DevServerControl tool to set environment variables
            </p>
          </div>
        )}
        {isProduction && (
          <div style={{ textAlign: 'left', backgroundColor: '#fef3c7', padding: 16, borderRadius: 4, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Production Deployment:</h3>
            <ol style={{ fontSize: 14, paddingLeft: 20 }}>
              <li>Go to Netlify Dashboard → Site Settings → Environment Variables</li>
              <li>Add: VITE_CLERK_PUBLISHABLE_KEY</li>
              <li>Add: VITE_SUPABASE_URL</li>
              <li>Add: VITE_SUPABASE_ANON_KEY</li>
              <li>Add: VITE_OPENROUTER_API_KEY</li>
              <li>Trigger a new deployment</li>
            </ol>
          </div>
        )}
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Check the DEPLOYMENT.md file for detailed setup instructions.
        </p>
      </div>
    </div>
  )
}
