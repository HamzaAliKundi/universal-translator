import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { TranslationProvider } from './contexts/TranslationContext'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <StrictMode>
    <TranslationProvider apiKey={import.meta.env.VITE_OPENAI_API_KEY}>
      <App />
    </TranslationProvider>
  </StrictMode>
)