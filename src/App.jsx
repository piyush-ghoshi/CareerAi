import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Landing from './pages/Landing'
import ResumeAnalyser from './pages/ResumeAnalyser'
import InterviewPractice from './pages/InterviewPractice'
import PortfolioReviewer from './pages/PortfolioReviewer'
import ScamDetector from './pages/ScamDetector'

function AppShell() {
  return (
    <div className="flex h-screen bg-[#0A0F1E] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* App shell with sidebar */}
        <Route path="/app" element={<AppShell />}>
          {/* Default redirect to resume */}
          <Route index element={<Navigate to="/app/resume" replace />} />
          <Route path="resume" element={<ResumeAnalyser />} />
          <Route path="interview" element={<InterviewPractice />} />
          <Route path="portfolio" element={<PortfolioReviewer />} />
          <Route path="scam" element={<ScamDetector />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
