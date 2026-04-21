# Production Deployment Guide: Hostinger Shared Hosting

This guide outlines the steps to deploy **Coptogram Docs** to Hostinger Shared Hosting using the Node.js selector.

## Prerequisites

1.  **Node.js**: Ensure your Hostinger plan supports Node.js (available in most Premium and Business shared hosting plans).
2.  **Node.js Version**: Select **Node.js 20** (or higher) in the Hostinger panel.

## Step 1: Build the Project Locally

Before uploading, you must build the project to generate the production-ready files.

1.  Open your terminal in the project root.
2.  Run the build command:
    ```bash
    npm run build
    ```
3.  Next.js will generate a `.next/standalone` folder. This is the core of your production app.

## Step 2: Prepare the Deployment Folder

1.  Create a new folder on your computer named `coptogram-deploy`.
2.  Copy the following from your project into `coptogram-deploy`:
    *   Everything inside `.next/standalone` (this includes `server.js`, `package.json`, and `node_modules`).
    *   The `public` folder from your project root into `coptogram-deploy/public`.
    *   The `.next/static` folder from your project into `coptogram-deploy/.next/static`.
    *   **CRITICAL**: Copy the `content` folder from your project root (which contains the `.mdx` files) into `coptogram-deploy/content`. Without this, the app will return a 500 error as it cannot find the data.

## Step 3: Upload to Hostinger

1.  Log in to your **Hostinger hPanel**.
2.  Go to **Websites** > **Manage** (for your domain).
3.  Navigate to **Files** > **File Manager**.
4.  Go to your application root (usually `public_html` or a subdirectory).
5.  Upload the **contents** of your `coptogram-deploy` folder.

## Step 4: Configure Node.js in hPanel

1.  In Hostinger hPanel, search for **Node.js**.
2.  Select your domain.
3.  **Application Root**: Set this to the folder where you uploaded the files (e.g., `/public_html`).
4.  **Application URL**: Set your domain (e.g., `https://docs.coptogram.com`).
5.  **Application Startup File**: Set this to `server.js`.
6.  **Node.js Version**: Select **Version 20.x** (or the latest stable). Next.js 15 requires at least Node 18.
7.  Click **Create/Save**.

## Step 5: Environment Variables

1.  In the Node.js setup page, find the **Environment Variables** section.
2.  Add the following:
    *   `PORT`: `3000` (or whatever Hostinger suggests).
    *   `NODE_ENV`: `production`.
    *   `NEXT_PUBLIC_GA_ID`: Your Google Analytics ID (if any).
    *   `NEXT_PUBLIC_CLARITY_ID`: Your Microsoft Clarity ID (if any).
    *   `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API Key.

## Step 6: Database & Firebase

Ensure your `firebase-applet-config.json` is present in the application root on Hostinger. The app will automatically connect to your Firestore database using the configuration in that file.

### **Important: Authorized Domains**
For Google Login to work on your new domain:
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Go to **Authentication** > **Settings** > **Authorized Domains**.
4.  Add your production domain (e.g., `docs.coptogram.com`).

## Step 7: Final Admin Setup

Once the site is live:
1.  Login to your new production URL.
2.  Navigate to `/admin`.
3.  Log in with your Google account.
4.  Go to the **Setup** tab and click **Save Landing Settings** to initialize the production configuration.
5.  Use the **Migrate Data** button in the Content tab to import the initial documentation into the production database.

## Troubleshooting

*   **Static Assets (Images/Styles)**: If styles or images are missing, ensure you copied `.next/static` into `.next/standalone/.next/static`.
*   **Startup Errors**: Check the **Node.js Logs** in the Hostinger panel for details if the app fails to start.
*   **Port Issues**: If you see a port error, verify that Hostinger is handling the proxying correctly. Usually, you don't need to manually set the PORT unless specified.

---
*Created for Coptogram Docs Production Setup.*
