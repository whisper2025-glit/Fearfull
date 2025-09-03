# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/81ffd394-96f1-4060-8f84-f586dd953bc5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/81ffd394-96f1-4060-8f84-f586dd953bc5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables (see Environment Variables section below)

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Variables

This project requires certain environment variables to function properly. These are kept secure and never committed to the repository.

### Required Variables

- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key for authentication
  - Get your publishable key from: https://clerk.com/
  - This key enables user authentication and account management

- `VITE_OPENROUTER_API_KEY`: Your OpenRouter API key for AI model access
  - Get your API key from: https://openrouter.ai/
  - This key enables access to AI models like Mistral Nemo for character conversations
  - Required for NSFW-enabled AI responses

### Setup Options

**Option 1: Using .env file (Local Development)**
1. Copy `.env.example` to `.env`
2. Replace placeholder values with your actual API keys
3. The `.env` file is automatically ignored by Git for security

**Option 2: Using Lovable DevServerControl (Recommended)**
- Environment variables are managed securely through the platform
- No risk of accidentally committing sensitive data
- Variables persist across deployments

### Security Note
- Never commit actual API keys to the repository
- The `.gitignore` file is configured to exclude all `.env` files
- Use `.env.example` as a template for required variables

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/81ffd394-96f1-4060-8f84-f586dd953bc5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
