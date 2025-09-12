"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { MapScreen } from "@/components/map-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PostDetailView } from "@/components/post-detail-view"

type Screen = "home" | "map" | "profile"

interface MainAppProps {
  onLogout: () => void
}

export function MainApp({ onLogout }: MainAppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const handleScreenChange = (screen: Screen) => {
    setSelectedPostId(null)
    setCurrentScreen(screen)
  }

  const renderScreen = () => {
    if (selectedPostId !== null) {
      return (
        <PostDetailView
          postId={selectedPostId}
          onBack={() => setSelectedPostId(null)}
        />
      )
    }
    switch (currentScreen) {
      case "home":
        return <HomeScreen onPostSelect={setSelectedPostId} />
      case "map":
        return <MapScreen onOpenPost={setSelectedPostId} />
      case "profile":
        return <ProfileScreen onLogout={onLogout} onPostSelect={setSelectedPostId} />
      default:
        return <HomeScreen onPostSelect={setSelectedPostId} />
    }
  }

  return (
    // min-h-screen을 h-full로 변경하여 부모 컨테이너에 맞춤
    <div className="h-full bg-background flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full transition-all duration-300 ease-in-out">{renderScreen()}</div>
      </div>
      <BottomNavigation currentScreen={currentScreen} onScreenChange={handleScreenChange} />
    </div>
  )
}
