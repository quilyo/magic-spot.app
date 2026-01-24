
  # MagicSpot Parking Availability App

  This is a code bundle for MagicSpot Parking Availability App. The original project is available at https://www.figma.com/design/MDO4wITHIviqxPkoT3kkXI/MagicSpot-Parking-Availability-App.

  ## Setup

  ### 1. Install Dependencies

  ```bash
  npm install
  ```

  ### 2. Configure Environment Variables

  Create a `.env` file in the root directory by copying the example file:

  ```bash
  cp .env.example .env
  ```

  Then edit `.env` and add your Supabase credentials:

  ```env
  VITE_SUPABASE_PROJECT_ID=your-actual-project-id
  VITE_SUPABASE_ANON_KEY=your-actual-anon-key
  ```

  **How to get your Supabase credentials:**
  1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
  2. Select your project
  3. Go to **Settings** → **API**
  4. Copy the **Project ID** (from the Project URL: `https://[PROJECT_ID].supabase.co`)
  5. Copy the **anon/public key** from the API Keys section

  ### 3. Run the Development Server

  ```bash
  npm run dev
  ```

  The app will be available at http://localhost:3000

  ## Building for Production

  ```bash
  npm run build
  ```

  ## Deployment

  The application is automatically deployed to GitHub Pages on every push to the `main` branch.

  **Live URL**: https://quilyo.github.io/magic-spot.app/

  For detailed deployment instructions and setup, see [DEPLOYMENT.md](DEPLOYMENT.md).

  ## Important Security Notes

  - **Never commit** your `.env` file to version control
  - The `.env.example` file should only contain placeholder values
  - For production deployments, set environment variables through your hosting platform's dashboard
  - Rotate your Supabase keys regularly for security

  