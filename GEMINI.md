# Project Context: TanStack AI Chat

## Project Overview

This project is a Full-Stack AI Chat Application demonstrating the capabilities of the `@tanstack/ai` library. It features a modern, responsive chat interface built with React and a Node.js/Hono backend that interfaces with OpenAI.

**Key Technologies:**

*   **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Shadcn/UI Components.
*   **Backend:** Node.js, Hono.
*   **AI Integration:** `@tanstack/ai`, `@tanstack/ai-react`, `@tanstack/ai-openai`, OpenAI API.
*   **Utilities:** `lucide-react` (Icons), `react-markdown` (Markdown rendering), `concurrently` (Script management).

## Architecture

*   **Entry Point (Frontend):** `src/main.tsx` mounts the React application.
*   **Entry Point (Backend):** `server.js` starts the Hono server.
*   **Main Component:** `src/components/Chat.tsx` contains the chat UI and logic, utilizing the `useChat` hook for state management and streaming communication with the backend.
*   **API Layer:** The backend exposes a `/api/chat` endpoint that accepts messages and streams back the AI response.

## Building and Running

### Prerequisites
*   Node.js and npm installed.
*   `OPENAI_API_KEY` environment variable set in a `.env` file (see `server.js` usage).

### Key Commands

| Command | Description |
| :--- | :--- |
| `npm start` | **Recommended.** Runs both the frontend (Vite) and backend (Hono) concurrently. |
| `npm run dev` | Starts only the Vite frontend development server. |
| `npm run server` | Starts only the Hono backend server on port 3000. |
| `npm run build` | Compiles the TypeScript code and builds the frontend for production. |
| `npm run lint` | Runs ESLint and Prettier to check and fix code style issues. |
| `npm run format` | Runs Prettier to format the codebase. |

## Development Conventions

*   **Styling:** Use Tailwind CSS utility classes. The `cn` helper function (in `src/lib/utils.ts`) is used for conditional class merging, especially within UI components.
*   **Components:** 
    *   UI components (buttons, inputs, cards) are located in `src/components/ui`.
    *   Feature-specific components (like `Chat.tsx`) are in `src/components`.
*   **AI Integration:** 
    *   Frontend uses `useChat` with `fetchHttpStream` adapter.
    *   Backend uses `chat` with `createOpenaiChat` adapter.
*   **Environment:** Sensitive keys (API keys) are managed via `dotenv` and should be placed in a `.env` file, never committed to version control.
