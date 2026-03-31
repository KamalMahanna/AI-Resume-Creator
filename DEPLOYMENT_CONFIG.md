# Deployment Configuration Guide

## Environment Setup

### For Render (Backend + Frontend)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Select `render.yaml` as the build configuration
4. Set environment variables:
   - `FLASK_ENV`: production
   - `CORS_ORIGINS`: https://ai-resume-creator.netlify.app,https://ai-resume-creator-backend.onrender.com

### For Netlify (Frontend only)
1. Connect your GitHub repository to Netlify
2. Netlify will auto-detect `netlify.toml` for build settings
3. Environment variables are set in netlify.toml context sections
4. Frontend will automatically use the Render backend URL via `VITE_API_URL`

## API Endpoint Routing

### Development
See separate development branch for localhost configuration.

### Production (Render)
```
Frontend: https://ai-resume-creator.onrender.com
Backend: https://ai-resume-creator-backend.onrender.com
API calls: /generate → direct to backend CORS-enabled
```

### Production (Netlify + Render)
```
Frontend: https://ai-resume-creator.netlify.app
Backend: https://ai-resume-creator-backend.onrender.com
API calls: /api/generate → direct to backend CORS-enabled
```

## CORS Configuration

Backend allows requests from:
- https://ai-resume-creator.netlify.app (Netlify frontend)
- https://ai-resume-creator-backend.onrender.com (Render frontend)

Configure additional origins via `CORS_ORIGINS` environment variable during deployment.

## Important Notes

1. **Backend URL naming**: Adjust `ai-resume-creator-backend` to match your actual Render service name
2. **Frontend URL naming**: Adjust `ai-resume-creator.netlify.app` to match your actual Netlify domain
3. **CORS preflight**: All requests include appropriate headers for cross-origin requests
4. **Timeout**: Backend timeout set to 300s for LLM processing
