import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'tippy.js/dist/tippy.css';
import { initTheme } from './lib/theme';
import { useThemeStore } from './store';

initTheme();

const stored = localStorage.getItem('collabdocs-theme');
if (stored === 'dark' || stored === 'light') {
  useThemeStore.setState({ theme: stored });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
