import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from '@/pages/index'
import NotFound from '@/pages/404'
import '@/globals.css'

const App: React.FC = () => {
  useEffect(() => {
    if (!window.location.hash) {
      window.location.replace(window.location.href + '#/')
    }
  }, [])
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </HashRouter>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
