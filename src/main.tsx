import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App";
import "./utils/performance";
import "./utils/networkMonitor";
import "./index.css";
import { validateEnv } from "./utils/env";

// Initialize Sentry for error tracking
import "./lib/sentry";

// Validate environment variables
if (import.meta.env.PROD) {
  validateEnv();
}

// Error handler for uncaught errors
const handleGlobalError = (event: ErrorEvent) => {
  console.error("Unhandled error:", event.error);
  // You can add additional error reporting here if needed
};

// Set up global error handlers
if (import.meta.env.PROD) {
  window.addEventListener("error", handleGlobalError);
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled rejection:", event.reason);
  });
}

// Create root
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

// Render the app
root.render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Log environment info in development
if (import.meta.env.DEV) {
  console.log("Running in development mode");
  console.log("Environment:", import.meta.env.MODE);
}
