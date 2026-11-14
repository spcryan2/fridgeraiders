import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {playSound} from './utils/sound.js'

document.addEventListener("click", (e) => {     // ← add this block
  const button = e.target.closest("button");
  if (button && !button.disabled) {
    playSound(button.dataset.sound || "click");
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
