import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {playSound} from './utils/sound.js'

document.addEventListener("click", (e) => {
  // clicking a <label> also fires a second, fake click on its <input>, so skip that one
  if (e.target.matches('input[type="file"]')) return;

  const el = e.target.closest("button, [data-sound]");
  if (el && !el.disabled) {
    playSound(el.dataset.sound || "click");
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
