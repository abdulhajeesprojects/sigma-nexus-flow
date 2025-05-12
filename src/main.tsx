
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Create a root element for error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure there is an element with id 'root' in your HTML.");
}

// Wrap the entire app in error boundaries
try {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error("Failed to render application:", error);
  
  // Display a minimal error UI if the app fails to render
  rootElement.innerHTML = `
    <div style="
      height: 100vh; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      text-align: center;
      font-family: system-ui, sans-serif;
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem;
    ">
      <h1 style="color: #cc0000; margin-bottom: 1rem;">Application Error</h1>
      <p style="margin-bottom: 1.5rem;">We're sorry, but the application failed to load properly.</p>
      <button 
        onclick="window.location.reload()" 
        style="
          background: #6557f5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
        "
      >
        Refresh Page
      </button>
    </div>
  `;
}
