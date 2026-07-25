import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { LoginPage } from './pages/auth/LoginPage'
import { ChatPage } from './pages/ChatPage'
import { AuthInitializer } from './components/auth/AuthInitializer'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicRoute } from './components/auth/PublicRoute'
import { registerSW } from 'virtual:pwa-register'
import { Toaster } from 'sonner'

registerSW();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthInitializer />
      <Toaster position="top-right" toastOptions={{
        style: {
          background: "#1A1F24",
          color: "#F0F5F9",
          border: "1px solid rgba(82, 97, 107, 0.4)",
          borderRadius: "0.2rem",
          fontSize: "14px",
          fontWeight: "500",
        },
      }} />
      <Routes>
        <Route path="/" element={<App />} />
        <Route index element={<HomePage />} />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
