import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

const root = createRoot(document.getElementById('root')!);

const missing: string[] = [];
if (!SUPABASE_URL || !SUPABASE_URL.trim()) missing.push('VITE_SUPABASE_URL');
if (!SUPABASE_ANON_KEY || !SUPABASE_ANON_KEY.trim()) missing.push('VITE_SUPABASE_ANON_KEY');
if (!OPENROUTER_KEY || !OPENROUTER_KEY.trim()) missing.push('VITE_OPENROUTER_API_KEY');

if (missing.length === 0) {
  root.render(<App />);
} else {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  root.render(
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      padding: 24, textAlign: 'center', backgroundColor: '#f8fafc'
    }}>
      <div style={{ maxWidth: 700, backgroundColor: 'white', padding: 32, borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: 24, marginBottom: 16, color: '#dc2626' }}>Configuration Error</h1>
        <p style={{ marginBottom: 12, color: '#374151' }}>Missing required environment variables:</p>
        <ul style={{ textAlign: 'left', margin: '0 0 16px', paddingLeft: 20, color: '#374151' }}>
          {missing.map((k) => (
            <li key={k} style={{ fontFamily: 'monospace', fontSize: 14 }}>{k}</li>
          ))}
        </ul>
        {isDevelopment && (
          <div style={{ textAlign: 'left', backgroundColor: '#f3f4f6', padding: 16, borderRadius: 4, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Development Setup:</h3>
            <p style={{ fontSize: 14 }}>
              Set the missing environment variables and restart the dev server.
            </p>
          </div>
        )}
        {isProduction && (
          <div style={{ textAlign: 'left', backgroundColor: '#fef3c7', padding: 16, borderRadius: 4, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Production Deployment:</h3>
            <ol style={{ fontSize: 14, paddingLeft: 20 }}>
              <li>Go to your hosting dashboard → Environment Variables</li>
              <li>Add: VITE_SUPABASE_URL</li>
              <li>Add: VITE_SUPABASE_ANON_KEY</li>
              <li>Add: VITE_OPENROUTER_API_KEY</li>
              <li>Redeploy the site</li>
            </ol>
          </div>
        )}
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          See DEPLOYMENT.md for detailed setup instructions.
        </p>
      </div>
    </div>
  );
}
