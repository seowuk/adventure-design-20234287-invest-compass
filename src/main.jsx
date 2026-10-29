import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyDesign, getDesign } from './lib/design'

// 화면을 그리기 전에 고른 디자인을 적용 (깜빡임 방지)
applyDesign(getDesign())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
