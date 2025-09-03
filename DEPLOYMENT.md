# Netlify Deployment Guide for WhisperChat AI

## Environment Variables Setup

Your app requires these environment variables to be set in Netlify:

1. Go to your Netlify dashboard
2. Navigate to your site → **Site settings** → **Environment variables**
3. Add these variables:

```
VITE_CLERK_PUBLISHABLE_KEY = pk_test_dG91Y2hlZC1nb29zZS03My5jbGVyay5hY2NvdW50cy5kZXYk
VITE_SUPABASE_URL = https://jhrmlnfdnxjdlrlzokdd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impocm1sbmZkbnhqZGxybHpva2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzAzNDIsImV4cCI6MjA3MTcwNjM0Mn0.1Qu2IDtDNb93qtEd_EinPrRe8Z2HPuFmcyyARGbEFnM
VITE_OPENROUTER_API_KEY = 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
```

## Build Settings

Ensure your Netlify build settings are:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 or higher

## Common Issues & Solutions

### Black Screen After Deployment

**Cause**: Missing environment variables
**Solution**: Verify all VITE_ prefixed environment variables are set in Netlify

### 404 Errors on Page Refresh

**Cause**: Missing redirect rules for SPA routing
**Solution**: The `netlify.toml` file should handle this automatically

### Build Failures

**Cause**: Node version or dependency issues
**Solution**: 
1. Check build logs in Netlify dashboard
2. Ensure Node version is 18+
3. Clear build cache and redeploy

## Deployment Steps

1. **Connect Repository**: Link your GitHub/GitLab repo to Netlify
2. **Set Environment Variables**: Add all required VITE_ variables
3. **Configure Build Settings**: Use the settings mentioned above
4. **Deploy**: Netlify will auto-deploy on code changes

## Verification

After deployment, check:
1. Site loads without black screen
2. Authentication works (Clerk)
3. Database connections work (Supabase)
4. AI chat functionality works (OpenRouter)

## Troubleshooting Commands

Local testing:
```bash
# Test build locally
npm run build
npm run preview

# Check environment variables
echo $VITE_CLERK_PUBLISHABLE_KEY
```

If issues persist, check the Netlify build logs for specific error messages.
