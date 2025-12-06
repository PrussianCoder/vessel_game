import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictModeを無効化（ダブルクリック問題のデバッグ用）
createRoot(document.getElementById('root')!).render(
  <App />,
)
