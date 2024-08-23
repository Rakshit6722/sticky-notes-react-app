import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import NotesProvider from './context/NoteContext.jsx'

createRoot(document.getElementById('root')).render(
  <NotesProvider>
    <App />
  </NotesProvider>,
)
