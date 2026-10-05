import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mouse wheel over a focused number input changes its value instead of
// scrolling the page. Blur it first so the wheel always scrolls, in every form.
document.addEventListener(
  'wheel',
  (event) => {
    const input = event.target
    if (input instanceof HTMLInputElement && input.type === 'number' && input === document.activeElement) {
      input.blur()
    }
  },
  { passive: true, capture: true },
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
