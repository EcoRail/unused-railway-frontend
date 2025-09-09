"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { MapScreen } from "@/components/map-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

type Screen = "home" | "map" | "profile"

interface MainAppProps {
  onLogout: () => void
}

export function MainApp({ onLogout }: MainAppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen />
      case "map":
        return <MapScreen />
      case "profile":
        return <ProfileScreen onLogout={onLogout} />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full transition-all duration-300 ease-in-out">{renderScreen()}</div>
      </div>
      <BottomNavigation currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
    </div>
  )
}
