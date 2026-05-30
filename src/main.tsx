import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

registerSW({ immediate: true })

// Prevent Linux X11 primary selection paste on middle click
const blockMiddleClick = (e: MouseEvent) => { if (e.button === 1) e.preventDefault(); };
document.addEventListener('mousedown', blockMiddleClick, { capture: true });
document.addEventListener('mouseup',   blockMiddleClick, { capture: true });
document.addEventListener('auxclick',  blockMiddleClick, { capture: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
