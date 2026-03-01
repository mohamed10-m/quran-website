import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite websocket errors in the AI Studio environment
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (typeof msg === 'string' && msg.toLowerCase().includes('websocket')) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason instanceof Error ? reason.message : (typeof reason === 'string' ? reason : '');
  if (typeof msg === 'string' && msg.toLowerCase().includes('websocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
