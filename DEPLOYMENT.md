# Deployment Guide

This document provides instructions for deploying the MagicSpot Parking Availability App to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- Supabase project set up with your credentials
- GitHub repository with the latest code
- Node.js 18+ installed locally

## Environment Variables

All deployment platforms require the following environment variables to be set:

```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Getting your Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project ID** (from the Project URL: `https://[PROJECT_ID].supabase.co`)
5. Copy the **anon/public key** from the API Keys section

---

## GitHub Pages (Current Setup)

The application is automatically deployed to GitHub Pages using GitHub Actions whenever changes are pushed to the `main` branch.

### Setting Environment Variables for GitHub Pages

**Important:** GitHub Pages deployments need environment variables to be set during the build process.

**Option 1: Using GitHub Secrets (Recommended for production)**

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:
   - Name: `VITE_SUPABASE_PROJECT_ID`, Value: your project ID
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: your anon key

5. Update `.github/workflows/deploy.yml` to use these secrets during build:
   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}
       VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
   ```

**Option 2: Using a .env file (Not recommended for public repos)**

Alternatively, you can commit a `.env.production` file (but this is not recommended if your repository is public as it exposes your credentials).

### Setup GitHub Pages

To enable GitHub Pages for this repository, follow these steps:

1. Go to the repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **"Build and deployment"** section:
   - **Source**: Select **"GitHub Actions"**
4. Save your changes

### Deployment URL

Once GitHub Pages is enabled and the workflow runs successfully, the application will be available at:

**https://quilyo.github.io/magic-spot.app/**

## How It Works

The deployment process is automated through the `.github/workflows/deploy.yml` workflow file:

1. **Trigger**: The workflow runs automatically on every push to the `main` branch
2. **Build**: 
   - Checks out the code
   - Sets up Node.js (version 18)
   - Installs dependencies using `npm ci`
   - Builds the application using `npm run build`
   - The build output is generated in the `build/` directory
3. **Deploy**: 
   - Uploads the built application to GitHub Pages
   - Makes it available at the deployment URL

## Manual Deployment

You can also trigger a deployment manually:

1. Go to **Actions** tab in the repository
2. Select the **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"**
4. Select the `main` branch
5. Click **"Run workflow"** to start the deployment

## Configuration

The application is configured for GitHub Pages deployment in `vite.config.ts`:

```typescript
base: '/magic-spot.app/'
```

This ensures all asset paths are correct when the app is deployed to the GitHub Pages subdirectory.

## Backend API

Note: The frontend application communicates with a separate backend API, which is deployed independently (typically on Fly.io). The backend deployment is managed separately from this frontend deployment process.

## Troubleshooting

If the deployment fails:

1. Check the **Actions** tab for error logs
2. Ensure GitHub Pages is enabled and set to use GitHub Actions
3. Verify that the `main` branch contains the latest changes
4. Check that the build process completes successfully locally with `npm run build`
5. **Verify environment variables are set correctly** - Missing Supabase credentials will cause the build to fail

### Common Issues

**Build fails with "Missing Supabase credentials" error:**
- Ensure you've added the environment variables as GitHub Secrets
- Verify the secrets are named exactly: `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_ANON_KEY`
- Check that your GitHub Actions workflow passes these secrets to the build step

---

## Alternative Deployment Options

### Vercel

Vercel provides automatic deployments from GitHub with excellent support for environment variables.

**Steps:**

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure environment variables:
   - Click **"Environment Variables"**
   - Add `VITE_SUPABASE_PROJECT_ID` = your project ID
   - Add `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **"Deploy"**

**Note:** For GitHub Pages compatibility, you may need to adjust the `base` setting in `vite.config.ts` to `/` for Vercel.

### Netlify

Netlify also supports automatic deployments from GitHub.

**Steps:**

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Add environment variables:
   - Go to **Site settings** → **Environment variables**
   - Add `VITE_SUPABASE_PROJECT_ID` = your project ID
   - Add `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click **"Deploy site"**

**Note:** For GitHub Pages compatibility, you may need to adjust the `base` setting in `vite.config.ts` to `/` for Netlify.

### Cloudflare Pages

Cloudflare Pages offers fast global deployment.

**Steps:**

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and sign up/login
2. Click **"Create a project"**
3. Connect to GitHub and select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `build`
5. Add environment variables:
   - Expand **"Environment variables"**
   - Add `VITE_SUPABASE_PROJECT_ID` = your project ID
   - Add `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click **"Save and Deploy"**

---

## Security Best Practices

1. **Never commit `.env` files** (except `.env.example` with placeholder values)
2. **Use different credentials for development and production**
3. **Rotate exposed keys** - If you've committed real credentials to Git history, rotate them in Supabase dashboard
4. **Review Supabase Row Level Security (RLS)** - Ensure proper access controls are in place
5. **Enable rate limiting** in Supabase if not already active
6. **Monitor API usage** regularly in your Supabase dashboard

## Key Rotation

If your Supabase credentials were exposed:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Under **Project API keys**, click **"Regenerate"** for the anon key
5. Update the new key in all deployment platforms
6. Redeploy your application

For more information about GitHub Pages deployment, see the [GitHub Pages documentation](https://docs.github.com/en/pages).
