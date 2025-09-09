"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, Users, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MapLocation {
  id: string
  name: string
  area: string
  usage: string
  lat: number
  lng: number
  proposals: Array<{
    id: string
    title: string
    description: string
    image: string
    status: "recruiting" | "completed"
    recommendCount: number
  }>
}

interface MapModalProps {
  location: MapLocation
  onClose: () => void
  onCreateProposal: (locationId: string) => void
}

export function MapModal({ location, onClose, onCreateProposal }: MapModalProps) {
  const [currentProposalIndex, setCurrentProposalIndex] = useState(0)
  const currentProposal = location.proposals[currentProposalIndex]

  const handlePrevious = () => {
    setCurrentProposalIndex((prev) => (prev > 0 ? prev - 1 : location.proposals.length - 1))
  }

  const handleNext = () => {
    setCurrentProposalIndex((prev) => (prev < location.proposals.length - 1 ? prev + 1 : 0))
  }

  const handleCreateProposal = () => {
    onCreateProposal(location.id)
  }

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      handleNext()
    } else {
      handlePrevious()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <Card className="w-full max-w-md mx-auto mb-0 rounded-t-xl rounded-b-none" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-lg">{location.name}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    국가철도공단
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">면적: {location.area}</p>
                <p className="text-sm text-muted-foreground">유형분류: {location.usage}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {location.proposals.length > 0 ? (
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  제안 목록 ({location.proposals.length})
                </h4>
              </div>

              <div className="relative">
                {/* Swipeable Proposal Card */}
                <div
                  className="relative overflow-hidden"
                  onTouchStart={(e) => {
                    const startX = e.touches[0].clientX
                    const handleTouchEnd = (endEvent: TouchEvent) => {
                      const endX = endEvent.changedTouches[0].clientX
                      const diff = startX - endX
                      if (Math.abs(diff) > 50) {
                        if (diff > 0) {
                          handleNext()
                        } else {
                          handlePrevious()
                        }
                      }
                      document.removeEventListener("touchend", handleTouchEnd)
                    }
                    document.addEventListener("touchend", handleTouchEnd)
                  }}
                >
                  {/* Image */}
                  <div className="relative mb-4">
                    <img
                      src={currentProposal.image || "/placeholder.svg"}
                      alt={currentProposal.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />

                    {/* Navigation Arrows */}
                    {location.proposals.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handlePrevious}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handleNext}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <StatusBadge status={currentProposal.status} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">{currentProposal.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{currentProposal.description}</p>

                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{currentProposal.recommendCount}명이 추천</span>
                    </div>
                  </div>

                  {/* Pagination Dots */}
                  {location.proposals.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {location.proposals.map((_, index) => (
                        <button
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === currentProposalIndex ? "bg-primary" : "bg-muted-foreground/30",
                          )}
                          onClick={() => setCurrentProposalIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Added empty state when no proposals exist */
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">제안 목록 (0)</h4>
              </div>
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">아직 제안이 없습니다. 첫 제안을 남겨보세요.</p>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-border">
            <Button onClick={handleCreateProposal} className="w-full flex items-center gap-2">
              <Plus size={16} />
              제안 등록
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatusBadgeProps {
  status: "recruiting" | "completed"
}

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "recruiting") {
    return (
      <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground border-secondary/30">
        <AlertCircle size={12} className="mr-1" />
        모집중
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-muted/90 text-muted-foreground border-muted-foreground/30">
      <CheckCircle size={12} className="mr-1" />
      완료
    </Badge>
  )
}
