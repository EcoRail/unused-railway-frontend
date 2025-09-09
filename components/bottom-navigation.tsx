"use client"

import { Home, Map, User } from "lucide-react"
import { cn } from "@/lib/utils"

type Screen = "home" | "map" | "profile"

interface BottomNavigationProps {
  currentScreen: Screen
  onScreenChange: (screen: Screen) => void
}

export function BottomNavigation({ currentScreen, onScreenChange }: BottomNavigationProps) {
  const navItems = [
    { id: "home" as Screen, label: "홈", icon: Home },
    { id: "map" as Screen, label: "지도", icon: Map },
    { id: "profile" as Screen, label: "프로필", icon: User },
  ]

  return (
    <div className="bg-card border-t border-border shadow-lg">
      <div className="flex safe-area-inset-bottom">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onScreenChange(id)}
            className={cn(
              "flex-1 flex flex-col items-center py-3 px-2 transition-all duration-200",
              "hover:bg-muted/50 active:scale-95",
              currentScreen === id ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={24} className="mb-1" />
            <span className="text-xs font-medium">{label}</span>
            {currentScreen === id && <div className="w-4 h-0.5 bg-primary rounded-full mt-1" />}
          </button>
        ))}
      </div>
    </div>
  )
}
