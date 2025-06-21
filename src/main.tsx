import { StrictMode, useEffect } from "react";
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

// Handle message channel errors
const handleMessageChannelError = (event: Event) => {
  if (event instanceof MessageEvent) {
    console.warn("Message channel warning:", event);
    return true; // Prevent default handling
  }
  return false;
};

// Set up global error handlers
if (import.meta.env.PROD) {
  window.addEventListener("error", handleGlobalError);
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled rejection:", event.reason);
  });
  
  // Add message channel error handler
  window.addEventListener("messageerror", handleMessageChannelError);
}

// Register service worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
            }
          });
        }
      });
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  }
};

// Create root
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

// Initialize the app
const initApp = () => {
  // Register service worker
  if (import.meta.hot) {
    // In development, don't register service worker
    renderApp();
  } else {
    registerServiceWorker().then(renderApp);
  }
};

// Render the app
const renderApp = () => {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

// Start the app
initApp();

// Log environment info in development
if (import.meta.env.DEV) {
  console.log("Running in development mode");
  console.log("Environment:", import.meta.env.MODE);
}
