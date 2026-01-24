# Deployment Guide

This document provides instructions for deploying the MagicSpot Parking Availability App to GitHub Pages.

## Automatic Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions whenever changes are pushed to the `main` branch.

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

For more information about GitHub Pages deployment, see the [GitHub Pages documentation](https://docs.github.com/en/pages).
