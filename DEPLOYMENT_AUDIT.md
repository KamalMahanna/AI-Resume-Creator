# Deployment Audit: Render & Netlify Configuration

## Summary of Fixes Applied

### ✅ Issues Fixed

| Issue | File | Problem | Fix |
|-------|------|---------|-----|
| 1. Frontend API endpoint fallback | `frontend/src/services/llm.ts` | Used `http://127.0.0.1:8000` which fails on Netlify | Now requires `VITE_API_URL` environment variable |
| 2. Nginx proxy hardcoded | `frontend/nginx.conf` | Hardcoded `https://ai-resume-creator-tmfr.onrender.com` | Changed to `http://backend:8000/` for docker network routing |
| 3. CORS incomplete | `backend/app.py` | Only allowed Netlify URL in CORS | Now configurable via `CORS_ORIGINS` environment variable |
| 4. Model name mismatch | `backend/app.py` | Used `openai/gpt-oss-120b` (invalid for Groq) | Changed to `mixtral-8x7b-32768` (valid Groq model) |
| 5. Docker compose CORS | `docker-compose.yml` | Missing backend URL | Configured for Netlify frontend |
| 6. No deployment configs | Root directory | Missing Netlify and Render configs | Created `netlify.toml` and `render.yaml` |

---

## Deployment Configuration Files Created

### 1. **netlify.toml** (Netlify Frontend Deployment)
- Builds frontend with `npm run build`
- Publishes from `frontend/dist`
- Sets environment variable `VITE_API_URL` to Render backend
- Handles SPA routing with redirects

### 2. **render.yaml** (Render Deployment - Both Backend & Frontend)
- Configures backend service with Python/Gunicorn
- Configures frontend service with Node build
- Sets up CORS_ORIGINS for both Netlify and Render URLs
- Includes timeout for LLM processing

### 3. **.netlify** (Environment template)
- Template for Netlify environment variables

### 4. **DEPLOYMENT_CONFIG.md** (Documentation)
- Architecture overview for each platform
- Environment setup instructions
- CORS configuration details

---

## API Endpoint Routing

### Development (docker-compose)
```
Frontend → http://localhost:5173 (see separate development branch)
Backend  → http://localhost:8000 (see separate development branch)
API Call: proxy through nginx (see separate development branch)
```

### Production (Netlify + Render Backend)
```
Frontend → https://ai-resume-creator.netlify.app
Backend  → https://ai-resume-creator-backend.onrender.com
API Call: fetch(https://ai-resume-creator-backend.onrender.com/generate)
```

### Production (Render - Both)
```
Frontend → https://ai-resume-creator.onrender.com
Backend  → https://ai-resume-creator-backend.onrender.com
API Call: fetch(https://ai-resume-creator-backend.onrender.com/generate)
```

---

## CORS Allowed Origins

Backend now accepts requests from:
- ✅ `https://ai-resume-creator.netlify.app` (Netlify frontend)
- ✅ `https://ai-resume-creator-backend.onrender.com` (Render frontend)
- ✅ Additional origins configured via `CORS_ORIGINS` environment variable on deployment

---

## Critical Instructions for Your Deployment

### For Render Backend
1. Create new Web Service on Render
2. Connect GitHub repository
3. Use `render.yaml` as build config (auto-detected)
4. **Update service name** if different from `ai-resume-creator-backend`
5. Set backend environment:
   ```
   FLASK_ENV = production
   CORS_ORIGINS = https://ai-resume-creator.netlify.app,<your-render-frontend-url>
   ```

### For Netlify Frontend
1. Connect GitHub repository to Netlify
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/dist`
4. **Update API URL** in netlify.toml if Render backend has different name
5. Environment variable:
   ```
   VITE_API_URL = https://ai-resume-creator-backend.onrender.com
   ```

### Local Development (docker-compose)
```bash
docker-compose up
### Local Development
See separate development branch for localhost configuration.

---

## Model Configuration

- **Current Model:** `mixtral-8x7b-32768` (Groq AI)
- **Note:** Verify model availability in Groq console
- Can be changed in `backend/app.py` at runtime via API responses

---

## ⚠️ Before Deploying

1. [ ] Replace `ai-resume-creator-backend` with your actual Render service name
2. [ ] Replace `ai-resume-creator.netlify.app` with your actual Netlify domain
3. [ ] Verify Groq API key is available in environment
4. [ ] Verify model name is available on Groq API
