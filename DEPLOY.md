# Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: Automatic Import from GitHub
1. Go to [vercel.com/new](https://vercel.com/new)
2. Connect GitHub account
3. Import repository: `carlstone2001/venture-fund-dashboard`
4. Configure deployment:
   - **Project Name**: `closed-end-funds` (for URL: closed-end-funds.vercel.app)
   - **Framework Preset**: Other
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install`
5. Click "Deploy"

### Option 2: Manual CLI Deploy
```bash
npx vercel
# Follow prompts:
# - Link to existing project? N
# - Project name: closed-end-funds
# - Directory: ./
# - Want to modify settings? Y
# - Build Command: cd client && npm install && npm run build
# - Output Directory: client/build
# - Development Command: npm run dev
```

### Option 3: Using GitHub Actions (Automated)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd client && npm install && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./
```

## Alternative Deployment Options

### Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`

### Railway
1. Go to [railway.app](https://railway.app)
2. "Deploy from GitHub repo"
3. Select `carlstone2001/venture-fund-dashboard`
4. Add environment variable: `NODE_ENV=production`

### Render
1. Go to [render.com](https://render.com)
2. "New Static Site"
3. Connect GitHub repository
4. Build settings:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`

## Local Testing

Test the production build locally:
```bash
# Build the client
cd client && npm run build

# Serve static files
npx serve -s build -p 3000

# Test API endpoints (separate terminal)
node server.js
```

## Environment Variables

No environment variables are required for basic functionality. Optional:
- `ALPHA_VANTAGE_API_KEY`: For backup price data
- `NODE_ENV`: Set to `production` for optimal performance

## Database Configuration

The SQLite database is automatically initialized on first API call. For production with high traffic, consider:
- Upgrading to PostgreSQL
- Using Vercel KV for caching
- Implementing connection pooling

## Performance Optimization

- ✅ Static asset caching
- ✅ Gzip compression  
- ✅ Serverless functions for API
- ✅ Database auto-initialization
- ✅ Client-side error handling

## Monitoring

Add monitoring endpoints:
- Health check: `GET /api/health`
- Database status: `GET /api/status`
- Price update logs: Check function logs

## Troubleshooting

### Build Fails
- Ensure Node.js 16+ is available
- Check that all dependencies install correctly
- Verify `client/build` directory is created

### API Errors
- Database initializes on first request (may take 10s)
- Yahoo Finance API has rate limits
- Check function logs for detailed errors

### Performance Issues
- Database recreates on each cold start (serverless limitation)
- Consider upgrading to persistent database for production
- Implement caching for frequently accessed data