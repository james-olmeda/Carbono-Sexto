# Synergize - A Dynamic Workspace Application

This is a modern frontend application designed as an iCloud-inspired application launcher and case management system. It uses React, TypeScript, and Tailwind CSS, and leverages the Google Gemini API for AI-powered features.

## How to Run Locally

The project uses a modern frontend setup that requires a local development server to handle dependencies and environment variables securely. We recommend using **Vite** for this purpose.

### Prerequisites

1.  **Node.js**: Ensure you have Node.js and `npm` (Node Package Manager) installed. You can download it from [nodejs.org](https://nodejs.org/).
2.  **Gemini API Key**: You need a valid API key for the Google Gemini API. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step-by-Step Guide

#### 1. Set Up the Project

First, place all the project files into a new folder on your local machine. Your folder structure should look like this:

```
your-project-folder/
├── components/
├── contexts/
├── services/
├── App.tsx
├── constants.ts
├── index.html
├── index.tsx
├── metadata.json
└── types.ts
```

#### 2. Install Dependencies

Open your terminal or command prompt, navigate into the project directory, and run the following commands:

```bash
# Initialize a new Node.js project (creates package.json)
npm init -y

# Install Vite and the React plugin as development dependencies
npm install vite @vitejs/plugin-react --save-dev
```

#### 3. Configure Vite

To handle the `process.env.API_KEY` correctly, you need to create a Vite configuration file.

1.  In the root of your project folder, create a file named `vite.config.ts`.
2.  Add the following code to `vite.config.ts`. This configuration tells Vite to use the React plugin and to replace `process.env.API_KEY` with the actual key value from your environment file.

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // Defines global constant replacements.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
```

#### 4. Provide Your API Key

Create a secure file to store your API key.

1.  In the root of your project folder, create a new file named `.env`.
2.  Add your Gemini API key to this file. This file is typically ignored by version control systems like Git, which keeps your key private.

    ```
    API_KEY="YOUR_GEMINI_API_KEY_GOES_HERE"
    ```

    Replace `YOUR_GEMINI_API_KEY_GOES_HERE` with your actual key.

#### 5. Run the Application

You're all set! Start the development server by running:

```bash
npx vite
```

Vite will start the server and provide a local URL, usually `http://localhost:5173/`. Open this URL in your web browser to see the application running.
