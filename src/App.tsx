import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Buyers } from './pages/Buyers'
import { Pipeline } from './pages/Pipeline'
import { Meetings } from './pages/Meetings'
import { Email } from './pages/Email'

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/email" element={<Email />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>
  )
}
