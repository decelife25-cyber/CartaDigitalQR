import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const savedTheme = window.localStorage.getItem('carta-theme');
if (savedTheme === 'night') {
  document.documentElement.classList.add('theme-night');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
