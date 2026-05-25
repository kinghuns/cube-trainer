import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CubeTrainer from './components/CubeTrainer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CubeTrainer />
  </StrictMode>,
)
