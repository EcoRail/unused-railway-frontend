"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { LoginScreen } from "@/components/login-screen"
import { RegisterScreen } from "@/components/register-screen"
import { MainApp } from "@/components/main-app"

type AppState = "splash" | "login" | "register" | "main"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("splash")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setAppState("login")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true)
      setAppState("main")
    }
  }

  const handleRegister = (success: boolean) => {
    if (success) {
      setAppState("login")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAppState("login")
  }

  const renderContent = () => {
    switch (appState) {
      case "splash":
        return <SplashScreen />
      case "login":
        return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setAppState("register")} />
      case "register":
        return <RegisterScreen onRegister={handleRegister} onGoToLogin={() => setAppState("login")} />
      case "main":
        return <MainApp onLogout={handleLogout} />
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="w-full h-full max-w-md bg-white shadow-2xl overflow-hidden relative md:h-[90vh] md:max-h-[800px] md:rounded-2xl">
        {renderContent()}
      </div>
    </div>
  )
}

