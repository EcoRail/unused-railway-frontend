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

  if (appState === "splash") {
    return <SplashScreen />
  }

  if (appState === "login") {
    return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setAppState("register")} />
  }

  if (appState === "register") {
    return <RegisterScreen onRegister={handleRegister} onGoToLogin={() => setAppState("login")} />
  }

  return <MainApp onLogout={handleLogout} />
}
